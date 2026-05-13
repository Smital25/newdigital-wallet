const express = require("express");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Compute real balance from transaction records — single source of truth.
// user.balance on the User document is NOT kept in sync by POST /transactions,
// so never trust it for sufficiency checks.
async function computeBalance(userId) {
  const txs = await Transaction.find({ userId });
  const income  = txs.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const expense = txs.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
  return income - expense;
}

// GET all transactions
router.get("/", authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Add new transaction
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { type, category, amount, note, date } = req.body;
    const transaction = new Transaction({
      userId: req.user.id,
      type,
      category,
      amount: Number(amount),
      note,
      date: date ? new Date(date) : new Date(),
    });
    await transaction.save();
    res.status(201).json(transaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Dashboard stats — always derived from transactions, never from user.balance
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id }).sort({ date: -1 });

    const income   = transactions.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
    const expenses = transactions.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
    const balance  = income - expenses;
    const savings  = balance; // real net savings, not an estimate

    res.json({ balance, income, expenses, savings, transactions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update transaction
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { type, category, amount, note, date } = req.body;
    const updated = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { type, category, amount: Number(amount), note, ...(date && { date: new Date(date) }) },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Transaction not found" });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete transaction
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deleted = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!deleted) return res.status(404).json({ message: "Transaction not found" });
    res.json({ message: "Transaction deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Send money
// FIX: use computeBalance() for the sufficiency check, same reason as bills.
// Also sync user.balance field after deduction so future checks stay accurate.
router.post("/send", authMiddleware, async (req, res) => {
  try {
    const { recipientEmail, category, amount, note } = req.body;

    const amountNum = Number(amount);
    if (!recipientEmail || isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    const sender    = await User.findById(req.user.id);
    const recipient = await User.findOne({ email: recipientEmail });

    if (!recipient) return res.status(404).json({ message: "Recipient not found" });
    if (sender._id.toString() === recipient._id.toString()) {
      return res.status(400).json({ message: "Cannot send money to yourself" });
    }

    const senderBalance = await computeBalance(req.user.id);
    if (senderBalance < amountNum) {
      return res.status(400).json({
        message: `Insufficient balance. Available: ₹${senderBalance.toFixed(2)}, Required: ₹${amountNum.toFixed(2)}`,
      });
    }

    let cashback = 0;
    if (amountNum >= 1000) cashback = 150;
    else if (amountNum >= 500) cashback = 50;

    // Record debit for sender
    await Transaction.create({
      userId: sender._id,
      type: "expense",
      category: category || "Transfer",
      amount: amountNum,
      note: note ? `${note} (Sent to ${recipient.email})` : `Sent to ${recipient.email}`,
      date: new Date(),
    });

    // Record credit for recipient
    await Transaction.create({
      userId: recipient._id,
      type: "income",
      category: category || "Transfer",
      amount: amountNum + cashback,
      note: cashback > 0
        ? `Received from ${sender.email} (+₹${cashback} cashback bonus)`
        : `Received from ${sender.email}`,
      date: new Date(),
    });

    // Sync user.balance fields
    sender.balance = senderBalance - amountNum;
    await sender.save();

    const recipientBalance = await computeBalance(recipient._id);
    recipient.balance = recipientBalance; // already includes the new credit transaction
    await recipient.save();

    res.json({
      message: `Sent ₹${amountNum} to ${recipient.email} successfully!${cashback > 0 ? ` Recipient received ₹${cashback} cashback bonus.` : ""}`,
      newBalance: sender.balance,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Transaction failed" });
  }
});

// Search transactions
router.get("/search", authMiddleware, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const transactions = await Transaction.find({
      userId: req.user.id,
      $or: [
        { category: { $regex: q, $options: "i" } },
        { note:     { $regex: q, $options: "i" } },
      ],
    }).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Search failed" });
  }
});

module.exports = router;