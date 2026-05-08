const express = require("express");
const router = express.Router();
const controller = require("./meter-reading.controller");

router.post("/", controller.createMeterReading);
router.get("/", controller.getAllMeterReadings);
router.get("/user/:userId", controller.getMeterReadingsByUserId);
router.get("/user/:userId/by-meter/:meterId", controller.getMeterReadingsByUserAndMeterId);
router.get("/:id", controller.getMeterReadingById);
router.put("/:id", controller.updateMeterReading);
router.delete("/:id", controller.deleteMeterReading);
router.patch("/:id/restore", controller.restoreMeterReading);

module.exports = router;
