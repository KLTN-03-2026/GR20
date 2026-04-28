const express = require("express");
const router = express.Router({ mergeParams: true });
const controller = require("./apartment.controller");

router.post("/", controller.createApartment);
router.get("/", controller.getAllApartments);
router.get("/stats", controller.getStats);
router.get("/building/:buildingId", controller.getByBuilding);
router.get("/floor/:floorId", controller.getByFloor);
router.get("/:id", controller.getApartmentById);
router.put("/:id", controller.updateApartment);
router.delete("/:id", controller.deleteApartment);
router.post("/:id/residents", controller.addResident);

module.exports = router;
