const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { msg: 'Demasiados intentos de inicio de sesión, por favor intente más tarde.' }
});

// @route   POST api/auth/login
// @desc    Autenticar usuario y conseguir token
// @access  Public
router.post(
  '/login',
  loginLimiter,
  [
    body('email', 'Por favor incluya un email válido').isEmail(),
    body('password', 'La contraseña es requerida').exists()
  ],
  authController.login
);

module.exports = router;
