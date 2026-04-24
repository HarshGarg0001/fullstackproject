const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Booking = require('../models/Booking');

// @desc    Add a review
// @route   POST /api/reviews
// @access  Private
const addReview = asyncHandler(async (req, res) => {
  const { hallId, rating, comment } = req.body;

  if (!hallId || !rating || !comment) {
    res.status(400);
    throw new Error('Please provide hallId, rating, and comment');
  }

  // Check if the user has an approved/completed booking for this hall
  const hasBooked = await Booking.findOne({
    hallId,
    userId: req.user._id,
    status: { $in: ['approved'] }
  });

  if (!hasBooked) {
    res.status(400);
    throw new Error('You can only review halls you have booked and were approved');
  }

  // Check if they already reviewed
  const alreadyReviewed = await Review.findOne({ hallId, userId: req.user._id });
  if (alreadyReviewed) {
    res.status(400);
    throw new Error('You have already reviewed this hall');
  }

  const review = await Review.create({
    userId: req.user._id,
    hallId,
    rating: Number(rating),
    comment
  });

  res.status(201).json(review);
});

// @desc    Get reviews for a hall
// @route   GET /api/reviews/:hallId
// @access  Public
const getHallReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ hallId: req.params.hallId })
    .populate('userId', 'name')
    .sort('-createdAt');
  res.json(reviews);
});

// @desc    Get reviews by user
// @route   GET /api/reviews/user
// @access  Private
const getUserReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ userId: req.user._id })
    .populate('hallId', 'name images')
    .sort('-createdAt');
  res.json(reviews);
});

module.exports = {
  addReview,
  getHallReviews,
  getUserReviews
};
