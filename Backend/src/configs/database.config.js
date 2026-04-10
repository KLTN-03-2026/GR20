require("dotenv").config();
const { Pool } = require("pg");
const { drizzle } = require("drizzle-orm/node-postgres"); // ✅ 1. Import Drizzle

// Dùng connection string (chuẩn production)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// ✅ 2. Khởi tạo Drizzle bọc lên trên pool cũ
const db = drizzle(pool);

// Hàm connect DB (Giữ nguyên)
async function connectDB() {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("✅ Kết nối DB thành công:", res.rows[0].now);
  } catch (err) {
    console.error("❌ Lỗi kết nối DB:", err.message);
  }
}

// ✅ 3. Thêm biến `db` vào danh sách export
module.exports = { pool, connectDB, db };
