const User = require("../models/User");
const Transaction = require("../models/Transaction");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { password, transactionPin, depositAmount, ...rest } = req.body;

    // Convert depositAmount to a number or default to 0
    const initialBalance = Number(depositAmount) || 0;

    // Hash password and transaction pin
    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedPin = await bcrypt.hash(transactionPin, 10);

    // Create new user with balance
    const user = new User({
      ...rest,
      password: hashedPassword,
      transactionPin: hashedPin,
      balance: initialBalance
    });

    await user.save();

    // Create initial deposit transaction if amount > 0
    if (initialBalance > 0) {
      await Transaction.create({
        userId: user._id,
        type: "income",
        category: "Initial Deposit",
        amount: initialBalance,
        note: "Initial account funding at registration",
        date: new Date()
      });
    }

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
