const express = require('express');
const {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getUserNotifications);

router.route('/read-all')
  .put(protect, markAllNotificationsRead);

router.route('/:id/read')
  .put(protect, markNotificationRead);

router.route('/:id')
  .delete(protect, deleteNotification);

module.exports = router;
