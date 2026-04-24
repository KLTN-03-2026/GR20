const express = require("express");
const router = express.Router();

const notificationAdminController = require("./notificationADMIN.controller");

const { verifyToken } = require("../../middlewares/auth.middleware");
const { requireRole } = require("../../middlewares/role.middleware");

const { validate } = require("../../utils/validator");
const {
  createNotificationSchema,
  validateNotificationId,
} = require("./notificationADMIN.request");

// 1. Kiểm tra xem có đăng nhập không (Có thẻ không?)
router.use(verifyToken);

router.use(requireRole(["ADMIN", "Quản lý"]));

// BQL: Xem danh sách đã gửi
router.get("/", notificationAdminController.getManagementHistory);

// BQL: Gửi thông báo mới
router.post(
  "/",
  validate(createNotificationSchema),
  notificationAdminController.sendNotification,
);

// BQL: Thu hồi thông báo đã gửi
router.delete(
  "/:id/recall",
  validate(validateNotificationId),
  notificationAdminController.recallNotification,
);

module.exports = router;
