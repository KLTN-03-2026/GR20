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

// 5. Tạo phòng chat Tòa nhà mới (ĐÃ SỬA: Lấy tên tòa nhà động)
const createBuildingRoom = async (buildingId, createdByUserId) => {
  // Lấy tên tòa nhà từ DB
  const buildingData = await db
    .select({ name: schema.buildings.name })
    .from(schema.buildings)
    .where(eq(schema.buildings.id, buildingId))
    .limit(1);

  const buildingName =
    buildingData.length > 0 ? buildingData[0].name : "Không xác định";

  const newRoom = await db
    .insert(schema.chatRooms)
    .values({
      name: `Nhóm cư dân tòa nhà ${buildingName}`, // Tên động theo Tòa nhà
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

// ================= CÁC HÀM DANH BẠ VÀ ADMIN =================

// Lấy danh sách ID của TẤT CẢ tòa nhà trong hệ thống (Dành cho Admin/Quản lý)
const getAllBuildings = async () => {
  return await db.select({ id: schema.buildings.id }).from(schema.buildings);
};

// Tìm TẤT CẢ các ID phòng chat tòa nhà mà user đang tham gia
const getUserAllBuildingRooms = async (userId) => {
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
    );
  return result.map((r) => r.roomId);
};

// Lấy danh bạ thành viên từ NHIỀU phòng chat
const getMembersFromMultipleRooms = async (roomIds, searchKeyword) => {
  if (!roomIds || roomIds.length === 0) return [];

  const query = db
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
        inArray(schema.chatRoomMembers.roomId, roomIds),
        searchKeyword
          ? ilike(schema.chatRoomMembers.nickname, `%${searchKeyword}%`)
          : undefined,
      ),
    )
    .orderBy(asc(schema.users.roleId), asc(schema.chatRoomMembers.nickname));

  const results = await query;

  // Loại bỏ trùng lặp
  const uniqueMembers = [];
  const map = new Map();
  for (const item of results) {
    if (!map.has(item.userId)) {
      map.set(item.userId, true);
      uniqueMembers.push(item);
    }
  }
  return uniqueMembers;
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

  await db
    .update(schema.chatRooms)
    .set({
      lastMessage: messageType === "text" ? content : "[Tệp đính kèm]",
      lastMessageAt: sql`now()`,
    })
    .where(eq(schema.chatRooms.id, roomId));

  return newMessage[0];
};

// 12. Tìm xem 2 user đã có phòng chat PRIVATE chung nào chưa
const findPrivateRoom = async (user1Id, user2Id) => {
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
  const newRoom = await db
    .insert(schema.chatRooms)
    .values({
      type: "private",
      createdBy: user1Id,
      isActive: true,
    })
    .returning({ id: schema.chatRooms.id });

  const roomId = newRoom[0].id;

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

// 15. Lấy danh sách các phòng chat (Inbox)
const getInboxRooms = async (userId) => {
  const myRooms = await db
    .select({ roomId: schema.chatRoomMembers.roomId })
    .from(schema.chatRoomMembers)
    .where(eq(schema.chatRoomMembers.userId, userId));

  const roomIds = myRooms.map((r) => r.roomId);
  if (roomIds.length === 0) return [];

  return await db
    .select()
    .from(schema.chatRooms)
    .where(inArray(schema.chatRooms.id, roomIds))
    .orderBy(desc(schema.chatRooms.lastMessageAt));
};

// 16. Tìm thông tin của người chat cùng trong phòng 1-1
const getOtherMemberInPrivateRoom = async (roomId, currentUserId) => {
  const result = await db
    .select({
      userId: schema.users.id,
      nickname: schema.chatRoomMembers.nickname,
      fullName: schema.users.fullName,
      username: schema.users.username,
      avatarUrl: schema.users.avatarUrl,
      roleName: schema.roles.name,
      lastReadAt: schema.chatRoomMembers.lastReadAt,
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

// 17. Lấy lịch sử tin nhắn (ĐÃ SỬA: Lấy nickname trong danh bạ thay vì tên thật)
const getMessageHistory = async (roomId) => {
  const messages = await db
    .select({
      id: schema.chatMessages.id,
      roomId: schema.chatMessages.roomId,
      senderId: schema.chatMessages.senderId,
      messageType: schema.chatMessages.messageType,
      content: schema.chatMessages.content,
      createdAt: schema.chatMessages.createdAt,

      // Lấy 2 thông tin: nickname (tên đã đổi) và fullName (tên thật gốc)
      senderNickname: schema.chatRoomMembers.nickname,
      senderFullName: schema.users.fullName,
      senderUsername: schema.users.username,
      senderAvatar: schema.users.avatarUrl,

      attachmentUrl: schema.chatMessageAttachments.url,
      isDeleted: schema.chatMessages.isDeleted,
      updatedAt: schema.chatMessages.updatedAt,
    })
    .from(schema.chatMessages)
    .innerJoin(schema.users, eq(schema.chatMessages.senderId, schema.users.id))
    // JOIN thêm bảng chatRoomMembers để móc ra đúng Nickname ở phòng này
    .leftJoin(
      schema.chatRoomMembers,
      and(
        eq(schema.chatRoomMembers.roomId, schema.chatMessages.roomId),
        eq(schema.chatRoomMembers.userId, schema.chatMessages.senderId),
      ),
    )
    .leftJoin(
      schema.chatMessageAttachments,
      eq(schema.chatMessages.id, schema.chatMessageAttachments.messageId),
    )
    .where(eq(schema.chatMessages.roomId, roomId))
    .orderBy(asc(schema.chatMessages.createdAt));

  // Map lại kết quả, ưu tiên Nickname (Tên giống danh bạ)
  return messages.map((msg) => ({
    id: msg.id,
    roomId: msg.roomId,
    senderId: msg.senderId,
    messageType: msg.messageType,
    content: msg.content,
    createdAt: msg.createdAt,
    senderName: msg.senderNickname || msg.senderFullName || msg.senderUsername,
    senderUsername: msg.senderUsername,
    senderAvatar: msg.senderAvatar,
    attachmentUrl: msg.attachmentUrl,
    isDeleted: msg.isDeleted,
    updatedAt: msg.updatedAt,
  }));
};

// 18. Sửa tin nhắn
const editMessage = async (messageId, senderId, newContent) => {
  const updatedMessage = await db
    .update(schema.chatMessages)
    .set({
      content: newContent,
      updatedAt: sql`now()`,
    })
    .where(
      and(
        eq(schema.chatMessages.id, messageId),
        eq(schema.chatMessages.senderId, senderId),
      ),
    )
    .returning();

  return updatedMessage[0];
};

// 19. Xóa tin nhắn (Thu hồi)
const deleteMessage = async (messageId, senderId) => {
  const deletedMessage = await db
    .update(schema.chatMessages)
    .set({
      isDeleted: true,
      deletedAt: sql`now()`,
    })
    .where(
      and(
        eq(schema.chatMessages.id, messageId),
        eq(schema.chatMessages.senderId, senderId),
      ),
    )
    .returning();

  return deletedMessage[0];
};

// 20. Đánh dấu đã xem
const markRoomAsRead = async (roomId, userId) => {
  await db
    .update(schema.chatRoomMembers)
    .set({
      lastReadAt: sql`now()`,
    })
    .where(
      and(
        eq(schema.chatRoomMembers.roomId, roomId),
        eq(schema.chatRoomMembers.userId, userId),
      ),
    );
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
  getAllBuildings,
  getUserAllBuildingRooms,
  getMembersFromMultipleRooms,
  saveMessage,
  findPrivateRoom,
  createPrivateRoom,
  saveAttachment,
  getInboxRooms,
  getOtherMemberInPrivateRoom,
  getMessageHistory,
  editMessage,
  deleteMessage,
  markRoomAsRead,
};
