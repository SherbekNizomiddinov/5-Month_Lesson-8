const User = require('../models/User');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('categories').populate('cars');
    res.render('profile', { user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};