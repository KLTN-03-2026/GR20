const { db } = require("../../configs/database.config");
const { users } = require("../../db/schema");
const { eq, inArray } = require("drizzle-orm");

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
    .where(inArray(users.roleId, [3, 4])); // Chỉ lấy vai trò 3 và 4

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

const updateEmployee = async (id, updateData) => {
  const result = await db
    .update(users)
    .set({
      fullName: updateData.fullName,
      email: updateData.email,
      roleId: updateData.roleId,
    })
    .where(eq(users.id, BigInt(id)))
    .returning({
      id: users.id,
      username: users.username,
      email: users.email,
      fullName: users.fullName,
      roleId: users.roleId,
      isActive: users.isActive,
    });
  return result[0];
};

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
