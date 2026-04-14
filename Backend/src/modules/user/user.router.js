
const express = require("express")
const router = express.Router();
const controller = require("./user.controller");

router.get("/:id", controller.getUserById);
router.post("/", controller.createUser);
router.get("/", controller.getAllUsers);
router.put("/:id", controller.updateUser);
router.delete("/:id", controller.deleteUser);

module.exports = router;