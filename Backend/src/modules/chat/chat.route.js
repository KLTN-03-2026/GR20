const express = require("express");
const router = express.Router();

const chatController = require("./chat.controller");
const { initChatSchema } = require("./chat.request"); // Import schema vừa tạo

// Import đúng tên middleware từ file của bạn
const { verifyToken } = require("../../middlewares/auth.middleware");
const { validate } = require("../../utils/validator"); // Đường dẫn tới file validator chung

// Flow: Auth (verifyToken) -> Validate dữ liệu (validate) -> Xử lý (Controller)
router.post(
  "/init",
  verifyToken,
  validate(initChatSchema),
  chatController.initChatProfile,
);

module.exports = router;
