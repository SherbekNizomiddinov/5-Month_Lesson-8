const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  name: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  price: Number
});

module.exports = mongoose.model('Car', carSchema);