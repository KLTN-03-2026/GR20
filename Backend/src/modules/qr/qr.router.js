const express = require("express");
const router = express.Router();
const controller = require("./qr.controller");
const { verifyToken } = require("../../middlewares/auth.middleware");


// router.get("/personal/:userId", controller.getPersonalQr);
router.get("/personal", verifyToken, controller.getPersonalQr); 

// router.post("/guest", controller.createGuestQr);
// router.get("/guest/host/:userId", controller.getGuestQrsByHost);
// router.get("/guest/history/:userId", controller.getGuestQrHistory);
// router.get("/guest/scan/:qrCode", controller.scanQr);

router.post("/guest", verifyToken, controller.createGuestQr);
router.get("/guest/list", verifyToken, controller.getGuestQrsByHost);  // Bỏ :userId
router.get("/guest/history", verifyToken, controller.getGuestQrHistory); // Bỏ :userId

router.get("/guest/scan/:qrCode", verifyToken, controller.scanQr);

// router.get("/guest/:id", controller.getGuestQrById);
// router.put("/guest/:id", controller.updateGuestQr);
// router.delete("/guest/:id", controller.deleteGuestQr);


router.get("/guest/:id", verifyToken, controller.getGuestQrById);
router.put("/guest/:id", verifyToken, controller.updateGuestQr);
router.delete("/guest/:id", verifyToken, controller.deleteGuestQr);

module.exports = router;