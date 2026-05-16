const axios = require("axios");
const aiChatRepo = require("./ai_chat.repository");

const processChatMessage = async (userId, userMessage) => {
  try {
    const dbData = await aiChatRepo.getUserContextData(userId);

    let dbContextText = "THÔNG TIN HIỆN TẠI CỦA NGƯỜI DÙNG:\n";

    if (dbData) {
      // 1. Căn hộ
      if (dbData.apartmentCode) {
        dbContextText += `- Căn hộ đang ở: ${dbData.apartmentCode} (Vai trò: ${dbData.relationship})\n`;
      } else {
        dbContextText += `- Căn hộ: Người dùng chưa được phân bổ vào căn hộ nào.\n`;
      }

      // 2. Hóa đơn
      if (dbData.pendingInvoices && dbData.pendingInvoices.length > 0) {
        dbContextText += `- Hóa đơn chưa thanh toán: `;
        const invoiceDetails = dbData.pendingInvoices
          .map(
            (inv) =>
              `Mã ${inv.invoiceCode} (${inv.totalAmount} VNĐ, hạn: ${inv.dueDate})`,
          )
          .join(", ");
        dbContextText += `${invoiceDetails}.\n`;
      } else {
        dbContextText += `- Hóa đơn: Không có hóa đơn nào đang nợ.\n`;
      }

      // 3. Xe cộ
      if (dbData.vehicles && dbData.vehicles.length > 0) {
        dbContextText += `- Phương tiện sở hữu: `;
        const vehicleDetails = dbData.vehicles
          .map(
            (v) =>
              `${v.vehicleType} màu ${v.color} (Biển số: ${v.plateNumber})`,
          )
          .join(", ");
        dbContextText += `${vehicleDetails}.\n`;
      } else {
        dbContextText += `- Phương tiện: Chưa đăng ký phương tiện nào.\n`;
      }

      // 4. Bảo trì
      if (dbData.maintenanceRequests && dbData.maintenanceRequests.length > 0) {
        dbContextText += `- Yêu cầu bảo trì đang xử lý: `;
        const mainDetails = dbData.maintenanceRequests
          .map((m) => `"${m.title}" (Trạng thái: ${m.status})`)
          .join(", ");
        dbContextText += `${mainDetails}.\n`;
      } else {
        dbContextText += `- Bảo trì: Không có yêu cầu nào đang chờ xử lý.\n`;
      }

      // 5. QR Code
      if (dbData.qrCode) {
        dbContextText += `- Mã QR ra vào: Đang hoạt động, hạn đến ${dbData.qrCode.expiresAt}.\n`;
      } else {
        dbContextText += `- Mã QR ra vào: Chưa có hoặc đã hết hạn.\n`;
      }

      // 6. THÔNG BÁO
      if (dbData.notifications && dbData.notifications.length > 0) {
        dbContextText += `- Thông báo gần đây: `;
        const notifDetails = dbData.notifications
          .map((n) => `"${n.title}"`)
          .join(" | ");
        dbContextText += `${notifDetails}.\n`;
      } else {
        dbContextText += `- Thông báo: Không có thông báo nào mới.\n`;
      }
    }

    console.log(
      "============= DỮ LIỆU DB_CONTEXT GỬI CHO AI =============\n",
      dbContextText,
    );

    // Gửi sang Server AI (Python)
    const aiResponse = await axios.post("http://localhost:8080/api/ai/chat", {
      message: userMessage,
      db_context: dbContextText,
    });

    return aiResponse.data.answer;
  } catch (error) {
    console.error("Lỗi quá trình xử lý AI:", error);
    if (error.response) {
      throw new Error(`Lỗi từ AI Server: ${error.response.status}`);
    }
    throw new Error(
      "Không thể kết nối đến Trợ lý AI lúc này, vui lòng thử lại sau.",
    );
  }
};

module.exports = {
  processChatMessage,
};
