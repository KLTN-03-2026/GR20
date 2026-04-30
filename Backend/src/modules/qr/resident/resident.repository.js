
const { pool } = require("../common/base.repository");

// Tạo guest QR
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


const getGuestQrsByHost = async (hostUserId, options = {}) => {
  const {
    limit = 10,
    offset = 0,
    onlyValid = false,
    search = '',
    validFromDate = null,  // valid_to >= fromDate
    validToDate = null      // valid_to <= toDate
  } = options;

  let conditions = [`gq.host_user_id = $1`];
  let params = [hostUserId];
  let paramIndex = 2;

  // Lọc QR còn hiệu lực
  if (onlyValid) {
    conditions.push(`gq.valid_from <= NOW()`);
    conditions.push(`gq.valid_to >= NOW()`);
    conditions.push(`gq.status = 'ACTIVE'`);
  }

  // ✅ Lọc valid_to trong khoảng fromDate -> toDate
  if (validFromDate) {
    conditions.push(`gq.valid_to >= $${paramIndex}`);
    params.push(validFromDate);
    paramIndex++;
  }
  if (validToDate) {
    conditions.push(`gq.valid_to <= $${paramIndex}`);
    params.push(validToDate);
    paramIndex++;
  }

  // Tìm kiếm
  if (search && search.trim()) {
    conditions.push(`(v.name ILIKE $${paramIndex} OR v.phone ILIKE $${paramIndex})`);
    params.push(`%${search.trim()}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 
    ? `WHERE ${conditions.join(' AND ')}` 
    : '';

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

  const countQuery = `
    SELECT COUNT(*) as total
    FROM guest_qr_codes gq
    LEFT JOIN visitors v ON v.id = gq.visitor_id
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

// Lấy chi tiết guest QR
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

// Cập nhật guest QR
const updateGuestQr = async (id, data) => {
  const fields = [];
  const values = [];
  let index = 1;
  if (data.valid_from !== undefined) { fields.push(`valid_from = $${index++}`); values.push(data.valid_from); }
  if (data.valid_to !== undefined) { fields.push(`valid_to = $${index++}`); values.push(data.valid_to); }
  if (data.max_entries !== undefined) { fields.push(`max_entries = $${index++}`); values.push(data.max_entries); }
  if (data.status !== undefined) { fields.push(`status = $${index++}`); values.push(data.status); }
  if (fields.length === 0) throw new Error("No fields to update");
  values.push(id);
  const query = `UPDATE guest_qr_codes SET ${fields.join(", ")} WHERE id = $${index} RETURNING *`;
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Xóa guest QR
const deleteGuestQr = async (id) => {
  const query = `UPDATE guest_qr_codes SET status = 'REVOKED' WHERE id = $1 RETURNING id`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// Lấy lịch sử guest QR
const getGuestQrHistory = async (hostUserId, options = {}) => {
  const { page = 1, limit = 10, search = '', result = '', fromDate = null, toDate = null, qrType = '' } = options;
  const offset = (page - 1) * limit;
  let conditions = [`gq.host_user_id = $1`];
  let params = [hostUserId];
  let paramIndex = 2;
  if (search && search.trim()) {
    conditions.push(`(v.name ILIKE $${paramIndex} OR v.phone ILIKE $${paramIndex} OR u.full_name ILIKE $${paramIndex} OR a.apartment_code ILIKE $${paramIndex})`);
    params.push(`%${search.trim()}%`);
    paramIndex++;
  }
  if (result && result.trim()) {
    conditions.push(`al.result = $${paramIndex}`);
    params.push(result.toUpperCase());
    paramIndex++;
  }
  if (qrType === 'guest') { conditions.push(`al.qr_code_id IS NOT NULL`); }
  if (fromDate) { conditions.push(`al.scan_time >= $${paramIndex}`); params.push(fromDate); paramIndex++; }
  if (toDate) { conditions.push(`al.scan_time <= $${paramIndex}`); params.push(toDate); paramIndex++; }
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const dataQuery = `SELECT al.id, al.scan_time, al.result, al.scanned_by, CASE WHEN al.qr_code_id IS NOT NULL THEN 'guest' ELSE 'personal' END AS qr_type, COALESCE(gq.qr_code, pq.qr_code) AS qr_code, v.name AS visitor_name, v.phone AS visitor_phone, a.apartment_code, u.full_name AS creator_name FROM access_logs al LEFT JOIN guest_qr_codes gq ON gq.id = al.qr_code_id LEFT JOIN qr_codes pq ON pq.id = al.personal_qr_code_id LEFT JOIN visitors v ON v.id = gq.visitor_id LEFT JOIN apartments a ON a.id = COALESCE(gq.apartment_id, pq.apartment_id) LEFT JOIN users u ON u.id = COALESCE(gq.host_user_id, pq.user_id) ${whereClause} ORDER BY al.scan_time DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  const dataResult = await pool.query(dataQuery, [...params, limit, offset]);
  const countQuery = `SELECT COUNT(*) as total FROM access_logs al LEFT JOIN guest_qr_codes gq ON gq.id = al.qr_code_id LEFT JOIN qr_codes pq ON pq.id = al.personal_qr_code_id ${whereClause}`;
  const countResult = await pool.query(countQuery, params);
  return { data: dataResult.rows, total: parseInt(countResult.rows[0]?.total || 0), page, limit, totalPages: Math.ceil(parseInt(countResult.rows[0]?.total || 0) / limit) };
};

// Lấy personal QR của cư dân
const getPersonalQrByUserId = async (userId) => {
  const query = `SELECT * FROM qr_codes WHERE user_id = $1 AND status = 'ACTIVE' ORDER BY created_at DESC LIMIT 1`;
  const result = await pool.query(query, [userId]);
  return result.rows[0];
};

// Lấy apartment theo user
const getApartmentByUserId = async (userId) => {
  const query = `SELECT a.* FROM apartments a WHERE a.owner_user_id = $1 UNION SELECT a.* FROM apartments a INNER JOIN resident_profiles rp ON rp.apartment_id = a.id WHERE rp.user_id = $1 AND rp.status = 'ACTIVE' LIMIT 1`;
  const result = await pool.query(query, [userId]);
  return result.rows[0];
};

module.exports = { createGuestQr, getGuestQrsByHost, getGuestQrById, updateGuestQr, deleteGuestQr, getGuestQrHistory, getPersonalQrByUserId, getApartmentByUserId };