const jwt = require('jsonwebtoken');

module.exports = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, 'secretkey', { expiresIn: '1h' });
};