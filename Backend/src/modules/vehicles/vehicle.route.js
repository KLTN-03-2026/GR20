const express = require("express");
const controller = require("./vehicle.controller");

const router = express.Router();

router.post("/", controller.create);
router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.put("/:id", controller.update);
router.delete("/:id", controller.deleteById);

module.exports = router;
