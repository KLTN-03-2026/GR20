const employeeService = require("./employee.service");
const {
  createEmployeeSchema,
  updateEmployeeSchema,
} = require("./employee.request");

const addEmployee = async (req, res) => {
  try {
    const validatedData = createEmployeeSchema.parse(req.body);
    const newEmployee = await employeeService.addEmployee(validatedData);
    return res
      .status(201)
      .json({
        status: "success",
        message: "Thêm nhân viên thành công!",
        data: newEmployee,
      });
  } catch (error) {
    if (error.name === "ZodError")
      return res
        .status(400)
        .json({ status: "error", message: error.errors[0].message });
    if (error.message.includes("đã tồn tại"))
      return res.status(409).json({ status: "error", message: error.message });
    return res
      .status(500)
      .json({ status: "error", message: "Lỗi máy chủ nội bộ" });
  }
};

const getAllEmployees = async (req, res) => {
  try {
    const employees = await employeeService.getAllEmployees();
    return res
      .status(200)
      .json({
        status: "success",
        message: "Lấy danh sách thành công",
        data: employees,
      });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: "Lỗi máy chủ nội bộ" });
  }
};

const getEmployeeById = async (req, res) => {
  try {
    const employee = await employeeService.getEmployeeById(req.params.id);
    return res
      .status(200)
      .json({
        status: "success",
        message: "Lấy chi tiết thành công",
        data: employee,
      });
  } catch (error) {
    if (
      error instanceof SyntaxError ||
      error.message.includes("Cannot convert")
    )
      return res
        .status(400)
        .json({ status: "error", message: "ID không hợp lệ!" });
    if (error.message.includes("Không tìm thấy"))
      return res.status(404).json({ status: "error", message: error.message });
    return res
      .status(500)
      .json({ status: "error", message: "Lỗi máy chủ nội bộ" });
  }
};

// --- MỚI: Xử lý request Sửa thông tin ---
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateEmployeeSchema.parse(req.body);

    // Nếu người dùng không gửi data gì lên mà vẫn bấm Update
    if (Object.keys(validatedData).length === 0) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "Vui lòng cung cấp dữ liệu cần sửa!",
        });
    }

    const updatedEmployee = await employeeService.updateEmployee(
      id,
      validatedData,
    );
    return res
      .status(200)
      .json({
        status: "success",
        message: "Cập nhật thông tin thành công!",
        data: updatedEmployee,
      });
  } catch (error) {
    if (error.name === "ZodError")
      return res
        .status(400)
        .json({ status: "error", message: error.errors[0].message });
    if (error.message.includes("Không tìm thấy"))
      return res.status(404).json({ status: "error", message: error.message });
    if (error.message.includes("đã được sử dụng"))
      return res.status(409).json({ status: "error", message: error.message });
    return res
      .status(500)
      .json({ status: "error", message: "Lỗi máy chủ nội bộ" });
  }
};

// --- MỚI: Xử lý request Khóa/Mở tài khoản ---
const toggleStatus = async (req, res) => {
  try {
    const result = await employeeService.toggleStatus(req.params.id);
    const statusText = result.isActive ? "Mở khóa" : "Khóa";

    return res
      .status(200)
      .json({
        status: "success",
        message: `${statusText} tài khoản thành công!`,
        data: result,
      });
  } catch (error) {
    if (
      error instanceof SyntaxError ||
      error.message.includes("Cannot convert")
    )
      return res
        .status(400)
        .json({ status: "error", message: "ID không hợp lệ!" });
    if (error.message.includes("Không tìm thấy"))
      return res.status(404).json({ status: "error", message: error.message });
    return res
      .status(500)
      .json({ status: "error", message: "Lỗi máy chủ nội bộ" });
  }
};

module.exports = {
  addEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  toggleStatus,
};
