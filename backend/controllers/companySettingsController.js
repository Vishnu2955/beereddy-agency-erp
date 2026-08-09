const Settings = require("../models/Settings");

// Get Company Settings
const getCompanySettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: "company_settings" });
    if (!settings) {
      settings = await Settings.create({
        key: "company_settings",
        agencyName: "Beereddy Agency",
        ownerName: "B Upender Reddy",
        gstNumber: "36AAAPB1234A1Z5",
        phone: "9876543210",
        email: "admin@beereddyagency.com",
        address: "Main Road, Near Bus Stand, Dist. Headquarters",
        logo: "/icon-192.png",
        currency: "₹",
        financialYear: "2026-2027",
        invoicePrefix: "BRA",
        defaultTaxPercentage: 18,
        isSetupCompleted: false,
      });
    }
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Company Settings / Complete First-Time Setup
const updateCompanySettings = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ success: false, message: "Only Admin can update company profile settings." });
    }

    const updateData = {
      ...req.body,
      lastUpdatedBy: req.user.fullName || "Admin",
      lastUpdatedAt: new Date(),
    };

    // If a file was uploaded (logo), attach its path
    if (req.file) {
      updateData.logo = `/uploads/${req.file.filename}`;
    }

    if (req.body.isSetupCompleted !== undefined) {
      updateData.isSetupCompleted = Boolean(req.body.isSetupCompleted);
    }

    const settings = await Settings.findOneAndUpdate(
      { key: "company_settings" },
      updateData,
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: "Company profile settings updated successfully! Reflecting across all invoices & reports.",
      settings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reset First-Time Setup Wizard (Admin Only)
const resetSetupWizard = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ success: false, message: "Only Admin can reset setup wizard." });
    }

    const settings = await Settings.findOneAndUpdate(
      { key: "company_settings" },
      { isSetupCompleted: false },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: "Setup wizard reset! The wizard will launch on next admin login.",
      settings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCompanySettings,
  updateCompanySettings,
  resetSetupWizard,
};
