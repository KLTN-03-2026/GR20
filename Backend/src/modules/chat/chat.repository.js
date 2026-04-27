const { eq, and } = require("drizzle-orm");
const { db } = require("../../configs/database.config");
const schema = require("../../db/schema");

// 1. Lấy Role của User
const getUserRole = async (userId) => {
  const result = await db
    .select({ roleName: schema.roles.name })
    .from(schema.users)
    .leftJoin(schema.roles, eq(schema.users.roleId, schema.roles.id))
    .where(eq(schema.users.id, userId))
    .limit(1);
  return result.length > 0 ? result[0].roleName : null;
};

// 2. Lấy thông tin Tòa nhà & Căn hộ nếu là Cư dân
const getResidentInfo = async (userId) => {
  const result = await db
    .select({
      buildingId: schema.apartments.buildingId,
      apartmentCode: schema.apartments.apartmentCode,
    })
    .from(schema.residentProfiles)
    .innerJoin(
      schema.apartments,
      eq(schema.residentProfiles.apartmentId, schema.apartments.id),
    )
    .where(eq(schema.residentProfiles.userId, userId))
    .limit(1);
  return result.length > 0 ? result[0] : null;
};

// 3. Lấy thông tin Tòa nhà nếu là Nhân viên/Bảo vệ
const getStaffBuildingInfo = async (userId) => {
  const result = await db
    .select({ buildingId: schema.buildingAssignments.buildingId })
    .from(schema.buildingAssignments)
    .where(eq(schema.buildingAssignments.userId, userId))
    .limit(1);
  return result.length > 0 ? result[0] : null;
};

// 4. Tìm phòng chat chung của Tòa nhà
const getBuildingChatRoom = async (buildingId) => {
  const result = await db
    .select()
    .from(schema.chatRooms)
    .where(
      and(
        eq(schema.chatRooms.buildingId, buildingId),
        eq(schema.chatRooms.type, "building"),
      ),
    )
    .limit(1);
  return result.length > 0 ? result[0] : null;
};

// 5. Tạo phòng chat Tòa nhà mới
const createBuildingRoom = async (buildingId, createdByUserId) => {
  const newRoom = await db
    .insert(schema.chatRooms)
    .values({
      name: `Nhóm cư dân Tòa nhà`,
      type: "building",
      buildingId: buildingId,
      createdBy: createdByUserId,
      isActive: true,
    })
    .returning({ id: schema.chatRooms.id });
  return newRoom[0];
};

// 6. Kiểm tra User đã trong nhóm chưa
const getRoomMember = async (roomId, userId) => {
  const result = await db
    .select()
    .from(schema.chatRoomMembers)
    .where(
      and(
        eq(schema.chatRoomMembers.roomId, roomId),
        eq(schema.chatRoomMembers.userId, userId),
      ),
    )
    .limit(1);
  return result.length > 0 ? result[0] : null;
};

// 7. Thêm User vào nhóm
const addMemberToRoom = async (roomId, userId, nickname) => {
  await db.insert(schema.chatRoomMembers).values({
    roomId: roomId,
    userId: userId,
    role: "member",
    nickname: nickname,
  });
};

// 8. Cập nhật Nickname nếu User đổi tên
const updateMemberNickname = async (memberId, nickname) => {
  await db
    .update(schema.chatRoomMembers)
    .set({ nickname: nickname })
    .where(eq(schema.chatRoomMembers.id, memberId));
};

module.exports = {
  getUserRole,
  getResidentInfo,
  getStaffBuildingInfo,
  getBuildingChatRoom,
  createBuildingRoom,
  getRoomMember,
  addMemberToRoom,
  updateMemberNickname,
};
