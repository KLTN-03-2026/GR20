const { db } = require("../../configs/database.config");
const { users } = require("../../db/schema");
const { eq } = require("drizzle-orm");

const createEmployee = async (employeeData) => {
  const result = await db.insert(users).values(employeeData).returning({
    id: users.id,
    username: users.username,
    email: users.email,
    fullName: users.fullName,
    roleId: users.roleId,
    isActive: users.isActive,
    createdAt: users.createdAt,
  });
  return result[0];
};

const getEmployees = async () => {
  const result = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
      fullName: users.fullName,
      roleId: users.roleId,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.roleId, 3)); // Chỉ lấy nhân viên

  return result;
};

const getEmployeeById = async (id) => {
  const result = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
      fullName: users.fullName,
      roleId: users.roleId,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, BigInt(id)));

  return result[0];
};

// --- MỚI: Cập nhật thông tin nhân viên ---
const updateEmployee = async (id, updateData) => {
  const result = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, BigInt(id)))
    .returning({
      id: users.id,
      username: users.username,
      email: users.email,
      fullName: users.fullName,
      isActive: users.isActive,
    });
  return result[0];
};

// --- MỚI: Cập nhật trạng thái (Khóa/Mở) ---
const updateStatus = async (id, newStatus) => {
  const result = await db
    .update(users)
    .set({ isActive: newStatus })
    .where(eq(users.id, BigInt(id)))
    .returning({ id: users.id, isActive: users.isActive });
  return result[0];
};

module.exports = {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  updateStatus,
};
