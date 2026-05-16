const express = require("express");
const dashboardController = require("./dashboard.controller");
const { verifyToken } = require("../../middlewares/auth.middleware");
const { requireRole } = require("../../middlewares/role.middleware");

const router = express.Router();

// ĐÃ SỬA: Bổ sung thêm "Nhân viên" vào danh sách được phép truy cập
router.use(
  verifyToken,
  requireRole(["ADMIN", "Quản lý", "Vận hành", "Nhân viên"]),
);

router.get("/stats", dashboardController.getDashboardStats);

module.exports = router;
