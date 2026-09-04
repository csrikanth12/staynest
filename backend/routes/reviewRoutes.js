const express = require('express');
const router = express.Router();
const {
  getHostelReviews,
  addReview,
  getOwnerReviews,
  replyToReview,
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/hostel/:hostelId', getHostelReviews);
router.post('/', protect, addReview);
router.get('/owner/all', protect, authorize('owner', 'admin'), getOwnerReviews);
router.put('/:id/reply', protect, authorize('owner', 'admin'), replyToReview);

module.exports = router;
