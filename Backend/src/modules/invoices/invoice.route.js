const express = require("express");
const router = express.Router();
const controller = require("./invoice.controller");

router.post("/", controller.createInvoice);
router.get("/", controller.getAllInvoices);
router.get("/user/:userId", controller.getInvoicesByUserId);
router.get("/user/:userId/:id", controller.getInvoiceByUserAndId);
router.get("/:id", controller.getInvoiceById);
router.put("/:id", controller.updateInvoice);
router.delete("/:id", controller.deleteInvoice);
router.patch("/:id/restore", controller.restoreInvoice);

module.exports = router;
