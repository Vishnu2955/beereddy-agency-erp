const express = require("express");
const router = express.Router();

const {
  getInvoices,
  getInvoice,
  createInvoice,
} = require("../controllers/invoiceController");

const {
  verifyToken,
  isAdmin,
} = require("../middleware/authMiddleware");

router.get("/", verifyToken, isAdmin, getInvoices);

router.get("/:id", verifyToken, isAdmin, getInvoice);

router.post("/", verifyToken, isAdmin, createInvoice);

module.exports = router;