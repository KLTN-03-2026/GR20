
const express = require("express")
const router = express.Router();
const controller = require("./user.controller");

router.get("/:id", controller.getUserById);
router.post("/", controller.createUser);
router.get("/", controller.getAllUsers);

module.exports = router;