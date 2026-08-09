const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, html) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[Email Service Notice] EMAIL_USER/EMAIL_PASS not configured. Skipping email send to ${to}.`);
    return { success: false, message: "SMTP credentials not configured" };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const info = await transporter.sendMail({
      from: `"Beereddy ERP" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`[Email Service] Email sent successfully to ${to}:`, info.messageId);
    return { success: true, info };
  } catch (err) {
    console.error(`[Email Service Error] Could not send email to ${to}:`, err.message);
    return { success: false, error: err.message };
  }
};

module.exports = sendEmail;