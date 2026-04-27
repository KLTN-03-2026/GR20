require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");

const { connectDB } = require("./configs/database.config");

// 3. Import file quản lý socket
const initializeSockets = require("./sockets/index");

BigInt.prototype.toJSON = function () {
  return this.toString();
};
// 👆 ------------------------- 👆

const PORT = process.env.PORT || 8000;

// Khởi tạo server HTTP bọc lấy app Express
const server = http.createServer(app);

// Gắn Socket.io vào server HTTP vừa tạo
const io = new Server(server, {
  cors: {
    origin: "*", // Chỗ này sau này ghép với frontend React thì chỉnh lại đúng cổng nhé
    methods: ["GET", "POST"],
  },
});

//Truyền io vào hàm khởi tạo các sự kiện Socket
initializeSockets(io);

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`🚀 Backend đang chạy tại: http://localhost:${PORT}`);
      console.log(`🔌 Socket.io đã sẵn sàng lắng nghe!`);
    });
  } catch (error) {
    console.error("❌ Lỗi khi khởi động server:", error);
  }
};

startServer();
