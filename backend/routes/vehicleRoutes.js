const express = require("express");
const router = express.Router();

const { getVehicles, createVehicle, updateVehicle, deleteVehicle } = require("../controllers/vehicleController");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

router.use(verifyToken);

router.get("/", getVehicles);
router.post("/", isAdmin, createVehicle);
router.put("/:id", isAdmin, updateVehicle);
router.delete("/:id", isAdmin, deleteVehicle);

module.exports = router;
