const Driver = require("../models/Driver");

exports.getDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find().populate("vehicleAssigned").sort({ createdAt: -1 });
    res.json({ success: true, count: drivers.length, drivers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createDriver = async (req, res) => {
  try {
    const { driverName, phone, email, licenseNumber, licenseExpiry, address, emergencyContact } = req.body;
    const driver = await Driver.create({
      driverName,
      phone,
      email,
      licenseNumber,
      licenseExpiry: licenseExpiry || new Date(Date.now() + 31536000000),
      address,
      emergencyContact,
    });

    res.status(201).json({ success: true, message: "Driver registered successfully.", driver });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: false });
    res.json({ success: true, message: "Driver profile updated.", driver });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteDriver = async (req, res) => {
  try {
    await Driver.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Driver record deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
