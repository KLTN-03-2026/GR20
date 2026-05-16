const chatRepo = require("./chat.repository");

const setupInitialChat = async (userId, prefixName) => {
  // 1. Lấy Role
  const roleName = await chatRepo.getUserRole(userId);
  const isGlobalRole =
    roleName &&
    (roleName.toLowerCase().includes("admin") ||
      roleName.toLowerCase().includes("quản lý") ||
      roleName.toLowerCase().includes("manager"));

  // NẾU LÀ ADMIN HOẶC QUẢN LÝ: Add vào toàn bộ các nhóm tòa nhà
  if (isGlobalRole) {
    const finalNickname = `${prefixName} - Ban Quản Trị`;
    const allBuildings = await chatRepo.getAllBuildings();

    for (const b of allBuildings) {
      let room = await chatRepo.getBuildingChatRoom(b.id);
      if (!room) {
        room = await chatRepo.createBuildingRoom(b.id, userId);
      }

      const existMember = await chatRepo.getRoomMember(room.id, userId);
      if (!existMember) {
        await chatRepo.addMemberToRoom(room.id, userId, finalNickname);
      } else {
        await chatRepo.updateMemberNickname(existMember.id, finalNickname);
      }
    }

    return {
      roomId: "global", // Trả về tượng trưng để FE biết đã init xong
      nickname: finalNickname,
    };
  }

  // NẾU LÀ CƯ DÂN HOẶC NHÂN VIÊN: Xử lý theo 1 tòa nhà
  let buildingId = null;
  let apartmentCode = null;

  const residentInfo = await chatRepo.getResidentInfo(userId);
  if (residentInfo) {
    buildingId = residentInfo.buildingId;
    apartmentCode = residentInfo.apartmentCode;
  } else {
    const staffInfo = await chatRepo.getStaffBuildingInfo(userId);
    if (staffInfo) {
      buildingId = staffInfo.buildingId;
    }
  }

  if (!buildingId) {
    throw new Error(
      "Tài khoản của bạn chưa được phân bổ vào Tòa nhà nào để tham gia Chat.",
    );
  }

  // Ghép chuỗi Nickname
  let finalNickname = prefixName;
  if (apartmentCode) finalNickname += ` - P.${apartmentCode}`;
  if (roleName) finalNickname += ` - ${roleName}`;

  // Xử lý phòng chat Tòa nhà
  let room = await chatRepo.getBuildingChatRoom(buildingId);
  let roomId;

  if (!room) {
    const newRoom = await chatRepo.createBuildingRoom(buildingId, userId);
    roomId = newRoom.id;
  } else {
    roomId = room.id;
  }

  // Thêm/Cập nhật thành viên vào nhóm chat
  const existMember = await chatRepo.getRoomMember(roomId, userId);
  if (!existMember) {
    await chatRepo.addMemberToRoom(roomId, userId, finalNickname);
  } else {
    await chatRepo.updateMemberNickname(existMember.id, finalNickname);
  }

  return {
    roomId,
    nickname: finalNickname,
  };
};

const getDirectory = async (userId, searchKeyword) => {
  // Lấy TẤT CẢ các ID phòng chat tòa nhà mà user đang tham gia
  const roomIds = await chatRepo.getUserAllBuildingRooms(userId);

  if (!roomIds || roomIds.length === 0) {
    throw new Error(
      "Bạn chưa tham gia phòng chat tòa nhà nào. Vui lòng khởi tạo chat trước.",
    );
  }

  // Lấy danh sách thành viên từ các phòng đó
  const members = await chatRepo.getMembersFromMultipleRooms(
    roomIds,
    searchKeyword,
  );

  // Lọc bỏ chính bản thân User ra khỏi danh bạ nếu không muốn tự nhắn tin
  const filteredMembers = members.filter((member) => member.userId !== userId);

  return filteredMembers;
};

const handleSendMessage = async (userId, roomId, content) => {
  if (!content || content.trim() === "") {
    throw new Error("Tin nhắn không được để trống");
  }

  const savedMessage = await chatRepo.saveMessage(
    roomId,
    userId,
    content,
    "text",
  );

  // Lấy nickname của người gửi trong phòng này để emit qua Socket
  const memberInfo = await chatRepo.getRoomMember(roomId, userId);
  const senderNickname = memberInfo ? memberInfo.nickname : null;

  return {
    ...savedMessage,
    senderName: senderNickname,
  };
};

const getOrCreatePrivateChat = async (currentUserId, targetUserId) => {
  if (currentUserId === targetUserId) {
    throw new Error("Bạn không thể tự tạo phòng chat với chính mình.");
  }

  let roomId = await chatRepo.findPrivateRoom(currentUserId, targetUserId);

  if (!roomId) {
    roomId = await chatRepo.createPrivateRoom(currentUserId, targetUserId);
  }

  return { roomId };
};

const handleUploadAttachment = async (userId, roomId, file) => {
  if (!file) {
    throw new Error("Không tìm thấy file tải lên");
  }

  const isImage = file.mimetype.startsWith("image/");
  const messageType = isImage ? "image" : "file";

  const savedMessage = await chatRepo.saveMessage(
    roomId,
    userId,
    file.originalname,
    messageType,
  );

  const fileData = {
    url: `/uploads/chat/${file.filename}`,
    fileName: file.originalname,
    fileSize: file.size,
    mimeType: file.mimetype,
  };

  const savedAttachment = await chatRepo.saveAttachment(
    savedMessage.id,
    fileData,
  );

  // Lấy nickname của người gửi trong phòng này để emit qua Socket
  const memberInfo = await chatRepo.getRoomMember(roomId, userId);
  const senderNickname = memberInfo ? memberInfo.nickname : null;

  return {
    id: savedMessage.id,
    roomId: savedMessage.roomId,
    senderId: userId,
    messageType: savedMessage.messageType,
    content: savedMessage.content,
    createdAt: savedMessage.createdAt,
    attachmentUrl: fileData.url,
    senderName: senderNickname,
  };
};

const getInboxList = async (userId) => {
  const rooms = await chatRepo.getInboxRooms(userId);

  const inboxList = await Promise.all(
    rooms.map(async (room) => {
      let roomName = room.name;
      let roomAvatar = room.avatar;
      let chatWithUser = null;

      if (room.type === "private") {
        const otherMember = await chatRepo.getOtherMemberInPrivateRoom(
          room.id,
          userId,
        );
        if (otherMember) {
          roomName =
            otherMember.nickname ||
            otherMember.fullName ||
            otherMember.username;
          roomAvatar = otherMember.avatarUrl;
          chatWithUser = otherMember;
        }
      }

      return {
        roomId: room.id,
        type: room.type,
        name: roomName || "Cuộc trò chuyện",
        avatar: roomAvatar,
        lastMessage: room.lastMessage,
        lastMessageAt: room.lastMessageAt,
        chatWithUser: chatWithUser,
      };
    }),
  );

  return inboxList;
};

const getMessageHistory = async (userId, roomId) => {
  const isMember = await chatRepo.getRoomMember(roomId, userId);
  // Do Admin có thể chui vào nhiều nhóm, nếu họ chưa vào thì check quyền
  if (!isMember) {
    const roleName = await chatRepo.getUserRole(userId);
    const isGlobalRole =
      roleName &&
      (roleName.toLowerCase().includes("admin") ||
        roleName.toLowerCase().includes("quản lý") ||
        roleName.toLowerCase().includes("manager"));
    if (!isGlobalRole) {
      throw new Error("Bạn không có quyền truy cập cuộc trò chuyện này");
    }
  }

  return await chatRepo.getMessageHistory(roomId);
};

const handleEditMessage = async (userId, messageId, newContent) => {
  if (!newContent || newContent.trim() === "") {
    throw new Error("Nội dung tin nhắn không được để trống");
  }
  const updated = await chatRepo.editMessage(messageId, userId, newContent);
  if (!updated) throw new Error("Không thể sửa tin nhắn này");
  return updated;
};

const handleDeleteMessage = async (userId, messageId) => {
  const deleted = await chatRepo.deleteMessage(messageId, userId);
  if (!deleted) throw new Error("Không thể thu hồi tin nhắn này");
  return deleted;
};

const handleMarkAsRead = async (userId, roomId) => {
  await chatRepo.markRoomAsRead(roomId, userId);
};

module.exports = {
  setupInitialChat,
  getDirectory,
  handleSendMessage,
  getOrCreatePrivateChat,
  handleUploadAttachment,
  getInboxList,
  getMessageHistory,
  handleEditMessage,
  handleDeleteMessage,
  handleMarkAsRead,
};
