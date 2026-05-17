const chatRepo = require("./chat.repository");

const setupInitialChat = async (userId, prefixName) => {
  // 1. Lấy Role
  const roleName = await chatRepo.getUserRole(userId);

  // 2. Xác định Tòa nhà & Căn hộ
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
    throw new Error("Tài khoản của bạn chưa được gán vào Tòa nhà nào.");
  }

  // 3. Ghép chuỗi Nickname
  let finalNickname = prefixName;
  if (apartmentCode) finalNickname += ` - ${apartmentCode}`;
  if (roleName) finalNickname += ` - ${roleName}`;

  // 4. Xử lý phòng chat Tòa nhà
  let room = await chatRepo.getBuildingChatRoom(buildingId);
  let roomId;

  if (!room) {
    const newRoom = await chatRepo.createBuildingRoom(buildingId, userId);
    roomId = newRoom.id;
  } else {
    roomId = room.id;
  }

  // 5. Thêm/Cập nhật thành viên vào nhóm chat
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
  // 1. Tìm xem user này đang ở phòng chat tòa nhà nào
  const roomId = await chatRepo.getUserBuildingRoom(userId);

  if (!roomId) {
    throw new Error(
      "Bạn chưa tham gia phòng chat tòa nhà nào. Vui lòng khởi tạo chat trước.",
    );
  }

  // 2. Lấy danh sách thành viên (đã được sắp xếp sẵn từ Repo)
  const members = await chatRepo.getBuildingMembers(roomId, searchKeyword);

  // 3. (Tùy chọn) Lọc bỏ chính bản thân User ra khỏi danh bạ nếu không muốn tự nhắn tin cho mình
  const filteredMembers = members.filter((member) => member.userId !== userId);

  return filteredMembers;
};
const handleSendMessage = async (userId, roomId, content) => {
  if (!content || content.trim() === "") {
    throw new Error("Tin nhắn không được để trống");
  }

  // Lưu xuống DB
  const savedMessage = await chatRepo.saveMessage(
    roomId,
    userId,
    content,
    "text",
  );

  // Trả về kết quả để Socket mang đi phát loa
  return savedMessage;
};
const getOrCreatePrivateChat = async (currentUserId, targetUserId) => {
  if (currentUserId === targetUserId) {
    throw new Error("Bạn không thể tự tạo phòng chat với chính mình.");
  }

  // Tìm xem có phòng chưa
  let roomId = await chatRepo.findPrivateRoom(currentUserId, targetUserId);

  // Nếu chưa có thì tạo mới
  if (!roomId) {
    roomId = await chatRepo.createPrivateRoom(currentUserId, targetUserId);
  }

  return { roomId };
};
const handleUploadAttachment = async (userId, roomId, file) => {
  if (!file) {
    throw new Error("Không tìm thấy file tải lên");
  }

  // 1. Kiểm tra xem nó là Image hay File thường dựa vào mimetype
  const isImage = file.mimetype.startsWith("image/");
  const messageType = isImage ? "image" : "file";

  // 2. Lưu tin nhắn gốc (Nội dung có thể để trống hoặc để tên file)
  const savedMessage = await chatRepo.saveMessage(
    roomId,
    userId,
    file.originalname,
    messageType,
  );

  // 3. Tạo data để lưu attachment
  const fileData = {
    url: `/uploads/chat/${file.filename}`, // Frontend link để hiển thị ảnh
    fileName: file.originalname,
    fileSize: file.size,
    mimeType: file.mimetype,
  };

  // 4. Lưu vào bảng chat_message_attachments
  const savedAttachment = await chatRepo.saveAttachment(
    savedMessage.id,
    fileData,
  );

  // Trả về dữ liệu gộp chung để phát qua Socket
  return {
    id: savedMessage.id,
    roomId: savedMessage.roomId,
    senderId: userId,
    messageType: savedMessage.messageType,
    content: savedMessage.content,
    createdAt: savedMessage.createdAt,
    attachment: savedAttachment,
  };
};
// 1. Service lấy danh sách Inbox (Cuộc trò chuyện)
const getInboxList = async (userId) => {
  // Lấy các phòng chat mà user tham gia
  const rooms = await chatRepo.getInboxRooms(userId);

  // Đắp thêm thông tin người chat cùng (nếu là phòng 1-1)
  const inboxList = await Promise.all(
    rooms.map(async (room) => {
      let roomName = room.name;
      let roomAvatar = room.avatar;
      let chatWithUser = null;

      // Nếu là phòng riêng tư (1-1), tìm thông tin người kia
      if (room.type === "private") {
        const otherMember = await chatRepo.getOtherMemberInPrivateRoom(
          room.id,
          userId,
        );
        if (otherMember) {
          // SỬA DÒNG DƯỚI ĐÂY: Ưu tiên Nickname -> FullName -> Username
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
        chatWithUser: chatWithUser, // Cục data này rất quan trọng để FE bấm vào là chat luôn
      };
    }),
  );

  return inboxList;
};

// 2. Service lấy Lịch sử tin nhắn
const getMessageHistory = async (userId, roomId) => {
  // Check bảo mật: Tránh việc user này truyền ID phòng của người khác để đọc trộm
  const isMember = await chatRepo.getRoomMember(roomId, userId);
  if (!isMember) {
    throw new Error("Bạn không có quyền truy cập cuộc trò chuyện này");
  }

  return await chatRepo.getMessageHistory(roomId);
};
// 3. Xử lý Sửa tin nhắn
const handleEditMessage = async (userId, messageId, newContent) => {
  if (!newContent || newContent.trim() === "") {
    throw new Error("Nội dung tin nhắn không được để trống");
  }
  const updated = await chatRepo.editMessage(messageId, userId, newContent);
  if (!updated) throw new Error("Không thể sửa tin nhắn này");
  return updated;
};

// 4. Xử lý Thu hồi tin nhắn
const handleDeleteMessage = async (userId, messageId) => {
  const deleted = await chatRepo.deleteMessage(messageId, userId);
  if (!deleted) throw new Error("Không thể thu hồi tin nhắn này");
  return deleted;
};
// 5. Xử lý đánh dấu đã xem
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
