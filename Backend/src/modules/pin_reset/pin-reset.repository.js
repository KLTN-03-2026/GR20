// modules/pin-reset/pin-reset.repository.js
const { pool } = require('../../configs/database.config');

// Tìm user theo email
const findUserByEmail = async (email) => {

     console.log('🔍 Searching for email:', email); // Debug
  const query = `
    SELECT id, full_name, email, phone
    FROM users
    WHERE email = $1 AND is_active = true
  `;
  const result = await pool.query(query, [email]);
  console.log('📊 Query result:', result.rows); // Debug
  return result.rows[0];
};

// Tìm guest QR code theo host_user_id
const findGuestQrByHostId = async (userId, qrId = null) => {
  let query = `
    SELECT id, qr_code, pin_code, status
    FROM guest_qr_codes
    WHERE host_user_id = $1 AND status = 'ACTIVE'
  `;
  let params = [userId];
  
  if (qrId) {
    query += ` AND id = $2`;
    params.push(qrId);
  }
  
  query += ` ORDER BY created_at DESC LIMIT 1`;
  
  const result = await pool.query(query, params);
  return result.rows[0];
};

// Tìm personal QR code theo user_id
const findPersonalQrByUserId = async (userId) => {
  const query = `
    SELECT id, qr_code, pin_code, status
    FROM qr_codes
    WHERE user_id = $1 AND status = 'ACTIVE'
    ORDER BY created_at DESC
    LIMIT 1
  `;
  const result = await pool.query(query, [userId]);
  return result.rows[0];
};

// Tìm guest QR code theo qr_code string
const findGuestQrByCode = async (qrCode) => {
  const query = `
    SELECT id, qr_code, pin_code, host_user_id, status
    FROM guest_qr_codes
    WHERE qr_code = $1 AND status = 'ACTIVE'
  `;
  const result = await pool.query(query, [qrCode]);
  return result.rows[0];
};

// Tìm personal QR code theo qr_code string
const findPersonalQrByCode = async (qrCode) => {
  const query = `
    SELECT id, qr_code, pin_code, user_id, status
    FROM qr_codes
    WHERE qr_code = $1 AND status = 'ACTIVE'
  `;
  const result = await pool.query(query, [qrCode]);
  return result.rows[0];
};



// Cập nhật PIN mới cho guest QR
const updateGuestQrPin = async (qrId, newPin, resetFailedCount = true) => {
  const query = `
    UPDATE guest_qr_codes 
    SET pin_code = $1, 
        pin_failed_count = $2,
        pin_locked = false
    WHERE id = $3
    RETURNING id, qr_code
  `;
  const failedCount = resetFailedCount ? 0 : undefined;
  const result = await pool.query(query, [newPin, resetFailedCount ? 0 : undefined, qrId]);
  return result.rows[0];
};

// Cập nhật PIN mới cho personal QR

const updatePersonalQrPin = async (qrId, newPin, resetFailedCount = true) => {
  const query = `
    UPDATE qr_codes 
    SET pin_code = $1, 
        pin_failed_count = $2,
        pin_locked = false
    WHERE id = $3
    RETURNING id, qr_code
  `;
  const result = await pool.query(query, [newPin, resetFailedCount ? 0 : 0, qrId]);
  return result.rows[0];
};


// Lưu token reset PIN
const saveResetToken = async (userId, token, expiresAt, qrType = null) => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS pin_reset_tokens (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      token VARCHAR(255) NOT NULL UNIQUE,
      qr_id INTEGER,
      qr_type VARCHAR(20),
      expires_at TIMESTAMP NOT NULL,
      is_used BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await pool.query(createTableQuery);
  
  const query = `
    INSERT INTO pin_reset_tokens (user_id, token, qr_id, qr_type, expires_at)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING token
  `;
  const result = await pool.query(query, [userId, token, null, qrType, expiresAt]);
  return result.rows[0];
};
// const saveResetToken = async (userId, token, expiresAt) => {
//   // Tạo bảng tạm nếu chưa có (có thể tạo permanent table sau)
//   const createTableQuery = `
//     CREATE TABLE IF NOT EXISTS pin_reset_tokens (
//       id SERIAL PRIMARY KEY,
//       user_id INTEGER NOT NULL REFERENCES users(id),
//       token VARCHAR(255) NOT NULL UNIQUE,
//       qr_id INTEGER,
//       qr_type VARCHAR(20),
//       expires_at TIMESTAMP NOT NULL,
//       is_used BOOLEAN DEFAULT false,
//       created_at TIMESTAMP DEFAULT NOW()
//     )
//   `;
//   await pool.query(createTableQuery);
  
//   const query = `
//     INSERT INTO pin_reset_tokens (user_id, token, qr_id, qr_type, expires_at)
//     VALUES ($1, $2, $3, $4, $5)
//     RETURNING token
//   `;
//   const result = await pool.query(query, [userId, token, null, null, expiresAt]);
//   return result.rows[0];
// };

// Tìm token reset PIN
const findResetToken = async (token) => {
  const query = `
    SELECT * FROM pin_reset_tokens
    WHERE token = $1 AND is_used = false AND expires_at > NOW()
  `;
  const result = await pool.query(query, [token]);
  return result.rows[0];
};

// Đánh dấu token đã sử dụng
const markTokenAsUsed = async (token) => {
  const query = `
    UPDATE pin_reset_tokens SET is_used = true WHERE token = $1
  `;
  await pool.query(query, [token]);
};

module.exports = {
  findUserByEmail,
  findGuestQrByHostId,
  findPersonalQrByUserId,
  findGuestQrByCode,
  findPersonalQrByCode,
  updateGuestQrPin,
  updatePersonalQrPin,
  saveResetToken,
  findResetToken,
  markTokenAsUsed,
};
