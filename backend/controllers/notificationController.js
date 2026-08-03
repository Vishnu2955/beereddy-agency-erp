const Notification = require("../models/Notification");
const { sendNotification, broadcastNotification } = require("../services/notificationService");

// ==========================================
// 1. GET /api/notifications (All Notifications)
// ==========================================
exports.getNotifications = async (req, res) => {
  try {
    const query = { isArchived: { $ne: true } };
    if (req.user?.role === "retailer") {
      query.$or = [{ recipient: req.user.id }, { recipientType: "Retailer" }, { recipientType: "All" }];
    } else if (req.user?.role === "driver") {
      query.$or = [{ recipient: req.user.id }, { recipientType: "Driver" }, { recipientType: "All" }];
    } else {
      query.$or = [{ recipient: req.user.id }, { recipientType: "Admin" }, { recipientType: "All" }];
    }

    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, count: notifications.length, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 2. GET /api/notifications/unread
// ==========================================
exports.getUnreadNotifications = async (req, res) => {
  try {
    const query = { isRead: false, isArchived: { $ne: true } };
    if (req.user?.role === "retailer") {
      query.$or = [{ recipient: req.user.id }, { recipientType: "Retailer" }, { recipientType: "All" }];
    } else {
      query.$or = [{ recipient: req.user.id }, { recipientType: "Admin" }, { recipientType: "All" }];
    }

    const unread = await Notification.find(query).sort({ createdAt: -1 });
    res.json({ success: true, unreadCount: unread.length, notifications: unread });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 3. POST /api/notifications/send
// ==========================================
exports.sendNotificationHandler = async (req, res) => {
  try {
    const { title, message, recipientId, recipientType, channel, priority, recipientEmail } = req.body;
    const notif = await sendNotification({
      title,
      message,
      recipientId,
      recipientType,
      channel,
      priority,
      recipientEmail,
    });

    res.status(201).json({ success: true, message: "Notification sent successfully.", notification: notif });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 4. POST /api/notifications/broadcast
// ==========================================
exports.broadcastHandler = async (req, res) => {
  try {
    const { title, message, recipientType, channel } = req.body;
    const notif = await broadcastNotification({ title, message, recipientType, channel });

    res.status(201).json({ success: true, message: "Broadcast notification dispatched.", notification: notif });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 5. PUT /api/notifications/read/:id (Mark as Seen / Auto-Archive on 2nd View)
// ==========================================
exports.markAsRead = async (req, res) => {
  try {
    const existing = await Notification.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Notification not found." });
    }

    const newViewCount = (existing.viewCount || 0) + 1;
    const isArchived = newViewCount >= 2;

    const notif = await Notification.findByIdAndUpdate(
      req.params.id,
      {
        isRead: true,
        readAt: existing.readAt || new Date(),
        status: "Read",
        viewCount: newViewCount,
        isArchived: isArchived,
      },
      { new: true }
    );

    res.json({
      success: true,
      message: isArchived ? "Notification viewed 2nd time & archived." : "Notification marked as seen.",
      notification: notif,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 6. DELETE /api/notifications/:id
// ==========================================
exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Notification deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
