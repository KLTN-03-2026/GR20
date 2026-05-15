const { z } = require("zod");

const createEmployeeSchema = z.object({
  username: z
    .string({ required_error: "Tên đăng nhập là bắt buộc" })
    .min(6, "Tên đăng nhập phải có ít nhất 6 ký tự"),

  password: z
    .string({ required_error: "Mật khẩu là bắt buộc" })
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),

  // Đã thêm Regex bắt email chuẩn cho Zod
  email: z
    .string({ required_error: "Email là bắt buộc" })
    .regex(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Email không đúng định dạng",
    ),

  fullName: z.string({ required_error: "Họ và tên là bắt buộc" }),

  roleId: z
    .number({ required_error: "Vui lòng chọn vai trò" })
    .refine((val) => val === 3 || val === 4, {
      message: "Vai trò chỉ được là Vận hành (3) hoặc Bảo vệ (4)",
    }),

  buildingIds: z
    .array(z.number(), { required_error: "Vui lòng chọn tòa nhà quản lý" })
    .min(1, "Vui lòng chọn ít nhất 1 tòa nhà để quản lý"),
});

const updateEmployeeSchema = z.object({
  email: z
    .string()
    .regex(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Email không đúng định dạng",
    )
    .optional(),
  fullName: z.string().min(2, "Họ tên quá ngắn").optional(),
  roleId: z
    .number()
    .refine((val) => val === 3 || val === 4, {
      message: "Vai trò không hợp lệ",
    })
    .optional(),
  buildingIds: z
    .array(z.number())
    .min(1, "Vui lòng chọn ít nhất 1 tòa nhà để quản lý")
    .optional(),
});

module.exports = {
  createEmployeeSchema,
  updateEmployeeSchema,
};
