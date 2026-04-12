const express = require('express');
const router = express.Router();
const { addReview, getHallReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, addReview);

router.route('/:hallId')
  .get(getHallReviews);

module.exports = router;
