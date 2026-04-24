/**
 * Middleware kiểm tra dữ liệu đầu vào (Validation) sử dụng Zod
 */
const validate = (schema) => (req, res, next) => {
  try {
    // Kiểm tra dữ liệu
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    // Hợp lệ thì cho đi tiếp
    next();
  } catch (error) {
    // 1. Nếu là lỗi do Zod (nhập thiếu, nhập sai định dạng)
    if (error.name === "ZodError" || error.issues) {
      const validationErrors = error.issues || error.errors; // Lấy đúng mảng lỗi

      return res.status(400).json({
        success: false,
        message: "Dữ liệu đầu vào không hợp lệ",
        errors: validationErrors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        })),
      });
    }

    // 2. Nếu là lỗi hệ thống khác, đẩy sang bộ xử lý lỗi chung
    next(error);
  }
};

module.exports = {
  validate,
};
