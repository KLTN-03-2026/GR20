const express = require("express");
const router = express.Router();
const controller = require("./contract.controller");

router.post("/", controller.createContract);
router.get("/", controller.getContracts);
router.get("/:id", controller.getContractById);
router.put("/:id", controller.updateContract);
router.delete("/:id", controller.terminateContract);
router.post("/:id/renew", controller.renewContract);

module.exports = router;