import express from 'express';
import { addNotification, getNotificationsByUser, markNotificationRead, clearAllNotifications } from '../controllers/Notifications/NotificationController.js';

const router = express.Router();

// Add a notification
router.post('/', addNotification);

// Get all notifications for a user
router.get('/:userId', getNotificationsByUser);

// Mark a notification as read
router.put('/:notificationId/read', markNotificationRead);

// Clear all notifications for a user
router.delete('/user/:userId', clearAllNotifications);

export default router; 