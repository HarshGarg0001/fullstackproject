const asyncHandler = require('express-async-handler');
const Hall = require('../models/Hall');

// @desc    Get all halls
// @route   GET /api/halls
// @access  Public
const getHalls = asyncHandler(async (req, res) => {
  const halls = await Hall.find({});
  res.json(halls);
});

// @desc    Get single hall
// @route   GET /api/halls/:id
// @access  Public
const getHallById = asyncHandler(async (req, res) => {
  const hall = await Hall.findById(req.params.id);

  if (hall) {
    res.json(hall);
  } else {
    res.status(404);
    throw new Error('Hall not found');
  }
});

// @desc    Create a hall
// @route   POST /api/halls
// @access  Private/Admin
const createHall = asyncHandler(async (req, res) => {
  const { name, location, price, capacity, description } = req.body;

  let images = [];
  if (req.files) {
    images = req.files.map(file => `/uploads/${file.filename}`);
  } else if (req.body.images) {
    // Alternatively accept image URLs
    images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
  }

  const hall = new Hall({
    name,
    location,
    price,
    capacity,
    description,
    images
  });

  const createdHall = await hall.save();
  res.status(201).json(createdHall);
});

// @desc    Update a hall
// @route   PUT /api/halls/:id
// @access  Private/Admin
const updateHall = asyncHandler(async (req, res) => {
  const { name, location, price, capacity, description } = req.body;

  const hall = await Hall.findById(req.params.id);

  if (hall) {
    hall.name = name || hall.name;
    hall.location = location || hall.location;
    hall.price = price || hall.price;
    hall.capacity = capacity || hall.capacity;
    hall.description = description || hall.description;

    if (req.files && req.files.length > 0) {
      hall.images = req.files.map(file => `/uploads/${file.filename}`);
    } else if (req.body.images) {
      hall.images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    }

    const updatedHall = await hall.save();
    res.json(updatedHall);
  } else {
    res.status(404);
    throw new Error('Hall not found');
  }
});

// @desc    Delete a hall
// @route   DELETE /api/halls/:id
// @access  Private/Admin
const deleteHall = asyncHandler(async (req, res) => {
  const hall = await Hall.findByIdAndDelete(req.params.id);

  if (hall) {
    res.json({ message: 'Hall removed' });
  } else {
    res.status(404);
    throw new Error('Hall not found');
  }
});

module.exports = {
  getHalls,
  getHallById,
  createHall,
  updateHall,
  deleteHall
};
