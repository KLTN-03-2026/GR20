const express = require("express");
const router = express.Router();
const controller = require("./maintenance-assignments.controller");

router.post("/", controller.create);
router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.delete("/:id", controller.deleteById);

module.exports = router;

