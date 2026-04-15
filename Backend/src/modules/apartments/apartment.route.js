const express = require("express");
const router = express.Router();
const controller = require("./apartment.controller");

// CRUD
router.post("/", controller.createApartment);
router.get("/", controller.getAllApartments);
router.get("/:id", controller.getApartmentById);
router.put("/:id", controller.updateApartment);
router.delete("/:id", controller.deleteApartment);

// FILTER
router.get("/building/:buildingId", controller.getByBuilding);
router.get("/floor/:floorId", controller.getByFloor);

module.exports = router;