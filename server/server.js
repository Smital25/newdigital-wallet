const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");
const cron = require("node-cron");
const Bill = require("./models/Bill");
const User = require("./models/User");
const Transaction = require("./models/Transaction");

dotenv.config();
connectDB();

// FIX: compute real balance from transactions, same as the route helpers.
// user.balance is never updated by POST /transactions so it can't be trusted.
async function computeBalance(userId) {
  const txs = await Transaction.find({ userId });
  const income  = txs.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const expense = txs.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
  return income - expense;
}

// Run daily at 00:05
cron.schedule("5 0 * * *", async () => {
  console.log("Running auto-pay cron...");
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayEnd   = new Date(); todayEnd.setHours(23, 59, 59, 999);

  const bills = await Bill.find({
    autoPay: true,
    status: "pending",
    dueDate: { $gte: todayStart, $lte: todayEnd },
  });

  for (const bill of bills) {
    try {
      const user = await User.findById(bill.userId);
      if (!user) continue;

      const realBalance = await computeBalance(bill.userId);

      if (realBalance >= bill.amount) {
        await Transaction.create({
          userId: user._id,
          type: "expense",
          category: "Bills",
          amount: bill.amount,
          note: `AutoPay: ${bill.title}`,
          date: new Date(),
        });

        // Keep user.balance in sync
        user.balance = realBalance - bill.amount;
        await user.save();

        bill.status = "paid";
        await bill.save();
        console.log(`Auto-paid bill ${bill._id} for user ${user._id}`);
      } else {
        console.log(`Insufficient balance (₹${realBalance}) to auto-pay bill ${bill._id} (₹${bill.amount}) for user ${user._id}`);
      }
    } catch (err) {
      console.error("Auto-pay error for bill", bill._id, err);
    }
  }
});

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth",         require("./routes/auth"));
app.use("/api/transactions", require("./routes/transactions"));
app.use("/api/bills",        require("./routes/bills"));
app.use("/api/challenges",   require("./routes/challenges"));
app.use("/api/insights",     require("./routes/insights"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));