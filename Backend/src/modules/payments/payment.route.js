const express = require("express");
const router = express.Router();
const controller = require("./payment.controller");
const { authenticate } = require("../../middlewares/auth.middleware");
const { requireRole } = require("../../middlewares/role.middleware");

const adminRoles = ["ADMIN", "Quản lý"];

/** Webhook Casso — không dùng JWT */
router.post("/casso-webhook", controller.cassoWebhook);

router.use(authenticate);

router.get("/by-invoice/:invoiceId/vietqr-mb", controller.generateMbVietQrByInvoiceId);
router.get("/by-invoice/:invoiceId", controller.getLatestPaymentByInvoiceId);

router.post("/user/:userId/:id/submit-cash", controller.submitUserCashDeclaration);
router.get("/user/:userId", controller.getPaymentsByUserId);
router.get("/user/:userId/:id", controller.getPaymentByUserAndId);

router.post("/", requireRole(adminRoles), controller.createPayment);
router.get("/", requireRole(adminRoles), controller.getAllPayments);

router.get("/:id/detail", requireRole(adminRoles), controller.getPaymentDetailById);
router.get("/:id", requireRole(adminRoles), controller.getPaymentById);
router.put("/:id", requireRole(adminRoles), controller.updatePayment);
router.delete("/:id", requireRole(adminRoles), controller.deletePayment);
router.patch("/:id/restore", requireRole(adminRoles), controller.restorePayment);

module.exports = router;
