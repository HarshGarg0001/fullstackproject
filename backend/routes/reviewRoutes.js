const express = require('express');
const router = express.Router();
const { addReview, getHallReviews, getUserReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, addReview);

router.route('/user')
  .get(protect, getUserReviews);

router.route('/:hallId')
  .get(getHallReviews);

module.exports = router;
