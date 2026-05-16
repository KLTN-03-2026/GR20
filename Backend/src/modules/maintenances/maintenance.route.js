const express = require("express");
const router = express.Router();
const controller = require("./maintenance.controller");
const { verifyToken } = require("../../middlewares/auth.middleware");

// Tất cả routes đều cần xác thực token
router.use(verifyToken);

// ==================== NHÂN VIÊN (đặt trước để tránh conflict) ====================
// Quản lý tất cả yêu cầu (dành cho Nhân viên, Quản lý, Admin, Chủ chung cư)
router.get("/admin/all", controller.getAllMaintenanceRequests);           // Danh sách tất cả yêu cầu
router.get("/admin/statistics", controller.getMaintenanceStatistics);     // Thống kê
router.get("/admin/:id", controller.getMaintenanceRequestByIdForStaff);   // Chi tiết bất kỳ yêu cầu nào
router.post("/admin/:id/comments", controller.addComment);                // Thêm comment vào yêu cầu
router.patch("/:id/status", controller.updateStatusByStaff);              // Cập nhật trạng thái
router.patch("/:id/assign", controller.assignTechnician);                 // Phân công kỹ thuật viên

// ==================== CƯ DÂN (đặt sau) ====================
router.post("/", controller.createMaintenanceRequest);                    // Tạo yêu cầu
router.get("/my-requests", controller.getMyMaintenanceRequests);          // Xem danh sách yêu cầu của tôi
router.get("/:id", controller.getMaintenanceRequestById);                 // Xem chi tiết 1 yêu cầu
router.put("/:id", controller.updateMaintenanceRequest);                  // Sửa yêu cầu (chỉ khi OPEN)
router.delete("/:id", controller.deleteMaintenanceRequest);               // Xóa yêu cầu (chỉ khi OPEN)

module.exports = router;