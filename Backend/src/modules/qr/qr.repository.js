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
  console.log('📝 visitor:', visitor);
  console.log('📝 guestQr:', guestQr);
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
// const getGuestQrsByHost = async (hostUserId, options = {}) => {
//   const {
//     limit = 10,
//     offset = 0,
//     onlyValid = false  // false: lấy hết (kể cả expired), true: chỉ lấy còn hiệu lực
//   } = options;

//   let conditions = [`gq.host_user_id = $1`];
//   let params = [hostUserId];
//   let paramIndex = 2;

//   // ✅ Chỉ lọc REVOKED - không hiển thị QR đã bị thu hồi
//   conditions.push(`gq.status != 'REVOKED'`);

//   // Nếu onlyValid = true thì chỉ lấy QR còn hiệu lực (chưa hết hạn)
//   if (onlyValid) {
//     conditions.push(`gq.valid_from <= NOW()`);
//     conditions.push(`gq.valid_to >= NOW()`);
//     conditions.push(`gq.status = 'ACTIVE'`);
//   }

//   const whereClause = conditions.length > 0 
//     ? `WHERE ${conditions.join(' AND ')}` 
//     : '';

//   // Query lấy dữ liệu với phân trang
//   const dataQuery = `
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
//     ${whereClause}
//     ORDER BY gq.created_at DESC
//     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
//   `;

//   const dataResult = await pool.query(dataQuery, [...params, limit, offset]);

//   // Query lấy tổng số
//   const countQuery = `
//     SELECT COUNT(*) as total
//     FROM guest_qr_codes gq
//     ${whereClause}
//   `;
//   const countResult = await pool.query(countQuery, params);

//   return {
//     total: parseInt(countResult.rows[0].total),
//     limit: parseInt(limit),
//     offset: parseInt(offset),
//     data: dataResult.rows
//   };
// };

// const getGuestQrsByHost = async (hostUserId, options = {}) => {
//   const {
//     limit = 10,
//     offset = 0,
//     onlyValid = false,
//     search = ''
//   } = options;

//   let conditions = [`gq.host_user_id = $1`];
//   let params = [hostUserId];
//   let paramIndex = 2;

//   // Chỉ lọc REVOKED - không hiển thị QR đã bị thu hồi
//   conditions.push(`gq.status != 'REVOKED'`);

//   // Nếu onlyValid = true thì chỉ lấy QR còn hiệu lực
//   if (onlyValid) {
//     conditions.push(`gq.valid_from <= NOW()`);
//     conditions.push(`gq.valid_to >= NOW()`);
//     conditions.push(`gq.status = 'ACTIVE'`);
//   }

//   // Tìm kiếm theo tên khách
//   if (search && search.trim()) {
//     conditions.push(`(v.name ILIKE $${paramIndex} OR v.phone ILIKE $${paramIndex})`);
//     params.push(`%${search.trim()}%`);
//     paramIndex++;
//   }

//   const whereClause = conditions.length > 0 
//     ? `WHERE ${conditions.join(' AND ')}` 
//     : '';

//   // Query lấy dữ liệu với phân trang
//   const dataQuery = `
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
//     ${whereClause}
//     ORDER BY gq.created_at DESC
//     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
//   `;

//   const dataResult = await pool.query(dataQuery, [...params, limit, offset]);

//   // Query lấy tổng số
//   const countQuery = `
//     SELECT COUNT(*) as total
//     FROM guest_qr_codes gq
//     LEFT JOIN visitors v ON v.id = gq.visitor_id
//     ${whereClause}
//   `;
//   const countResult = await pool.query(countQuery, params);

//   return {
//     total: parseInt(countResult.rows[0].total),
//     limit: parseInt(limit),
//     offset: parseInt(offset),
//     data: dataResult.rows
//   };
// };


// repositories/qrcode.repository.js
const MAX_SEARCH_LIMIT = 200; // Giới hạn tối đa khi search (nếu muốn giới hạn)

// repositories/qrcode.repository.js
const getGuestQrsByHost = async (hostUserId, options = {}) => {
  const {
    limit = 10,
    offset = 0,
    onlyValid = false,
    search = '',
    validFromDate = null,
    validToDate = null
  } = options;

  let conditions = [`gq.host_user_id = $1`];
  let params = [hostUserId];
  let paramIndex = 2;

  // ❌ BỎ dòng này - không lọc REVOKED nữa, lấy tất cả
  // conditions.push(`gq.status != 'REVOKED'`);

  // Lọc QR còn hiệu lực
  if (onlyValid) {
    conditions.push(`gq.valid_from <= NOW()`);
    conditions.push(`gq.valid_to >= NOW()`);
    conditions.push(`gq.status = 'ACTIVE'`);
  }

  // Lọc theo khoảng thời gian cụ thể
  if (validFromDate) {
    conditions.push(`gq.valid_from >= $${paramIndex}`);
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

// const getGuestQrsByHost = async (hostUserId, options = {}) => {
//   const {
//     limit = 10,
//     offset = 0,
//     onlyValid = false,
//     search = ''
//   } = options;

//   let conditions = [`gq.host_user_id = $1`];
//   let params = [hostUserId];
//   let paramIndex = 2;

//   conditions.push(`gq.status != 'REVOKED'`);

//   if (onlyValid) {
//     conditions.push(`gq.valid_from <= NOW()`);
//     conditions.push(`gq.valid_to >= NOW()`);
//     conditions.push(`gq.status = 'ACTIVE'`);
//   }

//   let isSearching = false;
//   if (search && search.trim()) {
//     isSearching = true;
//     conditions.push(`(v.name ILIKE $${paramIndex} OR v.phone ILIKE $${paramIndex})`);
//     params.push(`%${search.trim()}%`);
//     paramIndex++;
//   }

//   const whereClause = conditions.length > 0 
//     ? `WHERE ${conditions.join(' AND ')}` 
//     : '';

//   // 📌 Tính toán limit thực tế
//   let actualLimit = limit;
//   if (isSearching && (limit <= 0 || limit > MAX_SEARCH_LIMIT)) {
//     actualLimit = MAX_SEARCH_LIMIT;
//   }

//   const dataQuery = `
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
//     ${whereClause}
//     ORDER BY gq.created_at DESC
//     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
//   `;

//   const dataResult = await pool.query(dataQuery, [...params, actualLimit, offset]);

//   const countQuery = `
//     SELECT COUNT(*) as total
//     FROM guest_qr_codes gq
//     LEFT JOIN visitors v ON v.id = gq.visitor_id
//     ${whereClause}
//   `;
//   const countResult = await pool.query(countQuery, params);

//   return {
//     total: parseInt(countResult.rows[0].total),
//     limit: parseInt(actualLimit),
//     offset: parseInt(offset),
//     data: dataResult.rows
//   };
// };

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

// repositories/qrcode.repository.js
// repositories/qrcode.repository.js
// repositories/qrcode.repository.js
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

  // Tìm kiếm
  if (search && search.trim()) {
    conditions.push(`(v.name ILIKE $${paramIndex} 
      OR v.phone ILIKE $${paramIndex} 
      OR u.full_name ILIKE $${paramIndex}
      OR a.apartment_code ILIKE $${paramIndex})`);
    params.push(`%${search.trim()}%`);
    paramIndex++;
  }

  // Lọc kết quả
  if (result && result.trim()) {
    conditions.push(`al.result = $${paramIndex}`);
    params.push(result.toUpperCase());
    paramIndex++;
  }

  // Lọc loại QR
  if (qrType === 'guest') {
    conditions.push(`al.qr_code_id IS NOT NULL`);
  } else if (qrType === 'personal') {
    conditions.push(`al.personal_qr_code_id IS NOT NULL`);
  }

  // Lọc thời gian
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

  const whereClause = conditions.length > 0 
    ? `WHERE ${conditions.join(' AND ')}` 
    : '';

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

  // ✅ SỬA: Count query cần JOIN đầy đủ các bảng
  let countQuery = `
    SELECT COUNT(*) as total
    FROM access_logs al
    LEFT JOIN guest_qr_codes gq ON gq.id = al.qr_code_id
    LEFT JOIN qr_codes pq ON pq.id = al.personal_qr_code_id
    LEFT JOIN visitors v ON v.id = gq.visitor_id
  `;

  // Nếu có search liên quan đến users (u.full_name), cần JOIN users
  if (search && search.trim()) {
    countQuery += ` LEFT JOIN users u ON u.id = COALESCE(gq.host_user_id, pq.user_id)`;
  }
  // Nếu có search liên quan đến apartments (a.apartment_code), cần JOIN apartments
  if (search && search.trim()) {
    countQuery += ` LEFT JOIN apartments a ON a.id = COALESCE(gq.apartment_id, pq.apartment_id)`;
  }

  countQuery += ` ${whereClause}`;

  const countResult = await pool.query(countQuery, params);

  return {
    data: dataResult.rows,
    total: parseInt(countResult.rows[0]?.total || 0),
    page: page,
    limit: limit,
    totalPages: Math.ceil(parseInt(countResult.rows[0]?.total || 0) / limit)
  };
};

const getApartmentByUserId = async (userId) => {
  const query = `
    SELECT a.* 
    FROM apartments a
    WHERE a.owner_user_id = $1
    UNION
    SELECT a.* 
    FROM apartments a
    INNER JOIN resident_profiles rp ON rp.apartment_id = a.id
    WHERE rp.user_id = $1 AND rp.status = 'ACTIVE'
    LIMIT 1
  `;
  const result = await pool.query(query, [userId]);
  return result.rows[0];
};
const getUserById = async (userId) => {
  const query = `SELECT id, username, full_name, email, role_id FROM users WHERE id = $1`;
  const result = await pool.query(query, [userId]);
  return result.rows[0];
};


// repositories/qrcode.repository.js
const getResidentAccessHistory = async (userId, options = {}) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    result = '',
    fromDate = null,
    toDate = null
  } = options;

  const offset = (page - 1) * limit;
  let conditions = [`qc.user_id = $1`];
  let params = [userId];
  let paramIndex = 2;

  if (search && search.trim()) {
    conditions.push(`(u.full_name ILIKE $${paramIndex} OR u.phone ILIKE $${paramIndex} OR a.apartment_code ILIKE $${paramIndex})`);
    params.push(`%${search.trim()}%`);
    paramIndex++;
  }

  if (result && result.trim()) {
    conditions.push(`al.result = $${paramIndex}`);
    params.push(result.toUpperCase());
    paramIndex++;
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

  const whereClause = conditions.length > 0 
    ? `WHERE ${conditions.join(' AND ')}` 
    : '';

  const dataQuery = `
    SELECT 
      al.id,
      al.scan_time,
      al.direction,
      al.gate,
      al.result,
      al.building_id,
      al.scanned_by,
      COALESCE(b.name, bb.name) AS building_name,
      guard.full_name AS scanned_by_name,
      qc.qr_code,
      qc.user_id,
      u.full_name AS resident_name,
      u.phone AS resident_phone,
      a.apartment_code
    FROM access_logs al
    INNER JOIN qr_codes qc ON qc.id = al.personal_qr_code_id
    INNER JOIN users u ON u.id = qc.user_id
    LEFT JOIN buildings b ON b.id = al.building_id
    LEFT JOIN users guard ON guard.id = al.scanned_by
    LEFT JOIN apartments a ON a.id = qc.apartment_id
    LEFT JOIN floors f ON f.id = a.floor_id
    LEFT JOIN buildings bb ON bb.id = f.building_id
    ${whereClause}
    ORDER BY al.scan_time DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const dataResult = await pool.query(dataQuery, [...params, limit, offset]);

  // ✅ SỬA: Tạo countParams riêng, không dùng params.slice
  let countConditions = [`qc.user_id = $1`];
  let countParams = [userId];
  let countParamIndex = 2;

  if (search && search.trim()) {
    countConditions.push(`(u.full_name ILIKE $${countParamIndex} OR u.phone ILIKE $${countParamIndex} OR a.apartment_code ILIKE $${countParamIndex})`);
    countParams.push(`%${search.trim()}%`);
    countParamIndex++;
  }

  if (result && result.trim()) {
    countConditions.push(`al.result = $${countParamIndex}`);
    countParams.push(result.toUpperCase());
    countParamIndex++;
  }

  if (fromDate) {
    countConditions.push(`al.scan_time >= $${countParamIndex}`);
    countParams.push(fromDate);
    countParamIndex++;
  }
  if (toDate) {
    countConditions.push(`al.scan_time <= $${countParamIndex}`);
    countParams.push(toDate);
    countParamIndex++;
  }

  const countWhereClause = countConditions.length > 0 
    ? `WHERE ${countConditions.join(' AND ')}` 
    : '';

  const countQuery = `
    SELECT COUNT(*) as total
    FROM access_logs al
    INNER JOIN qr_codes qc ON qc.id = al.personal_qr_code_id
    INNER JOIN users u ON u.id = qc.user_id
    LEFT JOIN apartments a ON a.id = qc.apartment_id
    ${countWhereClause}
  `;
  
  const countResult = await pool.query(countQuery, countParams);

  return {
    data: dataResult.rows,
    total: parseInt(countResult.rows[0]?.total || 0),
    page: page,
    limit: limit,
    totalPages: Math.ceil(parseInt(countResult.rows[0]?.total || 0) / limit)
  };
};


const getAllPersonalQrs = async (options = {}) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    status = '',
    hasQrOnly = false
  } = options;

  const offset = (page - 1) * limit;
  let conditions = [`u.role_id = 5`]; // role_id của "Người Dùng"
  let params = [];
  let paramIndex = 1;

  if (search && search.trim()) {
    conditions.push(`(u.full_name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex} OR u.phone ILIKE $${paramIndex} OR COALESCE(a.apartment_code, '') ILIKE $${paramIndex})`);
    params.push(`%${search.trim()}%`);
    paramIndex++;
  }

  if (status && status.trim()) {
    if (hasQrOnly) {
      conditions.push(`qc.status = $${paramIndex}`);
    } else {
      conditions.push(`(qc.status = $${paramIndex} OR qc.id IS NULL)`);
    }
    params.push(status.toUpperCase());
    paramIndex++;
  }

  if (hasQrOnly) {
    conditions.push(`qc.id IS NOT NULL`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const dataQuery = `
    SELECT 
      u.id AS user_id,
      u.full_name AS user_name,
      u.email AS user_email,
      u.phone AS user_phone,
      COALESCE(a.id, qc.apartment_id) AS apartment_id,
      COALESCE(a.apartment_code, 'Chưa có căn hộ') AS apartment_code,
      qc.id AS qr_id,
      qc.qr_code,
      qc.expires_at,
      qc.status AS qr_status,
      qc.created_at AS qr_created_at
    FROM users u
    INNER JOIN roles r ON r.id = u.role_id
    LEFT JOIN resident_profiles rp ON rp.user_id = u.id AND rp.status = 'ACTIVE'
    LEFT JOIN apartments a ON a.id = rp.apartment_id
    LEFT JOIN qr_codes qc ON qc.user_id = u.id
    ${whereClause}
    GROUP BY u.id, a.id, a.apartment_code, qc.id, qc.apartment_id
    ORDER BY u.created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const dataResult = await pool.query(dataQuery, [...params, limit, offset]);

  const countQuery = `
    SELECT COUNT(DISTINCT u.id) as total
    FROM users u
    INNER JOIN roles r ON r.id = u.role_id
    LEFT JOIN resident_profiles rp ON rp.user_id = u.id AND rp.status = 'ACTIVE'
    LEFT JOIN apartments a ON a.id = rp.apartment_id
    LEFT JOIN qr_codes qc ON qc.user_id = u.id
    ${whereClause}
  `;

  const countResult = await pool.query(countQuery, params);

  return {
    data: dataResult.rows.map(row => ({
      qr_id: row.qr_id,
      user_id: row.user_id,
      apartment_id: row.apartment_id,
      qr_code: row.qr_code,
      expires_at: row.expires_at,
      qr_status: row.qr_status,
      created_at: row.qr_created_at,
      user_name: row.user_name,
      user_email: row.user_email,
      user_phone: row.user_phone,
      apartment_code: row.apartment_code
    })),
    total: parseInt(countResult.rows[0]?.total || 0),
    page: page,
    limit: limit,
    totalPages: Math.ceil(parseInt(countResult.rows[0]?.total || 0) / limit)
  };
};

// repositories/qr.repository.js
const getAllResidentAccessHistory = async (options = {}) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    result = '',
    fromDate = null,
    toDate = null
  } = options;

  const offset = (page - 1) * limit;
  let conditions = [`1=1`];
  let params = [];
  let paramIndex = 1;

  // Tìm kiếm theo tên hoặc mã căn hộ
  if (search && search.trim()) {
    conditions.push(`(u.full_name ILIKE $${paramIndex} OR a.apartment_code ILIKE $${paramIndex})`);
    params.push(`%${search.trim()}%`);
    paramIndex++;
  }

  // Lọc theo kết quả
  if (result && result.trim()) {
    conditions.push(`al.result = $${paramIndex}`);
    params.push(result.toUpperCase());
    paramIndex++;
  }

  // Lọc theo ngày
  if (fromDate && fromDate.trim()) {
    conditions.push(`DATE(al.scan_time) >= $${paramIndex}`);
    params.push(fromDate);
    paramIndex++;
  }
  if (toDate && toDate.trim()) {
    conditions.push(`DATE(al.scan_time) <= $${paramIndex}`);
    params.push(toDate);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 
    ? `WHERE ${conditions.join(' AND ')}` 
    : '';

  // Query lấy dữ liệu - SỬA: thêm đầy đủ JOIN
  const dataQuery = `
    SELECT 
      al.id,
      al.scan_time,
      al.direction,
      al.gate,
      al.result,
      u.id AS resident_id,
      u.full_name AS resident_name,
      u.email AS resident_email,
      a.apartment_code,
      qc.qr_code,
      scanner.full_name AS scanned_by_name
    FROM access_logs al
    LEFT JOIN qr_codes qc ON qc.id = al.personal_qr_code_id
    LEFT JOIN users u ON u.id = qc.user_id
    LEFT JOIN apartments a ON a.id = qc.apartment_id
    LEFT JOIN users scanner ON scanner.id = al.scanned_by
    ${whereClause}
    ORDER BY al.scan_time DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  console.log('Data Query:', dataQuery);
  console.log('Params:', [...params, limit, offset]);

  const dataResult = await pool.query(dataQuery, [...params, limit, offset]);

  // Query lấy tổng số - SỬA: thêm đầy đủ JOIN
  const countQuery = `
    SELECT COUNT(*) as total
    FROM access_logs al
    LEFT JOIN qr_codes qc ON qc.id = al.personal_qr_code_id
    LEFT JOIN users u ON u.id = qc.user_id
    LEFT JOIN apartments a ON a.id = qc.apartment_id
    ${whereClause}
  `;

  const countResult = await pool.query(countQuery, params);

  return {
    data: dataResult.rows,
    total: parseInt(countResult.rows[0]?.total || 0),
    page: page,
    limit: limit,
    totalPages: Math.ceil(parseInt(countResult.rows[0]?.total || 0) / limit)
  };
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
  incrementUsedEntries,
  getApartmentByUserId,
  getUserById,
 
  getAllResidentAccessHistory,
  getResidentAccessHistory,
  getAllPersonalQrs
};