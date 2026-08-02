const Delivery = require("../models/Delivery");
const Driver = require("../models/Driver");
const Vehicle = require("../models/Vehicle");
const Order = require("../models/Order");
const ProductReturn = require("../models/ProductReturn");
const { deductStockForApprovedOrder } = require("../utils/inventoryHelper");

// ==========================================
// 1. GET /api/delivery (All Deliveries)
// ==========================================
exports.getAllDeliveries = async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (req.user?.role === "retailer") {
      query.retailer = req.user.id;
    }

    if (status) {
      query.deliveryStatus = status;
    }

    let deliveries = await Delivery.find(query)
      .populate("order", "orderNumber totalAmount items orderStatus")
      .populate("retailer", "fullName shopName phone address")
      .populate("driver", "driverName employeeId phone licenseNumber")
      .populate("vehicle", "vehicleNumber vehicleType fuelType")
      .populate("warehouse", "name location")
      .sort({ createdAt: -1 });

    if (search) {
      const term = search.toLowerCase();
      deliveries = deliveries.filter(
        (d) =>
          d.deliveryId?.toLowerCase().includes(term) ||
          d.order?.orderNumber?.toLowerCase().includes(term) ||
          d.retailer?.shopName?.toLowerCase().includes(term) ||
          d.driver?.driverName?.toLowerCase().includes(term)
      );
    }

    res.json({ success: true, count: deliveries.length, deliveries });
  } catch (error) {
    console.error("Get All Deliveries Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 2. GET /api/delivery/:id (Single Delivery)
// ==========================================
exports.getDeliveryById = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id)
      .populate("order")
      .populate("retailer", "fullName shopName phone address email")
      .populate("driver")
      .populate("vehicle")
      .populate("warehouse");

    if (!delivery) {
      return res.status(404).json({ success: false, message: "Delivery record not found." });
    }

    res.json({ success: true, delivery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 3. POST /api/delivery (Create Delivery)
// ==========================================
exports.createDelivery = async (req, res) => {
  try {
    const { orderId, driverId, vehicleId, warehouseId, deliveryAddress, contactPerson, phoneNumber, expectedDeliveryDate, remarks } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Associated order not found." });
    }

    const existingDel = await Delivery.findOne({ order: orderId, deliveryStatus: { $ne: "Cancelled" } });
    if (existingDel) {
      return res.status(400).json({ success: false, message: `Delivery dispatch already created (${existingDel.deliveryId}).` });
    }

    const delivery = await Delivery.create({
      order: orderId,
      invoice: order.invoice || null,
      retailer: order.retailer,
      driver: driverId || null,
      vehicle: vehicleId || null,
      warehouse: warehouseId || null,
      deliveryAddress: deliveryAddress || order.deliveryAddress,
      contactPerson: contactPerson || "Store Manager",
      phoneNumber: phoneNumber || "",
      expectedDeliveryDate: expectedDeliveryDate || new Date(Date.now() + 86400000),
      createdBy: req.user?.id,
      remarks,
      deliveryStatus: driverId && vehicleId ? "Assigned" : "Pending",
      timeline: [
        {
          status: driverId && vehicleId ? "Assigned" : "Pending",
          remarks: "Delivery record initialized",
          performedBy: req.user?.id,
        },
      ],
    });

    if (driverId) {
      await Driver.findByIdAndUpdate(driverId, { status: "Busy" });
    }
    if (vehicleId) {
      await Vehicle.findByIdAndUpdate(vehicleId, { currentStatus: "On Delivery" });
    }

    res.status(201).json({ success: true, message: "Delivery record created successfully.", delivery });
  } catch (error) {
    console.error("Create Delivery Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 4. PUT /api/delivery/assign (Assign Driver & Vehicle)
// ==========================================
exports.assignDelivery = async (req, res) => {
  try {
    const { deliveryId, driverId, vehicleId, warehouseId, dispatchDate, expectedDeliveryDate } = req.body;

    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return res.status(404).json({ success: false, message: "Delivery not found." });
    }

    if (driverId) {
      const driver = await Driver.findById(driverId);
      if (!driver || driver.status === "Inactive") {
        return res.status(400).json({ success: false, message: "Selected driver is unavailable or inactive." });
      }
      delivery.driver = driverId;
      await Driver.findByIdAndUpdate(driverId, { status: "Busy" });
    }

    if (vehicleId) {
      const vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle || vehicle.currentStatus === "Maintenance") {
        return res.status(400).json({ success: false, message: "Selected vehicle is under maintenance or unavailable." });
      }
      delivery.vehicle = vehicleId;
      await Vehicle.findByIdAndUpdate(vehicleId, { currentStatus: "On Delivery" });
    }

    if (warehouseId) delivery.warehouse = warehouseId;
    if (dispatchDate) delivery.dispatchDate = dispatchDate;
    if (expectedDeliveryDate) delivery.expectedDeliveryDate = expectedDeliveryDate;

    delivery.deliveryStatus = "Assigned";
    delivery.timeline.push({
      status: "Assigned",
      remarks: `Assigned Driver & Vehicle for delivery dispatch.`,
      performedBy: req.user?.id,
    });

    await delivery.save();

    res.json({ success: true, message: "Driver & Vehicle assigned successfully.", delivery });
  } catch (error) {
    console.error("Assign Delivery Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 5. PUT /api/delivery/status (Update Delivery Status)
// ==========================================
exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { deliveryId, deliveryStatus, remarks } = req.body;

    const delivery = await Delivery.findById(deliveryId).populate("order");
    if (!delivery) {
      return res.status(404).json({ success: false, message: "Delivery not found." });
    }

    delivery.deliveryStatus = deliveryStatus;
    if (deliveryStatus === "Delivered") {
      delivery.deliveredDate = new Date();
      if (delivery.driver) await Driver.findByIdAndUpdate(delivery.driver, { status: "Available" });
      if (delivery.vehicle) await Vehicle.findByIdAndUpdate(delivery.vehicle, { currentStatus: "Available" });

      // Update Order Status to Delivered
      if (delivery.order) {
        await Order.findByIdAndUpdate(delivery.order._id, { orderStatus: "Delivered", status: "Delivered" });
      }
    } else if (deliveryStatus === "Dispatched" || deliveryStatus === "Out For Delivery") {
      if (!delivery.dispatchDate) delivery.dispatchDate = new Date();
      if (delivery.order) {
        await Order.findByIdAndUpdate(delivery.order._id, { orderStatus: "In Transit", status: "In Transit" });
      }
    }

    delivery.timeline.push({
      status: deliveryStatus,
      remarks: remarks || `Status updated to ${deliveryStatus}`,
      performedBy: req.user?.id,
    });

    await delivery.save();

    res.json({ success: true, message: `Delivery status updated to ${deliveryStatus}.`, delivery });
  } catch (error) {
    console.error("Update Delivery Status Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 6. PUT /api/delivery/proof (Proof of Delivery)
// ==========================================
exports.uploadProofOfDelivery = async (req, res) => {
  try {
    const { deliveryId, receiverName, signatureUrl, photoUrl, gpsLocation, otp } = req.body;

    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return res.status(404).json({ success: false, message: "Delivery not found." });
    }

    delivery.proofOfDelivery = {
      receiverName: receiverName || "Retailer Store Receiver",
      signatureUrl: signatureUrl || "",
      photoUrl: photoUrl || "",
      gpsLocation: gpsLocation || { latitude: 17.385, longitude: 78.4867 },
      otp: otp || "",
      deliveredTime: new Date(),
    };

    delivery.deliveryStatus = "Delivered";
    delivery.deliveredDate = new Date();
    delivery.timeline.push({
      status: "Delivered",
      remarks: `Proof of Delivery captured for receiver ${receiverName || "Retailer"}.`,
      performedBy: req.user?.id,
    });

    await delivery.save();

    if (delivery.driver) await Driver.findByIdAndUpdate(delivery.driver, { status: "Available" });
    if (delivery.vehicle) await Vehicle.findByIdAndUpdate(delivery.vehicle, { currentStatus: "Available" });
    if (delivery.order) await Order.findByIdAndUpdate(delivery.order, { orderStatus: "Delivered", status: "Delivered" });

    res.json({ success: true, message: "Proof of Delivery saved successfully!", delivery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 7. POST /api/delivery/return (Failed Delivery Return)
// ==========================================
exports.createDeliveryReturn = async (req, res) => {
  try {
    const { deliveryId, reason, remarks } = req.body;

    const delivery = await Delivery.findById(deliveryId).populate("order");
    if (!delivery) {
      return res.status(404).json({ success: false, message: "Delivery not found." });
    }

    delivery.deliveryStatus = "Returned";
    delivery.remarks = `Return Reason: ${reason} - ${remarks || ""}`;
    delivery.timeline.push({
      status: "Returned",
      remarks: `Delivery failed & returned. Reason: ${reason}`,
      performedBy: req.user?.id,
    });
    await delivery.save();

    if (delivery.driver) await Driver.findByIdAndUpdate(delivery.driver, { status: "Available" });
    if (delivery.vehicle) await Vehicle.findByIdAndUpdate(delivery.vehicle, { currentStatus: "Available" });

    res.json({ success: true, message: "Delivery return request recorded.", delivery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 8. GET /api/delivery/dashboard (Logistics KPIs)
// ==========================================
exports.getDeliveryDashboard = async (req, res) => {
  try {
    const totalDeliveries = await Delivery.countDocuments();
    const pendingCount = await Delivery.countDocuments({ deliveryStatus: { $in: ["Pending", "Assigned", "Packed"] } });
    const inTransitCount = await Delivery.countDocuments({ deliveryStatus: { $in: ["Dispatched", "In Transit", "Out For Delivery"] } });
    const deliveredCount = await Delivery.countDocuments({ deliveryStatus: "Delivered" });
    const failedCount = await Delivery.countDocuments({ deliveryStatus: { $in: ["Failed", "Cancelled", "Returned"] } });

    const availableDrivers = await Driver.countDocuments({ status: "Available" });
    const busyDrivers = await Driver.countDocuments({ status: "Busy" });

    const availableVehicles = await Vehicle.countDocuments({ currentStatus: "Available" });
    const onDeliveryVehicles = await Vehicle.countDocuments({ currentStatus: "On Delivery" });

    res.json({
      success: true,
      metrics: {
        totalDeliveries,
        pendingDeliveries: pendingCount,
        inTransit: inTransitCount,
        delivered: deliveredCount,
        failed: failedCount,
        availableDrivers,
        busyDrivers,
        availableVehicles,
        onDeliveryVehicles,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
