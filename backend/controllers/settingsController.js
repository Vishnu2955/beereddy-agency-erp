const Settings = require("../models/Settings");
const AuditLog = require("../models/AuditLog");

// Get Admin Payment & Bank Settings (Public / Auth)
const getPaymentSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: "payment_settings" });

    if (!settings) {
      settings = await Settings.create({
        key: "payment_settings",
        adminPayee: "B UPENDER REDDY",
        upiVpa: "bupenderreddy@ybl",
        bankName: "State Bank of India",
        accountName: "B UPENDER REDDY (BEEREDDY AGENCY)",
        accountNumber: "40982341902",
        ifsc: "SBIN0020145",
        qrImage: "/admin_qr.jpg",
      });
    }

    res.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Get Settings Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch payment settings.",
    });
  }
};

// Update Admin Payment & Bank Settings (Admin Only)
const updatePaymentSettings = async (req, res) => {
  try {
    const { adminPayee, upiVpa, bankName, accountName, accountNumber, ifsc } = req.body;

    const updateData = {};
    if (adminPayee !== undefined) updateData.adminPayee = adminPayee;
    if (upiVpa !== undefined) updateData.upiVpa = upiVpa;
    if (bankName !== undefined) updateData.bankName = bankName;
    if (accountName !== undefined) updateData.accountName = accountName;
    if (accountNumber !== undefined) updateData.accountNumber = accountNumber;
    if (ifsc !== undefined) updateData.ifsc = ifsc;

    if (req.file) {
      updateData.qrImage = `/uploads/${req.file.filename}`;
    }

    const settings = await Settings.findOneAndUpdate(
      { key: "payment_settings" },
      { $set: updateData },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: "⚡ Admin Bank & UPI details updated successfully!",
      settings,
    });
  } catch (error) {
    console.error("Update Settings Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update payment settings.",
    });
  }
};

// --- WHATSAPP NOTIFICATION SETTINGS ---

// Get WhatsApp Settings (Admin Only)
const getWhatsAppSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: "payment_settings" });

    if (!settings) {
      settings = await Settings.create({ key: "payment_settings" });
    }

    res.json({
      success: true,
      adminWhatsAppNumber: settings.adminWhatsAppNumber || "",
      whatsAppEnabled: Boolean(settings.whatsAppEnabled),
      lastUpdatedBy: settings.lastUpdatedBy || "System Admin",
      lastUpdatedAt: settings.lastUpdatedAt || settings.updatedAt,
    });
  } catch (error) {
    console.error("Get WhatsApp Settings Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch WhatsApp settings.",
    });
  }
};

// Helper: Sanitize & Validate International Phone Number
const sanitizeAndValidatePhoneNumber = (rawNumber) => {
  if (!rawNumber || typeof rawNumber !== "string") return null;
  // Automatically remove spaces, dashes, parentheses, dots
  const cleaned = rawNumber.replace(/[\s\-\(\)\.]/g, "");
  // Must match international phone number format E.164 (e.g. +919876543210 or 919876543210, 7 to 15 digits)
  const phoneRegex = /^\+?[1-9]\d{6,14}$/;
  if (!phoneRegex.test(cleaned)) {
    return null;
  }
  return cleaned;
};

// Update WhatsApp Settings (Admin Only)
const updateWhatsAppSettings = async (req, res) => {
  try {
    const { adminWhatsAppNumber, whatsAppEnabled } = req.body;

    let cleanedNumber = "";
    if (adminWhatsAppNumber && adminWhatsAppNumber.trim().length > 0) {
      cleanedNumber = sanitizeAndValidatePhoneNumber(adminWhatsAppNumber.trim());
      if (!cleanedNumber) {
        return res.status(400).json({
          success: false,
          message: "Invalid phone number format. Please provide a valid international number with country code (e.g. +919876543210).",
        });
      }
    } else if (whatsAppEnabled) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid WhatsApp number before enabling notifications.",
      });
    }

    // Get current settings for audit comparison
    let currentSettings = await Settings.findOne({ key: "payment_settings" });
    if (!currentSettings) {
      currentSettings = await Settings.create({ key: "payment_settings" });
    }

    const updaterName = req.user?.fullName || req.user?.email || "System Admin";
    const updateTime = new Date();

    const oldState = {
      adminWhatsAppNumber: currentSettings.adminWhatsAppNumber || "",
      whatsAppEnabled: Boolean(currentSettings.whatsAppEnabled),
    };

    currentSettings.adminWhatsAppNumber = cleanedNumber;
    currentSettings.whatsAppEnabled = Boolean(whatsAppEnabled);
    currentSettings.lastUpdatedBy = updaterName;
    currentSettings.lastUpdatedAt = updateTime;

    await currentSettings.save();

    // Log to AuditLog
    try {
      await AuditLog.create({
        user: req.user?._id || req.user?.id || null,
        userEmail: req.user?.email || updaterName,
        userRole: req.user?.role || "admin",
        action: "User Update",
        affectedModule: "Settings",
        oldValue: oldState,
        newValue: {
          adminWhatsAppNumber: cleanedNumber,
          whatsAppEnabled: Boolean(whatsAppEnabled),
        },
        reason: `Admin updated WhatsApp settings (Enabled: ${Boolean(whatsAppEnabled)}, Number: ${cleanedNumber || "None"})`,
      });
    } catch (auditErr) {
      console.warn("Audit Log warning for WhatsApp update:", auditErr.message);
    }

    res.json({
      success: true,
      message: "✅ WhatsApp notification settings updated successfully!",
      adminWhatsAppNumber: currentSettings.adminWhatsAppNumber,
      whatsAppEnabled: currentSettings.whatsAppEnabled,
      lastUpdatedBy: currentSettings.lastUpdatedBy,
      lastUpdatedAt: currentSettings.lastUpdatedAt,
    });
  } catch (error) {
    console.error("Update WhatsApp Settings Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update WhatsApp settings.",
    });
  }
};

// Send Test Message (Admin Only)
const testWhatsAppNotification = async (req, res) => {
  try {
    const settings = await Settings.findOne({ key: "payment_settings" });
    const numberToTest = req.body?.adminWhatsAppNumber || settings?.adminWhatsAppNumber;

    const cleanedNumber = sanitizeAndValidatePhoneNumber(numberToTest);
    if (!cleanedNumber) {
      return res.status(400).json({
        success: false,
        message: "No valid WhatsApp number configured. Please enter a valid number first.",
      });
    }

    const digitsOnly = cleanedNumber.replace(/\+/g, "");

    const currentTimeString = new Date().toLocaleString("en-IN", {
      dateStyle: "full",
      timeStyle: "medium",
    });

    const testMessageBody = `Beereddy ERP\n\nWhatsApp notification system is configured successfully.\n\nTime:\n${currentTimeString}`;
    const whatsappUrl = `https://wa.me/${digitsOnly}?text=${encodeURIComponent(testMessageBody)}`;

    console.log(`\n================ WHATSAPP TEST MESSAGE DISPATCH ================`);
    console.log(`TO: ${cleanedNumber}`);
    console.log(`WA LINK: ${whatsappUrl}`);
    console.log(`MESSAGE:\n${testMessageBody}`);
    console.log(`================================================================\n`);

    res.json({
      success: true,
      message: `Test message prepared for ${cleanedNumber}! Click below to open WhatsApp and send instantly.`,
      targetNumber: cleanedNumber,
      currentTime: currentTimeString,
      body: testMessageBody,
      whatsappUrl,
    });
  } catch (error) {
    console.error("WhatsApp Test Message Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to send WhatsApp test message.",
    });
  }
};

module.exports = {
  getPaymentSettings,
  updatePaymentSettings,
  getWhatsAppSettings,
  updateWhatsAppSettings,
  testWhatsAppNotification,
};
