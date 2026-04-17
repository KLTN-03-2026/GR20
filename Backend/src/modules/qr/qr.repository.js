const { pool } = require("../../configs/database.config");

// ─── QR CÁ NHÂN ───────────────────────────────────────────
const getPersonalQr = async (userId) => {
  const query = `SELECT * FROM qr_codes WHERE user_id = $1 AND status = 'ACTIVE' ORDER BY created_at DESC LIMIT 1`;
  const result = await pool.query(query, [userId]);
  return result.rows[0];
};

// ─── TẠO KHÁCH + QR KHÁCH ─────────────────────────────────
const createGuestQr = async ({ visitor, guestQr }) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Insert visitor
    const visitorResult = await client.query(`
      INSERT INTO visitors (host_user_id, name, phone, id_card)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `, [visitor.host_user_id, visitor.name, visitor.phone, visitor.id_card]);
    const visitorId = visitorResult.rows[0].id;

    // 2. Insert guest_qr_codes
    const qrResult = await client.query(`
      INSERT INTO guest_qr_codes 
        (host_user_id, apartment_id, visitor_id, qr_code, valid_from, valid_to, max_entries, used_entries, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 0, 'ACTIVE')
      RETURNING *
    `, [
      guestQr.host_user_id,
      guestQr.apartment_id,
      visitorId,
      guestQr.qr_code,
      guestQr.valid_from,
      guestQr.valid_to,
      guestQr.max_entries,
    ]);

    await client.query("COMMIT");
    return { visitor: visitorResult.rows[0], guestQr: qrResult.rows[0] };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// ─── DANH SÁCH QR KHÁCH (Lấy tất cả trừ REVOKED) ───────────────────────────────────
const getGuestQrsByHost = async (hostUserId, options = {}) => {
  const {
    limit = 10,
    offset = 0,
    onlyValid = false  // false: lấy hết (kể cả expired), true: chỉ lấy còn hiệu lực
  } = options;

  let conditions = [`gq.host_user_id = $1`];
  let params = [hostUserId];
  let paramIndex = 2;

  // ✅ Chỉ lọc REVOKED - không hiển thị QR đã bị thu hồi
  conditions.push(`gq.status != 'REVOKED'`);

  // Nếu onlyValid = true thì chỉ lấy QR còn hiệu lực (chưa hết hạn)
  if (onlyValid) {
    conditions.push(`gq.valid_from <= NOW()`);
    conditions.push(`gq.valid_to >= NOW()`);
    conditions.push(`gq.status = 'ACTIVE'`);
  }

  const whereClause = conditions.length > 0 
    ? `WHERE ${conditions.join(' AND ')}` 
    : '';

  // Query lấy dữ liệu với phân trang
  const dataQuery = `
    SELECT 
      gq.*,
      v.name AS visitor_name,
      v.phone AS visitor_phone,
      v.id_card AS visitor_id_card,
      a.apartment_code,
      u.full_name AS host_name
    FROM guest_qr_codes gq
    LEFT JOIN visitors v ON v.id = gq.visitor_id
    LEFT JOIN apartments a ON a.id = gq.apartment_id
    LEFT JOIN users u ON u.id = gq.host_user_id
    ${whereClause}
    ORDER BY gq.created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const dataResult = await pool.query(dataQuery, [...params, limit, offset]);

  // Query lấy tổng số
  const countQuery = `
    SELECT COUNT(*) as total
    FROM guest_qr_codes gq
    ${whereClause}
  `;
  const countResult = await pool.query(countQuery, params);

  return {
    total: parseInt(countResult.rows[0].total),
    limit: parseInt(limit),
    offset: parseInt(offset),
    data: dataResult.rows
  };
};

// ─── CHI TIẾT QR KHÁCH ────────────────────────────────────
const getGuestQrById = async (id) => {
  const query = `
    SELECT 
      gq.*,
      v.name AS visitor_name,
      v.phone AS visitor_phone,
      v.id_card AS visitor_id_card,
      a.apartment_code,
      u.full_name AS host_name
    FROM guest_qr_codes gq
    LEFT JOIN visitors v ON v.id = gq.visitor_id
    LEFT JOIN apartments a ON a.id = gq.apartment_id
    LEFT JOIN users u ON u.id = gq.host_user_id
    WHERE gq.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// ─── QUÉT QR ──────────────────────────────────────────────
const scanQr = async (qrCode) => {
  const query = `
    SELECT 
      gq.*,
      v.name AS visitor_name,
      v.phone AS visitor_phone,
      v.id_card AS visitor_id_card,
      a.apartment_code,
      u.full_name AS host_name
    FROM guest_qr_codes gq
    LEFT JOIN visitors v ON v.id = gq.visitor_id
    LEFT JOIN apartments a ON a.id = gq.apartment_id
    LEFT JOIN users u ON u.id = gq.host_user_id
    WHERE gq.qr_code = $1
  `;
  const result = await pool.query(query, [qrCode]);
  return result.rows[0];
};
// const scanQr = async (qrCode) => {
//   const query = `
//     SELECT 
//       gq.*,
//       v.name AS visitor_name,
//       v.phone AS visitor_phone,
//       v.id_card AS visitor_id_card,
//       a.apartment_code,
//       u.full_name AS host_name
//     FROM guest_qr_codes gq
//     LEFT JOIN visitors v ON v.id = gq.visitor_id
//     LEFT JOIN apartments a ON a.id = gq.apartment_id
//     LEFT JOIN users u ON u.id = gq.host_user_id
//     WHERE gq.qr_code = $1
//   `;
//   const result = await pool.query(query, [qrCode]);
//   return result.rows[0];
// };

// ─── SỬA QR KHÁCH ─────────────────────────────────────────
const updateGuestQr = async (id, data) => {
  const fields = [];
  const values = [];
  let index = 1;

  if (data.valid_from !== undefined)  { fields.push(`valid_from = $${index++}`);  values.push(data.valid_from); }
  if (data.valid_to !== undefined)    { fields.push(`valid_to = $${index++}`);    values.push(data.valid_to); }
  if (data.max_entries !== undefined) { fields.push(`max_entries = $${index++}`); values.push(data.max_entries); }
  if (data.status !== undefined)      { fields.push(`status = $${index++}`);      values.push(data.status); }

  if (fields.length === 0) throw new Error("No fields to update");

  values.push(id);
  const query = `UPDATE guest_qr_codes SET ${fields.join(", ")} WHERE id = $${index} RETURNING *`;
  const result = await pool.query(query, values);
  return result.rows[0];
};

// ─── XÓA QR KHÁCH ─────────────────────────────────────────
const deleteGuestQr = async (id) => {
  // const query = `UPDATE guest_qr_codes SET status = 'INACTIVE' WHERE id = $1 RETURNING id`;
  // const result = await pool.query(query, [id]);
  // return result.rows[0];

     const query = `UPDATE guest_qr_codes SET status = 'REVOKED' WHERE id = $1 RETURNING id`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// ─── LỊCH SỬ QR KHÁCH ─────────────────────────────────────
// const getGuestQrHistory = async (hostUserId) => {
//   const query = `
//     SELECT 
//       gq.*,
//       v.name AS visitor_name,
//       v.phone AS visitor_phone,
//       a.apartment_code,
//       u.full_name AS host_name,
//       al.scan_time,
//       al.direction,
//       al.gate,
//       al.result
//     FROM guest_qr_codes gq
//     LEFT JOIN visitors v ON v.id = gq.visitor_id
//     LEFT JOIN apartments a ON a.id = gq.apartment_id
//     LEFT JOIN users u ON u.id = gq.host_user_id
//     LEFT JOIN access_logs al ON al.qr_code_id = gq.id
//     WHERE gq.host_user_id = $1
//     ORDER BY gq.created_at DESC
//   `;
//   const result = await pool.query(query, [hostUserId]);
//   return result.rows;
// };

// ─── TẠO LOG KHI QUÉT QR ─────────────────────────────────────────
const createAccessLog = async (logData) => {
  const query = `
    INSERT INTO access_logs (qr_code_id, user_id, building_id, direction, gate, scan_time, result)
    VALUES ($1, $2, $3, $4, $5, NOW(), $6)
    RETURNING *
  `;
  const result = await pool.query(query, [
    logData.qr_code_id,
    logData.user_id || null,
    logData.building_id || null,
    logData.direction || 'IN',
    logData.gate || null,
    logData.result || 'SUCCESS'
  ]);
  return result.rows[0];
};

// ─── CẬP NHẬT SỐ LẦN ĐÃ DÙNG ─────────────────────────────────────────
const incrementUsedEntries = async (id) => {
  const query = `
    UPDATE guest_qr_codes 
    SET used_entries = used_entries + 1 
    WHERE id = $1 
    RETURNING *
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// ─── LẤY LỊCH SỬ QUÉT QR ─────────────────────────────────────────
const getGuestQrHistory = async (hostUserId) => {
  const query = `
    SELECT 
      gq.*,
      v.name AS visitor_name,
      v.phone AS visitor_phone,
      a.apartment_code,
      u.full_name AS host_name,
      al.scan_time,
      al.direction,
      al.gate,
      al.result
    FROM guest_qr_codes gq
    LEFT JOIN visitors v ON v.id = gq.visitor_id
    LEFT JOIN apartments a ON a.id = gq.apartment_id
    LEFT JOIN users u ON u.id = gq.host_user_id
    LEFT JOIN access_logs al ON al.qr_code_id = gq.id
    WHERE gq.host_user_id = $1
    ORDER BY al.scan_time DESC
  `;
  const result = await pool.query(query, [hostUserId]);
  return result.rows;
};

module.exports = {
  getPersonalQr,
  createGuestQr,
  getGuestQrsByHost,
  getGuestQrById,
  scanQr,
  updateGuestQr,
  deleteGuestQr,
  getGuestQrHistory,
    createAccessLog,        // ← Thêm
  incrementUsedEntries
};