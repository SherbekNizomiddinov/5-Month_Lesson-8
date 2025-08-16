const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: { type: String, default: 'user' },
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  cars: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Car' }]
});

module.exports = mongoose.model('User', userSchema);