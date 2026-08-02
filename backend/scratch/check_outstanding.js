const mongoose = require("mongoose");
const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const Order = require("../models/Order");
const Payment = require("../models/Payment");
const User = require("../models/User");

async function check() {
  await mongoose.connect(process.env.MONGO_URI, { family: 4 });
  console.log("Connected to MongoDB Atlas");

  const orders = await Order.find({ orderStatus: { $ne: "Cancelled" } }).populate("retailer");
  const payments = await Payment.find({ status: { $in: ["Approved", "Paid"] } });

  console.log(`Total Non-cancelled Orders: ${orders.length}`);
  console.log(`Total Approved Payments: ${payments.length}`);

  const orderPaidMap = {};
  payments.forEach((p) => {
    if (p.order) {
      const oId = p.order.toString();
      orderPaidMap[oId] = (orderPaidMap[oId] || 0) + Number(p.amount || 0);
    }
  });

  let totalDueSum = 0;

  orders.forEach((o) => {
    const total = Number(o.finalAmount || o.totalAmount || 0);
    const paid = orderPaidMap[o._id.toString()] || 0;
    const due = Math.max(0, Math.round((total - paid) * 100) / 100);
    const isPaid = (o.paymentStatus || "").toLowerCase() === "paid";
    
    if (due > 0 || !isPaid) {
      console.log(`Order ID: ${o._id} | Inv: ${o.invoiceNumber || o.orderNumber} | Retailer: ${o.retailer?.shopName || o.retailer?.fullName} | Total: ${total} | Paid: ${paid} | Due: ${due} | PaymentStatus: "${o.paymentStatus}"`);
      totalDueSum += due;
    }
  });

  console.log(`\n>>> TOTAL AGENCY OUTSTANDING DUE: ${totalDueSum}`);
  mongoose.connection.close();
}

check().catch(console.error);
