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


// Thêm hàm này vào file qr.service.js (đặt sau hàm deleteGuestQr)

// const scanQr = async (qrCode, scanData = {}) => {
//   const data = await repo.scanQr(qrCode);
//   if (!data) throw new Error("QR code không hợp lệ hoặc đã bị vô hiệu");
  
//   const now = new Date();
//   let result = "SUCCESS";
//   let errorMessage = null;
  
//   // Kiểm tra thời hạn
//   if (data.valid_from && new Date(data.valid_from) > now) {
//     result = "DENIED";
//     errorMessage = "QR code chưa có hiệu lực";
//   }
//   else if (data.valid_to && new Date(data.valid_to) < now) {
//     result = "DENIED";
//     errorMessage = "QR code đã hết hạn";
//   }
//   else if (data.max_entries && data.used_entries >= data.max_entries) {
//     result = "DENIED";
//     errorMessage = "QR code đã được sử dụng hết số lần cho phép";
//   }
  
//   // Ghi log vào access_logs
//   await repo.createAccessLog({
//     qr_code_id: data.id,
//     user_id: data.host_user_id,
//     building_id: scanData.building_id || null,
//     direction: scanData.direction || "IN",
//     gate: scanData.gate || null,
//     result: result
//   });
  
//   // Nếu có lỗi thì throw
//   if (errorMessage) {
//     throw new Error(errorMessage);
//   }
  
//   // Cập nhật số lần đã sử dụng
//   if (data.max_entries > 0) {
//     await repo.incrementUsedEntries(data.id);
//   }
  
//   // Tạo QR image
//   const qrImage = await QRCode.toDataURL(data.qr_code);
  
//   return { ...mapper.toGuestQrResponse(data), qrImage };
// };
// const scanQr = async (qrCode, scanData = {}) => {
//   const data = await repo.scanQr(qrCode);
//   if (!data) throw new Error("QR code không hợp lệ hoặc đã bị vô hiệu");
  
//   const now = new Date();
//   let result = "SUCCESS";
//   let errorMessage = null;
  
//   // Kiểm tra thời hạn
//   if (data.valid_from && new Date(data.valid_from) > now) {
//     result = "DENIED";
//     errorMessage = "QR code chưa có hiệu lực";
//   }
//   else if (data.valid_to && new Date(data.valid_to) < now) {
//     result = "DENIED";
//     errorMessage = "QR code đã hết hạn";
//   }
//   else if (data.max_entries && data.used_entries >= data.max_entries) {
//     result = "DENIED";
//     errorMessage = "QR code đã được sử dụng hết số lần cho phép";
//   }
  
//   // Ghi log vào access_logs (nếu có bảng)
//   if (repo.createAccessLog) {
//     await repo.createAccessLog({
//       qr_code_id: data.id,
//       user_id: data.host_user_id,
//       building_id: scanData.building_id || null,
//       direction: scanData.direction || "IN",
//       gate: scanData.gate || null,
//       result: result
//     });
//   }
  
//   // ✅ Nếu thành công, tăng used_entries lên 1
//   if (result === "SUCCESS") {
//     await repo.incrementUsedEntries(data.id);
//     // Lấy lại data mới sau khi cập nhật
//     const updatedData = await repo.getGuestQrById(data.id);
//     data.used_entries = updatedData.used_entries;
//     data.remaining_entries = data.max_entries - updatedData.used_entries;
//   }
  
//   // Nếu có lỗi thì throw
//   if (errorMessage) {
//     throw new Error(errorMessage);
//   }
  
//   // Tạo QR image
//   const qrImage = await QRCode.toDataURL(data.qr_code);
  
//   const response = mapper.toGuestQrResponse(data);
//   return { ...response, qrImage };
// };------
// qr.service.js
const scanQr = async (qrCode, scanData = {}) => {
  const data = await repo.scanQr(qrCode);
  if (!data) throw new Error("QR code không hợp lệ hoặc đã bị vô hiệu");
  
  const now = new Date();
  let result = "SUCCESS";
  let errorMessage = null;
  
  // Kiểm tra thời hạn
  if (data.valid_from && new Date(data.valid_from) > now) {
    result = "DENIED";
    errorMessage = "QR code chưa có hiệu lực";
  }
  else if (data.valid_to && new Date(data.valid_to) < now) {
    result = "DENIED";
    errorMessage = "QR code đã hết hạn";
  }
  else if (data.max_entries && data.used_entries >= data.max_entries) {
    result = "DENIED";
    errorMessage = "QR code đã được sử dụng hết số lần cho phép";
  }
  
  // Ghi log với scanned_by
  await repo.createAccessLog({
    qr_code_id: data.id,
    user_id: data.host_user_id,
    scanned_by: scanData.scannedBy,  // 👈 Người quét
    building_id: scanData.building_id || null,
    direction: scanData.direction || "IN",
    gate: scanData.gate || null,
    result: result
  });
  
  if (result === "SUCCESS") {
    await repo.incrementUsedEntries(data.id);
    const updatedData = await repo.getGuestQrById(data.id);
    data.used_entries = updatedData.used_entries;
    data.remaining_entries = data.max_entries - updatedData.used_entries;
  }
  
  if (errorMessage) {
    throw new Error(errorMessage);
  }
  
  const qrImage = await QRCode.toDataURL(data.qr_code);
  const response = mapper.toGuestQrResponse(data);
  return { ...response, qrImage };
};

//   const data = await repo.scanQr(qrCode);
//   if (!data) throw new Error("QR code không hợp lệ hoặc đã bị vô hiệu");
  
//   // Kiểm tra thời hạn
//   const now = new Date();
//   if (data.valid_from && new Date(data.valid_from) > now) {
//     throw new Error("QR code chưa có hiệu lực");
//   }
//   if (data.valid_to && new Date(data.valid_to) < now) {
//     throw new Error("QR code đã hết hạn");
//   }
  
//   // Kiểm tra số lần sử dụng
//   if (data.max_entries && data.used_entries >= data.max_entries) {
//     throw new Error("QR code đã được sử dụng hết số lần cho phép");
//   }
  
//   // ✅ THÊM DÒNG NÀY: Tạo QR image từ qrCode
//   const qrImage = await QRCode.toDataURL(data.qr_code);
  
//   // ✅ TRẢ VỀ có qrImage
//   return { ...mapper.toGuestQrResponse(data), qrImage };
// };

// const scanQr = async (qrCode) => {
//   // Tìm QR code trong database
//   const data = await repo.scanQr(qrCode);
  
//   if (!data) {
//     throw new Error("QR code không tồn tại hoặc đã bị vô hiệu");
//   }
  
//   // Kiểm tra trạng thái
//   if (data.status !== 'ACTIVE') {
//     throw new Error("QR code đã bị vô hiệu hóa");
//   }
  
//   // Kiểm tra thời gian hiệu lực
//   const now = new Date();
//   const validFrom = new Date(data.valid_from);
//   const validTo = new Date(data.valid_to);
  
//   if (validFrom > now) {
//     throw new Error(`QR code chưa có hiệu lực. Bắt đầu từ: ${validFrom.toLocaleString()}`);
//   }
  
//   if (validTo < now) {
//     throw new Error(`QR code đã hết hạn. Hết hạn lúc: ${validTo.toLocaleString()}`);
//   }
  
//   // Kiểm tra số lần sử dụng
//   if (data.max_entries && data.used_entries >= data.max_entries) {
//     throw new Error(`QR code đã được sử dụng hết ${data.max_entries}/${data.max_entries} lần`);
//   }
  
//   // (Tùy chọn) Cập nhật số lần đã sử dụng
//   // await repo.incrementUsedEntries(data.id);
  
//   return mapper.toGuestQrResponse(data);
// };

// ─── QR KHÁCH ─────────────────────────────────────────────

// const createGuestQr = async (reqBody) => {
//   const entity = mapper.toGuestQrEntity(reqBody);

//   // Tạo mã QR unique
//   const qrString = `GUEST_${uuidv4()}`;
//   entity.qr_code = qrString;

//   const result = await repo.createGuestQr(entity);

//   // Generate ảnh QR
//   const qrImage = await QRCode.toDataURL(qrString);

//   return { ...mapper.toGuestQrResponse(result), qrImage };
// };

// const createGuestQr = async (reqBody) => {
//   const entity = mapper.toGuestQrEntity(reqBody);

//   const code = `GUEST_${uuidv4()}`;
//   const qrString = `http://localhost:8000/api/qr/scan/${code}`;
//   entity.guestQr.qr_code = code;

//   const result = await repo.createGuestQr(entity);

//   // ← Sau khi tạo xong, query lại để có đủ thông tin join
//   const fullData = await repo.getGuestQrById(result.guestQr.id);

//   const qrImage = await QRCode.toDataURL(qrString);

//   return { ...mapper.toGuestQrResponse(fullData), qrImage };
// };

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

// const createGuestQr = async (reqBody) => {
//   const entity = mapper.toGuestQrEntity(reqBody);

//   // Tạo mã code unique
//   const code = `GUEST_${uuidv4()}`;
  
//   // QR chứa URL → quét ra mở trình duyệt
//   const qrString = `https://homelink.ai/scan/${code}`;
  
//   entity.guestQr.qr_code = code; // lưu code vào DB
  
//   const result = await repo.createGuestQr(entity);

//   // Generate ảnh QR chứa URL
//   const qrImage = await QRCode.toDataURL(qrString);

//   return { ...mapper.toGuestQrResponse(result.guestQr), qrImage };
// };

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

// const getGuestQrsByHost = async (hostUserId, queryParams = {}) => {
//   const { limit, offset, status, onlyValid } = queryParams;
  
//   const result = await repo.getGuestQrsByHost(hostUserId, {
//     limit: limit ? parseInt(limit) : 10,
//     offset: offset ? parseInt(offset) : 0,
//     status: status || 'ACTIVE',
//     onlyValid: onlyValid !== 'false'
//   });
  
//   // Map dữ liệu
//   const mappedData = result.data.map(mapper.toGuestQrResponse);
  
//   // Trả về đúng structure
//   return {
//     total: result.total,
//     limit: result.limit,
//     offset: result.offset,
//     data: mappedData
//   };
// };

// const getGuestQrsByHost = async (hostUserId) => {
//   const data = await repo.getGuestQrsByHost(hostUserId);
//   return data.map(mapper.toGuestQrResponse);
// };

// const updateGuestQr = async (id, reqBody) => {
//   const entity = {
//     valid_from: reqBody.validFrom,
//     valid_to: reqBody.validTo,
//     max_entries: reqBody.maxEntries,
//     status: reqBody.status,
//   };

//   const updated = await repo.updateGuestQr(id, entity);
//   if (!updated) throw new Error("Update failed");

//   return mapper.toGuestQrResponse(updated);
// };
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

const getScanHistoryByGuard = async (guardUserId) => {
  const query = `
    SELECT 
      al.*,
      gq.qr_code,
      gq.valid_from,
      gq.valid_to,
      v.name AS visitor_name,
      v.phone AS visitor_phone,
      a.apartment_code,
      u.full_name AS host_name
    FROM access_logs al
    LEFT JOIN guest_qr_codes gq ON gq.id = al.qr_code_id
    LEFT JOIN visitors v ON v.id = gq.visitor_id
    LEFT JOIN apartments a ON a.id = gq.apartment_id
    LEFT JOIN users u ON u.id = gq.host_user_id
    WHERE al.scanned_by = $1
    ORDER BY al.scan_time DESC
  `;
  const result = await pool.query(query, [guardUserId]);
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
  scanQr
};