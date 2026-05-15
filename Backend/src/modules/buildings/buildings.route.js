const express = require("express");
const router = express.Router();
const controller = require("./buildings.controller");
const { optionalVerifyToken } = require("../../middlewares/auth.middleware");

router.post("/", controller.createBuilding);
router.get("/", optionalVerifyToken, controller.getAllBuildings);
router.get("/:id", controller.getBuildingById);
router.put("/:id", controller.updateBuilding);
router.delete("/:id", controller.deleteBuilding);

module.exports = router;
