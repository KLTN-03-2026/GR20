const { z } = require("zod");

// 1. Kiểm tra dữ liệu khi Thêm mới
const createEmployeeSchema = z.object({
  username: z
    .string({ required_error: "Tên đăng nhập là bắt buộc" })
    .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
  password: z
    .string({ required_error: "Mật khẩu là bắt buộc" })
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  email: z
    .string({ required_error: "Email là bắt buộc" })
    .email("Email không đúng định dạng"),
  fullName: z.string({ required_error: "Họ và tên là bắt buộc" }),
});

// 2. Kiểm tra dữ liệu khi Sửa thông tin (Dùng .optional() vì người dùng có thể chỉ muốn sửa 1 trong 2)
const updateEmployeeSchema = z.object({
  email: z.string().email("Email không đúng định dạng").optional(),
  fullName: z.string().min(2, "Họ tên quá ngắn").optional(),
});

module.exports = {
  createEmployeeSchema,
  updateEmployeeSchema,
};
