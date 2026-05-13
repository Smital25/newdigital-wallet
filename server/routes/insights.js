const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

function autoCategorize(nameOrNote) {
  if (!nameOrNote) return "Other";
  const s = nameOrNote.toString().toLowerCase();
  if (/(grocery|supermarket|grocer|vegetable|mart)/.test(s)) return "Food";
  if (/(rent)/.test(s)) return "Rent";
  if (/(uber|ola|taxi|bus|train|flight|airport)/.test(s)) return "Travel";
  if (/(electric|water|bill|gas|utility)/.test(s)) return "Utilities";
  if (/(netflix|prime|subscription|spotify)/.test(s)) return "Entertainment";
  if (/(pharmacy|hospital|clinic|doctor)/.test(s)) return "Healthcare";
  if (/(salary|payroll|income)/.test(s)) return "Salary";
  return "Other";
}

router.get("/category-stats", authMiddleware, async (req, res) => {
  try {
    const monthStr = req.query.month || new Date().toISOString().slice(0, 7);
    const [year, month] = monthStr.split("-").map(Number);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month - 1 + 1, 1);

    const transactions = await Transaction.find({
      userId: req.user.id,
      date: { $gte: start, $lt: end },
    });

    const totals = {};
    for (const t of transactions) {
      const cat = t.category || autoCategorize(t.note || "");
      totals[cat] = (totals[cat] || 0) + (t.type === "expense" ? Number(t.amount || 0) : 0);
    }

    const user = await User.findById(req.user.id);
    const categoryBudgets = (user && user.categoryBudgets) ? user.categoryBudgets : {};

    const alerts = [];
    for (const [cat, total] of Object.entries(totals)) {
      const bud = Number(categoryBudgets[cat] || 0);
      if (bud > 0 && total > bud) {
        alerts.push({
          category: cat,
          spent: total,
          budget: bud,
          message: `You have exceeded budget for ${cat}: ₹${total} / ₹${bud}`,
        });
      }
    }

    res.json({ month: monthStr, totals, alerts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to compute category stats" });
  }
});

// FIX: Wrap leaderboard in { results: [...] } so the frontend
// lbData.results works correctly (previously returned bare array)
router.get("/leaderboard", authMiddleware, async (req, res) => {
  try {
    const months = Number(req.query.months || 6);
    const since = new Date();
    since.setMonth(since.getMonth() - months);

    const users = await User.find({}, "fullName email");

    const leaderboard = [];

    for (const user of users) {
      const txs = await Transaction.find({
        userId: user._id,
        date: { $gte: since },
      });

      const income = txs
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + Number(t.amount || 0), 0);
      const expense = txs
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + Number(t.amount || 0), 0);

      leaderboard.push({
        userName: user.fullName || user.email,
        points: income - expense, // actual savings, not a hardcoded formula
      });
    }

    leaderboard.sort((a, b) => b.points - a.points);

    // FIXED: wrap in { results } so frontend lbData.results works
    res.json({ results: leaderboard });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate leaderboard" });
  }
});

module.exports = router;