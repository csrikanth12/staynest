const express = require('express');
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  getOwnerPayments,
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/owner/all', protect, authorize('owner', 'admin'), getOwnerPayments);

module.exports = router;
