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
    inv.currentStock = Number(product.stock || 0);
    inv.availableStock = Math.max(0, Number(inv.currentStock || 0) - Number(inv.reservedStock || 0));
    await inv.save();
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

/**
 * Atomic stock deduction for approved / placed orders.
 * Validates stock, deducts atomically using $inc, logs detail, and supports rollback on failure.
 */
const deductStockForApprovedOrder = async (orderItems, performedBy = null, orderNumber = "") => {
  const deductedBatch = [];

  try {
    for (const item of orderItems) {
      const productId = item.product;
      const qty = Number(item.quantity || 0);

      if (!productId) {
        throw new Error("Invalid product reference in order items.");
      }

      if (qty <= 0) {
        throw new Error("Quantity must be greater than zero.");
      }

      // Step 1: Validate Product existence, active status, and non-deleted
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error(`Product not found.`);
      }

      if (product.isActive === false || product.isDeleted === true) {
        throw new Error(`Product "${product.productName}" is inactive or deleted.`);
      }

      if (product.stock < qty) {
        throw new Error(`Insufficient stock for "${product.productName}". Available: ${product.stock}, Ordered: ${qty}.`);
      }

      const previousStock = Number(product.stock || 0);

      // Step 2: Atomic MongoDB deduction on Product schema using $inc with stock >= qty condition
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: productId,
          stock: { $gte: qty },
          isActive: { $ne: false },
        },
        {
          $inc: { stock: -qty },
        },
        { new: true }
      );

      if (!updatedProduct) {
        throw new Error(`Stock collision or insufficient stock for "${product.productName}". Available stock was altered concurrently.`);
      }

      const newStock = updatedProduct.stock;

      // Keep Inventory model in sync atomically
      await Inventory.findOneAndUpdate(
        { product: productId },
        {
          $inc: { currentStock: -qty, availableStock: -qty },
        },
        { upsert: true }
      );

      // Track deducted item for potential rollback
      deductedBatch.push({ productId, qty });

      // Detailed Inventory Log
      console.log(
        `[INVENTORY STOCK DEDUCTION LOG] ` +
        `Order: ${orderNumber} | User: ${performedBy || "System"} | ` +
        `Product: ${product.productName} (${productId}) | ` +
        `Previous Stock: ${previousStock} | Ordered Quantity: ${qty} | ` +
        `New Stock: ${newStock} | Time: ${new Date().toISOString()}`
      );

      // Record in StockHistory
      await recordStockMovement({
        productId,
        previousStock,
        newStock,
        quantityChanged: -qty,
        type: "Sale",
        reason: `Stock deducted for order ${orderNumber}`,
        performedBy,
        referenceDoc: orderNumber,
      });
    }

    return true;
  } catch (error) {
    console.error(`[STOCK DEDUCTION FAILED] Order: ${orderNumber}. Initiating rollback of ${deductedBatch.length} items. Error: ${error.message}`);

    // Automatic Rollback for items deducted so far in this failed batch
    for (const item of deductedBatch) {
      try {
        await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.qty } });
        await Inventory.findOneAndUpdate(
          { product: item.productId },
          { $inc: { currentStock: item.qty, availableStock: item.qty } }
        );
        console.log(`[STOCK ROLLBACK COMPLETED] Product: ${item.productId} restored by +${item.qty} units.`);
      } catch (rollbackErr) {
        console.error(`[CRITICAL ROLLBACK FAILURE] Product: ${item.productId}`, rollbackErr);
      }
    }

    throw error;
  }
};

// Restore stock when an order is cancelled
const restoreStockForCancelledOrder = async (orderItems, performedBy = null, orderNumber = "") => {
  for (const item of orderItems) {
    if (!item.product) continue;
    const qty = Number(item.quantity || 0);

    const product = await Product.findByIdAndUpdate(
      item.product,
      { $inc: { stock: qty } },
      { new: true }
    );

    if (product) {
      await Inventory.findOneAndUpdate(
        { product: item.product },
        { $inc: { currentStock: qty, availableStock: qty } }
      );

      await recordStockMovement({
        productId: item.product,
        previousStock: product.stock - qty,
        newStock: product.stock,
        quantityChanged: qty,
        type: "Return",
        reason: `Restored stock for cancelled order ${orderNumber}`,
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
