const express = require("express");
const router = express.Router();
const controller = require("./billing.controller");

router.post("/generate-cash", controller.generateInvoiceAndCashPayment);

module.exports = router;
