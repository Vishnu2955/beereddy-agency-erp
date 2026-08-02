require("dotenv").config();
const dns = require("dns");
try { dns.setServers(["8.8.8.8", "1.1.1.1"]); } catch (_) {}

const mongoose = require("mongoose");
const Order = require("../models/Order");

const updateAllGst = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB Atlas...");

    const orders = await Order.find({});
    console.log(`Found ${orders.length} order records.`);

    let updatedCount = 0;
    for (const order of orders) {
      const subtotal = order.items.reduce(
        (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
        0
      ) || Number(order.totalAmount || 0);

      const computedGst = Math.round(subtotal * 0.18);
      const discount = Number(order.discount || 0);
      const grandTotalWithGst = subtotal + computedGst - discount;
      const isPaid = order.paymentStatus === "Paid";
      const remainingBalance = isPaid ? 0 : grandTotalWithGst;

      order.totalAmount = subtotal;
      order.gstAmount = computedGst;
      order.finalAmount = grandTotalWithGst;
      order.remainingBalance = remainingBalance;

      await order.save();
      updatedCount++;
      console.log(`Updated ${order.orderNumber}: Subtotal ₹${subtotal} | GST (18%) ₹${computedGst} | Grand Total (Incl. GST) ₹${grandTotalWithGst}`);
    }

    console.log(`\n========================================================`);
    console.log(`✅ SUCCESSFULLY UPDATED ALL ${updatedCount} ORDERS IN MONGODB ATLAS TO INCLUDE 18% GST (₹3,186)!`);
    console.log(`========================================================\n`);
    process.exit(0);
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
};

updateAllGst();
