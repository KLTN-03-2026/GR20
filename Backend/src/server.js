require("dotenv").config();
const app = require("./app");

// Đổi dòng require này
const { connectDB } = require("./configs/database.config");

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  // Gọi hàm kết nối
  await connectDB();

  app.listen(PORT, () => {
    console.log(`[⚡] Server đang chạy tại: http://localhost:${PORT}`);
  });
};

startServer();
