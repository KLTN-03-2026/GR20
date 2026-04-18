const express = require("express");
const router = express.Router();
const controller = require("./qr.controller");
const { verifyToken } = require("../../middlewares/auth.middleware");
const { requireRole } = require("../../middlewares/role.middleware");

// ==================== TEST ROUTE ====================
router.get("/test", (req, res) => {
  res.json({ message: "QR Router is working!" });
});

router.get("/test-auth", verifyToken, (req, res) => {
  res.json({ 
    message: "Auth working!", 
    user: req.user 
  });
});

// ==================== TẠM COMMENT TOÀN BỘ ====================
router.get("/personal/me", verifyToken, controller.getMyPersonalQr);
router.post("/personal", verifyToken, requireRole(['ADMIN']), controller.createPersonalQr);
router.get("/personal/list", verifyToken, requireRole(['ADMIN']), controller.getAllPersonalQrs);
router.delete("/personal/:id", verifyToken, requireRole(['ADMIN']), controller.revokePersonalQr);
router.get("/personal/user/:userId", verifyToken, requireRole(['ADMIN']), controller.getPersonalQrByUserId);

router.get("/guest/list", verifyToken, controller.getGuestQrsByHost);
router.post("/guest", verifyToken, controller.createGuestQr);
router.get("/guest/history", verifyToken, controller.getGuestQrHistory);
router.get("/guest/:id", verifyToken, controller.getGuestQrById);
router.put("/guest/:id", verifyToken, controller.updateGuestQr);
router.delete("/guest/:id", verifyToken, controller.deleteGuestQr);
router.get("/guest/scan/:qrCode", verifyToken, controller.scanQr);


module.exports = router;