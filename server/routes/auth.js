const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const User = require("../models/User");
const Transaction = require("../models/Transaction"); // ✅ add this



const router = express.Router();

// Multer config for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Register
// Register
router.post("/register", upload.single("idProof"), async (req, res) => {
  try {
    const {
      fullName, dob, gender, mobile, email, idType, idNumber,
      username, password, securityQuestion, securityAnswer,
      transactionPin, accountType, depositAmount, currency
    } = req.body;

    // Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Convert deposit amount to number
    const initialBalance = Number(depositAmount) || 0;

    // Hash password & PIN
    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedPin = await bcrypt.hash(transactionPin, 10);

    // Create new user with balance set
    const newUser = new User({
      fullName,
      dob,
      gender,
      mobile,
      email,
      idType,
      idNumber,
      idProof: req.file ? req.file.path : null,
      username,
      password: hashedPassword,
      securityQuestion,
      securityAnswer,
      transactionPin: hashedPin,
      accountType,
      depositAmount: initialBalance,
      balance: initialBalance, // ✅ set balance same as deposit
      currency
    });

    await newUser.save();

    // ✅ Create initial deposit transaction if amount > 0
    if (initialBalance > 0) {
      await Transaction.create({
        userId: newUser._id,
        type: "income",
        category: "Initial Deposit",
        amount: initialBalance,
        note: "Initial account funding at registration",
        date: new Date()
      });
    }

    res.status(201).json({ message: "User registered successfully" });

  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token });

  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
