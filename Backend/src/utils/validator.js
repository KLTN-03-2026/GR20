// src/utils/validator.js

/**
 * Middleware kiểm tra dữ liệu đầu vào (Validation) sử dụng Zod
 * @param {object} schema - Zod schema chứa các quy tắc kiểm tra
 */
const validate = (schema) => (req, res, next) => {
  try {
    // Zod sẽ kiểm tra cả 3 phần của request: body, query và params
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    // Nếu mọi thứ ok, cho phép đi tiếp vào Controller
    next();
  } catch (error) {
    // Nếu có lỗi, chặn lại và trả về mã 400 (Bad Request)
    return res.status(400).json({
      success: false,
      message: "Dữ liệu đầu vào không hợp lệ (Validation Error)",
      // Trả về chi tiết các trường bị lỗi từ Zod để Frontend biết đường sửa
      errors: error.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      })),
    });
  }
};

module.exports = {
  validate,
};
