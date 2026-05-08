const express = require("express");
const router = express.Router();
const controller = require("./payment.controller");

router.post("/", controller.createPayment);
router.get("/", controller.getAllPayments);
router.post("/casso-webhook", controller.cassoWebhook);
router.get("/by-invoice/:invoiceId", controller.getLatestPaymentByInvoiceId);
router.get("/by-invoice/:invoiceId/vietqr-mb", controller.generateMbVietQrByInvoiceId);
router.get("/user/:userId", controller.getPaymentsByUserId);
router.get("/user/:userId/:id", controller.getPaymentByUserAndId);
router.get("/:id/detail", controller.getPaymentDetailById);
router.get("/:id", controller.getPaymentById);
router.put("/:id", controller.updatePayment);
router.delete("/:id", controller.deletePayment);
router.patch("/:id/restore", controller.restorePayment);

module.exports = router;
