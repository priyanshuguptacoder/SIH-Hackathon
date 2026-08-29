const Notification = require('../models/Notification');

// @route   GET /notifications
// @desc    Get all notifications for the logged-in user
// @access  Protected
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.json({ success: true, data: notifications });
  } catch (err) {
    console.error('Get Notifications Error:', err);
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Server error fetching notifications' } });
  }
};

// @route   PUT /notifications/:id/read
// @desc    Mark a notification as read
// @access  Protected
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Notification not found' } });
    }
    if (notification.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not authorized' } });
    }

    notification.isRead = true;
    await notification.save();
    return res.json({ success: true, data: notification });
  } catch (err) {
    console.error('Mark Read Error:', err);
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Server error marking notification' } });
  }
};

// @route   PUT /notifications/read-all
// @desc    Mark all user notifications as read
// @access  Protected
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id, isRead: false }, { isRead: true });
    return res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    console.error('Mark All Read Error:', err);
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Server error marking notifications' } });
  }
};

// Helper: create a notification (used internally by other controllers)
const createNotification = async ({ userId, type, title, message, relatedModel = null, relatedId = null }) => {
  try {
    await Notification.create({ userId, type, title, message, relatedModel, relatedId });
  } catch (e) {
    console.error('Create Notification Error:', e.message);
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead, createNotification };
