require("dotenv").config();
const { defineConfig } = require("drizzle-kit");

module.exports = defineConfig({
  dialect: "postgresql", // Báo cho Drizzle biết bạn đang dùng Postgres
  schema: "./src/db/schema.js", // Nơi bạn sẽ tự viết schema (hoặc để trống nếu dùng pull)
  out: "./drizzle", // Đây chính là cấu hình để nó tự đẻ ra thư mục 'drizzle' mà bạn thắc mắc!
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
