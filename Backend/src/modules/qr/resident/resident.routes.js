

const express = require("express");
const router = express.Router();
const controller = require("./resident.controller");
const { verifyToken } = require("../../../middlewares/auth.middleware");

router.use(verifyToken);

router.get("/me", controller.getMyPersonalQr);
router.get("/guest/list", controller.getGuestQrsByHost);
router.post("/guest", controller.createGuestQr);
router.put("/guest/:id", controller.updateGuestQr);
router.delete("/guest/:id", controller.deleteGuestQr);
router.get("/guest/:id", controller.getGuestQrById);
router.get("/history/me", controller.getPersonalQrHistory);

router.get("/guest-qrs", controller.getMyGuestQrs);           // Danh sách QR của tôi
router.get("/guest-qrs/:id", controller.getMyGuestQrById);   // Chi tiết QR
router.put("/guest-qrs/:id/status", controller.updateMyGuestQrStatus);  // Bật/Tắt
router.put("/guest-qrs/:id/valid-to", controller.updateMyGuestQrValidTo); // Cập nhật thời hạn
router.get("/guest-qrs/:id/history", controller.getMyGuestQrHistory);   // Lịch sử quét

module.exports = router;