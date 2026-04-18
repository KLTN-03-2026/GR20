const express = require("express");
const router = express.Router();
const controller = require("./maintenance.controller");

// Basic CRUD
router.post("/", controller.createMaintenanceRequest);
router.get("/", controller.getAllMaintenanceRequests);
router.get("/statistics", controller.getStatistics);
router.get("/:id", controller.getMaintenanceRequestById);
router.put("/:id", controller.updateMaintenanceRequest);
router.delete("/:id", controller.deleteMaintenanceRequest);

// Additional operations
router.patch("/:id/status", controller.updateStatus);
router.patch("/:id/assign", controller.assignTechnician);

module.exports = router;