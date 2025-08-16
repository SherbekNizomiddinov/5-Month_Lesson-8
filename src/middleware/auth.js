const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) return res.redirect('/login');
  jwt.verify(token, 'secretkey', (err, decoded) => {
    if (err) return res.redirect('/login');
    req.user = decoded;
    next();
  });
};