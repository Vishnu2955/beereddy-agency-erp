const express = require("express");

const router = express.Router();

const {
  createContact,
  getAllContacts,
  deleteContact,
  markAsContacted,
} = require("../controllers/contactController");

const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

// ==============================
// Public Route
// ==============================

router.post("/", createContact);

// ==============================
// Admin Routes
// ==============================

router.get("/", verifyToken, isAdmin, getAllContacts);

router.patch(
  "/:id/contacted",
  verifyToken,
  isAdmin,
  markAsContacted
);

router.delete("/:id", verifyToken, isAdmin, deleteContact);

module.exports = router;