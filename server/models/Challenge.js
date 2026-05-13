const mongoose = require("mongoose");

const challengeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true }, // store YYYY-MM-DD for uniqueness per day
  challengeText: { type: String, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
});

module.exports = mongoose.model("Challenge", challengeSchema);
