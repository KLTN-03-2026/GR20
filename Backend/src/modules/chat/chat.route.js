const express = require("express");
const router = express.Router();

const chatController = require("./chat.controller");
const {
  initChatSchema,
  getDirectorySchema,
  createPrivateChatSchema,
} = require("./chat.request");

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
// API 2: Lấy danh bạ (MỚI THÊM)
// URL: GET /api/chat/directory hoặc /api/chat/directory?search=Nhat
router.get(
  "/directory",
  verifyToken,
  validate(getDirectorySchema),
  chatController.getBuildingDirectory,
);
router.post(
  "/private",
  verifyToken,
  validate(createPrivateChatSchema),
  chatController.initPrivateChat,
);
module.exports = router;
