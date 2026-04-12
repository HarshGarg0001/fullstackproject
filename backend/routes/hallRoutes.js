const express = require('express');
const router = express.Router();
const {
  getHalls,
  getHallById,
  createHall,
  updateHall,
  deleteHall
} = require('../controllers/hallController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
  .get(getHalls)
  .post(protect, admin, upload.array('images', 5), createHall);

router.route('/:id')
  .get(getHallById)
  .put(protect, admin, upload.array('images', 5), updateHall)
  .delete(protect, admin, deleteHall);

module.exports = router;
