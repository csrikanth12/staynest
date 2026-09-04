const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getRevenueAnalytics,
  getBookingsAnalytics,
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, authorize('owner', 'admin'), getDashboardStats);
router.get('/revenue', protect, authorize('owner', 'admin'), getRevenueAnalytics);
router.get('/bookings', protect, authorize('owner', 'admin'), getBookingsAnalytics);

module.exports = router;
