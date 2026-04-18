const express = require("express");
const router = express.Router();
const controller = require("./roles.controller");

router.post("/", controller.saveRole);
router.post("/seed", controller.seedDefaultRoles);
router.get("/", controller.getAllRoles);
router.get("/:id", controller.findRoleById);
router.put("/:id", controller.updateRole);
router.delete("/:id", controller.deleteRole);

module.exports = router;
