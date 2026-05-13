// routes/dashboard.routes.js
const express = require("express");
const router = express.Router();
const controller = require("./dashboard.controller");
const { verifyToken } = require("../../middlewares/auth.middleware");
const { requireRole } = require("../../middlewares/role.middleware");

router.use(verifyToken);
router.use(requireRole(['Bảo vệ', 'GUARD', 'SECURITY', 'ADMIN']));

router.get("/stats", controller.getDashboardStats);

module.exports = router;