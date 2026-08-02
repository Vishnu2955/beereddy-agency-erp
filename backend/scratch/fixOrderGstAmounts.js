require("dotenv").config();
const dns = require("dns");
try { dns.setServers(["8.8.8.8", "1.1.1.1"]); } catch (_) {}

const mongoose = require("mongoose");
const Order = require("../models/Order");

const fixOrderGst = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB Atlas...");

    // Drop legacy invoiceNumber_1 unique index on orders if exists
    try {
      await mongoose.connection.db.collection("orders").dropIndex("invoiceNumber_1");
      console.log("✅ Successfully dropped legacy invoiceNumber_1 index from orders collection.");
    } catch (e) {
      console.log("Notice on invoiceNumber_1 index:", e.message);
    }

    const orders = await Order.find({});
    console.log(`Found ${orders.length} order records.`);

    let updatedCount = 0;
    for (const order of orders) {
      const subtotal = order.items.reduce(
        (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
        0
      );
      const computedGst = Math.round(subtotal * 0.18);
      const discount = Number(order.discount || 0);
      const finalAmount = subtotal + computedGst - discount;
      const isPaid = order.paymentStatus === "Paid";
      const remainingBalance = isPaid ? 0 : finalAmount;

      if (!order.invoiceNumber || order.invoiceNumber.trim() === "") {
        order.invoiceNumber = `INV-${order.orderNumber.replace("ORD-", "")}`;
      }

      order.gstAmount = computedGst;
      order.finalAmount = finalAmount;
      order.totalAmount = subtotal;
      order.remainingBalance = remainingBalance;

      await order.save();
      updatedCount++;
      console.log(`Updated ${order.orderNumber}: Subtotal ₹${subtotal} | GST (18%) ₹${computedGst} | Final Total ₹${finalAmount}`);
    }

    console.log(`\n========================================================`);
    console.log(`✅ SUCCESSFULLY UPDATED ${updatedCount} ORDERS WITH 18% GST IN MONGODB ATLAS!`);
    console.log(`========================================================\n`);
    process.exit(0);
  } catch (err) {
    console.error("Fix order GST error:", err);
    process.exit(1);
  }
};

fixOrderGst();
