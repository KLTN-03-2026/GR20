const express = require("express");
const router = express.Router();
const controller = require("./building-assignments.controller");

router.post("/", controller.saveBuildingAssignment);
router.get("/", controller.getAllBuildingAssignments);
router.get("/:id", controller.findBuildingAssignmentById);
router.put("/:id", controller.updateBuildingAssignment);
router.delete("/:id", controller.softDeleteBuildingAssignment);

module.exports = router;
