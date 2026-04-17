const express = require("express");
const router = express.Router();
const controller = require("./resident.controller");

router.post("/", controller.createResident);
router.get("/", controller.getAllResidents);
router.get("/:id", controller.getResidentById);
router.put("/:id", controller.updateResident);
router.delete("/:id", controller.deleteResident);

module.exports = router;