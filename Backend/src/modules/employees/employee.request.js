const { z } = require("zod");

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
  roleId: z
    .number({ required_error: "Vui lòng chọn vai trò" })
    .refine((val) => val === 3 || val === 4, {
      message: "Vai trò chỉ được là Vận hành (3) hoặc Bảo vệ (4)",
    }),
});

const updateEmployeeSchema = z.object({
  email: z.string().email("Email không đúng định dạng").optional(),
  fullName: z.string().min(2, "Họ tên quá ngắn").optional(),
  roleId: z
    .number()
    .refine((val) => val === 3 || val === 4, {
      message: "Vai trò không hợp lệ",
    })
    .optional(),
});

module.exports = {
  createEmployeeSchema,
  updateEmployeeSchema,
};
