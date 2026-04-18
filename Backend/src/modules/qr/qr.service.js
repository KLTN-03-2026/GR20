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

const getGuestQrsByHost = async (hostUserId, queryParams = {}) => {
  const { limit, offset, onlyValid } = queryParams;
  
  const result = await repo.getGuestQrsByHost(hostUserId, {
    limit: limit ? parseInt(limit) : 10,
    offset: offset ? parseInt(offset) : 0,
    onlyValid: onlyValid === 'true'  // Chỉ lọc khi onlyValid=true
  });
  
  // Map dữ liệu (mapper đã xử lý trạng thái EXPIRED)
  const mappedData = result.data.map(mapper.toGuestQrResponse);
  
  return {
    total: result.total,
    limit: result.limit,
    offset: result.offset,
    data: mappedData
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

const getGuestQrHistory = async (hostUserId) => {
  const data = await repo.getGuestQrHistory(hostUserId);
  return data.map((row) => ({
    ...mapper.toGuestQrResponse(row),
    scanTime: row.scan_time,
    direction: row.direction,
    gate: row.gate,
    result: row.result,
  }));
};

// qr.service.js - Sửa lại hàm getScanHistoryByGuard
const getScanHistoryByGuard = async (guardUserId) => {
  // Query cho guest QR
  const guestQuery = `
    SELECT 
      al.id,
      al.scan_time,
      al.direction,
      al.gate,
      al.result,
      al.scanned_by,
      'guest' as qr_type,
      gq.qr_code,
      gq.valid_from,
      gq.valid_to,
      v.name AS visitor_name,
      v.phone AS visitor_phone,
      a.apartment_code,
      u.full_name AS creator_name
    FROM access_logs al
    INNER JOIN guest_qr_codes gq ON gq.id = al.qr_code_id
    LEFT JOIN visitors v ON v.id = gq.visitor_id
    LEFT JOIN apartments a ON a.id = gq.apartment_id
    LEFT JOIN users u ON u.id = gq.host_user_id
    WHERE al.scanned_by = $1 AND al.qr_code_id IS NOT NULL
  `;
  
  // Query cho personal QR
  const personalQuery = `
    SELECT 
      al.id,
      al.scan_time,
      al.direction,
      al.gate,
      al.result,
      al.scanned_by,
      'personal' as qr_type,
      pq.qr_code,
      pq.expires_at as valid_to,
      NULL as valid_from,
      u.full_name AS visitor_name,
      u.phone AS visitor_phone,
      a.apartment_code,
      'Admin' as creator_name
    FROM access_logs al
    INNER JOIN qr_codes pq ON pq.id = al.personal_qr_code_id
    LEFT JOIN users u ON u.id = pq.user_id
    LEFT JOIN apartments a ON a.id = pq.apartment_id
    WHERE al.scanned_by = $1 AND al.personal_qr_code_id IS NOT NULL
  `;
  
  const [guestResult, personalResult] = await Promise.all([
    pool.query(guestQuery, [guardUserId]),
    pool.query(personalQuery, [guardUserId])
  ]);
  
  // Gộp và sắp xếp theo thời gian giảm dần
  const allLogs = [...guestResult.rows, ...personalResult.rows];
  allLogs.sort((a, b) => new Date(b.scan_time) - new Date(a.scan_time));
  
  return allLogs;
};

// const getScanHistoryByGuard = async (guardUserId) => {
//   const query = `
//     SELECT 
//       al.*,
//       gq.qr_code,
//       gq.valid_from,
//       gq.valid_to,
//       v.name AS visitor_name,
//       v.phone AS visitor_phone,
//       a.apartment_code,
//       u.full_name AS host_name
//     FROM access_logs al
//     LEFT JOIN guest_qr_codes gq ON gq.id = al.qr_code_id
//     LEFT JOIN visitors v ON v.id = gq.visitor_id
//     LEFT JOIN apartments a ON a.id = gq.apartment_id
//     LEFT JOIN users u ON u.id = gq.host_user_id
//     WHERE al.scanned_by = $1
//     ORDER BY al.scan_time DESC
//   `;
//   const result = await pool.query(query, [guardUserId]);
//   return result.rows;
// };
// qr.service.js
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
// qr.service.js - Thêm hàm này
const getAllPersonalQrs = async () => {
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
    ORDER BY qc.created_at DESC
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
  getPersonalQrByCode
};