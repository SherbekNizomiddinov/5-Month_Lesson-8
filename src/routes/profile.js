const express = require('express');
const router = express.Router();
const { getProfile } = require('../controllers/profileController');
const auth = require('../middleware/auth');

router.get('/', auth, getProfile);

module.exports = router;