const bcrypt = require("bcrypt");
const employeeRepo = require("./employee.repository");

const addEmployee = async (data) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);
    const { buildingIds, ...userData } = data;

    const newEmployeeData = {
      username: userData.username,
      password: hashedPassword,
      email: userData.email,
      fullName: userData.fullName,
      roleId: userData.roleId,
      isActive: true,
    };

    return await employeeRepo.createEmployee(newEmployeeData, buildingIds);
  } catch (error) {
    const errorCode = error.code || (error.cause && error.cause.code);

    if (errorCode === "23505" || error.message.includes("duplicate key")) {
      throw new Error("Tên đăng nhập hoặc Email đã tồn tại trong hệ thống!");
    }
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
    // Kiểm tra xem nhân viên có tồn tại không
    await getEmployeeById(id);

    // Tách buildingIds ra khỏi dữ liệu User chung
    const { buildingIds, ...userData } = updateData;

    return await employeeRepo.updateEmployee(id, userData, buildingIds);
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
