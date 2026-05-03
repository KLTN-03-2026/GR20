
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


// ==================== RESIDENT: GUEST QR ====================

// Lấy danh sách guest QR của cư dân (host_user_id = userId)
// const getMyGuestQrs = async (userId, options = {}) => {
//   const {
//     page = 1,
//     limit = 10,
//     search = '',
//     status = ''
//   } = options;

//   const offset = (page - 1) * limit;
//   let conditions = [`gq.host_user_id = $1`];
//   let params = [userId];
//   let paramIndex = 2;

//   if (search && search.trim()) {
//     conditions.push(`(v.name ILIKE $${paramIndex} OR v.phone ILIKE $${paramIndex} OR gq.qr_code ILIKE $${paramIndex})`);
//     params.push(`%${search.trim()}%`);
//     paramIndex++;
//   }

//   if (status && status.trim()) {
//     conditions.push(`gq.status = $${paramIndex}`);
//     params.push(status.toUpperCase());
//     paramIndex++;
//   }

//   const whereClause = `WHERE ${conditions.join(' AND ')}`;

//   const dataQuery = `
//     SELECT 
//       gq.id,
//       gq.qr_code,
//       gq.valid_from,
//       gq.valid_to,
//       gq.max_entries,
//       gq.used_entries,
//       gq.status,
//       gq.created_at,
//       v.name AS visitor_name,
//       v.phone AS visitor_phone,
//       v.id_card AS visitor_id_card,
//       a.apartment_code,
//       CASE 
//         WHEN gq.valid_to < NOW() THEN false
//         WHEN gq.used_entries >= gq.max_entries THEN false
//         ELSE true
//       END AS is_active,
//       CASE 
//         WHEN gq.status = 'REVOKED' THEN false
//         WHEN gq.valid_to < NOW() THEN false
//         ELSE true
//       END AS can_toggle
//     FROM guest_qr_codes gq
//     LEFT JOIN visitors v ON v.id = gq.visitor_id
//     LEFT JOIN apartments a ON a.id = gq.apartment_id
//     ${whereClause}
//     ORDER BY gq.created_at DESC
//     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
//   `;

//   const dataResult = await pool.query(dataQuery, [...params, limit, offset]);

//   const countQuery = `
//     SELECT COUNT(*) as total
//     FROM guest_qr_codes gq
//     LEFT JOIN visitors v ON v.id = gq.visitor_id
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
const getMyGuestQrs = async (userId, options = {}) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    status = ''
  } = options;

  const offset = (page - 1) * limit;
  let conditions = [`gq.host_user_id = $1`];
  let params = [userId];
  let paramIndex = 2;

  // 👉 TẠM THỜI BỎ HẾT FILTER ĐỂ TEST
  // if (search && search.trim()) {
  //   conditions.push(`(v.name ILIKE $${paramIndex} OR v.phone ILIKE $${paramIndex} OR gq.qr_code ILIKE $${paramIndex})`);
  //   params.push(`%${search.trim()}%`);
  //   paramIndex++;
  // }

  // if (status && status.trim()) {
  //   conditions.push(`gq.status = $${paramIndex}`);
  //   params.push(status.toUpperCase());
  //   paramIndex++;
  // }

  // ❌ KHÔNG thêm BẤT KỲ điều kiện lọc nào khác

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  console.log('userId:', userId);  // 👈 Debug: in ra userId
  console.log('params:', params);   // 👈 Debug: in ra params

  const dataQuery = `
    SELECT 
      gq.id,
      gq.qr_code,
      gq.valid_from,
      gq.valid_to,
      gq.max_entries,
      gq.used_entries,
      gq.status,
      gq.created_at,
      v.name AS visitor_name,
      v.phone AS visitor_phone,
      v.id_card AS visitor_id_card,
      a.apartment_code
    FROM guest_qr_codes gq
    LEFT JOIN visitors v ON v.id = gq.visitor_id
    LEFT JOIN apartments a ON a.id = gq.apartment_id
    ${whereClause}
    ORDER BY gq.created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  console.log('SQL Query:', dataQuery);  // 👈 Debug: in ra câu SQL

  const dataResult = await pool.query(dataQuery, [...params, limit, offset]);
  
  console.log('dataResult.rows:', dataResult.rows);  // 👈 Debug: in ra kết quả

  const countQuery = `
    SELECT COUNT(*) as total
    FROM guest_qr_codes gq
    LEFT JOIN visitors v ON v.id = gq.visitor_id
    ${whereClause}
  `;

  const countResult = await pool.query(countQuery, params);
  console.log('countResult:', countResult.rows);  // 👈 Debug

  return {
    data: dataResult.rows,
    total: parseInt(countResult.rows[0]?.total || 0),
    page: page,
    limit: limit,
    totalPages: Math.ceil(parseInt(countResult.rows[0]?.total || 0) / limit)
  };
};

// Lấy chi tiết 1 guest QR (kiểm tra quyền)
const getMyGuestQrById = async (qrId, userId) => {
  const query = `
    SELECT 
      gq.id,
      gq.qr_code,
      gq.valid_from,
      gq.valid_to,
      gq.max_entries,
      gq.used_entries,
      gq.status,
      gq.created_at,
      v.name AS visitor_name,
      v.phone AS visitor_phone,
      v.id_card AS visitor_id_card,
      a.apartment_code,
      (SELECT valid_to FROM guest_qr_codes WHERE id = gq.id) AS original_valid_to,
      CASE 
        WHEN gq.valid_to < NOW() THEN false
        WHEN gq.used_entries >= gq.max_entries THEN false
        ELSE true
      END AS is_active
    FROM guest_qr_codes gq
    LEFT JOIN visitors v ON v.id = gq.visitor_id
    LEFT JOIN apartments a ON a.id = gq.apartment_id
    WHERE gq.id = $1 AND gq.host_user_id = $2
  `;
  const result = await pool.query(query, [qrId, userId]);
  return result.rows[0];
};

// Cập nhật status guest QR (bật/tắt)
// const updateMyGuestQrStatus = async (qrId, userId, status) => {
//   // Kiểm tra quyền trước
//   const checkQuery = `
//     SELECT id, valid_to, status 
//     FROM guest_qr_codes 
//     WHERE id = $1 AND host_user_id = $2
//   `;
//   const checkResult = await pool.query(checkQuery, [qrId, userId]);
  
//   if (checkResult.rows.length === 0) {
//     throw new Error("QR không tồn tại hoặc không thuộc quyền của bạn");
//   }
  
//   const currentQr = checkResult.rows[0];
  
//   // Nếu muốn bật (ACTIVE), kiểm tra thời hạn còn hiệu lực không
//   if (status === 'ACTIVE') {
//     if (new Date(currentQr.valid_to) < new Date()) {
//       throw new Error("QR đã hết hạn, không thể bật lại");
//     }
//   }
  
//   const query = `
//     UPDATE guest_qr_codes 
//     SET status = $1, updated_at = NOW()
//     WHERE id = $2 AND host_user_id = $3
//     RETURNING *
//   `;
//   const result = await pool.query(query, [status, qrId, userId]);
//   return result.rows[0];
// };

const updateMyGuestQrStatus = async (qrId, userId, status) => {
  const checkQuery = `
    SELECT id, valid_to, status 
    FROM guest_qr_codes 
    WHERE id = $1 AND host_user_id = $2
  `;
  const checkResult = await pool.query(checkQuery, [qrId, userId]);
  
  if (checkResult.rows.length === 0) {
    throw new Error("QR không tồn tại hoặc không thuộc quyền của bạn");
  }
  
  const currentQr = checkResult.rows[0];
  
  // Nếu muốn bật (ACTIVE), kiểm tra thời hạn còn hiệu lực không
  if (status === 'ACTIVE') {
    if (new Date(currentQr.valid_to) < new Date()) {
      throw new Error("QR đã hết hạn, không thể bật lại");
    }
  }
  
  // ❌ XÓA updated_at = NOW() vì bảng không có cột này
  const query = `
    UPDATE guest_qr_codes 
    SET status = $1
    WHERE id = $2 AND host_user_id = $3
    RETURNING *
  `;
  const result = await pool.query(query, [status, qrId, userId]);
  return result.rows[0];
};
// Cập nhật thời hạn guest QR (chỉ rút ngắn)
const updateMyGuestQrValidTo = async (
  qrId, 
  userId, 
  newValidTo, 
  maxEntries,
  visitorName, 
  visitorPhone, 
  visitorIdCard
) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 1️⃣ LẤY THÔNG TIN QR
    const checkQuery = `
      SELECT 
        gq.id, 
        gq.valid_to,
        gq.valid_from,
        gq.admin_valid_to_original,
        gq.max_entries, 
        gq.used_entries, 
        gq.status, 
        gq.visitor_id
      FROM guest_qr_codes gq
      WHERE gq.id = $1 AND gq.host_user_id = $2
    `;
    const checkResult = await client.query(checkQuery, [parseInt(qrId), parseInt(userId)]);
    
    if (checkResult.rows.length === 0) {
      throw new Error("QR không tồn tại hoặc không thuộc quyền của bạn");
    }
    
    const currentQr = checkResult.rows[0];
    
    // Kiểm tra admin_valid_to_original
    if (!currentQr.admin_valid_to_original) {
      throw new Error("Lỗi: Không tìm thấy thời hạn gốc. Vui lòng liên hệ admin.");
    }
    
    // Chuyển đổi sang Date object
    const adminValidToOriginal = new Date(currentQr.admin_valid_to_original);
    const newValidToDate = new Date(newValidTo);
    const validFromDate = new Date(currentQr.valid_from);
    
    // Validation 1: Không được vượt quá admin_valid_to_original
    if (newValidToDate.getTime() > adminValidToOriginal.getTime()) {
      throw new Error(
        `Không thể kéo dài quá ${adminValidToOriginal.toISOString().split('T')[0]}. ` +
        `Bạn chỉ có thể cập nhật đến ngày này hoặc sớm hơn.`
      );
    }
    
    // Validation 2: Không được cập nhật về trước ngày bắt đầu
    if (newValidToDate.getTime() < validFromDate.getTime()) {
      throw new Error(
        `Thời hạn không thể sớm hơn ngày bắt đầu (${validFromDate.toISOString().split('T')[0]})`
      );
    }
    
    // Validation 3: QR phải đang hoạt động
    if (currentQr.status !== 'ACTIVE') {
      throw new Error("QR đã bị khóa hoặc không hoạt động");
    }
    
    // 3️⃣ CẬP NHẬP VISITOR INFORMATION
    let finalVisitorId = currentQr.visitor_id;
    
    // 👑 QUAN TRỌNG: Kiểm tra xem có muốn cập nhật visitor hay không
    // Nếu cả 3 trường đều là chuỗi rỗng hoặc undefined -> XÓA visitor
    const shouldClearVisitor = 
      (visitorName === "" || visitorName === null || visitorName === undefined) &&
      (visitorPhone === "" || visitorPhone === null || visitorPhone === undefined) &&
      (visitorIdCard === "" || visitorIdCard === null || visitorIdCard === undefined);
    
    const hasVisitorUpdate = 
      (visitorName && visitorName !== "") ||
      (visitorPhone && visitorPhone !== "") ||
      (visitorIdCard && visitorIdCard !== "");
    
    if (shouldClearVisitor && currentQr.visitor_id) {
      // 🔥 XÓA visitor: set visitor_id = NULL
      finalVisitorId = null;
      console.log('✅ Clear visitor (set to NULL)');
    } 
    else if (hasVisitorUpdate) {
      // 🔥 CÓ thông tin visitor mới
      if (currentQr.visitor_id) {
        // Cập nhật visitor hiện tại
        const updateVisitorQuery = `
          UPDATE visitors 
          SET 
            name = $1,
            phone = $2,
            id_card = $3
          WHERE id = $4
          RETURNING id
        `;
        
        await client.query(updateVisitorQuery, [
          visitorName || null,
          visitorPhone || null,
          visitorIdCard || null,
          currentQr.visitor_id
        ]);
        console.log('✅ Updated existing visitor');
        finalVisitorId = currentQr.visitor_id;
      } 
      else {
        // Tạo mới visitor (chỉ tạo khi có tên)
        if (visitorName && visitorName !== "") {
          const insertVisitorQuery = `
            INSERT INTO visitors (host_user_id, name, phone, id_card, created_at)
            VALUES ($1, $2, $3, $4, NOW())
            RETURNING id
          `;
          const insertResult = await client.query(insertVisitorQuery, [
            parseInt(userId),
            visitorName,
            visitorPhone || null,
            visitorIdCard || null
          ]);
          finalVisitorId = insertResult.rows[0].id;
          console.log('✅ Created new visitor');
        } else {
          // Không có tên thì không tạo visitor
          finalVisitorId = null;
          console.log('⚠️ No visitor name provided, keep visitor NULL');
        }
      }
    }
    
    // 4️⃣ CẬP NHẬP MAX_ENTRIES
    const finalMaxEntries = maxEntries !== undefined && maxEntries !== null 
      ? maxEntries 
      : currentQr.max_entries;
    
    // 5️⃣ CẬP NHẬP GUEST_QR_CODES
    const updateQuery = `
      UPDATE guest_qr_codes 
      SET 
        valid_to = $1,
        max_entries = $2,
        visitor_id = $3
      WHERE id = $4 AND host_user_id = $5
      RETURNING *
    `;
    
    await client.query(updateQuery, [
      newValidTo,
      finalMaxEntries,
      finalVisitorId,
      parseInt(qrId),
      parseInt(userId)
    ]);
    
    console.log('✅ Updated guest_qr_codes table');
    
    // 6️⃣ LẤY THÔNG TIN ĐẦY ĐỦ
    const finalQuery = `
      SELECT 
        gq.id,
        gq.qr_code,
        gq.valid_from,
        gq.valid_to,
        gq.admin_valid_to_original,
        gq.max_entries,
        gq.used_entries,
        gq.status,
        gq.created_at,
        v.name AS visitor_name,
        v.phone AS visitor_phone,
        v.id_card AS visitor_id_card,
        a.apartment_code
      FROM guest_qr_codes gq
      LEFT JOIN visitors v ON v.id = gq.visitor_id
      LEFT JOIN apartments a ON a.id = gq.apartment_id
      WHERE gq.id = $1
    `;
    
    const finalResult = await client.query(finalQuery, [parseInt(qrId)]);
    
    await client.query('COMMIT');
    
    console.log('✅ Transaction committed successfully');
    return finalResult.rows[0];
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Transaction rolled back:', err.message);
    throw err;
  } finally {
    client.release();
  }
};
// Lấy lịch sử quét của guest QR

const getMyGuestQrHistory = async (qrId, userId, options = {}) => {
  const {
    page = 1,
    limit = 10,
    fromDate = null,
    toDate = null
  } = options;

  const parsedQrId = parseInt(qrId);
  const parsedUserId = parseInt(userId);

  // Kiểm tra quyền
  const checkQuery = `
    SELECT id FROM guest_qr_codes 
    WHERE id = $1 AND host_user_id = $2
  `;
  const checkResult = await pool.query(checkQuery, [parsedQrId, parsedUserId]);
  
  if (checkResult.rows.length === 0) {
    throw new Error("QR không tồn tại hoặc không thuộc quyền của bạn");
  }

  const offset = (page - 1) * limit;
  let conditions = [`al.qr_code_id = $1`];
  let params = [parsedQrId];
  let paramIndex = 2;

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

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  const dataQuery = `
    SELECT 
      al.id,
      al.scan_time,
      al.direction,
      al.gate,
      al.result,
      al.scanned_by,
      scanner.full_name AS scanned_by_name,
      b.name AS building_name,
      gq.qr_code,
      gq.valid_from,
      gq.valid_to,
      gq.max_entries,
      gq.used_entries,
      v.name AS visitor_name,
      v.phone AS visitor_phone,
      v.id_card AS visitor_id_card,
      u.full_name AS host_name,
      a.apartment_code
    FROM access_logs al
    INNER JOIN guest_qr_codes gq ON gq.id = al.qr_code_id
    LEFT JOIN visitors v ON v.id = gq.visitor_id
    LEFT JOIN users u ON u.id = gq.host_user_id
    LEFT JOIN apartments a ON a.id = gq.apartment_id
    LEFT JOIN users scanner ON scanner.id = al.scanned_by
    LEFT JOIN buildings b ON b.id = al.building_id
    ${whereClause}
    ORDER BY al.scan_time DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const dataResult = await pool.query(dataQuery, [...params, limit, offset]);

  const countQuery = `
    SELECT COUNT(*) as total
    FROM access_logs al
    ${whereClause}
  `;

  const countResult = await pool.query(countQuery, params);
  const total = parseInt(countResult.rows[0]?.total || 0);

  return {
    data: dataResult.rows,
    total: total,
    page: page,
    limit: limit,
    totalPages: Math.ceil(total / limit),
    size: dataResult.rows.length,
    totalElements: total,
    pageSize: limit
  };
};

const getPersonalQrHistory = async (userId, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  
  try {
    // Lấy personal_qr_code_id của user
    const getPersonalQrQuery = `
      SELECT id FROM qr_codes 
      WHERE user_id = $1 AND status = 'ACTIVE'
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const personalQrResult = await pool.query(getPersonalQrQuery, [userId]);
    
    if (personalQrResult.rows.length === 0) {
      return {
        data: [],
        total: 0,
        page,
        limit,
        totalPages: 0
      };
    }
    
    const personalQrId = personalQrResult.rows[0].id;
    
    // Lấy lịch sử quét từ access_logs (có tên tòa nhà)
    const query = `
      SELECT 
        al.id,
        al.scan_time,
        al.direction,
        al.result,
        al.scanned_by,
        al.building_id,
        u.full_name as scanned_by_name,
        b.name as building_name
      FROM access_logs al
      LEFT JOIN users u ON u.id = al.scanned_by
      LEFT JOIN buildings b ON b.id = al.building_id
      WHERE al.personal_qr_code_id = $1
      ORDER BY al.scan_time DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [personalQrId, limit, offset]);
    
    // Đếm tổng số bản ghi
    const countQuery = `
      SELECT COUNT(*) as total
      FROM access_logs
      WHERE personal_qr_code_id = $1
    `;
    const countResult = await pool.query(countQuery, [personalQrId]);
    const total = parseInt(countResult.rows[0].total);
    
    return {
      data: result.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
    
  } catch (err) {
    console.error('Error in getPersonalQrHistory:', err);
    throw err;
  }
};


module.exports = { createGuestQr, getGuestQrsByHost, getGuestQrById, updateGuestQr, deleteGuestQr, getGuestQrHistory, getPersonalQrByUserId, getApartmentByUserId,

  getMyGuestQrs,
  getMyGuestQrById,
  updateMyGuestQrStatus,
  updateMyGuestQrValidTo,
  getMyGuestQrHistory,
  getPersonalQrHistory
 };