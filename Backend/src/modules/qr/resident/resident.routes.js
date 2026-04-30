

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
router.get("/history", controller.getGuestQrHistory);

module.exports = router;