const express = require('express');
    const { getCategories, createCategory } = require('../controllers/categoryController.js');
    const { validateCategory } = require('../middleware/validation.js');
    const auth = require('../middleware/auth.js');
    const roleCheck = require('../middleware/roleCheck.js');

    const router = express.Router();

    router.get('/', auth, roleCheck, getCategories);
    router.post('/', auth, roleCheck, validateCategory, createCategory);

    module.exports = router;