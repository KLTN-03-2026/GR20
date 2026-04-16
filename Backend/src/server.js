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
  // Gọi hàm kết nối
  await connectDB();

  app.listen(PORT, () => {
    // Server started
  });
};

startServer();
