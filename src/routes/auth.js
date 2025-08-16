const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/change-password', changePassword);

module.exports = router;