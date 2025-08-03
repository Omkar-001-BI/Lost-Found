import Notification from '../../models/Notification.js';

// Add a new notification
export const addNotification = async (req, res) => {
    try {
        const { userId, type, message, itemId, fromUserId } = req.body;
        const notification = new Notification({ userId, type, message, itemId, fromUserId });
        await notification.save();
        res.status(201).json({ ok: true, notification });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Failed to add notification' });
    }
};

// Get all notifications for a user
export const getNotificationsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json({ ok: true, notifications });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Failed to fetch notifications' });
    }
};

// Mark a notification as read
export const markNotificationRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        await Notification.findByIdAndUpdate(notificationId, { isRead: true });
        res.status(200).json({ ok: true, msg: 'Notification marked as read' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Failed to mark notification as read' });
    }
};

// Clear all notifications for a user
export const clearAllNotifications = async (req, res) => {
    try {
        const { userId } = req.params;
        await Notification.deleteMany({ userId });
        res.status(200).json({ ok: true, msg: 'All notifications cleared' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Failed to clear notifications' });
    }
}; 