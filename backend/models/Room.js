const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    hostel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hostel',
      required: true,
    },
    roomNumber: {
      type: String,
      required: [true, 'Please provide a room number or identifier'],
    },
    roomType: {
      type: String,
      required: [true, 'Please specify room type'],
      enum: ['Private Room', '4 Bed Dorm', '6 Bed Dorm', '8 Bed Dorm', 'Deluxe Private', 'Standard Dorm'],
    },
    capacity: {
      type: Number,
      required: true,
      default: 1,
    },
    price: {
      type: Number,
      required: [true, 'Please specify price per night in INR'],
    },
    availableBeds: {
      type: Number,
      required: true,
      default: 1,
    },
    amenities: [
      {
        type: String,
      },
    ],
    isAvailable: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Room', roomSchema);
