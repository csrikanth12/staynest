const Room = require('../models/Room');
const Hostel = require('../models/Hostel');

// @desc    Get rooms (by hostelId query or owner)
// @route   GET /api/rooms
// @access  Public (or Private for owner full list)
const getRooms = async (req, res, next) => {
  try {
    const { hostelId, roomType, availableOnly } = req.query;
    const query = {};

    if (hostelId) {
      query.hostel = hostelId;
    }

    if (roomType) {
      query.roomType = roomType;
    }

    if (availableOnly === 'true') {
      query.availableBeds = { $gt: 0 };
      query.isAvailable = true;
    }

    const rooms = await Room.find(query).populate('hostel', 'name location startingPrice owner');
    res.json({ success: true, count: rooms.length, data: rooms });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single room by ID
// @route   GET /api/rooms/:id
// @access  Public
const getRoomById = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id).populate('hostel', 'name location startingPrice owner');
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    res.json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a room for a hostel
// @route   POST /api/rooms
// @access  Private (Owner/Admin)
const createRoom = async (req, res, next) => {
  try {
    const { hostel, roomNumber, roomType, capacity, price, availableBeds, amenities, image } = req.body;

    const targetHostel = await Hostel.findById(hostel);
    if (!targetHostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    // Check ownership
    if (targetHostel.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to add rooms to this hostel' });
    }

    const room = await Room.create({
      hostel,
      roomNumber,
      roomType,
      capacity: Number(capacity) || 1,
      price: Number(price),
      availableBeds: Number(availableBeds) || Number(capacity) || 1,
      amenities: amenities || [],
      image: image || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80',
    });

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: room,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a room
// @route   PUT /api/rooms/:id
// @access  Private (Owner/Admin)
const updateRoom = async (req, res, next) => {
  try {
    let room = await Room.findById(req.params.id).populate('hostel');
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Check ownership
    if (room.hostel.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this room' });
    }

    room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Room updated successfully',
      data: room,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a room
// @route   DELETE /api/rooms/:id
// @access  Private (Owner/Admin)
const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id).populate('hostel');
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Check ownership
    if (room.hostel.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this room' });
    }

    await room.deleteOne();

    res.json({
      success: true,
      message: 'Room deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
};
