const express = require("express");
const router = express.Router();
const controller = require("./qr.controller");

router.get("/personal/:userId", controller.getPersonalQr);

router.post("/guest", controller.createGuestQr);
router.get("/guest/host/:userId", controller.getGuestQrsByHost);
router.get("/guest/history/:userId", controller.getGuestQrHistory);
router.get("/guest/scan/:qrCode", controller.scanQr);

router.get("/guest/:id", controller.getGuestQrById);
router.put("/guest/:id", controller.updateGuestQr);
router.delete("/guest/:id", controller.deleteGuestQr);

module.exports = router;