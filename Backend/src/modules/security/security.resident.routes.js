// src/modules/security/security.resident.routes.js
const express = require("express");
const router = express.Router();
const controller = require("./security.resident.controller");
const { verifyToken } = require("../../middlewares/auth.middleware");
const { requireRole } = require("../../middlewares/role.middleware");

router.use(verifyToken);
router.use(requireRole(['ADMIN', 'Quản lý', 'Bảo vệ']));

// ✅ ĐẢM BẢO: Route GET "/" phải khai báo TRƯỚC route "/:id"
router.get("/residents", controller.getResidentList);  // Phải ở trước
router.get("/residents/:id", controller.getResidentDetail);  // Ở sau

module.exports = router;