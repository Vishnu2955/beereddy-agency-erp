const express = require("express");
const router = express.Router();

const { getDrivers, createDriver, updateDriver, deleteDriver } = require("../controllers/driverController");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

router.use(verifyToken);

router.get("/", getDrivers);
router.post("/", isAdmin, createDriver);
router.put("/:id", isAdmin, updateDriver);
router.delete("/:id", isAdmin, deleteDriver);

module.exports = router;
