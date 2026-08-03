const Settings = require("../models/Settings");

// Get Company Settings
const getCompanySettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: "company_settings" });
    if (!settings) {
      settings = await Settings.create({
        key: "company_settings",
        companyName: "BEEREDDY AGENCY",
        dealerTagline: "A Trusted V Bond Distributor",
        address: "H.No. 4-12, Main Road, Distributor Market",
        city: "Hyderabad",
        district: "Rangareddy",
        state: "Telangana",
        pincode: "500001",
        gstNumber: "36AAACB1234C1Z5",
        phone: "+91 9876543210",
        email: "contact@beereddyagency.com",
        website: "https://beereddyagency.com",
        logo: "/logo.png",
        invoiceFooter: "Thank you for doing business with Beereddy Agency!",
        invoiceTerms: "1. Goods once sold will not be taken back without valid approval.\n2. Interest @ 18% p.a. will be charged on overdue payments.",
        signatureImage: "",
        companyStamp: "",
      });
    }
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Company Settings
const updateCompanySettings = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ success: false, message: "Only Admin can update company settings." });
    }

    const settings = await Settings.findOneAndUpdate(
      { key: "company_settings" },
      {
        ...req.body,
        lastUpdatedBy: req.user.fullName || "Admin",
        lastUpdatedAt: new Date(),
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: "Company settings updated successfully! All invoices and pages updated.",
      settings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCompanySettings,
  updateCompanySettings,
};
