const asyncHandler = require('express-async-handler');
const Booking = require('../models/Booking');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = asyncHandler(async (req, res) => {
  const { hallId, date } = req.body;

  if (!hallId || !date) {
    res.status(400);
    throw new Error('Please provide hall and date');
  }

  // Parse date to a start of day to normalize
  const bookingDate = new Date(date);
  bookingDate.setHours(0,0,0,0);

  // Check for existing booking on exactly the same date for the same hall
  // that is either pending or approved
  const existingBooking = await Booking.findOne({
    hallId,
    date: {
      $gte: bookingDate,
      $lt: new Date(bookingDate.getTime() + 24 * 60 * 60 * 1000)
    },
    status: { $in: ['pending', 'approved'] }
  });

  if (existingBooking) {
    res.status(400);
    throw new Error('Hall is already booked for this date');
  }

  const booking = await Booking.create({
    userId: req.user._id,
    hallId,
    date: bookingDate,
    status: 'pending'
  });

  res.status(201).json(booking);
});

// @desc    Get user bookings
// @route   GET /api/bookings/user
// @access  Private
const getUserBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ userId: req.user._id })
    .populate('hallId', 'name location price images')
    .sort('-date');
  res.json(bookings);
});

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings
// @access  Private/Admin
const getAllBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({})
    .populate('userId', 'name email')
    .populate('hallId', 'name location')
    .sort('-date');
  res.json(bookings);
});

// @desc    Update booking status (Admin / Cancel by User)
// @route   PUT /api/bookings/:id
// @access  Private
const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // If user is trying to cancel their own booking
  if (req.user.role === 'user') {
    if (booking.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to update this booking');
    }
    if (status !== 'cancelled') {
      res.status(400);
      throw new Error('Users can only cancel bookings');
    }
  }

  booking.status = status;
  const updatedBooking = await booking.save();
  res.json(updatedBooking);
});

module.exports = {
  createBooking,
  getUserBookings,
  getAllBookings,
  updateBookingStatus
};
