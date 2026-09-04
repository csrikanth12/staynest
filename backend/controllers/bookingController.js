const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Hostel = require('../models/Hostel');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private (Customer/User)
const createBooking = async (req, res, next) => {
  try {
    const {
      hostelId,
      roomId,
      checkIn,
      checkOut,
      guests = 1,
      specialRequests = '',
      guestDetails,
    } = req.body;

    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    if (room.availableBeds < guests) {
      return res.status(400).json({
        success: false,
        message: `Only ${room.availableBeds} beds available in this room`,
      });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
    const nights = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)));

    const amount = room.price * nights * guests;
    const taxes = Math.round(amount * 0.12); // 12% GST
    const totalAmount = amount + taxes;

    const booking = await Booking.create({
      customer: req.user._id,
      hostel: hostelId,
      room: roomId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: Number(guests),
      nights,
      amount,
      taxes,
      totalAmount,
      paymentStatus: 'Pending',
      bookingStatus: 'Pending',
      specialRequests,
      guestDetails: guestDetails || {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone || '+91 98765 43210',
      },
    });

    // Populate for clean response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('hostel', 'name location images contactInfo cancellationPolicy')
      .populate('room', 'roomNumber roomType price');

    // Trigger Notification for Customer
    try {
      await Notification.create({
        recipient: req.user._id,
        title: 'Booking Initiated',
        message: `Your reservation at ${hostel.name} for ${nights} night(s) has been created. Complete payment to confirm your stay.`,
        type: 'booking',
        link: `/payment/${booking._id}`,
      });

      // Trigger Notification for Hostel Owner
      if (hostel.owner) {
        await Notification.create({
          recipient: hostel.owner,
          title: 'New Booking Request',
          message: `${req.user.name} initiated booking for ${room.roomType} at ${hostel.name}.`,
          type: 'booking',
          link: '/owner/bookings',
        });
      }
    } catch (notifErr) {
      console.warn('Notification trigger error:', notifErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: populatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user's bookings
// @route   GET /api/bookings
// @access  Private (Customer)
const getUserBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ customer: req.user._id })
      .populate('hostel', 'name location images rating')
      .populate('room', 'roomNumber roomType price')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'name email phone profileImage')
      .populate('hostel', 'name location images contactInfo cancellationPolicy rules owner')
      .populate('room', 'roomNumber roomType price capacity amenities');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Authorization: customer who made the booking OR owner of the hostel OR admin
    const isCustomer = booking.customer._id.toString() === req.user._id.toString();
    const isOwner = booking.hostel.owner && booking.hostel.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
    }

    // Get payment info if available
    const payment = await Payment.findOne({ booking: booking._id });

    res.json({
      success: true,
      data: {
        ...booking.toObject(),
        payment: payment || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private (Customer / Owner)
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('hostel');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const isCustomer = booking.customer.toString() === req.user._id.toString();
    const isOwner = booking.hostel.owner && booking.hostel.owner.toString() === req.user._id.toString();

    if (!isCustomer && !isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    if (booking.bookingStatus === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    booking.bookingStatus = 'Cancelled';
    booking.paymentStatus = booking.paymentStatus === 'Paid' ? 'Refunded' : 'Failed';
    await booking.save();

    // Restore available beds
    await Room.findByIdAndUpdate(booking.room, {
      $inc: { availableBeds: booking.guests },
    });

    // Send notifications
    try {
      // Customer notification
      await Notification.create({
        recipient: booking.customer,
        title: 'Booking Cancelled',
        message: `Your booking for ${booking.hostel.name} has been cancelled.${booking.paymentStatus === 'Refunded' ? ' Refund will be credited within 3-5 working days.' : ''}`,
        type: 'booking',
        link: '/my-bookings',
      });

      // Owner notification
      if (booking.hostel.owner) {
        await Notification.create({
          recipient: booking.hostel.owner,
          title: 'Booking Cancelled',
          message: `Booking #${booking._id.toString().substring(0, 8)} at ${booking.hostel.name} was cancelled.`,
          type: 'booking',
          link: '/owner/bookings',
        });
      }
    } catch (notifErr) {
      console.warn('Notification trigger error:', notifErr.message);
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get owner's bookings across their hostels
// @route   GET /api/bookings/owner/all
// @access  Private (Owner/Admin)
const getOwnerBookings = async (req, res, next) => {
  try {
    const { status, hostelId, search } = req.query;

    // Find all hostels owned by this user
    const ownerHostels = await Hostel.find({ owner: req.user._id }).select('_id');
    const hostelIds = ownerHostels.map((h) => h._id);

    const query = { hostel: { $in: hostelIds } };

    if (hostelId && hostelId !== 'all') {
      query.hostel = hostelId;
    }

    if (status && status !== 'all') {
      query.bookingStatus = status;
    }

    let bookings = await Booking.find(query)
      .populate('customer', 'name email phone profileImage')
      .populate('hostel', 'name location')
      .populate('room', 'roomNumber roomType price')
      .sort({ createdAt: -1 });

    if (search) {
      const searchLower = search.toLowerCase();
      bookings = bookings.filter((b) => {
        return (
          b._id.toString().includes(searchLower) ||
          (b.customer && b.customer.name.toLowerCase().includes(searchLower)) ||
          (b.customer && b.customer.email.toLowerCase().includes(searchLower)) ||
          (b.hostel && b.hostel.name.toLowerCase().includes(searchLower))
        );
      });
    }

    res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status (Owner/Admin)
// @route   PUT /api/bookings/:id/status
// @access  Private (Owner/Admin)
const updateBookingStatus = async (req, res, next) => {
  try {
    const { bookingStatus, paymentStatus } = req.body;
    const booking = await Booking.findById(req.params.id).populate('hostel');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.hostel.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to manage this booking' });
    }

    if (bookingStatus) booking.bookingStatus = bookingStatus;
    if (paymentStatus) booking.paymentStatus = paymentStatus;

    await booking.save();

    // Notify customer about status update
    try {
      await Notification.create({
        recipient: booking.customer,
        title: 'Booking Status Update',
        message: `Your booking at ${booking.hostel.name} has been updated to "${booking.bookingStatus}".`,
        type: 'booking',
        link: '/my-bookings',
      });
    } catch (notifErr) {
      console.warn('Notification trigger error:', notifErr.message);
    }

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  getOwnerBookings,
  updateBookingStatus,
};
