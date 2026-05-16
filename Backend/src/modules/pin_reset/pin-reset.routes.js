// modules/pin-reset/pin-reset.routes.js
const express = require('express');
const router = express.Router();
const controller = require('./pin-reset.controller');
const { verifyToken } = require('../../middlewares/auth.middleware');

// Public routes (không cần token)
router.post('/request-reset', controller.requestResetPin);
router.post('/reset', controller.resetPin);

// Protected route (cần đăng nhập)
router.post('/send-pin', verifyToken, controller.sendPin);

module.exports = router;