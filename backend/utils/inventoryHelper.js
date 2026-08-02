const Inventory = require("../models/Inventory");
const StockHistory = require("../models/StockHistory");
const Product = require("../models/Product");

// Sync product inventory and keep Product.stock in sync with Inventory.currentStock
const syncProductInventory = async (productId) => {
  let product = await Product.findById(productId);
  if (!product) return null;

  let inv = await Inventory.findOne({ product: productId });
  if (!inv) {
    inv = await Inventory.create({
      product: productId,
      currentStock: Number(product.stock || 0),
      reservedStock: 0,
      availableStock: Number(product.stock || 0),
      minimumStock: 10,
      maximumStock: 500,
    });
  } else {
    inv.availableStock = Math.max(0, Number(inv.currentStock || 0) - Number(inv.reservedStock || 0));
    await inv.save();
  }

  // Ensure Product.stock matches Inventory.currentStock
  if (product.stock !== inv.currentStock) {
    product.stock = inv.currentStock;
    await product.save();
  }

  return inv;
};

// Record Stock Movement Entry in StockHistory
const recordStockMovement = async ({
  productId,
  warehouseId = null,
  previousStock,
  newStock,
  quantityChanged,
  type,
  reason,
  performedBy = null,
  referenceDoc = "",
}) => {
  try {
    const validWh = warehouseId && String(warehouseId).trim() !== "" ? warehouseId : null;
    return await StockHistory.create({
      product: productId,
      warehouse: validWh,
      previousStock,
      newStock,
      quantityChanged,
      type,
      reason,
      performedBy,
      referenceDoc,
    });
  } catch (err) {
    console.error("Record Stock Movement Error:", err);
  }
};

// Reserve stock when an order is created
const reserveStockForOrder = async (orderItems, performedBy = null, orderNumber = "") => {
  for (const item of orderItems) {
    if (!item.product) continue;
    const inv = await syncProductInventory(item.product);
    if (inv) {
      const prevRes = inv.reservedStock;
      inv.reservedStock = Number(prevRes || 0) + Number(item.quantity || 0);
      await inv.save();

      await recordStockMovement({
        productId: item.product,
        previousStock: inv.currentStock,
        newStock: inv.currentStock,
        quantityChanged: Number(item.quantity),
        type: "Reservation",
        reason: `Reserved stock for new order ${orderNumber}`,
        performedBy,
        referenceDoc: orderNumber,
      });
    }
  }
};

// Deduct stock when an order is approved/delivered
const deductStockForApprovedOrder = async (orderItems, performedBy = null, orderNumber = "") => {
  for (const item of orderItems) {
    if (!item.product) continue;
    const inv = await syncProductInventory(item.product);
    if (inv) {
      const prevStock = inv.currentStock;
      const qty = Number(item.quantity || 0);
      
      inv.currentStock = Math.max(0, prevStock - qty);
      inv.reservedStock = Math.max(0, Number(inv.reservedStock || 0) - qty);
      await inv.save();

      // Sync Product.stock
      await Product.findByIdAndUpdate(item.product, { stock: inv.currentStock });

      await recordStockMovement({
        productId: item.product,
        previousStock: prevStock,
        newStock: inv.currentStock,
        quantityChanged: -qty,
        type: "Sale",
        reason: `Stock deducted for order ${orderNumber}`,
        performedBy,
        referenceDoc: orderNumber,
      });
    }
  }
};

// Restore reserved stock when an order is cancelled
const restoreStockForCancelledOrder = async (orderItems, performedBy = null, orderNumber = "") => {
  for (const item of orderItems) {
    if (!item.product) continue;
    const inv = await syncProductInventory(item.product);
    if (inv) {
      const qty = Number(item.quantity || 0);
      inv.reservedStock = Math.max(0, Number(inv.reservedStock || 0) - qty);
      await inv.save();

      await recordStockMovement({
        productId: item.product,
        previousStock: inv.currentStock,
        newStock: inv.currentStock,
        quantityChanged: qty,
        type: "Unreservation",
        reason: `Restored reserved stock for cancelled order ${orderNumber}`,
        performedBy,
        referenceDoc: orderNumber,
      });
    }
  }
};

module.exports = {
  syncProductInventory,
  recordStockMovement,
  reserveStockForOrder,
  deductStockForApprovedOrder,
  restoreStockForCancelledOrder,
};
