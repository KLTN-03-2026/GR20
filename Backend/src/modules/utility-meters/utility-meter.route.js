const express = require("express");
const router = express.Router();
const controller = require("./utility-meter.controller");

router.post("/", controller.createUtilityMeter);
router.get("/", controller.getAllUtilityMeters);
router.get("/user/:userId", controller.getUtilityMetersByUserId);
router.get("/user/:userId/:id", controller.getUtilityMeterByUserAndId);
router.get("/:id", controller.getUtilityMeterById);
router.put("/:id", controller.updateUtilityMeter);
router.delete("/:id", controller.deleteUtilityMeter);
router.patch("/:id/restore", controller.restoreUtilityMeter);

module.exports = router;
