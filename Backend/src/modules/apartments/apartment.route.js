const express = require("express");
const router = express.Router({ mergeParams: true });
const controller = require("./apartment.controller");
const { verifyToken } = require("../../middlewares/auth.middleware");

// CRUD
router.post("/", controller.createApartment);
router.get("/", controller.getAllApartments);

// Cố định phải khai báo TRƯỚC "/:id" (tránh "stats"/"available" bị nuốt thành id → 500)
router.get("/stats", controller.getDashboardStats);
router.get("/available", controller.getAvailableApartments);
router.get("/my", verifyToken, controller.getMyApartment);

// FILTER
router.get("/building/:buildingId", controller.getByBuilding);
router.get("/floor/:floorId", controller.getByFloor);
router.get("/:id", controller.getApartmentById);
router.put("/:id", controller.updateApartment);
router.delete("/:id", controller.deleteApartment);

module.exports = router;