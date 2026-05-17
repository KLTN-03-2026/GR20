const express = require("express");
const router = express.Router();
const controller = require("./utility-pricing.controller");

router.post("/", controller.createUtilityPricing);
router.get("/", controller.getAllUtilityPricing);
router.get("/active", controller.getActiveUtilityPricing);
router.get("/active/:meterType", controller.getActiveUtilityPricingByMeterType);
router.get("/:id", controller.getUtilityPricingById);
router.put("/:id", controller.updateUtilityPricing);
router.delete("/:id", controller.deleteUtilityPricing);
router.patch("/:id/restore", controller.restoreUtilityPricing);

module.exports = router;
