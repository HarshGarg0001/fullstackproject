const express = require('express');
const router = express.Router();
const {
  createBooking,
  getUserBookings,
  getAllBookings,
  updateBookingStatus
} = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createBooking)
  .get(protect, admin, getAllBookings);

router.route('/user').get(protect, getUserBookings);

router.route('/:id').put(protect, updateBookingStatus);

module.exports = router;
