// const { pool } = require("../../../configs/database.config");

// // ==================== PERSONAL QR ====================

// const getAllPersonalQrs = async (options = {}) => {
//   const {
//     page = 1,
//     limit = 10,
//     search = '',
//     status = '',
//     hasQrOnly = false
//   } = options;

//   const offset = (page - 1) * limit;
//   let conditions = [`u.role_id = 5`];
//   let params = [];
//   let paramIndex = 1;

//   if (search && search.trim()) {
//     conditions.push(`(u.full_name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex} OR u.phone ILIKE $${paramIndex} OR COALESCE(a.apartment_code, '') ILIKE $${paramIndex})`);
//     params.push(`%${search.trim()}%`);
//     paramIndex++;
//   }

//   if (status && status.trim()) {
//     if (hasQrOnly) {
//       conditions.push(`qc.status = $${paramIndex}`);
//     } else {
//       conditions.push(`(qc.status = $${paramIndex} OR qc.id IS NULL)`);
//     }
//     params.push(status.toUpperCase());
//     paramIndex++;
//   }

//   if (hasQrOnly) {
//     conditions.push(`qc.id IS NOT NULL`);
//   }

//   const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

//   const dataQuery = `
//     SELECT 
//       u.id AS user_id,
//       u.full_name AS user_name,
//       u.email AS user_email,
//       u.phone AS user_phone,
//       COALESCE(a.id, qc.apartment_id) AS apartment_id,
//       COALESCE(a.apartment_code, 'Chưa có căn hộ') AS apartment_code,
//       qc.id AS qr_id,
//       qc.qr_code,
//       qc.expires_at,
//       qc.status AS qr_status,
//       qc.created_at AS qr_created_at
//     FROM users u
//     INNER JOIN roles r ON r.id = u.role_id
//     LEFT JOIN resident_profiles rp ON rp.user_id = u.id AND rp.status = 'ACTIVE'
//     LEFT JOIN apartments a ON a.id = rp.apartment_id
//     LEFT JOIN qr_codes qc ON qc.user_id = u.id
//     ${whereClause}
//     GROUP BY u.id, a.id, a.apartment_code, qc.id, qc.apartment_id
//     ORDER BY u.created_at DESC
//     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
//   `;

//   const dataResult = await pool.query(dataQuery, [...params, limit, offset]);

//   const countQuery = `
//     SELECT COUNT(DISTINCT u.id) as total
//     FROM users u
//     INNER JOIN roles r ON r.id = u.role_id
//     LEFT JOIN resident_profiles rp ON rp.user_id = u.id AND rp.status = 'ACTIVE'
//     LEFT JOIN apartments a ON a.id = rp.apartment_id
//     LEFT JOIN qr_codes qc ON qc.user_id = u.id
//     ${whereClause}
//   `;

//   const countResult = await pool.query(countQuery, params);

//   return {
//     data: dataResult.rows.map(row => ({
//       qr_id: row.qr_id,
//       user_id: row.user_id,
//       apartment_id: row.apartment_id,
//       qr_code: row.qr_code,
//       expires_at: row.expires_at,
//       qr_status: row.qr_status,
//       created_at: row.qr_created_at,
//       user_name: row.user_name,
//       user_email: row.user_email,
//       user_phone: row.user_phone,
//       apartment_code: row.apartment_code
//     })),
//     total: parseInt(countResult.rows[0]?.total || 0),
//     page: page,
//     limit: limit,
//     totalPages: Math.ceil(parseInt(countResult.rows[0]?.total || 0) / limit)
//   };
// };

// // ==================== ACCESS HISTORY ====================

// const getResidentAccessHistory = async (userId, options = {}) => {
//   const {
//     page = 1,
//     limit = 10,
//     search = '',
//     result = '',
//     fromDate = null,
//     toDate = null
//   } = options;

//   const offset = (page - 1) * limit;
//   let conditions = [`qc.user_id = $1`];
//   let params = [userId];
//   let paramIndex = 2;

//   if (search && search.trim()) {
//     conditions.push(`(u.full_name ILIKE $${paramIndex} OR u.phone ILIKE $${paramIndex} OR a.apartment_code ILIKE $${paramIndex})`);
//     params.push(`%${search.trim()}%`);
//     paramIndex++;
//   }

//   if (result && result.trim()) {
//     conditions.push(`al.result = $${paramIndex}`);
//     params.push(result.toUpperCase());
//     paramIndex++;
//   }

//   if (fromDate) {
//     conditions.push(`al.scan_time >= $${paramIndex}`);
//     params.push(fromDate);
//     paramIndex++;
//   }
//   if (toDate) {
//     conditions.push(`al.scan_time <= $${paramIndex}`);
//     params.push(toDate);
//     paramIndex++;
//   }

//   const whereClause = conditions.length > 0 
//     ? `WHERE ${conditions.join(' AND ')}` 
//     : '';

//   const dataQuery = `
//     SELECT 
//       al.id,
//       al.scan_time,
//       al.direction,
//       al.gate,
//       al.result,
//       al.building_id,
//       al.scanned_by,
//       COALESCE(b.name, bb.name) AS building_name,
//       guard.full_name AS scanned_by_name,
//       qc.qr_code,
//       qc.user_id,
//       u.full_name AS resident_name,
//       u.phone AS resident_phone,
//       a.apartment_code
//     FROM access_logs al
//     INNER JOIN qr_codes qc ON qc.id = al.personal_qr_code_id
//     INNER JOIN users u ON u.id = qc.user_id
//     LEFT JOIN buildings b ON b.id = al.building_id
//     LEFT JOIN users guard ON guard.id = al.scanned_by
//     LEFT JOIN apartments a ON a.id = qc.apartment_id
//     LEFT JOIN floors f ON f.id = a.floor_id
//     LEFT JOIN buildings bb ON bb.id = f.building_id
//     ${whereClause}
//     ORDER BY al.scan_time DESC
//     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
//   `;

//   const dataResult = await pool.query(dataQuery, [...params, limit, offset]);

//   let countConditions = [`qc.user_id = $1`];
//   let countParams = [userId];
//   let countParamIndex = 2;

//   if (search && search.trim()) {
//     countConditions.push(`(u.full_name ILIKE $${countParamIndex} OR u.phone ILIKE $${countParamIndex} OR a.apartment_code ILIKE $${countParamIndex})`);
//     countParams.push(`%${search.trim()}%`);
//     countParamIndex++;
//   }

//   if (result && result.trim()) {
//     countConditions.push(`al.result = $${countParamIndex}`);
//     countParams.push(result.toUpperCase());
//     countParamIndex++;
//   }

//   if (fromDate) {
//     countConditions.push(`al.scan_time >= $${countParamIndex}`);
//     countParams.push(fromDate);
//     countParamIndex++;
//   }
//   if (toDate) {
//     countConditions.push(`al.scan_time <= $${countParamIndex}`);
//     countParams.push(toDate);
//     countParamIndex++;
//   }

//   const countWhereClause = countConditions.length > 0 
//     ? `WHERE ${countConditions.join(' AND ')}` 
//     : '';

//   const countQuery = `
//     SELECT COUNT(*) as total
//     FROM access_logs al
//     INNER JOIN qr_codes qc ON qc.id = al.personal_qr_code_id
//     INNER JOIN users u ON u.id = qc.user_id
//     LEFT JOIN apartments a ON a.id = qc.apartment_id
//     ${countWhereClause}
//   `;
  
//   const countResult = await pool.query(countQuery, countParams);

//   return {
//     data: dataResult.rows,
//     total: parseInt(countResult.rows[0]?.total || 0),
//     page: page,
//     limit: limit,
//     totalPages: Math.ceil(parseInt(countResult.rows[0]?.total || 0) / limit)
//   };
// };

// const getAllResidentAccessHistory = async (options = {}) => {
//   const {
//     page = 1,
//     limit = 10,
//     search = '',
//     result = '',
//     fromDate = null,
//     toDate = null
//   } = options;

//   const offset = (page - 1) * limit;
//   let conditions = [`1=1`];
//   let params = [];
//   let paramIndex = 1;

//   if (search && search.trim()) {
//     conditions.push(`(u.full_name ILIKE $${paramIndex} OR a.apartment_code ILIKE $${paramIndex})`);
//     params.push(`%${search.trim()}%`);
//     paramIndex++;
//   }

//   if (result && result.trim()) {
//     conditions.push(`al.result = $${paramIndex}`);
//     params.push(result.toUpperCase());
//     paramIndex++;
//   }

//   if (fromDate && fromDate.trim()) {
//     conditions.push(`DATE(al.scan_time) >= $${paramIndex}`);
//     params.push(fromDate);
//     paramIndex++;
//   }
//   if (toDate && toDate.trim()) {
//     conditions.push(`DATE(al.scan_time) <= $${paramIndex}`);
//     params.push(toDate);
//     paramIndex++;
//   }

//   const whereClause = conditions.length > 0 
//     ? `WHERE ${conditions.join(' AND ')}` 
//     : '';

//   const dataQuery = `
//     SELECT 
//       al.id,
//       al.scan_time,
//       al.direction,
//       al.gate,
//       al.result,
//       u.id AS resident_id,
//       u.full_name AS resident_name,
//       u.email AS resident_email,
//       a.apartment_code,
//       qc.qr_code,
//       scanner.full_name AS scanned_by_name
//     FROM access_logs al
//     LEFT JOIN qr_codes qc ON qc.id = al.personal_qr_code_id
//     LEFT JOIN users u ON u.id = qc.user_id
//     LEFT JOIN apartments a ON a.id = qc.apartment_id
//     LEFT JOIN users scanner ON scanner.id = al.scanned_by
//     ${whereClause}
//     ORDER BY al.scan_time DESC
//     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
//   `;

//   const dataResult = await pool.query(dataQuery, [...params, limit, offset]);

//   const countQuery = `
//     SELECT COUNT(*) as total
//     FROM access_logs al
//     LEFT JOIN qr_codes qc ON qc.id = al.personal_qr_code_id
//     LEFT JOIN users u ON u.id = qc.user_id
//     LEFT JOIN apartments a ON a.id = qc.apartment_id
//     ${whereClause}
//   `;

//   const countResult = await pool.query(countQuery, params);

//   return {
//     data: dataResult.rows,
//     total: parseInt(countResult.rows[0]?.total || 0),
//     page: page,
//     limit: limit,
//     totalPages: Math.ceil(parseInt(countResult.rows[0]?.total || 0) / limit)
//   };
// };

// module.exports = {
//   getAllPersonalQrs,
//   getResidentAccessHistory,
//   getAllResidentAccessHistory
// };

const { pool } = require("../common/base.repository");

// Lấy danh sách personal QR
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

// Tạo personal QR
const createPersonalQr = async (data) => {
  const query = `INSERT INTO qr_codes (user_id, apartment_id, qr_code, expires_at, status) VALUES ($1, $2, $3, $4, 'ACTIVE') RETURNING *`;
  const result = await pool.query(query, [data.userId, data.apartmentId, data.qrCode, data.expiresAt]);
  return result.rows[0];
};

// Cập nhật personal QR
// const updatePersonalQr = async (id, updateData) => {
//   const fields = [];
//   const values = [];
//   let idx = 1;
//   if (updateData.status !== undefined) { fields.push(`status = $${idx++}`); values.push(updateData.status); }
//   if (updateData.expiresAt !== undefined) { fields.push(`expires_at = $${idx++}`); values.push(updateData.expiresAt); }
//   if (updateData.apartmentId !== undefined) { fields.push(`apartment_id = $${idx++}`); values.push(updateData.apartmentId); }
//   if (fields.length === 0) throw new Error("No fields to update");
//   values.push(id);
//   const query = `UPDATE qr_codes SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`;
//   const result = await pool.query(query, values);
//   return result.rows[0];
// };

// Thu hồi personal QR
const revokePersonalQr = async (id) => {
  const query = `UPDATE qr_codes SET status = 'REVOKED' WHERE id = $1 RETURNING *`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// Lấy lịch sử theo cư dân
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

module.exports = { getAllPersonalQrs, createPersonalQr, revokePersonalQr, getResidentAccessHistory, getAllResidentAccessHistory };