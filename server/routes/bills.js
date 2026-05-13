const express = require("express");
const router = express.Router();
const Bill = require("../models/Bill");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

// Compute real balance by summing all transactions — single source of truth
async function computeBalance(userId) {
  const txs = await Transaction.find({ userId });
  const income  = txs.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const expense = txs.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
  return income - expense;
}

// Create a bill
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, amount, dueDate, autoPay } = req.body;
    const bill = await Bill.create({
      userId: req.user.id,
      title,
      amount: Number(amount),
      dueDate: new Date(dueDate),
      autoPay: !!autoPay,
      status: "pending",
    });
    res.status(201).json(bill);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create bill" });
  }
});

// Return ALL bills (paid + pending + overdue)
router.get("/upcoming", authMiddleware, async (req, res) => {
  try {
    const bills = await Bill.find({ userId: req.user.id }).sort({ dueDate: 1 });
    res.json(bills);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch bills" });
  }
});

// Pay a bill
// FIX: use computeBalance() instead of user.balance — user.balance is never
// updated when transactions are added via POST /transactions, so it stays
// at its seed value (0 or whatever was set at registration) and always
// triggers the "insufficient balance" 400.
router.put("/:id/pay", authMiddleware, async (req, res) => {
  try {
    const bill = await Bill.findOne({ _id: req.params.id, userId: req.user.id });
    if (!bill) return res.status(404).json({ message: "Bill not found" });
    if (bill.status === "paid") return res.status(400).json({ message: "Bill is already paid" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const billAmount = Number(bill.amount);
    const realBalance = await computeBalance(req.user.id);

    if (realBalance < billAmount) {
      return res.status(400).json({
        message: `Insufficient balance. Available: ₹${realBalance.toFixed(2)}, Required: ₹${billAmount.toFixed(2)}`,
      });
    }

    // Record expense transaction — this is what reduces the balance next time
    await Transaction.create({
      userId: user._id,
      type: "expense",
      category: "Bills",
      amount: billAmount,
      note: `Bill payment: ${bill.title}`,
      date: new Date(),
    });

    // Keep user.balance field in sync for the send-money route
    user.balance = realBalance - billAmount;
    await user.save();

    bill.status = "paid";
    await bill.save();

    const transactions = await Transaction.find({ userId: user._id }).sort({ date: -1 });

    res.json({
      message: "Bill paid successfully",
      bill,
      newBalance: user.balance,
      transactions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to pay bill" });
  }
});

module.exports = router;