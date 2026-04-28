// Thêm dòng này lên đầu file để mượn não bộ xử lý từ Service
const chatService = require("../modules/chat/chat.service");

const onlineUsers = new Map();

const initializeSockets = (io) => {
  // Middleware xác thực (Tạm thời chúng ta vẫn đang để lỏng chỗ này,
  // khi nào ghép với React Frontend thì mình sẽ hướng dẫn bạn nhét JWT Token vào đây)
  io.use((socket, next) => {
    // Ưu tiên lấy trong auth (cho Frontend sau này), nếu không có thì lấy trên URL (để test Postman)
    const userId =
      socket.handshake.auth.userId || socket.handshake.query.userId;

    if (!userId) {
      return next(new Error("Vui lòng đăng nhập để chat"));
    }
    socket.userId = Number(userId);
    next();
  });

  io.on("connection", (socket) => {
    console.log(`⚡ User connected: ${socket.id} (UserID: ${socket.userId})`);
    onlineUsers.set(socket.userId, socket.id);

    // 1. Lắng nghe yêu cầu Join phòng
    socket.on("join_room", (roomId) => {
      // Ép kiểu roomId về chuỗi (string) để socket join cho chuẩn
      const roomStr = roomId.toString();
      socket.join(roomStr);
      console.log(`User ${socket.userId} đã join phòng ${roomStr}`);
    });

    // 👇 --- PHẦN MỚI THÊM: XỬ LÝ NHẮN TIN --- 👇
    socket.on("send_message", async (data) => {
      /* Cấu trúc data Frontend gửi lên mong đợi:
         { roomId: 1, content: "Chào mọi người" }
      */
      try {
        const { roomId, content } = data;

        // B1: Lưu tin nhắn vào Database
        const savedMsg = await chatService.handleSendMessage(
          socket.userId,
          roomId,
          content,
        );

        // B2: Phát loa tin nhắn này cho TẤT CẢ mọi người đang ở trong cái roomId đó
        const roomStr = roomId.toString();
        io.to(roomStr).emit("receive_message", {
          id: savedMsg.id,
          roomId: savedMsg.roomId,
          senderId: socket.userId,
          content: savedMsg.content,
          createdAt: savedMsg.createdAt,
        });

        console.log(`📩 Đã gửi tin nhắn trong phòng ${roomStr}: ${content}`);
      } catch (error) {
        console.error("❌ Lỗi khi gửi tin nhắn qua Socket:", error);
        // Báo lỗi riêng lại cho cái người vừa gửi để họ biết
        socket.emit("error_message", { message: error.message });
      }
    });
    // 👆 -------------------------------------- 👆

    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.id}`);
      onlineUsers.delete(socket.userId);
    });
  });
};

module.exports = initializeSockets;
