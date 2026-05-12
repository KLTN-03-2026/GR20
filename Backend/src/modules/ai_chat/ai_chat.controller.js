const aiChatService = require("./ai_chat.service");
const { chatRequestSchema } = require("./ai_chat.request");

const handleChat = async (req, res) => {
  try {
    // Validate bằng Zod giống hệt bên employee
    const validatedData = chatRequestSchema.parse(req.body);

    // Lấy userId từ token (middleware verifyToken đã xử lý)
    const userId = req.user.sub || req.user.id;

    // Gọi service
    const answer = await aiChatService.processChatMessage(
      userId,
      validatedData.message,
    );

    return res.status(200).json({
      status: "success",
      message: "Phản hồi AI thành công",
      data: { answer },
    });
  } catch (error) {
    // Xử lý lỗi Zod
    if (error.name === "ZodError") {
      return res
        .status(400)
        .json({ status: "error", message: error.errors[0].message });
    }
    // Xử lý lỗi mất kết nối Python
    if (error.message.includes("Không thể kết nối")) {
      return res.status(503).json({ status: "error", message: error.message });
    }
    // Lỗi hệ thống khác
    return res
      .status(500)
      .json({ status: "error", message: "Lỗi máy chủ nội bộ" });
  }
};

module.exports = {
  handleChat,
};
