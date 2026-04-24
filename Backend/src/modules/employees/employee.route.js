const express = require("express");
const employeeController = require("./employee.controller");
const { verifyToken } = require("../../middlewares/auth.middleware");
const { requireRole } = require("../../middlewares/role.middleware");

const router = express.Router();

// Bảo vệ tất cả employee routes - chỉ ADMIN và Quản lý
router.use(verifyToken, requireRole(["ADMIN", "Quản lý"]));

// 1. Lấy danh sách (GET)
router.get("/", employeeController.getAllEmployees);

// 2. Lấy chi tiết 1 nhân viên (GET)
router.get("/:id", employeeController.getEmployeeById);

// 3. Thêm mới (POST)
router.post("/", employeeController.addEmployee);

// 4. Sửa thông tin (PUT)
router.put("/:id", employeeController.updateEmployee);

// 5. Khóa/Mở tài khoản (PATCH)
router.patch("/:id/status", employeeController.toggleStatus);

module.exports = router;
