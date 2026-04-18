require("dotenv").config();
const app = require("./app");

// Đổi dòng require này
const { connectDB } = require("./configs/database.config");

// 👇 --- BẠN CHÈN VÀO ĐÂY --- 👇
// Dạy cho JSON biết cách xử lý kiểu BigInt thành Chuỗi (String)
BigInt.prototype.toJSON = function () {
  return this.toString();
};
// 👆 ------------------------- 👆

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Backend đang chạy tại: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Lỗi khi khởi động server:", error);
  }
};

startServer();
