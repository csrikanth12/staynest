const mongoose = require('mongoose');

const hostelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide hostel name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide hostel description'],
    },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, default: '' },
      landmark: { type: String, default: '' },
    },
    images: [
      {
        type: String,
      },
    ],
    amenities: [
      {
        type: String,
      },
    ],
    rules: [
      {
        type: String,
      },
    ],
    cancellationPolicy: {
      type: String,
      default: 'Free cancellation up to 24 hours before check-in. Non-refundable thereafter.',
    },
    contactInfo: {
      phone: { type: String, default: '+91 98765 43210' },
      email: { type: String, default: 'contact@hostel.stayguard.com' },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 1,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    startingPrice: {
      type: Number,
      required: true,
      default: 499,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Hostel', hostelSchema);
