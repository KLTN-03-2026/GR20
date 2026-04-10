const bcrypt = require("bcrypt");
const employeeRepo = require("./employee.repository");

const addEmployee = async (data) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const newEmployeeData = {
      username: data.username,
      password: hashedPassword,
      email: data.email,
      fullName: data.fullName,
      roleId: 3, // Ép cứng quyền Nhân viên
      isActive: true,
    };

    return await employeeRepo.createEmployee(newEmployeeData);
  } catch (error) {
    if (error.code === "23505")
      throw new Error("Tên đăng nhập hoặc Email đã tồn tại!");
    throw error;
  }
};

const getAllEmployees = async () => {
  return await employeeRepo.getEmployees();
};

const getEmployeeById = async (id) => {
  const employee = await employeeRepo.getEmployeeById(id);
  if (!employee)
    throw new Error("Không tìm thấy nhân viên này trong hệ thống!");
  return employee;
};

// --- MỚI: Sửa thông tin ---
const updateEmployee = async (id, updateData) => {
  try {
    // 1. Kiểm tra xem nhân viên có tồn tại không
    await getEmployeeById(id);

    // 2. Tiến hành update
    return await employeeRepo.updateEmployee(id, updateData);
  } catch (error) {
    if (error.code === "23505")
      throw new Error("Email này đã được sử dụng bởi người khác!");
    throw error;
  }
};

// --- MỚI: Khóa/Mở tài khoản ---
const toggleStatus = async (id) => {
  // 1. Lấy thông tin hiện tại
  const employee = await getEmployeeById(id);

  // 2. Đảo ngược trạng thái (Đang true -> false, Đang false -> true)
  const newStatus = !employee.isActive;

  // 3. Cập nhật vào DB
  return await employeeRepo.updateStatus(id, newStatus);
};

module.exports = {
  addEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  toggleStatus,
};
