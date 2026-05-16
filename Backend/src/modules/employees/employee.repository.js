const { db } = require("../../configs/database.config");
// Phải import thêm buildingAssignments từ schema
const { users, buildingAssignments } = require("../../db/schema");
const { eq, inArray } = require("drizzle-orm");

const createEmployee = async (employeeData, buildingIds) => {
  // Dùng transaction để tạo User và Gán tòa nhà cùng lúc
  return await db.transaction(async (tx) => {
    // 1. Tạo user mới
    const [newUser] = await tx.insert(users).values(employeeData).returning({
      id: users.id,
      username: users.username,
      email: users.email,
      fullName: users.fullName,
      roleId: users.roleId,
      isActive: users.isActive,
      createdAt: users.createdAt,
    });

    // 2. Gán tòa nhà vào bảng building_assignments
    if (buildingIds && Array.isArray(buildingIds) && buildingIds.length > 0) {
      const assignments = buildingIds.map((buildingId) => ({
        userId: Number(newUser.id), // Ép kiểu để tránh lỗi BigInt của Drizzle
        buildingId: Number(buildingId),
        role: employeeData.roleId === 3 ? "OPERATOR" : "SECURITY",
        isActive: true,
      }));
      await tx.insert(buildingAssignments).values(assignments);
    }

    return newUser;
  });
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
    .where(inArray(users.roleId, [3, 4]));

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

  if (result.length === 0) return null;

  // Lấy danh sách các tòa nhà đang quản lý
  const assignments = await db
    .select({ buildingId: buildingAssignments.buildingId })
    .from(buildingAssignments)
    .where(eq(buildingAssignments.userId, BigInt(id)));

  return {
    ...result[0],
    buildingIds: assignments.map((a) => a.buildingId), // Trả về mảng [1, 2]
  };
};

const updateEmployee = async (id, updateData, buildingIds) => {
  return await db.transaction(async (tx) => {
    // 1. Cập nhật thông tin user
    const [updatedUser] = await tx
      .update(users)
      .set(updateData)
      .where(eq(users.id, BigInt(id)))
      .returning({
        id: users.id,
        username: users.username,
        email: users.email,
        fullName: users.fullName,
        roleId: users.roleId,
        isActive: users.isActive,
      });

    // 2. Cập nhật lại tòa nhà
    if (buildingIds && Array.isArray(buildingIds) && buildingIds.length > 0) {
      // Xóa gán cũ
      await tx
        .delete(buildingAssignments)
        .where(eq(buildingAssignments.userId, BigInt(id)));

      // Thêm gán mới
      const assignments = buildingIds.map((buildingId) => ({
        userId: Number(id),
        buildingId: Number(buildingId),
        role: updateData.roleId === 3 ? "OPERATOR" : "SECURITY",
        isActive: true,
      }));
      await tx.insert(buildingAssignments).values(assignments);
    }

    return updatedUser;
  });
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
