const express = require("express");
const router = express.Router();
const controller = require("./floors.controller");

// import apartments route
const apartmentRouter = require("../apartments/apartment.route");

// CREATE
router.post("/", controller.createFloor);

// GET ALL (có pagination: ?page=0&size=10)
router.get("/", controller.getAllFloors);

// GET BY ID
router.get("/:id", controller.getFloorById);

// UPDATE
router.put("/:id", controller.updateFloor);

// TOGGLE STATUS (ACTIVE / INACTIVE)
router.patch("/:id/delete", controller.softDeleteFloor);

// /floors/:floorId/apartments
router.use("/:floorId/apartments", apartmentRouter);

module.exports = router;
