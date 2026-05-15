const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// @route   POST api/auth/login
// @desc    Autenticar usuario y conseguir token
// @access  Public
router.post('/login', authController.login);

module.exports = router;
