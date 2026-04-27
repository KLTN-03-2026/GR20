// src/routes/sockets/index.js

// Biến cục bộ để lưu trữ danh sách user đang online (Map giúp truy xuất nhanh hơn Object)
// Key: userId, Value: socketId
const onlineUsers = new Map();

const initializeSockets = (io) => {
  // Middleware kiểm tra token (Authentication)
  io.use((socket, next) => {
    // Ở bước sau, chúng ta sẽ bắt frontend gửi token lên để decode ra userId
    // Tạm thời để next() đi tiếp
    const userId = socket.handshake.auth.userId;
    if (!userId) {
      return next(new Error("Vui lòng đăng nhập để chat"));
    }
    socket.userId = userId;
    next();
  });

  io.on("connection", (socket) => {
    console.log(`⚡ User connected: ${socket.id} (UserID: ${socket.userId})`);

    // Lưu user vào danh sách online
    onlineUsers.set(socket.userId, socket.id);

    // Xử lý khi user tham gia vào 1 phòng chat cụ thể (Ví dụ: nhóm tòa nhà)
    socket.on("join_room", (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.userId} joined room ${roomId}`);
    });

    // Xử lý khi user ngắt kết nối
    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.id}`);
      onlineUsers.delete(socket.userId);
    });
  });
};

module.exports = initializeSockets;
