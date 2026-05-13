const express = require("express");
const router = express.Router();
const Challenge = require("../models/Challenge");
const authMiddleware = require("../middleware/auth");

// static list of example challenges (you can expand)
const CHALLENGES = [
  "Save ₹50 today by skipping dessert",
  "Make coffee at home — save ₹30",
  "Pack lunch and save ₹60",
  "No online shopping today — save ₹100",
  "Walk instead of cab — save ₹80",
  "Skip one movie this month — save ₹200",
];

// Helper to pick a deterministic challenge per day (so it doesn't change each call)
function pickChallengeForDate(dateStr) {
  // dateStr format: YYYY-MM-DD
  let seed = 0;
  for (let i = 0; i < dateStr.length; i++) seed += dateStr.charCodeAt(i);
  return CHALLENGES[seed % CHALLENGES.length];
}

// Get today's challenge (and record it if not recorded)
router.get("/today", authMiddleware, async (req, res) => {
  try {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10); // YYYY-MM-DD
    let record = await Challenge.findOne({ userId: req.user.id, date: dateStr });
    const text = pickChallengeForDate(dateStr);
    if (!record) {
      record = await Challenge.create({
        userId: req.user.id,
        date: dateStr,
        challengeText: text,
      });
    }
    res.json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get today's challenge" });
  }
});

// Mark challenge as completed
router.put("/today/complete", authMiddleware, async (req, res) => {
  try {
    const dateStr = new Date().toISOString().slice(0, 10);
    const record = await Challenge.findOneAndUpdate(
      { userId: req.user.id, date: dateStr },
      { completed: true, completedAt: new Date() },
      { new: true, upsert: true }
    );
    res.json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to complete challenge" });
  }
});

module.exports = router;
