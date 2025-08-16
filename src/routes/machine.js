const express = require('express');
const router = express.Router();
const { getCars, createCar } = require('../controllers/machineController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', auth, getCars);
router.post('/', auth, roleCheck, createCar);

module.exports = router;