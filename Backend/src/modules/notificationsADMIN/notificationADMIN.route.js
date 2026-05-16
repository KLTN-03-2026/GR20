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

router.use(verifyToken);
router.use(requireRole(["ADMIN", "Quản lý"]));

// Lấy lịch sử
router.get("/", notificationAdminController.getManagementHistory);

// Lấy cư dân theo tòa nhà để admin chọn (có thể kèm ?search=nh)
router.get(
  "/buildings/:buildingId/residents",
  notificationAdminController.getResidentsByBuilding,
);

// Gửi thông báo mới
router.post(
  "/",
  validate(createNotificationSchema),
  notificationAdminController.sendNotification,
);

// Thu hồi
router.delete(
  "/:id/recall",
  validate(validateNotificationId),
  notificationAdminController.recallNotification,
);

module.exports = router;
