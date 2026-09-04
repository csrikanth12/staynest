const express = require('express');
const router = express.Router();
const {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
} = require('../controllers/roomController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getRooms);
router.get('/:id', getRoomById);
router.post('/', protect, authorize('owner', 'admin'), createRoom);
router.put('/:id', protect, authorize('owner', 'admin'), updateRoom);
router.delete('/:id', protect, authorize('owner', 'admin'), deleteRoom);

module.exports = router;
