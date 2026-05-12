const axios = require("axios");
const aiChatRepo = require("./ai_chat.repository");

const processChatMessage = async (userId, userMessage) => {
  // 1. Lấy Context từ Database
  const dbData = await aiChatRepo.getUserContextData(userId);

  let dbContextText = "Người dùng hiện tại chưa được cấp căn hộ nào.";

  if (dbData) {
    dbContextText = `Thông tin người đang chat:\n- Đang ở căn hộ: ${dbData.apartmentCode}\n`;
    if (dbData.pendingInvoices.length > 0) {
      dbContextText += `- Hóa đơn chưa thanh toán: `;
      dbData.pendingInvoices.forEach((inv) => {
        dbContextText += `Mã ${inv.invoiceCode} (Số tiền: ${inv.totalAmount} VNĐ, Hạn chót: ${inv.dueDate}). `;
      });
    } else {
      dbContextText += `- Không có hóa đơn nào đang nợ.`;
    }
  }

  // 2. Bắn câu hỏi và DB Context sang Server AI (Python)
  try {
    const aiResponse = await axios.post("http://localhost:8080/api/ai/chat", {
      message: userMessage,
      db_context: dbContextText,
    });

    return aiResponse.data.answer;
  } catch (error) {
    console.error("Lỗi gọi AI Server:", error.message);
    throw new Error(
      "Không thể kết nối đến Trợ lý AI lúc này, vui lòng thử lại sau.",
    );
  }
};

module.exports = {
  processChatMessage,
};
