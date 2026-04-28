const chatService = require("./chat.service");

const initChatProfile = async (req, res) => {
  try {
    // Ép kiểu sub từ Chuỗi sang Số để Drizzle không bị nhầm lẫn
    const userId = Number(req.user.sub);
    const { prefixName } = req.body;

    const result = await chatService.setupInitialChat(userId, prefixName);

    return res.status(200).json({
      success: true,
      message: "Khởi tạo thông tin chat thành công",
      data: result,
    });
  } catch (error) {
    // THÊM DÒNG NÀY ĐỂ IN LỖI RA TERMINAL
    console.error("❌ Lỗi chi tiết tại initChatProfile:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getBuildingDirectory = async (req, res) => {
  try {
    const userId = Number(req.user.sub);
    // Lấy từ khóa tìm kiếm trên URL (VD: ?search=Nhat)
    const { search } = req.query;

    const result = await chatService.getDirectory(userId, search);

    return res.status(200).json({
      success: true,
      message: "Lấy danh bạ thành công",
      data: result,
    });
  } catch (error) {
    console.error("❌ Lỗi tại getBuildingDirectory:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const initPrivateChat = async (req, res) => {
  try {
    const currentUserId = Number(req.user.sub);
    const { targetUserId } = req.body;

    const result = await chatService.getOrCreatePrivateChat(
      currentUserId,
      targetUserId,
    );

    return res.status(200).json({
      success: true,
      message: "Lấy thông tin phòng chat 1-1 thành công",
      data: result,
    });
  } catch (error) {
    console.error("❌ Lỗi tại initPrivateChat:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = { initChatProfile, getBuildingDirectory, initPrivateChat };
