const { pool } = require("../common/base.repository");
const { buildingIdsFromUser } = require("../../../common/building-scope");

// Lấy danh sách personal QR
// const getAllPersonalQrs = async (options = {}) => {
//   const {
//     page = 1,
//     limit = 10,
//     search = "",
//     status = "",
//     hasQrOnly = false,
//   } = options;

//   const offset = (page - 1) * limit;
//   let conditions = [`u.role_id = 5`]; // role_id của "Người Dùng"
//   let params = [];
//   let paramIndex = 1;

//   if (search && search.trim()) {
//     conditions.push(
//       `(u.full_name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex} OR u.phone ILIKE $${paramIndex} OR COALESCE(a.apartment_code, '') ILIKE $${paramIndex})`,
//     );
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

//   const whereClause =
//     conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

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
//     data: dataResult.rows.map((row) => ({
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
//       apartment_code: row.apartment_code,
//     })),
//     total: parseInt(countResult.rows[0]?.total || 0),
//     page: page,
//     limit: limit,
//     totalPages: Math.ceil(parseInt(countResult.rows[0]?.total || 0) / limit),
//   };
// };
// Trong admin.repository.js - getAllPersonalQrs
const getAllPersonalQrs = async (options = {}, currentUser = null) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    status = "",
    hasQrOnly = false,
  } = options;

  const offset = (page - 1) * limit;
  let conditions = [`u.role_id = 5`];
  let params = [];
  let paramIndex = 1;

  // 1. SEARCH
  if (search?.trim()) {
    conditions.push(`
      (u.full_name ILIKE $${paramIndex}
      OR u.email ILIKE $${paramIndex}
      OR u.phone ILIKE $${paramIndex}
      OR COALESCE(a.apartment_code,'') ILIKE $${paramIndex})
    `);
    params.push(`%${search.trim()}%`);
    paramIndex++;
  }

  // 2. STATUS
  if (status?.trim()) {
    if (hasQrOnly) {
      conditions.push(`qc.status = $${paramIndex}`);
    } else {
      conditions.push(`(qc.status = $${paramIndex} OR qc.id IS NULL)`);
    }
    params.push(status.toUpperCase());
    paramIndex++;
  }

  // 3. HAS QR ONLY
  if (hasQrOnly) {
    conditions.push(`qc.id IS NOT NULL`);
  }

  // 4. BUILDING SCOPE 🔥 (BẠN MUỐN BỎ VÀO ĐÂY)
  const qBuildingId =
    options.buildingId != null && options.buildingId !== ""
      ? Number(options.buildingId)
      : null;

  const scope = currentUser ? buildingIdsFromUser(currentUser) : null;

  if (scope === null) {
    // ADMIN → nếu có query thì filter theo query
    if (qBuildingId != null && !Number.isNaN(qBuildingId)) {
      conditions.push(`a.building_id = $${paramIndex}`);
      params.push(qBuildingId);
      paramIndex++;
    }
  } else {
    // USER / MANAGER
    if (scope.length === 0) {
      return {
        data: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    if (qBuildingId != null && !Number.isNaN(qBuildingId)) {
      if (scope.includes(qBuildingId)) {
        conditions.push(`a.building_id = $${paramIndex}`);
        params.push(qBuildingId);
        paramIndex++;
      } else {
        return {
          data: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
        };
      }
    } else {
      conditions.push(`a.building_id = ANY($${paramIndex})`);
      params.push(scope);
      paramIndex++;
    }
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`;

  // 5. DATA QUERY
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
      qc.created_at AS qr_created_at,
      qc.pin_code  -- 👈 Thêm pin_code
    FROM users u
    INNER JOIN roles r ON r.id = u.role_id
    LEFT JOIN resident_profiles rp ON rp.user_id = u.id AND rp.status = 'ACTIVE'
    LEFT JOIN apartments a ON a.id = rp.apartment_id
    LEFT JOIN qr_codes qc ON qc.user_id = u.id
    ${whereClause}
    GROUP BY u.id, a.id, a.apartment_code, qc.id, qc.apartment_id, qc.pin_code
    ORDER BY u.created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const dataResult = await pool.query(dataQuery, [...params, limit, offset]);

  // 6. COUNT QUERY
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

  const total = parseInt(countResult.rows[0]?.total || 0);

  return {
    data: dataResult.rows.map((row) => ({
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
      apartment_code: row.apartment_code,
      pin_code: row.pin_code, // 👈 Thêm pin_code vào response
    })),
    total: parseInt(countResult.rows[0]?.total || 0),
    page: page,
    limit: limit,
    totalPages: Math.ceil(parseInt(countResult.rows[0]?.total || 0) / limit),
  };
};

// Tạo personal QR
const createPersonalQr = async (data) => {
  const query = `INSERT INTO qr_codes (user_id, apartment_id, qr_code, expires_at, status) VALUES ($1, $2, $3, $4, 'ACTIVE') RETURNING *`;
  const result = await pool.query(query, [
    data.userId,
    data.apartmentId,
    data.qrCode,
    data.expiresAt,
  ]);
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
    search = "",
    result = "",
    fromDate = null,
    toDate = null,
  } = options;

  const offset = (page - 1) * limit;
  let conditions = [`qc.user_id = $1`];
  let params = [userId];
  let paramIndex = 2;

  if (search && search.trim()) {
    conditions.push(
      `(u.full_name ILIKE $${paramIndex} OR u.phone ILIKE $${paramIndex} OR a.apartment_code ILIKE $${paramIndex})`,
    );
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

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

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
    countConditions.push(
      `(u.full_name ILIKE $${countParamIndex} OR u.phone ILIKE $${countParamIndex} OR a.apartment_code ILIKE $${countParamIndex})`,
    );
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

  const countWhereClause =
    countConditions.length > 0 ? `WHERE ${countConditions.join(" AND ")}` : "";

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
    totalPages: Math.ceil(parseInt(countResult.rows[0]?.total || 0) / limit),
  };
};

const getAllResidentAccessHistory = async (options = {}) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    result = "",
    fromDate = null,
    toDate = null,
  } = options;

  const offset = (page - 1) * limit;
  let conditions = [`1=1`];
  let params = [];
  let paramIndex = 1;

  // Tìm kiếm theo tên hoặc mã căn hộ
  if (search && search.trim()) {
    conditions.push(`(
      -- Tìm theo tên cư dân (personal)
      u.full_name ILIKE $${paramIndex} OR
      -- Tìm theo tên chủ nhà (guest)
      host.full_name ILIKE $${paramIndex} OR
      -- Tìm theo tên khách (guest từ snapshot)
      al.snapshot_visitor_name ILIKE $${paramIndex} OR
      -- Tìm theo mã căn hộ
      a_personal.apartment_code ILIKE $${paramIndex} OR
      a_guest.apartment_code ILIKE $${paramIndex}
    )`);
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

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const dataQuery = `
    SELECT 
      al.id,
      al.scan_time,
      al.direction,
      al.gate,
      al.result,
      al.scanned_by,
      scanner.full_name AS scanned_by_name,
      
      -- Personal QR fields
      qc.user_id AS personal_user_id,
      u.full_name AS resident_name,
      u.email AS resident_email,
      a_personal.apartment_code AS personal_apartment_code,
      qc.qr_code AS personal_qr_code,
      
      -- Guest QR fields - DÙNG SNAPSHOT
      gq.id AS guest_qr_id,
      gq.host_user_id,
      host.full_name AS host_name,
      -- ✅ LẤY TỪ SNAPSHOT
      al.snapshot_visitor_name AS visitor_name,
      al.snapshot_visitor_phone AS visitor_phone,
      v.id_card AS visitor_id_card,
      gq.qr_code AS guest_qr_code,
      a_guest.apartment_code AS guest_apartment_code,
      
      -- Xác định loại QR
      CASE 
        WHEN al.personal_qr_code_id IS NOT NULL THEN 'personal'
        WHEN al.qr_code_id IS NOT NULL THEN 'guest'
        ELSE 'unknown'
      END AS qr_type
      
    FROM access_logs al
    LEFT JOIN users scanner ON scanner.id = al.scanned_by
    
    -- JOIN với personal QR
    LEFT JOIN qr_codes qc ON qc.id = al.personal_qr_code_id
    LEFT JOIN users u ON u.id = qc.user_id
    LEFT JOIN apartments a_personal ON a_personal.id = qc.apartment_id
    
    -- JOIN với guest QR
    LEFT JOIN guest_qr_codes gq ON gq.id = al.qr_code_id
    LEFT JOIN users host ON host.id = gq.host_user_id
    LEFT JOIN visitors v ON v.id = gq.visitor_id
    LEFT JOIN apartments a_guest ON a_guest.id = gq.apartment_id
    
    ${whereClause}
    ORDER BY al.scan_time DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const dataResult = await pool.query(dataQuery, [...params, limit, offset]);

  // Format lại data để trả về đồng nhất
  const formattedData = dataResult.rows.map((row) => {
    if (row.qr_type === "personal") {
      return {
        id: row.id,
        scan_time: row.scan_time,
        direction: row.direction,
        gate: row.gate,
        result: row.result,
        resident_id: row.personal_user_id,
        resident_name: row.resident_name,
        resident_email: row.resident_email,
        apartment_code: row.personal_apartment_code,
        qr_code: row.personal_qr_code,
        scanned_by_name: row.scanned_by_name,
        qr_type: "personal",
        // Thêm các field cho đồng nhất
        visitor_name: null,
        visitor_phone: null,
        host_name: null,
      };
    } else if (row.qr_type === "guest") {
      return {
        id: row.id,
        scan_time: row.scan_time,
        direction: row.direction,
        gate: row.gate,
        result: row.result,
        resident_id: row.host_user_id,
        resident_name: row.host_name, // chủ nhà
        resident_email: null,
        apartment_code: row.guest_apartment_code,
        qr_code: row.guest_qr_code,
        scanned_by_name: row.scanned_by_name,
        qr_type: "guest",
        // ✅ THÔNG TIN KHÁCH TỪ SNAPSHOT
        visitor_name: row.visitor_name,
        visitor_phone: row.visitor_phone,
        visitor_id_card: row.visitor_id_card,
        host_name: row.host_name,
      };
    }
    return row;
  });

  // Query lấy tổng số
  const countQuery = `
    SELECT COUNT(*) as total
    FROM access_logs al
    ${whereClause}
  `;

  const countResult = await pool.query(countQuery, params);

  return {
    data: formattedData,
    total: parseInt(countResult.rows[0]?.total || 0),
    page: page,
    limit: limit,
    totalPages: Math.ceil(parseInt(countResult.rows[0]?.total || 0) / limit),
  };
};

// const createGuestQr = async (data) => {
//   const client = await pool.connect();
//   try {
//     await client.query("BEGIN");

//     let visitorId = data.visitorId;

//     // Nếu chưa có visitor_id và có thông tin khách, tạo mới visitor
//     if (!visitorId && data.visitorName) {
//       const visitorQuery = `
//         INSERT INTO visitors (host_user_id, name, phone, id_card)
//         VALUES ($1, $2, $3, $4)
//         RETURNING id
//       `;
//       const visitorResult = await client.query(visitorQuery, [
//         data.hostUserId,
//         data.visitorName,
//         data.visitorPhone || null,
//         data.visitorIdCard || null,
//       ]);
//       visitorId = visitorResult.rows[0].id;
//     }

//     const query = `
//       INSERT INTO guest_qr_codes (
//         host_user_id,
//         apartment_id,
//         qr_code,
//         valid_from,
//         valid_to,
//         max_entries,
//         used_entries,
//         status,
//         visitor_id,
//         admin_valid_to_original  -- 👈 Thêm cột này
//       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
//       RETURNING *
//     `;

//     const result = await client.query(query, [
//       data.hostUserId,
//       data.apartmentId,
//       data.qrCode,
//       data.validFrom || new Date(),
//       data.validTo,
//       data.maxEntries || 1,
//       0,
//       data.status || "ACTIVE",
//       visitorId,
//       data.adminValidToOriginal, // 👈 Giá trị original từ admin
//     ]);

//     await client.query("COMMIT");
//     return result.rows[0];
//   } catch (err) {
//     await client.query("ROLLBACK");
//     throw err;
//   } finally {
//     client.release();
//   }
// };
const createGuestQr = async (data) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    let visitorId = data.visitorId;

    // Nếu chưa có visitor_id và có thông tin khách, tạo mới visitor
    if (!visitorId && data.visitorName) {
      const visitorQuery = `
        INSERT INTO visitors (host_user_id, name, phone, id_card)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `;
      const visitorResult = await client.query(visitorQuery, [
        data.hostUserId,
        data.visitorName,
        data.visitorPhone || null,
        data.visitorIdCard || null,
      ]);
      visitorId = visitorResult.rows[0].id;
    }

    const query = `
      INSERT INTO guest_qr_codes (
        host_user_id, 
        apartment_id, 
        qr_code, 
        valid_from, 
        valid_to, 
        max_entries, 
        used_entries, 
        status,
        visitor_id,
        admin_valid_to_original,
        pin_code,
        pin_failed_count,
        pin_locked
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;

    const result = await client.query(query, [
      data.hostUserId,
      data.apartmentId,
      data.qrCode,
      data.validFrom || new Date(),
      data.validTo,
      data.maxEntries || 1,
      0,
      data.status || "ACTIVE",
      visitorId,
      data.adminValidToOriginal,
      data.pinCode || null, // 👈 Thêm PIN
      0, // pin_failed_count
      false, // pin_locked
    ]);

    await client.query("COMMIT");
    return result.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const updateGuestQrValidity = async (id, newValidTo, userId, userRole) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Lấy thông tin QR hiện tại
    const qr = await getGuestQrById(id);

    // Kiểm tra quyền
    if (userRole !== "ADMIN" && qr.host_user_id !== userId) {
      throw new Error("Unauthorized to update this QR");
    }

    // Nếu là user (resident), kiểm tra không được vượt quá original date
    if (userRole !== "ADMIN" && newValidTo > qr.admin_valid_to_original) {
      throw new Error(
        `Cannot extend beyond original expiry date: ${qr.admin_valid_to_original}`,
      );
    }

    // Cập nhật
    const updateQuery = `
      UPDATE guest_qr_codes 
      SET valid_to = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    const result = await client.query(updateQuery, [newValidTo, id]);

    await client.query("COMMIT");
    return result.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// Lấy guest QR theo ID
const getGuestQrById = async (id) => {
  const query = `
    SELECT 
      gq.*,
      u.full_name AS host_name,
      a.apartment_code,
      v.name AS visitor_name,
      v.phone AS visitor_phone,
      v.id_card AS visitor_id_card
    FROM guest_qr_codes gq
    LEFT JOIN users u ON u.id = gq.host_user_id
    LEFT JOIN apartments a ON a.id = gq.apartment_id
    LEFT JOIN visitors v ON v.id = gq.visitor_id
    WHERE gq.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// Trong admin.repository.js - updateGuestQr
const updateGuestQr = async (id, updateData) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const currentQr = await client.query(
      `SELECT * FROM guest_qr_codes WHERE id = $1`,
      [id],
    );

    if (currentQr.rows.length === 0) {
      throw new Error("Guest QR not found");
    }

    const visitorId = currentQr.rows[0].visitor_id;

    // Cập nhật thông tin khách trong bảng visitors
    if (
      visitorId &&
      (updateData.visitorName ||
        updateData.visitorPhone ||
        updateData.visitorIdCard)
    ) {
      const visitorFields = [];
      const visitorValues = [];
      let visitorIdx = 1;

      if (updateData.visitorName !== undefined) {
        visitorFields.push(`name = $${visitorIdx++}`);
        visitorValues.push(updateData.visitorName);
      }
      if (updateData.visitorPhone !== undefined) {
        visitorFields.push(`phone = $${visitorIdx++}`);
        visitorValues.push(updateData.visitorPhone);
      }
      if (updateData.visitorIdCard !== undefined) {
        visitorFields.push(`id_card = $${visitorIdx++}`);
        visitorValues.push(updateData.visitorIdCard);
      }

      if (visitorFields.length > 0) {
        visitorValues.push(visitorId);
        const visitorQuery = `
          UPDATE visitors 
          SET ${visitorFields.join(", ")} 
          WHERE id = $${visitorIdx}
        `;
        await client.query(visitorQuery, visitorValues);
      }
    }

    // Cập nhật thông tin guest_qr_codes
    const qrFields = [];
    const qrValues = [];
    let qrIdx = 1;

    if (updateData.validFrom !== undefined) {
      qrFields.push(`valid_from = $${qrIdx++}`);
      qrValues.push(updateData.validFrom);
    }

    if (updateData.validTo !== undefined) {
      qrFields.push(`valid_to = $${qrIdx++}`);
      qrValues.push(updateData.validTo);
      qrFields.push(`admin_valid_to_original = $${qrIdx++}`);
      qrValues.push(updateData.validTo);
    }

    if (updateData.maxEntries !== undefined) {
      qrFields.push(`max_entries = $${qrIdx++}`);
      qrValues.push(updateData.maxEntries);
    }
    if (updateData.status !== undefined) {
      qrFields.push(`status = $${qrIdx++}`);
      qrValues.push(updateData.status);
    }
    if (updateData.apartmentId !== undefined) {
      qrFields.push(`apartment_id = $${qrIdx++}`);
      qrValues.push(updateData.apartmentId);
    }
    if (updateData.hostUserId !== undefined) {
      qrFields.push(`host_user_id = $${qrIdx++}`);
      qrValues.push(updateData.hostUserId);
    }

    // 👈 Thêm cập nhật pin_code
    if (updateData.pin_code !== undefined) {
      qrFields.push(`pin_code = $${qrIdx++}`);
      qrValues.push(updateData.pin_code);
    }

    if (qrFields.length === 0) {
      throw new Error("No fields to update");
    }

    qrValues.push(id);
    const qrQuery = `
      UPDATE guest_qr_codes 
      SET ${qrFields.join(", ")} 
      WHERE id = $${qrIdx}
      RETURNING *
    `;

    const result = await client.query(qrQuery, qrValues);

    await client.query("COMMIT");

    const finalData = await getGuestQrById(id);
    return finalData;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// const updateGuestQr = async (id, updateData) => {
//   const client = await pool.connect();
//   try {
//     await client.query("BEGIN");

//     // 1. Lấy guest QR hiện tại
//     const currentQr = await client.query(
//       `SELECT * FROM guest_qr_codes WHERE id = $1`,
//       [id],
//     );

//     if (currentQr.rows.length === 0) {
//       throw new Error("Guest QR not found");
//     }

//     const visitorId = currentQr.rows[0].visitor_id;

//     // 2. Cập nhật thông tin khách trong bảng visitors
//     if (
//       visitorId &&
//       (updateData.visitorName ||
//         updateData.visitorPhone ||
//         updateData.visitorIdCard)
//     ) {
//       const visitorFields = [];
//       const visitorValues = [];
//       let visitorIdx = 1;

//       if (updateData.visitorName !== undefined) {
//         visitorFields.push(`name = $${visitorIdx++}`);
//         visitorValues.push(updateData.visitorName);
//       }
//       if (updateData.visitorPhone !== undefined) {
//         visitorFields.push(`phone = $${visitorIdx++}`);
//         visitorValues.push(updateData.visitorPhone);
//       }
//       if (updateData.visitorIdCard !== undefined) {
//         visitorFields.push(`id_card = $${visitorIdx++}`);
//         visitorValues.push(updateData.visitorIdCard);
//       }

//       if (visitorFields.length > 0) {
//         visitorValues.push(visitorId);
//         const visitorQuery = `
//           UPDATE visitors
//           SET ${visitorFields.join(", ")}
//           WHERE id = $${visitorIdx}
//         `;
//         await client.query(visitorQuery, visitorValues);
//       }
//     }

//     // 3. Cập nhật thông tin guest_qr_codes
//     const qrFields = [];
//     const qrValues = [];
//     let qrIdx = 1;

//     if (updateData.validFrom !== undefined) {
//       qrFields.push(`valid_from = $${qrIdx++}`);
//       qrValues.push(updateData.validFrom);
//     }

//     // 👑 QUAN TRỌNG: Nếu có validTo thì tự động cập nhật luôn admin_valid_to_original
//     if (updateData.validTo !== undefined) {
//       qrFields.push(`valid_to = $${qrIdx++}`);
//       qrValues.push(updateData.validTo);

//       // 🔥 TỰ ĐỘNG cập nhật admin_valid_to_original bằng valid_to mới
//       qrFields.push(`admin_valid_to_original = $${qrIdx++}`);
//       qrValues.push(updateData.validTo);
//     }

//     if (updateData.maxEntries !== undefined) {
//       qrFields.push(`max_entries = $${qrIdx++}`);
//       qrValues.push(updateData.maxEntries);
//     }
//     if (updateData.status !== undefined) {
//       qrFields.push(`status = $${qrIdx++}`);
//       qrValues.push(updateData.status);
//     }
//     if (updateData.apartmentId !== undefined) {
//       qrFields.push(`apartment_id = $${qrIdx++}`);
//       qrValues.push(updateData.apartmentId);
//     }
//     if (updateData.hostUserId !== undefined) {
//       qrFields.push(`host_user_id = $${qrIdx++}`);
//       qrValues.push(updateData.hostUserId);
//     }

//     if (qrFields.length === 0) {
//       throw new Error("No fields to update");
//     }

//     qrValues.push(id);
//     const qrQuery = `
//       UPDATE guest_qr_codes
//       SET ${qrFields.join(", ")}
//       WHERE id = $${qrIdx}
//       RETURNING *
//     `;

//     const result = await client.query(qrQuery, qrValues);

//     await client.query("COMMIT");

//     // Lấy lại thông tin đầy đủ
//     const finalData = await getGuestQrById(id);
//     return finalData;
//   } catch (err) {
//     await client.query("ROLLBACK");
//     throw err;
//   } finally {
//     client.release();
//   }
// };

// Xóa (soft delete) guest QR - chuyển status thành REVOKED
const deleteGuestQr = async (id) => {
  const query = `
    UPDATE guest_qr_codes 
    SET status = 'REVOKED' 
    WHERE id = $1 
    RETURNING *
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// Tạo QR code image
const generateQrCodeImage = async (qrCodeValue) => {
  try {
    const qrImage = await QRCode.toDataURL(qrCodeValue);
    return qrImage;
  } catch (err) {
    console.error("Error generating QR code:", err);
    return null;
  }
};

// const getGuestQrHistory = async (guestQrId, options = {}) => {
//   const {
//     page = 1,
//     limit = 10,
//     fromDate = null,
//     toDate = null,
//     search = "",
//   } = options;

//   const offset = (page - 1) * limit;
//   let conditions = [`al.qr_code_id = $1`];
//   let params = [guestQrId];
//   let paramIndex = 2;

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
//   if (search && search.trim()) {
//     conditions.push(`(
//     v.name ILIKE $${paramIndex} OR
//     v.phone ILIKE $${paramIndex} OR
//     v.id_card ILIKE $${paramIndex} OR
//     scanner.full_name ILIKE $${paramIndex} OR
//     al.gate ILIKE $${paramIndex} OR
//     al.result ILIKE $${paramIndex}
//   )`);
//     params.push(`%${search.trim()}%`);
//     paramIndex++;
//   }

//   const whereClause =
//     conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

//   const dataQuery = `
//     SELECT
//       al.id,
//       al.scan_time,
//       al.direction,
//       al.gate,
//       al.result,
//       al.scanned_by,
//       al.building_id,
//       scanner.full_name AS scanned_by_name,
//       b.name AS building_name,
//       gq.qr_code,
//       v.name AS visitor_name,
//       v.phone AS visitor_phone,
//       v.id_card AS visitor_id_card,
//       gq.host_user_id,
//       u.full_name AS host_name,
//       a.apartment_code
//     FROM access_logs al
//     INNER JOIN guest_qr_codes gq ON gq.id = al.qr_code_id
//     LEFT JOIN visitors v ON v.id = gq.visitor_id
//     LEFT JOIN users scanner ON scanner.id = al.scanned_by
//     LEFT JOIN users u ON u.id = gq.host_user_id
//     LEFT JOIN apartments a ON a.id = gq.apartment_id
//     LEFT JOIN buildings b ON b.id = al.building_id
//     ${whereClause}
//     ORDER BY al.scan_time DESC
//     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
//   `;

//   const dataResult = await pool.query(dataQuery, [...params, limit, offset]);

//   const countQuery = `
//     SELECT COUNT(*) as total
//     FROM access_logs al
//     INNER JOIN guest_qr_codes gq ON gq.id = al.qr_code_id
//     ${whereClause}
//   `;

//   const countResult = await pool.query(countQuery, params);
//   const total = parseInt(countResult.rows[0]?.total || 0);

//   return {
//     data: dataResult.rows,
//     total: total,
//     page: page,
//     limit: limit,
//     totalPages: Math.ceil(total / limit),
//     size: dataResult.rows.length,
//     totalElements: total,
//     pageSize: limit,
//   };
// };

// Lấy danh sách cư dân (chưa có hoặc đã có QR khách - tất cả cư dân)

// Lấy danh sách guest QR (chỉ lọc theo search và status)

const getGuestQrHistory = async (guestQrId, options = {}) => {
  const { page = 1, limit = 10, fromDate = null, toDate = null } = options;

  const offset = (page - 1) * limit;
  let conditions = [`al.qr_code_id = $1`];
  let params = [guestQrId];
  let paramIndex = 2;

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

  const whereClause = `WHERE ${conditions.join(" AND ")}`;

  // 👉 ĐÃ SỬA: Thêm visitor_id_card và building_name
  const dataQuery = `
    SELECT 
      al.id,
      al.scan_time,
      al.direction,
      al.gate,
      al.result,
      al.scanned_by,
      al.snapshot_visitor_name AS visitor_name,
      al.snapshot_visitor_phone AS visitor_phone,
      v.id_card AS visitor_id_card,
      gq.qr_code,
      gq.valid_from,
      gq.valid_to,
      gq.max_entries,
      gq.used_entries,
      a.apartment_code,
      b.name AS building_name,
      u.full_name AS host_name,
      guard.full_name AS scanned_by_name
    FROM access_logs al
    LEFT JOIN guest_qr_codes gq ON gq.id = al.qr_code_id
    LEFT JOIN apartments a ON a.id = gq.apartment_id
    LEFT JOIN buildings b ON b.id = a.building_id
    LEFT JOIN visitors v ON v.id = gq.visitor_id
    LEFT JOIN users u ON u.id = gq.host_user_id
    LEFT JOIN users guard ON guard.id = al.scanned_by
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

  return {
    data: dataResult.rows,
    size: dataResult.rows.length,
    totalElements: parseInt(countResult.rows[0]?.total || 0),
    totalPages: Math.ceil(parseInt(countResult.rows[0]?.total || 0) / limit),
    page: parseInt(page),
    pageSize: parseInt(limit),
  };
};

const getAllGuestQrs = async (options = {}) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    status = "",
    // ❌ XÓA apartmentId
  } = options;

  const offset = (page - 1) * limit;
  let conditions = [`1=1`];
  let params = [];
  let paramIndex = 1;

  // Tìm kiếm theo tên cư dân, căn hộ, tên khách
  if (search && search.trim()) {
    conditions.push(
      `(v.name ILIKE $${paramIndex} OR a.apartment_code ILIKE $${paramIndex} OR u.full_name ILIKE $${paramIndex})`,
    );
    params.push(`%${search.trim()}%`);
    paramIndex++;
  }

  // ✅ Lọc theo trạng thái (ACTIVE, EXPIRED, REVOKED)
  if (status && status.trim()) {
    conditions.push(`gq.status = $${paramIndex}`);
    params.push(status.toUpperCase());
    paramIndex++;
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const dataQuery = `
    SELECT 
      gq.id,
      gq.host_user_id,
      gq.apartment_id,
      gq.qr_code,
      gq.valid_from,
      gq.valid_to,
      gq.max_entries,
      gq.used_entries,
      gq.status,
      gq.created_at,
      gq.visitor_id,
      u.full_name AS host_name,
      u.email AS host_email,
      u.phone AS host_phone,
      a.apartment_code,
      v.name AS visitor_name,
      v.phone AS visitor_phone,
      v.id_card AS visitor_id_card
    FROM guest_qr_codes gq
    LEFT JOIN users u ON u.id = gq.host_user_id
    LEFT JOIN apartments a ON a.id = gq.apartment_id
    LEFT JOIN visitors v ON v.id = gq.visitor_id
    ${whereClause}
    ORDER BY gq.created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const dataResult = await pool.query(dataQuery, [...params, limit, offset]);

  const countQuery = `
    SELECT COUNT(*) as total
    FROM guest_qr_codes gq
    LEFT JOIN users u ON u.id = gq.host_user_id
    LEFT JOIN apartments a ON a.id = gq.apartment_id
    LEFT JOIN visitors v ON v.id = gq.visitor_id
    ${whereClause}
  `;

  const countResult = await pool.query(countQuery, params);

  return {
    data: dataResult.rows,
    total: parseInt(countResult.rows[0]?.total || 0),
    page: page,
    limit: limit,
    totalPages: Math.ceil(parseInt(countResult.rows[0]?.total || 0) / limit),
  };
};

// Lấy danh sách cư dân (chưa có hoặc đã có QR khách - tất cả cư dân)

const getAllResidents = async (options = {}) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    apartmentId = "",
    hasQrOnly = false,
    noQrOnly = false,
  } = options;

  const offset = (page - 1) * limit;
  let conditions = [`u.role_id = 5 AND u.is_active = true`];
  let params = [];
  let paramIndex = 1;
  if (search && search.trim()) {
    conditions.push(
      `(u.full_name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex} OR u.phone ILIKE $${paramIndex})`,
    );
    params.push(`%${search.trim()}%`);
    paramIndex++;
  }

  if (apartmentId && apartmentId.trim()) {
    conditions.push(`a.apartment_code ILIKE $${paramIndex}`);
    params.push(`%${apartmentId.trim()}%`);
    paramIndex++;
  }

  if (hasQrOnly) {
    conditions.push(
      `EXISTS (SELECT 1 FROM guest_qr_codes gq WHERE gq.host_user_id = u.id)`,
    );
  }

  if (noQrOnly) {
    conditions.push(
      `NOT EXISTS (SELECT 1 FROM guest_qr_codes gq WHERE gq.host_user_id = u.id)`,
    );
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const dataQuery = `
    SELECT 
      u.id AS user_id,
      u.full_name,
      u.email,
      u.phone,
      u.is_active,
      rp.apartment_id,
      a.apartment_code,
      a.building_id,
      b.name AS building_name,
      CASE 
        WHEN EXISTS (SELECT 1 FROM guest_qr_codes gq WHERE gq.host_user_id = u.id) 
        THEN true 
        ELSE false 
      END AS has_guest_qr,
      (SELECT COUNT(*) FROM guest_qr_codes gq WHERE gq.host_user_id = u.id) AS guest_qr_count,
      -- 👉 Lấy ID đầu tiên (KHÔNG LỌC REVOKED)
      (
        SELECT gq.id 
        FROM guest_qr_codes gq 
        WHERE gq.host_user_id = u.id 
        LIMIT 1
      ) AS guest_qr_id,
      -- 👉 Lấy STATUS (KHÔNG LỌC REVOKED)
      (
        SELECT gq.status 
        FROM guest_qr_codes gq 
        WHERE gq.host_user_id = u.id 
        LIMIT 1
      ) AS guest_qr_status,
      -- 👉 Lấy thời gian hết hạn (KHÔNG LỌC REVOKED)
      (
        SELECT gq.valid_to 
        FROM guest_qr_codes gq 
        WHERE gq.host_user_id = u.id 
        LIMIT 1
      ) AS guest_qr_valid_to,
      -- 👉 Lấy số lượt đã dùng (KHÔNG LỌC REVOKED)
      (
        SELECT gq.used_entries 
        FROM guest_qr_codes gq 
        WHERE gq.host_user_id = u.id 
        LIMIT 1
      ) AS guest_qr_used_entries,
      -- 👉 Lấy tổng lượt (KHÔNG LỌC REVOKED)
      (
        SELECT gq.max_entries 
        FROM guest_qr_codes gq 
        WHERE gq.host_user_id = u.id 
        LIMIT 1
      ) AS guest_qr_max_entries
    FROM users u
    INNER JOIN roles r ON r.id = u.role_id
    LEFT JOIN resident_profiles rp ON rp.user_id = u.id AND rp.status = 'ACTIVE'
    LEFT JOIN apartments a ON a.id = rp.apartment_id
    LEFT JOIN buildings b ON b.id = a.building_id
    ${whereClause}
    GROUP BY u.id, rp.apartment_id, a.apartment_code, a.building_id, b.name
    ORDER BY u.full_name ASC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const dataResult = await pool.query(dataQuery, [...params, limit, offset]);

  const countQuery = `
    SELECT COUNT(DISTINCT u.id) as total
    FROM users u
    INNER JOIN roles r ON r.id = u.role_id
    LEFT JOIN resident_profiles rp ON rp.user_id = u.id AND rp.status = 'ACTIVE'
LEFT JOIN apartments a ON a.id = rp.apartment_id
    ${whereClause}
  `;

  const countResult = await pool.query(countQuery, params);

  return {
    data: dataResult.rows,
    total: parseInt(countResult.rows[0]?.total || 0),
    page: page,
    limit: limit,
    totalPages: Math.ceil(parseInt(countResult.rows[0]?.total || 0) / limit),
  };
};
module.exports = {
  getAllPersonalQrs,
  createPersonalQr,
  revokePersonalQr,
  getResidentAccessHistory,
  getAllResidentAccessHistory,
  getAllGuestQrs,
  createGuestQr,
  getGuestQrById,
  updateGuestQr,
  deleteGuestQr,
  generateQrCodeImage,
  getGuestQrHistory,
  getAllResidents,
};
