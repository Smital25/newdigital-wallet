const mongoose = require("mongoose");

const billSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  autoPay: { type: Boolean, default: false },
  status: { type: String, enum: ["pending", "paid"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Bill", billSchema);
