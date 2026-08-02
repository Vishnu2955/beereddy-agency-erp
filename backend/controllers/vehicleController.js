const Vehicle = require("../models/Vehicle");

exports.getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find().populate("driver").sort({ createdAt: -1 });
    res.json({ success: true, count: vehicles.length, vehicles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createVehicle = async (req, res) => {
  try {
    const { vehicleNumber, vehicleType, ownerName, capacity, fuelType, driver } = req.body;
    const vehicle = await Vehicle.create({
      vehicleNumber,
      vehicleType: vehicleType || "Pickup",
      ownerName: ownerName || "Beereddy Agency",
      capacity: capacity || 1000,
      fuelType: fuelType || "Diesel",
      driver: driver || null,
    });

    res.status(201).json({ success: true, message: "Vehicle added to fleet.", vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: false });
    res.json({ success: true, message: "Vehicle details updated.", vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteVehicle = async (req, res) => {
  try {
    await Vehicle.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Vehicle removed from fleet." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
