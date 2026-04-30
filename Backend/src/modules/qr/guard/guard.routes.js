const express = require("express");
const router = express.Router();
const controller = require("./guard.controller");
const { verifyToken } = require("../../../middlewares/auth.middleware");
const { requireRole } = require("../../../middlewares/role.middleware");

router.use(verifyToken);
router.use(requireRole(['Bảo vệ', 'GUARD', 'SECURITY']));

router.get("/scan/:qrCode", controller.scanQr);
router.get("/history", controller.getGuestQrHistory);

module.exports = router;