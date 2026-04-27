const { z } = require("zod");

// Định nghĩa schema kiểm tra dữ liệu body
const initChatSchema = z.object({
  body: z.object({
    prefixName: z
      .string({
        required_error: "Vui lòng nhập tên đệm để hiển thị",
        invalid_type_error: "Tên đệm phải là chuỗi ký tự",
      })
      .trim()
      .min(1, "Tên đệm không được để trống")
      .max(50, "Tên đệm không được vượt quá 50 ký tự"),
  }),
});

// Middleware để xác thực
const validateInitChat = (req, res, next) => {
  try {
    // Nếu parse thành công, đi tiếp sang Controller
    initChatSchema.parse({ body: req.body });
    next();
  } catch (error) {
    // Nếu có lỗi, Zod sẽ quăng lỗi, ta bắt lấy và trả về luôn
    return res.status(400).json({
      success: false,
      message: error.errors[0].message, // Lấy câu thông báo lỗi đầu tiên
    });
  }
};

module.exports = {
  validateInitChat,
};
module.exports = {
  initChatSchema,
};
