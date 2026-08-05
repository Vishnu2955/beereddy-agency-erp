const Notification = require("../models/Notification");
const { sendNotification, broadcastNotification } = require("../services/notificationService");

// 1. GET /api/notifications (All Notifications)
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
    const unreadCount = notifications.filter(n => !n.isRead).length;

    res.json({ success: true, count: notifications.length, unreadCount, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. GET /api/notifications/unread
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

// 3. POST /api/notifications/send
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

// 4. POST /api/notifications/broadcast
exports.broadcastHandler = async (req, res) => {
  try {
    const { title, message, recipientType, channel } = req.body;
    const notif = await broadcastNotification({ title, message, recipientType, channel });

    res.status(201).json({ success: true, message: "Broadcast notification dispatched.", notification: notif });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. PUT /api/notifications/read/:id (Mark as Read)
exports.markAsRead = async (req, res) => {
  try {
    const notif = await Notification.findByIdAndUpdate(
      req.params.id,
      {
        isRead: true,
        readAt: new Date(),
        status: "Read",
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "Notification marked as read.",
      notification: notif,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. PUT /api/notifications/read-all (Mark All as Read)
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ isRead: false }, { isRead: true, status: "Read", readAt: new Date() });
    res.json({ success: true, message: "All notifications marked as read." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. DELETE /api/notifications/:id
exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Notification deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
