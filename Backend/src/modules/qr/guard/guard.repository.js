
const { pool } = require("../common/base.repository");

// Tìm guest QR theo code
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

// Tìm personal QR theo code
const getPersonalQrByCode = async (qrCode) => {
  const query = `
    SELECT 
      qc.*,
      u.full_name AS user_name,
      u.phone AS user_phone,
      u.email AS user_email,
      a.apartment_code,
      a.id AS apartment_id
    FROM qr_codes qc
    LEFT JOIN users u ON u.id = qc.user_id
    LEFT JOIN apartments a ON a.id = qc.apartment_id
    WHERE qc.qr_code = $1 AND qc.status = 'ACTIVE'
  `;
  const result = await pool.query(query, [qrCode]);
  return result.rows[0];
};

// Lấy guest QR theo ID
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

// Tạo access log
const createAccessLog = async (logData) => {
  const query = `
    INSERT INTO access_logs (qr_code_id, personal_qr_code_id, user_id, scanned_by, building_id, direction, gate, scan_time, result)
    VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8)
    RETURNING *
  `;
  const result = await pool.query(query, [
    logData.qr_code_id || null,
    logData.personal_qr_code_id || null,
    logData.user_id || null,
    logData.scanned_by || null,
    logData.building_id || null,
    logData.direction || 'IN',
    logData.gate || null,
    logData.result || 'SUCCESS'
  ]);
  return result.rows[0];
};

// Cập nhật số lần đã dùng
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

// Lấy lịch sử quét của bảo vệ
const getScanHistoryByGuard = async (guardUserId, options = {}) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    result = '',
    fromDate = null,
    toDate = null,
    qrType = ''
  } = options;

  const offset = (page - 1) * limit;
  let conditions = [`al.scanned_by = $1`];
  let params = [guardUserId];
  let paramIndex = 2;

  if (search && search.trim()) {
    conditions.push(`(v.name ILIKE $${paramIndex} OR v.phone ILIKE $${paramIndex} OR u_full.full_name ILIKE $${paramIndex})`);
    params.push(`%${search.trim()}%`);
    paramIndex++;
  }

  if (result && result.trim()) {
    conditions.push(`al.result = $${paramIndex}`);
    params.push(result.toUpperCase());
    paramIndex++;
  }

  if (qrType === 'guest') {
    conditions.push(`al.qr_code_id IS NOT NULL`);
  } else if (qrType === 'personal') {
    conditions.push(`al.personal_qr_code_id IS NOT NULL`);
  }

  if (fromDate) {
    conditions.push(`al.scan_time >= $${paramIndex}`);
    params.push(fromDate);
    paramIndex++;
  }
  if (toDate) {
    conditions.push(`al.scan_time <= $${paramIndex}`);
    params.push(toDate);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const dataQuery = `
    SELECT 
      al.id,
      al.scan_time,
      al.direction,
      al.gate,
      al.result,
      al.scanned_by,
      CASE 
        WHEN al.qr_code_id IS NOT NULL THEN 'guest'
        ELSE 'personal'
      END AS qr_type,
      COALESCE(gq.qr_code, pq.qr_code) AS qr_code,
      gq.valid_from,
      COALESCE(gq.valid_to, pq.expires_at) AS valid_to,
      CASE 
        WHEN al.qr_code_id IS NOT NULL THEN v.name
        ELSE u_full.full_name
      END AS visitor_name,
      CASE 
        WHEN al.qr_code_id IS NOT NULL THEN v.phone
        ELSE u_full.phone
      END AS visitor_phone,
      a.apartment_code,
      CASE 
        WHEN al.qr_code_id IS NOT NULL THEN creator.full_name
        ELSE 'Admin'
      END AS creator_name,
      guard.full_name AS scanned_by_name
    FROM access_logs al
    LEFT JOIN guest_qr_codes gq ON gq.id = al.qr_code_id
    LEFT JOIN qr_codes pq ON pq.id = al.personal_qr_code_id
    LEFT JOIN visitors v ON v.id = gq.visitor_id
    LEFT JOIN apartments a ON a.id = COALESCE(gq.apartment_id, pq.apartment_id)
    LEFT JOIN users u_full ON u_full.id = COALESCE(gq.host_user_id, pq.user_id)
    LEFT JOIN users creator ON creator.id = gq.host_user_id
    LEFT JOIN users guard ON guard.id = al.scanned_by
    ${whereClause}
    ORDER BY al.scan_time DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const dataResult = await pool.query(dataQuery, [...params, limit, offset]);

  const countQuery = `
    SELECT COUNT(*) as total
    FROM access_logs al
    LEFT JOIN guest_qr_codes gq ON gq.id = al.qr_code_id
    LEFT JOIN qr_codes pq ON pq.id = al.personal_qr_code_id
    LEFT JOIN visitors v ON v.id = gq.visitor_id
    LEFT JOIN users u_full ON u_full.id = COALESCE(gq.host_user_id, pq.user_id)
    LEFT JOIN users creator ON creator.id = gq.host_user_id
    LEFT JOIN users guard ON guard.id = al.scanned_by
    LEFT JOIN apartments a ON a.id = COALESCE(gq.apartment_id, pq.apartment_id)
    ${whereClause}
  `;

  const countResult = await pool.query(countQuery, params);

  return {
    data: dataResult.rows,
    size: dataResult.rows.length,
    totalElements: parseInt(countResult.rows[0]?.total || 0),
    totalPages: Math.ceil(parseInt(countResult.rows[0]?.total || 0) / limit),
    page: parseInt(page),
    pageSize: parseInt(limit)
  };
};

// Lấy lịch sử guest QR (cho cư dân)
const getGuestQrHistory = async (hostUserId, options = {}) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    result = '',
    fromDate = null,
    toDate = null,
    qrType = ''
  } = options;

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

  if (qrType === 'guest') {
    conditions.push(`al.qr_code_id IS NOT NULL`);
  } else if (qrType === 'personal') {
    conditions.push(`al.personal_qr_code_id IS NOT NULL`);
  }

  if (fromDate) {
    conditions.push(`al.scan_time >= $${paramIndex}`);
    params.push(fromDate);
    paramIndex++;
  }
  if (toDate) {
    conditions.push(`al.scan_time <= $${paramIndex}`);
    params.push(toDate);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const dataQuery = `
    SELECT 
      al.id,
      al.scan_time,
      al.direction,
      al.gate,
      al.result,
      al.scanned_by,
      CASE 
        WHEN al.qr_code_id IS NOT NULL THEN 'guest'
        ELSE 'personal'
      END AS qr_type,
      COALESCE(gq.qr_code, pq.qr_code) AS qr_code,
      gq.valid_from,
      COALESCE(gq.valid_to, pq.expires_at) AS valid_to,
      v.name AS visitor_name,
      v.phone AS visitor_phone,
      a.apartment_code,
      u.full_name AS creator_name,
      guard.full_name AS scanned_by_name
    FROM access_logs al
    LEFT JOIN guest_qr_codes gq ON gq.id = al.qr_code_id
    LEFT JOIN qr_codes pq ON pq.id = al.personal_qr_code_id
    LEFT JOIN visitors v ON v.id = gq.visitor_id
    LEFT JOIN apartments a ON a.id = COALESCE(gq.apartment_id, pq.apartment_id)
    LEFT JOIN users u ON u.id = COALESCE(gq.host_user_id, pq.user_id)
    LEFT JOIN users guard ON guard.id = al.scanned_by
    ${whereClause}
    ORDER BY al.scan_time DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const dataResult = await pool.query(dataQuery, [...params, limit, offset]);

  let countQuery = `
    SELECT COUNT(*) as total
    FROM access_logs al
    LEFT JOIN guest_qr_codes gq ON gq.id = al.qr_code_id
    LEFT JOIN qr_codes pq ON pq.id = al.personal_qr_code_id
    LEFT JOIN visitors v ON v.id = gq.visitor_id
  `;

  if (search && search.trim()) {
    countQuery += ` LEFT JOIN users u ON u.id = COALESCE(gq.host_user_id, pq.user_id)`;
    countQuery += ` LEFT JOIN apartments a ON a.id = COALESCE(gq.apartment_id, pq.apartment_id)`;
  }

  countQuery += ` ${whereClause}`;
  const countResult = await pool.query(countQuery, params);

  return {
    data: dataResult.rows,
    total: parseInt(countResult.rows[0]?.total || 0),
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(parseInt(countResult.rows[0]?.total || 0) / limit)
  };
};

module.exports = {
  scanQr,
  getPersonalQrByCode,
  getGuestQrById,
  createAccessLog,
  incrementUsedEntries,
  getScanHistoryByGuard,
  getGuestQrHistory
};