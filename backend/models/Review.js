const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
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
  rating: {
    type: Number,
    required: [true, 'Please add a rating between 1 and 5'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: [true, 'Please add a comment']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Review', reviewSchema);
