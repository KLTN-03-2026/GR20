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

module.exports = { initChatProfile };
