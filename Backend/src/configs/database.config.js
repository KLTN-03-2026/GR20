require("dotenv").config();
const { Pool } = require("pg");

// ✅ Dùng connection string (chuẩn production)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// ✅ Hàm connect DB
async function connectDB() {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("✅ Kết nối DB thành công:", res.rows[0].now);
  } catch (err) {
    console.error("❌ Lỗi kết nối DB:", err.message);
  }
}

module.exports = { pool, connectDB };
