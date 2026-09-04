const express = require('express');
const router = express.Router();
const {
  getAllHostels,
  getHostelById,
  getHostelImages,
  getOwnerHostels,
  createHostel,
  updateHostel,
  deleteHostel,
} = require('../controllers/hostelController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getAllHostels);
router.get('/owner/my-hostels', protect, authorize('owner', 'admin'), getOwnerHostels);
router.get('/:id', getHostelById);
router.get('/:id/images', getHostelImages);
router.post('/', protect, authorize('owner', 'admin'), createHostel);
router.put('/:id', protect, authorize('owner', 'admin'), updateHostel);
router.delete('/:id', protect, authorize('owner', 'admin'), deleteHostel);

module.exports = router;
