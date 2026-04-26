const express = require("express");
const router = express.Router();
const controller = require("./invoice-item.controller");

router.post("/", controller.createInvoiceItem);
router.get("/", controller.getAllInvoiceItems);
router.get("/by-invoice/:invoiceId", controller.getInvoiceItemsByInvoiceId);
router.get("/:id", controller.getInvoiceItemById);
router.put("/:id", controller.updateInvoiceItem);
router.delete("/:id", controller.deleteInvoiceItem);

module.exports = router;
