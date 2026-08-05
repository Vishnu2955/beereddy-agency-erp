const express = require("express");
const router = express.Router();

const {
  getNotifications,
  getUnreadNotifications,
  sendNotificationHandler,
  broadcastHandler,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

router.use(verifyToken);

router.get("/", getNotifications);
router.get("/unread", getUnreadNotifications);
router.post("/send", isAdmin, sendNotificationHandler);
router.post("/broadcast", isAdmin, broadcastHandler);
router.put("/read-all", markAllAsRead);
router.put("/read/:id", markAsRead);
router.delete("/:id", deleteNotification);

module.exports = router;
