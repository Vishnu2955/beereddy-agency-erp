const Inventory = require("../models/Inventory");
const StockHistory = require("../models/StockHistory");
const ProductReturn = require("../models/ProductReturn");
const Warehouse = require("../models/Warehouse");
const Product = require("../models/Product");
const Order = require("../models/Order");

const {
  syncProductInventory,
  recordStockMovement,
} = require("../utils/inventoryHelper");
const { recordAuditLog } = require("../middleware/auditLogger");

// ==========================================
// 1. GET /api/inventory (Inventory List)
// ==========================================
exports.getInventoryList = async (req, res) => {
  try {
    const { search, warehouse, minStockFilter } = req.query;

    // Ensure all products have an inventory document initialized
    const allProducts = await Product.find({});
    for (const p of allProducts) {
      await syncProductInventory(p._id);
    }

    const query = {};
    if (warehouse) query.warehouse = warehouse;

    let items = await Inventory.find(query)
      .populate("product", "productName brand category sellingPrice costPrice purchasePrice stock sku unit image mrp")
      .populate("warehouse", "name code location")
      .sort({ updatedAt: -1 });

    // Filter out null products
    items = items.filter((item) => item.product !== null && item.product !== undefined);

    if (search) {
      const term = search.toLowerCase();
      items = items.filter(
        (item) =>
          item.product?.productName?.toLowerCase().includes(term) ||
          item.product?.brand?.toLowerCase().includes(term) ||
          item.product?.sku?.toLowerCase().includes(term) ||
          item.batchNumber?.toLowerCase().includes(term)
      );
    }

    if (minStockFilter === "low") {
      items = items.filter((item) => item.availableStock <= item.minimumStock);
    } else if (minStockFilter === "out") {
      items = items.filter((item) => item.currentStock === 0);
    }

    res.json({
      success: true,
      count: items.length,
      inventory: items,
    });
  } catch (error) {
    console.error("Get Inventory Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 2. GET /api/inventory/dashboard (Metrics)
// ==========================================
exports.getInventoryDashboard = async (req, res) => {
  try {
    const allProducts = await Product.find({});
    for (const p of allProducts) {
      await syncProductInventory(p._id);
    }

    const rawItems = await Inventory.find().populate("product", "productName sellingPrice purchasePrice mrp stock");
    const items = rawItems.filter((i) => i.product !== null && i.product !== undefined);

    const totalProducts = items.length;
    const totalStock = items.reduce((sum, i) => sum + Number(i.currentStock || 0), 0);
    const reservedStock = items.reduce((sum, i) => sum + Number(i.reservedStock || 0), 0);
    const availableStock = items.reduce((sum, i) => sum + Number(i.availableStock || 0), 0);

    const lowStockCount = items.filter((i) => i.availableStock <= i.minimumStock).length;
    const outOfStockCount = items.filter((i) => i.currentStock === 0).length;

    // Total Inventory Asset Value (Stock * Price)
    const inventoryValue = items.reduce((sum, i) => {
      const price = Number(i.product?.sellingPrice || i.product?.purchasePrice || i.product?.mrp || 0);
      return sum + Math.max(0, Number(i.currentStock || 0)) * price;
    }, 0);

    // Sales Aggregation to find Most Sold and Least Sold Products
    const salesAggregation = await Order.aggregate([
      { $match: { orderStatus: { $ne: "Cancelled" } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          productName: { $first: "$items.productName" },
          totalQuantitySold: { $sum: "$items.quantity" },
        },
      },
      { $sort: { totalQuantitySold: -1 } },
    ]);

    const mostSoldProduct = salesAggregation.length > 0 ? salesAggregation[0] : null;
    const leastSoldProduct = salesAggregation.length > 0 ? salesAggregation[salesAggregation.length - 1] : null;

    res.json({
      success: true,
      metrics: {
        totalProducts,
        totalStock,
        availableStock,
        reservedStock,
        lowStock: lowStockCount,
        outOfStock: outOfStockCount,
        inventoryValue: Math.round(inventoryValue * 100) / 100,
        mostSoldProduct: mostSoldProduct ? `${mostSoldProduct.productName} (${mostSoldProduct.totalQuantitySold} units)` : "N/A",
        leastSoldProduct: leastSoldProduct ? `${leastSoldProduct.productName} (${leastSoldProduct.totalQuantitySold} units)` : "N/A",
      },
    });
  } catch (error) {
    console.error("Get Inventory Dashboard Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 3. GET /api/inventory/history (Movement Log)
// ==========================================
exports.getStockHistory = async (req, res) => {
  try {
    const history = await StockHistory.find()
      .populate("product", "productName brand sku")
      .populate("warehouse", "name code")
      .populate("performedBy", "fullName role")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error) {
    console.error("Get Stock History Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 4. GET /api/inventory/low-stock
// ==========================================
exports.getLowStockItems = async (req, res) => {
  try {
    const items = await Inventory.find()
      .populate("product", "productName brand sellingPrice sku image")
      .populate("warehouse", "name");

    const lowStock = items.filter((i) => i.availableStock <= i.minimumStock);

    res.json({
      success: true,
      count: lowStock.length,
      lowStock,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 5. GET /api/inventory/out-of-stock
// ==========================================
exports.getOutOfStockItems = async (req, res) => {
  try {
    const items = await Inventory.find({ currentStock: 0 })
      .populate("product", "productName brand sellingPrice sku image")
      .populate("warehouse", "name");

    res.json({
      success: true,
      count: items.length,
      outOfStock: items.map((i) => ({ ...i.toObject(), status: "OUT_OF_STOCK" })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 6. POST /api/inventory/purchase (New Stock Entry)
// ==========================================
exports.purchaseStockEntry = async (req, res) => {
  try {
    const {
      productId,
      warehouseId,
      supplier,
      invoiceNumber,
      purchaseQuantity,
      purchasePrice,
      gst = 0,
      transportCharges = 0,
      batchNumber,
      expiryDate,
    } = req.body;

    if (!productId || !purchaseQuantity || purchaseQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid Product ID and purchase quantity (> 0) are required.",
      });
    }

    const inv = await syncProductInventory(productId);
    if (!inv) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    const prevStock = inv.currentStock;
    const newStock = prevStock + Number(purchaseQuantity);

    inv.currentStock = newStock;
    if (supplier) inv.supplier = supplier;
    if (batchNumber) inv.batchNumber = batchNumber;
    if (expiryDate) inv.expiryDate = expiryDate;
    if (warehouseId) inv.warehouse = warehouseId;
    await inv.save();

    // Sync Product Model
    await Product.findByIdAndUpdate(productId, { stock: newStock });

    // Record Stock Movement History
    await recordStockMovement({
      productId,
      warehouseId,
      previousStock: prevStock,
      newStock,
      quantityChanged: Number(purchaseQuantity),
      type: "Purchase",
      reason: `New Purchase Entry Inv #${invoiceNumber || "N/A"} from ${supplier || "Supplier"}`,
      performedBy: req.user?.id,
      referenceDoc: invoiceNumber || "",
    });

    // Record Audit Log for Purchase Entry
    await recordAuditLog({
      req,
      action: "Stock Purchase",
      affectedModule: "Inventory",
      newValue: { purchaseQuantity, newStock, supplier },
      reason: `Purchased ${purchaseQuantity} units (Inv #${invoiceNumber || "N/A"})`,
    });

    res.status(201).json({
      success: true,
      message: `Successfully added ${purchaseQuantity} units to stock from purchase!`,
      inventory: inv,
    });
  } catch (error) {
    console.error("Purchase Stock Entry Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 7. POST /api/inventory/adjust (Manual Edit)
// ==========================================
exports.adjustStock = async (req, res) => {
  try {
    const { productId, adjustmentType, quantity, reason } = req.body;

    if (!productId || !quantity || quantity <= 0 || !reason) {
      return res.status(400).json({
        success: false,
        message: "Product ID, valid positive quantity, and adjustment reason are mandatory.",
      });
    }

    const inv = await syncProductInventory(productId);
    if (!inv) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    const prevStock = inv.currentStock;
    const qty = Number(quantity);
    let newStock = prevStock;

    if (adjustmentType === "INCREASE") {
      newStock = prevStock + qty;
    } else if (adjustmentType === "DECREASE") {
      if (prevStock < qty) {
        return res.status(400).json({
          success: false,
          message: `Cannot decrease stock below 0. Current stock is ${prevStock}.`,
        });
      }
      newStock = prevStock - qty;
    } else {
      return res.status(400).json({ success: false, message: "adjustmentType must be INCREASE or DECREASE." });
    }

    inv.currentStock = newStock;
    await inv.save();

    await Product.findByIdAndUpdate(productId, { stock: newStock });

    await recordStockMovement({
      productId,
      previousStock: prevStock,
      newStock,
      quantityChanged: adjustmentType === "INCREASE" ? qty : -qty,
      type: "Adjustment",
      reason: `Manual Adjustment (${adjustmentType}): ${reason}`,
      performedBy: req.user?.id,
    });

    res.json({
      success: true,
      message: `Stock successfully adjusted to ${newStock} units!`,
      inventory: inv,
    });
  } catch (error) {
    console.error("Adjust Stock Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 8. POST /api/inventory/damage (Damage Entry)
// ==========================================
exports.recordDamage = async (req, res) => {
  try {
    const { productId, quantity, reason } = req.body;

    if (!productId || !quantity || quantity <= 0 || !reason) {
      return res.status(400).json({
        success: false,
        message: "Product ID, damaged quantity, and mandatory reason are required.",
      });
    }

    const inv = await syncProductInventory(productId);
    if (!inv) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    const prevStock = inv.currentStock;
    const qty = Number(quantity);

    if (prevStock < qty) {
      return res.status(400).json({
        success: false,
        message: `Damaged quantity (${qty}) exceeds current available stock (${prevStock}).`,
      });
    }

    const newStock = prevStock - qty;
    inv.currentStock = newStock;
    await inv.save();

    await Product.findByIdAndUpdate(productId, { stock: newStock });

    await recordStockMovement({
      productId,
      previousStock: prevStock,
      newStock,
      quantityChanged: -qty,
      type: "Damage",
      reason: `Damage Write-off: ${reason}`,
      performedBy: req.user?.id,
    });

    res.json({
      success: true,
      message: `Damaged stock (${qty} units) removed from inventory.`,
      inventory: inv,
    });
  } catch (error) {
    console.error("Record Damage Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 9. POST /api/inventory/return (Product Return Request)
// ==========================================
exports.requestReturn = async (req, res) => {
  try {
    const { productId, orderId, quantity, reason } = req.body;
    const retailerId = req.user?.role === "retailer" ? req.user.id : req.body.retailerId;

    if (!productId || !quantity || quantity <= 0 || !reason || !retailerId) {
      return res.status(400).json({
        success: false,
        message: "Product ID, retailer ID, quantity, and reason are required.",
      });
    }

    const productReturn = await ProductReturn.create({
      retailer: retailerId,
      product: productId,
      order: orderId || null,
      quantity: Number(quantity),
      reason,
      status: "Pending",
    });

    res.status(201).json({
      success: true,
      message: "Product return request submitted successfully for Admin approval.",
      productReturn,
    });
  } catch (error) {
    console.error("Request Return Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 10. PUT /api/inventory/return/:id/status (Approve/Reject Return)
// ==========================================
exports.updateReturnStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const returnRecord = await ProductReturn.findById(req.params.id);

    if (!returnRecord) {
      return res.status(404).json({ success: false, message: "Return record not found." });
    }

    if (returnRecord.status !== "Pending") {
      return res.status(400).json({ success: false, message: `Return is already ${returnRecord.status}.` });
    }

    returnRecord.status = status;
    returnRecord.verifiedBy = req.user?.id;
    returnRecord.verifiedAt = new Date();
    await returnRecord.save();

    // If approved, restore returned stock to inventory
    if (status === "Approved") {
      const inv = await syncProductInventory(returnRecord.product);
      if (inv) {
        const prevStock = inv.currentStock;
        const newStock = prevStock + Number(returnRecord.quantity);

        inv.currentStock = newStock;
        await inv.save();

        await Product.findByIdAndUpdate(returnRecord.product, { stock: newStock });

        await recordStockMovement({
          productId: returnRecord.product,
          previousStock: prevStock,
          newStock,
          quantityChanged: Number(returnRecord.quantity),
          type: "Return",
          reason: `Approved Retailer Return: ${returnRecord.reason}`,
          performedBy: req.user?.id,
          referenceDoc: returnRecord._id.toString(),
        });
      }
    }

    res.json({
      success: true,
      message: `Return request ${status} successfully.`,
      productReturn: returnRecord,
    });
  } catch (error) {
    console.error("Update Return Status Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 11. PUT /api/inventory/transfer (Warehouse Transfer)
// ==========================================
exports.transferStock = async (req, res) => {
  try {
    const { productId, fromWarehouseId, toWarehouseId, quantity, reason } = req.body;

    if (!productId || !toWarehouseId || !quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Product ID, Destination Warehouse ID, and valid quantity are required.",
      });
    }

    const inv = await syncProductInventory(productId);
    if (!inv) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    const toWh = await Warehouse.findById(toWarehouseId);
    if (!toWh) {
      return res.status(404).json({ success: false, message: "Destination warehouse not found." });
    }

    inv.warehouse = toWarehouseId;
    await inv.save();

    await recordStockMovement({
      productId,
      warehouseId: toWarehouseId,
      previousStock: inv.currentStock,
      newStock: inv.currentStock,
      quantityChanged: 0,
      type: "Transferred",
      reason: `Transferred ${quantity} units to Warehouse ${toWh.name}: ${reason || "Inter-warehouse Transfer"}`,
      performedBy: req.user?.id,
    });

    res.json({
      success: true,
      message: `Stock location updated to ${toWh.name} warehouse successfully!`,
      inventory: inv,
    });
  } catch (error) {
    console.error("Transfer Stock Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 12. GET & POST /api/inventory/warehouses
// ==========================================
exports.getWarehouses = async (req, res) => {
  try {
    let warehouses = await Warehouse.find().populate("manager", "fullName phone email");
    if (warehouses.length === 0) {
      const defaultWh = await Warehouse.create({
        name: "Main Hyderabad Central Warehouse",
        location: "Kukatpally Industrial Estate, Hyderabad, Telangana",
        capacity: 25000,
      });
      warehouses = [defaultWh];
    }

    res.json({ success: true, count: warehouses.length, warehouses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createWarehouse = async (req, res) => {
  try {
    const { name, location, capacity, manager } = req.body;
    const warehouse = await Warehouse.create({ name, location, capacity, manager });

    res.status(201).json({
      success: true,
      message: "Warehouse created successfully.",
      warehouse,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};