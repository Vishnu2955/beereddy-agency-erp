const Notification = require("../models/Notification");
const nodemailer = require("nodemailer");

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "vvishnuvardhanreddy653@gmail.com",
    pass: process.env.EMAIL_PASS || "srcbslrtdksdzpsi",
  },
});

// Send Notification via In-App, Email, SMS, WhatsApp, Push
const sendNotification = async ({
  title,
  message,
  recipientId = null,
  recipientType = "Retailer",
  channel = "In-App",
  priority = "Normal",
  recipientEmail = "",
}) => {
  try {
    const notif = await Notification.create({
      title,
      message,
      recipient: recipientId,
      recipientType,
      channel,
      priority,
      status: "Sent",
    });

    // Send Email if channel is Email or high priority
    if ((channel === "Email" || priority === "Urgent") && recipientEmail) {
      transporter.sendMail({
        from: `"Beereddy Agency ERP" <${process.env.EMAIL_USER}>`,
        to: recipientEmail,
        subject: `[Beereddy ERP Alert] ${title}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; borderRadius: 12px;">
            <h2 style="color: #0f172a;">${title}</h2>
            <p style="font-size: 14px; color: #334155;">${message}</p>
            <hr style="border: none; border-top: 1px solid #cbd5e1; margin: 20px 0;" />
            <p style="font-size: 11px; color: #64748b;">Beereddy Agency - Authorized Distributor of V Bond Tile Adhesives</p>
          </div>
        `,
      }).catch((err) => console.error("Email Dispatch Notice:", err.message));
    }

    return notif;
  } catch (error) {
    console.error("Notification Service Error:", error);
  }
};

// Broadcast to multiple users
const broadcastNotification = async ({ title, message, recipientType = "All", channel = "In-App" }) => {
  try {
    return await Notification.create({
      title,
      message,
      recipient: null,
      recipientType,
      channel,
      status: "Sent",
    });
  } catch (error) {
    console.error("Broadcast Error:", error);
  }
};

module.exports = {
  sendNotification,
  broadcastNotification,
};
