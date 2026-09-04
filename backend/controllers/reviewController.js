const Review = require('../models/Review');
const Hostel = require('../models/Hostel');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');

// @desc    Get reviews for a hostel
// @route   GET /api/reviews/hostel/:hostelId
// @access  Public
const getHostelReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ hostel: req.params.hostelId })
      .populate('customer', 'name profileImage')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add review for a hostel
// @route   POST /api/reviews
// @access  Private (Customer)
const addReview = async (req, res, next) => {
  try {
    const { hostelId, rating, comment } = req.body;

    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    // Check if user already reviewed this hostel
    const existingReview = await Review.findOne({
      customer: req.user._id,
      hostel: hostelId,
    });

    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already submitted a review for this hostel' });
    }

    const review = await Review.create({
      customer: req.user._id,
      hostel: hostelId,
      rating: Number(rating),
      comment,
    });

    // Recalculate hostel average rating
    const allReviews = await Review.find({ hostel: hostelId });
    const avgRating = (
      allReviews.reduce((acc, item) => item.rating + acc, 0) / allReviews.length
    ).toFixed(1);

    hostel.rating = Number(avgRating);
    hostel.numReviews = allReviews.length;
    await hostel.save();

    const populatedReview = await Review.findById(review._id).populate('customer', 'name profileImage');

    // Notify hostel owner
    try {
      if (hostel.owner) {
        await Notification.create({
          recipient: hostel.owner,
          title: 'New Guest Review',
          message: `${req.user.name} rated ${hostel.name} ${rating}★: "${comment.substring(0, 60)}${comment.length > 60 ? '...' : ''}"`,
          type: 'review',
          link: '/owner/reviews',
        });
      }
    } catch (notifErr) {
      console.warn('Notification trigger error:', notifErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: populatedReview,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews for an owner's hostels
// @route   GET /api/reviews/owner/all
// @access  Private (Owner/Admin)
const getOwnerReviews = async (req, res, next) => {
  try {
    const ownerHostels = await Hostel.find({ owner: req.user._id }).select('_id');
    const hostelIds = ownerHostels.map((h) => h._id);

    const reviews = await Review.find({ hostel: { $in: hostelIds } })
      .populate('customer', 'name email profileImage')
      .populate('hostel', 'name location')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Owner reply to a review
// @route   PUT /api/reviews/:id/reply
// @access  Private (Owner/Admin)
const replyToReview = async (req, res, next) => {
  try {
    const { reply } = req.body;
    const review = await Review.findById(req.params.id).populate('hostel');

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.hostel.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to reply to this review' });
    }

    review.ownerReply = {
      reply,
      repliedAt: new Date(),
    };

    await review.save();

    // Notify reviewer customer
    try {
      await Notification.create({
        recipient: review.customer,
        title: 'Hostel Replied to Your Review',
        message: `The management of ${review.hostel.name} posted an official response to your review.`,
        type: 'review',
        link: `/hostels/${review.hostel._id}`,
      });
    } catch (notifErr) {
      console.warn('Notification trigger error:', notifErr.message);
    }

    res.json({
      success: true,
      message: 'Reply posted successfully',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHostelReviews,
  addReview,
  getOwnerReviews,
  replyToReview,
};
