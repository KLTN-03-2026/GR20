const repo = require("./qr.repository");
const mapper = require("./qr.mapper");
const QRCode = require("qrcode");        // ← thư viện generate QR
const { v4: uuidv4 } = require("uuid"); // ← tạo mã unique (có sẵn trong Node)
const cron = require('node-cron');
// const { pool } = require("../../configs/database.config");
const { pool } = require("../../configs/database.config.js");


cron.schedule('0 0 * * *', async () => {
  try {
    const result = await pool.query(`
      UPDATE guest_qr_codes 
      SET status = 'EXPIRED' 
      WHERE status = 'ACTIVE' 
        AND valid_to < NOW()
    `);
    // QR codes updated
  } catch (error) {
    // Update error
  }
});

// Thêm hàm này vào qr.service.js
const getApartmentByUserId = async (userId) => {
  return await repo.getApartmentByUserId(userId);
};

// ─── QR CÁ NHÂN ───────────────────────────────────────────

const getPersonalQr = async (userId) => {
  const data = await repo.getPersonalQr(userId);
  if (!data) throw new Error("Personal QR not found");

  // Generate ảnh QR từ mã
  const qrImage = await QRCode.toDataURL(data.qr_code);

  return { ...mapper.toPersonalQrResponse(data), qrImage };
};



const scanQr = async (qrCode, scanData = {}) => {
  // Thử tìm trong guest_qr_codes trước
  let data = await repo.scanQr(qrCode);
  let qrType = 'guest';
  let qrCodeId = data?.id;
  
  // Nếu không tìm thấy, tìm trong qr_codes (personal)
  if (!data) {
    data = await getPersonalQrByCode(qrCode);
    qrType = 'personal';
    qrCodeId = data?.id;
  }
  
  if (!data) throw new Error("QR code không hợp lệ hoặc đã bị vô hiệu");
  
  const now = new Date();
  let result = "SUCCESS";
  let errorMessage = null;
  
  // Kiểm tra thời hạn
  const validTo = data.valid_to || data.expires_at;
  const validFrom = data.valid_from;
  
  if (validFrom && new Date(validFrom) > now) {
    result = "DENIED";
    errorMessage = "QR code chưa có hiệu lực";
  }
  else if (validTo && new Date(validTo) < now) {
    result = "DENIED";
    errorMessage = "QR code đã hết hạn";
  }
  else if (data.status !== 'ACTIVE') {
    result = "DENIED";
    errorMessage = "QR code đã bị vô hiệu hóa";
  }
  else if (qrType === 'guest' && data.max_entries && data.used_entries >= data.max_entries) {
    result = "DENIED";
    errorMessage = "QR code đã được sử dụng hết số lần cho phép";
  }
  
  // Ghi log
  await repo.createAccessLog({
    qr_code_id: qrType === 'guest' ? qrCodeId : null,
    personal_qr_code_id: qrType === 'personal' ? qrCodeId : null,
    user_id: qrType === 'guest' ? data.host_user_id : data.user_id,
    scanned_by: scanData.scannedBy,
    building_id: scanData.building_id || null,
    direction: scanData.direction || "IN",
    gate: scanData.gate || null,
    result: result,
    qr_type: qrType
  });
  
  if (result === "SUCCESS" && qrType === 'guest') {
    await repo.incrementUsedEntries(data.id);
    const updatedData = await repo.getGuestQrById(data.id);
    data.used_entries = updatedData.used_entries;
    data.remaining_entries = data.max_entries - updatedData.used_entries;
  }
  
  if (errorMessage) {
    throw new Error(errorMessage);
  }
  
  const qrImage = await QRCode.toDataURL(qrCode);
  
  const response = {
    id: data.id,
    qrCode: data.qr_code,
    status: data.status,
    qrType: qrType,
    qrImage: qrImage
  };
  
  if (qrType === 'guest') {
    response.hostName = data.host_name;
    response.visitorName = data.visitor_name;
    response.visitorPhone = data.visitor_phone;
    response.apartmentCode = data.apartment_code;
    response.usedEntries = data.used_entries;
    response.maxEntries = data.max_entries;
    response.remainingEntries = data.max_entries - data.used_entries;
    response.validFrom = data.valid_from;
    response.validTo = data.valid_to;
  } else {
    response.userName = data.user_name;
    response.userPhone = data.user_phone;
    response.userEmail = data.user_email;
    response.apartmentCode = data.apartment_code;
    response.expiresAt = data.expires_at;
  }
  
  return response;
};


const createGuestQr = async (reqBody) => {
  // ✅ Đảm bảo hostUserId được truyền đúng
  const entity = mapper.toGuestQrEntity({
    hostUserId: reqBody.hostUserId,  // Phải có giá trị
    visitorName: reqBody.visitorName,
    visitorPhone: reqBody.visitorPhone,
    visitorIdCard: reqBody.visitorIdCard,
    apartmentId: reqBody.apartmentId,
    validFrom: reqBody.validFrom,
    validTo: reqBody.validTo,
    maxEntries: reqBody.maxEntries,
  });

  const code = `GUEST_${uuidv4()}`;
  const qrString = `http://localhost:8000/api/qr/guest/scan/${code}`;
  entity.guestQr.qr_code = code;

  const result = await repo.createGuestQr(entity);

  const fullData = await repo.getGuestQrById(result.guestQr.id);
  const qrImage = await QRCode.toDataURL(qrString);

  return { ...mapper.toGuestQrResponse(fullData), qrImage };
};



const getGuestQrById = async (id) => {
  const data = await repo.getGuestQrById(id);
  if (!data) throw new Error("Guest QR not found");

  const qrImage = await QRCode.toDataURL(data.qr_code);
  return { ...mapper.toGuestQrResponse(data), qrImage };
};

// services/qrcode.service.js
const getGuestQrsByHost = async (hostUserId, queryParams = {}) => {
  const { 
    limit, 
    page, 
    onlyValid, 
    search,
    fromDate,   // ✅ fromDate
    toDate      // ✅ toDate
  } = queryParams;
  
  const pageNum = page ? parseInt(page) : 1;
  const pageSize = limit ? parseInt(limit) : 10;
  const offset = (pageNum - 1) * pageSize;
  
  // Xử lý thời gian
  let fromDateTime = fromDate;
  let toDateTime = toDate;
  
  if (fromDate && !fromDate.includes('T')) {
    fromDateTime = `${fromDate}T00:00:00`;
  }
  if (toDate && !toDate.includes('T')) {
    toDateTime = `${toDate}T23:59:59`;
  }
  
  const result = await repo.getGuestQrsByHost(hostUserId, {
    limit: pageSize,
    offset: offset,
    onlyValid: onlyValid === 'true',
    search: search || '',
    validFromDate: fromDateTime || null,   // ✅ từ fromDate
    validToDate: toDateTime || null        // ✅ từ toDate
  });
  
  const mappedData = result.data.map(mapper.toGuestQrResponse);
  
  return {
    data: mappedData,
    size: mappedData.length,
    totalElements: result.total,
    totalPages: Math.ceil(result.total / pageSize),
    page: pageNum,
    pageSize: pageSize
  };
};
 

const updateGuestQr = async (id, updateData) => {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
    // Cập nhật guest_qr_codes
    const qrFields = [];
    const qrValues = [];
    let idx = 1;
    
    if (updateData.validFrom !== undefined) {
      qrFields.push(`valid_from = $${idx++}`);
      qrValues.push(updateData.validFrom);
    }
    if (updateData.validTo !== undefined) {
      qrFields.push(`valid_to = $${idx++}`);
      qrValues.push(updateData.validTo);
    }
    if (updateData.maxEntries !== undefined) {
      qrFields.push(`max_entries = $${idx++}`);
      qrValues.push(updateData.maxEntries);
    }
    if (updateData.status !== undefined) {
      qrFields.push(`status = $${idx++}`);
      qrValues.push(updateData.status);
    }
    
    if (qrFields.length > 0) {
      qrValues.push(id);
      const qrQuery = `
        UPDATE guest_qr_codes 
        SET ${qrFields.join(", ")} 
        WHERE id = $${idx} 
        RETURNING *
      `;
      await client.query(qrQuery, qrValues);
    }
    
    // Cập nhật visitors table
    if (updateData.visitorName !== undefined || updateData.visitorPhone !== undefined || updateData.visitorIdCard !== undefined) {
      // Lấy visitor_id từ guest_qr_codes
      const getVisitorQuery = `SELECT visitor_id FROM guest_qr_codes WHERE id = $1`;
      const visitorResult = await client.query(getVisitorQuery, [id]);
      const visitorId = visitorResult.rows[0]?.visitor_id;
      
      if (visitorId) {
        const visitorFields = [];
        const visitorValues = [];
        let vIdx = 1;
        
        if (updateData.visitorName !== undefined) {
          visitorFields.push(`name = $${vIdx++}`);
          visitorValues.push(updateData.visitorName);
        }
        if (updateData.visitorPhone !== undefined) {
          visitorFields.push(`phone = $${vIdx++}`);
          visitorValues.push(updateData.visitorPhone);
        }
        if (updateData.visitorIdCard !== undefined) {
          visitorFields.push(`id_card = $${vIdx++}`);
          visitorValues.push(updateData.visitorIdCard);
        }
        
        if (visitorFields.length > 0) {
          visitorValues.push(visitorId);
          const visitorQuery = `
            UPDATE visitors 
            SET ${visitorFields.join(", ")} 
            WHERE id = $${vIdx}
          `;
          await client.query(visitorQuery, visitorValues);
        }
      }
    }
    
    await client.query("COMMIT");
    
    // Lấy lại dữ liệu đã cập nhật
    const updatedData = await getGuestQrById(id);
    return mapper.toGuestQrResponse(updatedData);
    
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};
const deleteGuestQr = async (id) => {
  const deleted = await repo.deleteGuestQr(id);
  if (!deleted) throw new Error("QR not found");
  return { id: deleted.id };
};

// services/qrcode.service.js

const getGuestQrHistory = async (hostUserId, queryParams = {}) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    result = '',
    fromDate = null,
    toDate = null,
    qrType = ''
  } = queryParams;

  // Xử lý ngày tháng
  let fromDateTime = fromDate;
  let toDateTime = toDate;
  
  if (fromDate && !fromDate.includes('T')) {
    fromDateTime = `${fromDate}T00:00:00`;
  }
  if (toDate && !toDate.includes('T')) {
    toDateTime = `${toDate}T23:59:59`;
  }

  const resultData = await repo.getGuestQrHistory(hostUserId, {
    page: parseInt(page),
    limit: parseInt(limit),
    search: search || '',
    result: result || '',
    fromDate: fromDateTime || null,
    toDate: toDateTime || null,
    qrType: qrType || ''
  });

  return {
     data: resultData.data,
    size: resultData.data.length,
    totalElements: resultData.total,
    totalPages: resultData.totalPages,
    page: resultData.page,
    pageSize: resultData.limit
  };
};  

// services/qrcode.service.js
// services/qrcode.service.js
const getScanHistoryByGuard = async (guardUserId, queryParams = {}) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    result = '',
    fromDate = null,
    toDate = null,
    qrType = ''
  } = queryParams;

  const offset = (page - 1) * limit;
  let conditions = [`al.scanned_by = $1`];
  let params = [guardUserId];
  let paramIndex = 2;

  // Tìm kiếm
  if (search && search.trim()) {
    conditions.push(`(v.name ILIKE $${paramIndex} OR v.phone ILIKE $${paramIndex} OR u_full.full_name ILIKE $${paramIndex})`);
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

  // ✅ SỬA: Count query cần JOIN đủ các bảng
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
    page: page,
    pageSize: limit
  };
};
const createPersonalQr = async (data) => {
  const query = `
    INSERT INTO qr_codes (user_id, apartment_id, qr_code, expires_at, status)
    VALUES ($1, $2, $3, $4, 'ACTIVE')
    RETURNING *
  `;
  const result = await pool.query(query, [
    data.userId,
    data.apartmentId,
    data.qrCode,
    data.expiresAt
  ]);
  return result.rows[0];
};

const getPersonalQrByUserId = async (userId) => {
  const query = `
    SELECT * FROM qr_codes 
    WHERE user_id = $1 AND status = 'ACTIVE'
    ORDER BY created_at DESC
    LIMIT 1
  `;
  const result = await pool.query(query, [userId]);
  return result.rows[0];
};

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
const revokePersonalQr = async (id) => {
  const query = `
    UPDATE qr_codes 
    SET status = 'REVOKED' 
    WHERE id = $1 
    RETURNING *
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};
// services/qrcode.service.js
const getAllPersonalQrs = async (queryParams = {}) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    status = ''
  } = queryParams;

  const result = await repo.getAllPersonalQrs({
    page: parseInt(page),
    limit: parseInt(limit),
    search: search || '',
    status: status || ''
  });

  return {
    data: result.data,
    size: result.data.length,
    totalElements: result.total,
    totalPages: result.totalPages,
    page: result.page,
    pageSize: result.limit
  };
};

// Lấy tất cả lịch sử ra vào của cư dân (ADMIN)
// services/qrcode.service.js
const getAllResidentAccessHistory = async (queryParams = {}) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    result = '',
    fromDate = null,
    toDate = null
  } = queryParams;

  let fromDateTime = fromDate;
  let toDateTime = toDate;

  if (fromDate && !fromDate.includes('T')) {
    fromDateTime = `${fromDate}T00:00:00`;
  }
  if (toDate && !toDate.includes('T')) {
    toDateTime = `${toDate}T23:59:59`;
  }

  const resultData = await repo.getAllResidentAccessHistory({
    page: parseInt(page),
    limit: parseInt(limit),
    search: search || '',
    result: result || '',
    fromDate: fromDateTime || null,
    toDate: toDateTime || null
  });

  return {
    data: resultData.data,
    size: resultData.data.length,
    totalElements: resultData.total,
    totalPages: resultData.totalPages,
    page: resultData.page,
    pageSize: resultData.limit
  };
};

// services/qrcode.service.js
const getResidentAccessHistory = async (userId, queryParams = {}) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    result = '',
    fromDate = null,
    toDate = null
  } = queryParams;

  let fromDateTime = fromDate;
  let toDateTime = toDate;

  if (fromDate && !fromDate.includes('T')) {
    fromDateTime = `${fromDate}T00:00:00`;
  }
  if (toDate && !toDate.includes('T')) {
    toDateTime = `${toDate}T23:59:59`;
  }

  const resultData = await repo.getResidentAccessHistory(userId, {
    page: parseInt(page),
    limit: parseInt(limit),
    search: search || '',
    result: result || '',
    fromDate: fromDateTime || null,
    toDate: toDateTime || null
  });

  return {
    data: resultData.data,
    size: resultData.data.length,
    totalElements: resultData.total,
    totalPages: resultData.totalPages,
    page: resultData.page,
    pageSize: resultData.limit
  };
};

// qr.service.js
const getPersonalQrById = async (id) => {
  const query = `
    SELECT 
      qc.*,
      u.full_name AS user_name,
      u.email AS user_email,
      u.phone AS user_phone,
      a.apartment_code
    FROM qr_codes qc
    LEFT JOIN users u ON u.id = qc.user_id
    LEFT JOIN apartments a ON a.id = qc.apartment_id
    WHERE qc.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const updatePersonalQr = async (id, updateData) => {
  const fields = [];
  const values = [];
  let idx = 1;
  
  if (updateData.status !== undefined) {
    fields.push(`status = $${idx++}`);
    values.push(updateData.status);
  }
  if (updateData.expiresAt !== undefined) {
    fields.push(`expires_at = $${idx++}`);
    values.push(updateData.expiresAt);
  }
  if (updateData.apartmentId !== undefined) {
    fields.push(`apartment_id = $${idx++}`);
    values.push(updateData.apartmentId);
  }
  
  if (fields.length === 0) {
    throw new Error("No fields to update");
  }
  
  values.push(id);
  const query = `
    UPDATE qr_codes 
    SET ${fields.join(", ")} 
    WHERE id = $${idx}
    RETURNING *
  `;
  const result = await pool.query(query, values);
  return result.rows[0];
};


const getAllResidentsWithQRStatus = async () => {
  const query = `
    SELECT 
      u.id AS user_id,
      u.full_name AS user_name,
      u.email AS user_email,
      u.phone AS user_phone,
      a.id AS apartment_id,
      a.apartment_code,
      qc.id AS qr_id,
      qc.qr_code,
      qc.status AS qr_status,
      qc.expires_at,
      qc.created_at,
      CASE 
        WHEN qc.id IS NOT NULL THEN 'HAS_QR'
        ELSE 'NO_QR'
      END AS qr_exists
    FROM users u
    LEFT JOIN apartments a ON a.owner_user_id = u.id
    LEFT JOIN qr_codes qc ON qc.user_id = u.id
    WHERE u.role_id = 5  -- role_id = 5 là "Người Dùng" (cư dân)
    ORDER BY qr_exists DESC, u.created_at DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};
module.exports = {
  getPersonalQr,
  createGuestQr,
  getGuestQrById,
  getGuestQrsByHost,
  updateGuestQr,
  deleteGuestQr,
  getApartmentByUserId,
  getGuestQrHistory,
  getScanHistoryByGuard,
  scanQr,
  createPersonalQr,
  revokePersonalQr,
  getPersonalQrByUserId,
  getAllPersonalQrs,
  getPersonalQrByCode,
  getAllResidentAccessHistory,
  getResidentAccessHistory,
  updatePersonalQr,
  getPersonalQrById,
  getAllResidentsWithQRStatus 
};