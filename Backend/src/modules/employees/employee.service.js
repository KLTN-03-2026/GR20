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
      roleId: data.roleId,
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

const updateEmployee = async (id, updateData) => {
  try {
    await getEmployeeById(id);
    return await employeeRepo.updateEmployee(id, updateData);
  } catch (error) {
    if (error.code === "23505")
      throw new Error("Email này đã được sử dụng bởi người khác!");
    throw error;
  }
};

const toggleStatus = async (id) => {
  const employee = await getEmployeeById(id);
  const newStatus = !employee.isActive;
  return await employeeRepo.updateStatus(id, newStatus);
};

module.exports = {
  addEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  toggleStatus,
};
