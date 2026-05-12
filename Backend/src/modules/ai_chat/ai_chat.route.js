const express = require("express");
const aiChatController = require("./ai_chat.controller");
const { verifyToken } = require("../../middlewares/auth.middleware");

const router = express.Router();

// Chỉ những ai đăng nhập (có token) mới được chat
router.post("/", verifyToken, aiChatController.handleChat);

module.exports = router;
