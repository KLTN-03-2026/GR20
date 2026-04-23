const express = require("express");
const router = express.Router();
const controller = require("./maintenance.controller");
const { verifyToken } = require("../../middlewares/auth.middleware");

// Tất cả routes đều cần xác thực token
router.use(verifyToken);

// ==================== CƯ DÂN ====================
router.post("/", controller.createMaintenanceRequest);           // Tạo yêu cầu
router.get("/my-requests", controller.getMyMaintenanceRequests); // Xem danh sách yêu cầu của tôi
router.get("/:id", controller.getMaintenanceRequestById);        // Xem chi tiết 1 yêu cầu
router.put("/:id", controller.updateMaintenanceRequest);         // Sửa yêu cầu (chỉ khi OPEN)
router.delete("/:id", controller.deleteMaintenanceRequest);      // Xóa yêu cầu (chỉ khi OPEN)

// ==================== NHÂN VIÊN ====================
router.patch("/:id/status", controller.updateStatusByStaff);     // Cập nhật trạng thái
router.patch("/:id/assign", controller.assignTechnician);        // Phân công kỹ thuật viên

module.exports = router;