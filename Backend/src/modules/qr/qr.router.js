const express = require("express");
const router = express.Router();
const controller = require("./qr.controller");
const { verifyToken } = require("../../middlewares/auth.middleware");
const { requireRole } = require("../../middlewares/role.middleware");

// ==================== LỊCH SỬ (ADMIN) ====================
// ✅ Đặt route cụ thể lên TRƯỚC route có tham số
// Lấy tất cả lịch sử ra vào của tất cả cư dân (ADMIN)
router.get("/resident/history/all", verifyToken, requireRole(['ADMIN']), controller.getAllResidentAccessHistory);
router.put("/personal/:id", verifyToken, requireRole(['ADMIN']), controller.updatePersonalQr);
// Lấy lịch sử ra vào của cư dân theo user_id (ADMIN)
router.get("/resident/history/:userId", verifyToken, requireRole(['ADMIN']), controller.getResidentAccessHistory);

// ==================== PERSONAL QR ====================
router.get("/personal/me", verifyToken, controller.getMyPersonalQr);
router.post("/personal", verifyToken, requireRole(['ADMIN']), controller.createPersonalQr);
router.get("/personal/list", verifyToken, requireRole(['ADMIN']), controller.getAllPersonalQrs);
router.delete("/personal/:id", verifyToken, requireRole(['ADMIN']), controller.revokePersonalQr);
router.get("/personal/user/:userId", verifyToken, requireRole(['ADMIN']), controller.getPersonalQrByUserId);

// ==================== GUEST QR ====================
router.get("/guest/list", verifyToken, controller.getGuestQrsByHost);
router.post("/guest", verifyToken, controller.createGuestQr);
router.get("/guest/history", verifyToken, controller.getGuestQrHistory);
router.get("/guest/:id", verifyToken, controller.getGuestQrById);
router.put("/guest/:id", verifyToken, controller.updateGuestQr);
router.delete("/guest/:id", verifyToken, controller.deleteGuestQr);
router.get("/guest/scan/:qrCode", verifyToken, controller.scanQr);

module.exports = router;