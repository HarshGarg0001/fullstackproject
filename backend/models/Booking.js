const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  hallId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Hall'
  },
  date: {
    type: Date,
    required: [true, 'Please add a booking date']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);
