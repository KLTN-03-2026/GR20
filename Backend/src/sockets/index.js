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
    // BẮT SỰ KIỆN SỬA TIN NHẮN
    socket.on("edit_message", async (data) => {
      try {
        const { messageId, roomId, newContent } = data;

        // Gọi service cập nhật DB
        const updatedMsg = await chatService.handleEditMessage(
          socket.userId,
          messageId,
          newContent,
        );

        // Phát loa cho cả phòng biết tin nhắn đã được sửa
        const roomStr = roomId.toString();
        io.to(roomStr).emit("message_updated", {
          id: updatedMsg.id,
          roomId: updatedMsg.roomId,
          content: updatedMsg.content,
          updatedAt: updatedMsg.updatedAt,
        });

        console.log(`✏️ Đã sửa tin nhắn ${messageId} trong phòng ${roomStr}`);
      } catch (error) {
        console.error("❌ Lỗi sửa tin nhắn:", error);
        socket.emit("error_message", { message: error.message });
      }
    });

    // BẮT SỰ KIỆN THU HỒI TIN NHẮN
    socket.on("delete_message", async (data) => {
      try {
        const { messageId, roomId } = data;

        // Gọi service cập nhật isDeleted = true
        const deletedMsg = await chatService.handleDeleteMessage(
          socket.userId,
          messageId,
        );

        // Phát loa cho cả phòng biết tin nhắn đã bị thu hồi
        const roomStr = roomId.toString();
        io.to(roomStr).emit("message_deleted", {
          id: deletedMsg.id,
          roomId: deletedMsg.roomId,
          isDeleted: true,
        });

        console.log(
          `🗑️ Đã thu hồi tin nhắn ${messageId} trong phòng ${roomStr}`,
        );
      } catch (error) {
        console.error("❌ Lỗi thu hồi tin:", error);
        socket.emit("error_message", { message: error.message });
      }
    });
    // BẮT SỰ KIỆN ĐANG GÕ PHÍM
    socket.on("typing", (data) => {
      const { roomId } = data;
      // socket.to().emit: Phát loa cho cả phòng TRỪ người đang gõ
      socket
        .to(roomId.toString())
        .emit("user_typing", { userId: socket.userId });
    });

    // BẮT SỰ KIỆN NGỪNG GÕ PHÍM
    socket.on("stop_typing", (data) => {
      const { roomId } = data;
      socket
        .to(roomId.toString())
        .emit("user_stop_typing", { userId: socket.userId });
    });
    // BẮT SỰ KIỆN ĐÁNH DẤU ĐÃ XEM
    socket.on("mark_as_read", async (data) => {
      try {
        const { roomId } = data;

        // Cập nhật Database
        await chatService.handleMarkAsRead(socket.userId, roomId);

        // Báo cho những người khác trong phòng biết là tôi đã xem rồi
        socket.to(roomId.toString()).emit("user_read_message", {
          roomId,
          userId: socket.userId,
        });
      } catch (error) {
        console.error("❌ Lỗi đánh dấu đã xem:", error);
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
