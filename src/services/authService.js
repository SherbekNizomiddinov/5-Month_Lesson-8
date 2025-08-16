const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, 'secretkey', { expiresIn: '1h' });
};

module.exports = { generateToken };