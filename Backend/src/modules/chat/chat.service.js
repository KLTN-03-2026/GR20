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

module.exports = { setupInitialChat };
