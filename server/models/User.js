const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  dob: { type: Date, required: true },
  gender: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  idType: { type: String, required: true },
  idNumber: { type: String, required: true },
  idProof: { type: String }, // file path
  username: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 }, // add this if missing
  password: { type: String, required: true },
  securityQuestion: { type: String, required: true },
  securityAnswer: { type: String, required: true },
  transactionPin: { type: String, required: true },
  accountType: { type: String, required: true },
  depositAmount: { type: Number, default: 0 },
  currency: { type: String, default: "INR" },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
