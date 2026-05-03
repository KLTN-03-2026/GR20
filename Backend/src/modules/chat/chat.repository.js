const { eq, and, ilike, asc, inArray, desc, sql } = require("drizzle-orm");
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
// 9. Tìm ID phòng chat tòa nhà mà user đang tham gia
const getUserBuildingRoom = async (userId) => {
  const result = await db
    .select({ roomId: schema.chatRooms.id })
    .from(schema.chatRooms)
    .innerJoin(
      schema.chatRoomMembers,
      eq(schema.chatRooms.id, schema.chatRoomMembers.roomId),
    )
    .where(
      and(
        eq(schema.chatRoomMembers.userId, userId),
        eq(schema.chatRooms.type, "building"),
      ),
    )
    .limit(1);
  return result.length > 0 ? result[0].roomId : null;
};

// 10. Lấy danh bạ thành viên trong phòng, có search và sắp xếp theo Role
const getBuildingMembers = async (roomId, searchKeyword) => {
  let query = db
    .select({
      userId: schema.users.id,
      nickname: schema.chatRoomMembers.nickname,
      avatarUrl: schema.users.avatarUrl,
      roleName: schema.roles.name,
      roleId: schema.users.roleId,
    })
    .from(schema.chatRoomMembers)
    .innerJoin(schema.users, eq(schema.chatRoomMembers.userId, schema.users.id))
    .leftJoin(schema.roles, eq(schema.users.roleId, schema.roles.id))
    .where(
      and(
        eq(schema.chatRoomMembers.roomId, roomId),
        // Nếu có truyền searchKeyword thì tìm kiếm (ilike không phân biệt hoa thường)
        searchKeyword
          ? ilike(schema.chatRoomMembers.nickname, `%${searchKeyword}%`)
          : undefined,
      ),
    )
    .orderBy(
      // Sắp xếp ưu tiên theo ID của role: Admin(1) -> Quản lý(2) -> Nhân viên(3) -> Bảo vệ(4) -> Cư dân(5)
      asc(schema.users.roleId),
      // Nếu cùng Role thì sắp xếp theo tên chữ cái
      asc(schema.chatRoomMembers.nickname),
    );

  return await query;
};
// 11. Lưu tin nhắn vào Database
const saveMessage = async (roomId, senderId, content, messageType = "text") => {
  const newMessage = await db
    .insert(schema.chatMessages)
    .values({
      roomId: roomId,
      senderId: senderId,
      messageType: messageType,
      content: content,
    })
    .returning();

  // Cập nhật tin nhắn cuối cùng cho phòng chat
  await db
    .update(schema.chatRooms)
    .set({
      lastMessage: messageType === "text" ? content : "[Tệp đính kèm]",
      lastMessageAt: sql`now()`, // Cập nhật thời gian
    })
    .where(eq(schema.chatRooms.id, roomId));

  return newMessage[0];
};
// 12. Tìm xem 2 user đã có phòng chat PRIVATE chung nào chưa
const findPrivateRoom = async (user1Id, user2Id) => {
  // Lấy tất cả ID phòng private của User 1
  const user1PrivateRooms = db
    .select({ roomId: schema.chatRoomMembers.roomId })
    .from(schema.chatRoomMembers)
    .innerJoin(
      schema.chatRooms,
      eq(schema.chatRoomMembers.roomId, schema.chatRooms.id),
    )
    .where(
      and(
        eq(schema.chatRoomMembers.userId, user1Id),
        eq(schema.chatRooms.type, "private"),
      ),
    );

  // Tìm xem User 2 có nằm trong danh sách phòng private của User 1 không
  const commonRoom = await db
    .select()
    .from(schema.chatRoomMembers)
    .where(
      and(
        eq(schema.chatRoomMembers.userId, user2Id),
        inArray(schema.chatRoomMembers.roomId, user1PrivateRooms),
      ),
    )
    .limit(1);

  return commonRoom.length > 0 ? commonRoom[0].roomId : null;
};

// 13. Tạo phòng chat riêng 1-1
const createPrivateRoom = async (user1Id, user2Id) => {
  // B1: Tạo phòng type = 'private'
  const newRoom = await db
    .insert(schema.chatRooms)
    .values({
      type: "private",
      createdBy: user1Id,
      isActive: true,
    })
    .returning({ id: schema.chatRooms.id });

  const roomId = newRoom[0].id;

  // B2: Nhét cả 2 user vào phòng này
  await db.insert(schema.chatRoomMembers).values([
    { roomId: roomId, userId: user1Id, role: "member" },
    { roomId: roomId, userId: user2Id, role: "member" },
  ]);

  return roomId;
};
// 14. Lưu file đính kèm vào Database
const saveAttachment = async (messageId, fileData) => {
  const newAttachment = await db
    .insert(schema.chatMessageAttachments)
    .values({
      messageId: messageId,
      url: fileData.url,
      fileName: fileData.fileName,
      fileSize: fileData.fileSize,
      mimeType: fileData.mimeType,
    })
    .returning();

  return newAttachment[0];
};
// 15. Lấy danh sách các phòng chat (Inbox) mà User đang tham gia
const getInboxRooms = async (userId) => {
  // Lấy các ID phòng mà user có mặt
  const myRooms = await db
    .select({ roomId: schema.chatRoomMembers.roomId })
    .from(schema.chatRoomMembers)
    .where(eq(schema.chatRoomMembers.userId, userId));

  const roomIds = myRooms.map((r) => r.roomId);
  if (roomIds.length === 0) return [];

  // Lấy chi tiết các phòng đó, sắp xếp phòng có tin nhắn mới nhất lên đầu
  return await db
    .select()
    .from(schema.chatRooms)
    .where(inArray(schema.chatRooms.id, roomIds))
    .orderBy(desc(schema.chatRooms.lastMessageAt));
};

// 16. Tìm thông tin của người chat cùng trong phòng 1-1 (Private)
// Thay thế hàm 16 bằng đoạn này:
const getOtherMemberInPrivateRoom = async (roomId, currentUserId) => {
  const result = await db
    .select({
      userId: schema.users.id,
      nickname: schema.chatRoomMembers.nickname,
      fullName: schema.users.fullName, // <-- THÊM DÒNG NÀY
      username: schema.users.username, // <-- THÊM DÒNG NÀY
      avatarUrl: schema.users.avatarUrl,
      roleName: schema.roles.name,
    })
    .from(schema.chatRoomMembers)
    .innerJoin(schema.users, eq(schema.chatRoomMembers.userId, schema.users.id))
    .leftJoin(schema.roles, eq(schema.users.roleId, schema.roles.id))
    .where(
      and(
        eq(schema.chatRoomMembers.roomId, roomId),
        sql`${schema.chatRoomMembers.userId} != ${currentUserId}`,
      ),
    )
    .limit(1);

  return result.length > 0 ? result[0] : null;
};
// 17. Lấy lịch sử tin nhắn của 1 phòng cụ thể
// 17. Lấy lịch sử tin nhắn của 1 phòng cụ thể (Đã nâng cấp để lấy tên người gửi)
const getMessageHistory = async (roomId) => {
  return await db
    .select({
      id: schema.chatMessages.id,
      roomId: schema.chatMessages.roomId,
      senderId: schema.chatMessages.senderId,
      messageType: schema.chatMessages.messageType,
      content: schema.chatMessages.content,
      createdAt: schema.chatMessages.createdAt,
      // Lấy thêm thông tin người gửi để hiển thị tên trong Chat Nhóm
      senderName: schema.users.fullName,
      senderUsername: schema.users.username,
      senderAvatar: schema.users.avatarUrl,
    })
    .from(schema.chatMessages)
    .innerJoin(schema.users, eq(schema.chatMessages.senderId, schema.users.id))
    .where(eq(schema.chatMessages.roomId, roomId))
    .orderBy(asc(schema.chatMessages.createdAt));
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
  getUserBuildingRoom,
  getBuildingMembers,
  saveMessage,
  findPrivateRoom,
  createPrivateRoom,
  saveAttachment,
  getInboxRooms,
  getOtherMemberInPrivateRoom,
  getMessageHistory,
};
