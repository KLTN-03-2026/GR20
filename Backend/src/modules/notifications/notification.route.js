const express = require("express");
const router = express.Router();

const notificationController = require("./notification.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const { validate } = require("../../utils/validator"); // Middleware chạy Zod
const { validateNotificationId } = require("./notification.request");

// Tất cả route thông báo đều phải đăng nhập
router.use(authMiddleware.verifyToken); // Cập nhật tên hàm verifyToken cho đúng với code của bạn

// 1. Cư dân: Xem danh sách thông báo
router.get("/me", notificationController.getMyNotifications);

// 2. Cư dân: Đọc thông báo
router.patch(
  "/me/:id/read",
  validate(validateNotificationId),
  notificationController.markAsRead,
);

// 3. Cư dân: Xóa thông báo
router.delete(
  "/me/:id",
  validate(validateNotificationId),
  notificationController.deleteNotification,
);

module.exports = router;
