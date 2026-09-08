const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Ruta POST: /api/auth/google
router.post('/google', authController.loginGoogle);

module.exports = router;