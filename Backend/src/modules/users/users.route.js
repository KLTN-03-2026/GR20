const express = require("express");
const router = express.Router();
const controller = require("./users.controller");

router.post("/", controller.saveUser);
router.get("/", controller.getAllUsers);
router.get("/:id", controller.findUserById);
router.put("/:id", controller.updateUser);
router.delete("/:id", controller.deleteUser);

module.exports = router;
