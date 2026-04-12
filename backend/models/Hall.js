const mongoose = require('mongoose');

const hallSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  location: {
    type: String,
    required: [true, 'Please add a location']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },
  capacity: {
    type: Number,
    required: [true, 'Please add a capacity']
  },
  description: {
    type: String
  },
  images: [{
    type: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Hall', hallSchema);
