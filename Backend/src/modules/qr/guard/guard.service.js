
const repo = require("./guard.repository");
const QRCode = require("qrcode");
const { pool } = require("../common/base.repository");

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

// const scanQr = async (qrCode, scanData = {}) => {
//   // // Thử tìm trong guest_qr_codes trước
//   // let data = await repo.scanQr(qrCode);
//   // let qrType = 'guest';
//   // let qrCodeId = data?.id;
  
//   // // Nếu không tìm thấy, tìm trong qr_codes (personal)
//   // if (!data) {
//   //   data = await getPersonalQrByCode(qrCode);
//   //   qrType = 'personal';
//   //   qrCodeId = data?.id;
//   // }
  
//   // if (!data) throw new Error("QR code không hợp lệ hoặc đã bị vô hiệu");
  
//   // const now = new Date();
//   // let result = "SUCCESS";
//   // let errorMessage = null;
  
//   // // Kiểm tra thời hạn
//   // const validTo = data.valid_to || data.expires_at;
//   // const validFrom = data.valid_from;
  
//   // if (validFrom && new Date(validFrom) > now) {
//   //   result = "DENIED";
//   //   errorMessage = "QR code chưa có hiệu lực";
//   // }
//   // else if (validTo && new Date(validTo) < now) {
//   //   result = "DENIED";
//   //   errorMessage = "QR code đã hết hạn";
//   // }
//   // else if (data.status === 'REVOKED') {
//   //   result = "DENIED";
//   //   errorMessage = "QR code đã bị vô hiệu hóa";
//   // }
//   // else if (qrType === 'guest' && data.max_entries && data.used_entries >= data.max_entries) {
//   //   result = "DENIED";
//   //   errorMessage = "QR code đã được sử dụng hết số lần cho phép";
//   // }
  
//   // // Ghi log
//   // await repo.createAccessLog({
//   //   qr_code_id: qrType === 'guest' ? qrCodeId : null,
//   //   personal_qr_code_id: qrType === 'personal' ? qrCodeId : null,
//   //   user_id: qrType === 'guest' ? data.host_user_id : data.user_id,
//   //   scanned_by: scanData.scannedBy,
//   //   building_id: scanData.building_id || null,
//   //   direction: scanData.direction || "IN",
//   //   gate: scanData.gate || null,
//   //   result: result,
//   //   qr_type: qrType
//   // });
  
//   // if (result === "SUCCESS" && qrType === 'guest') {
//   //   await repo.incrementUsedEntries(data.id);
//   //   const updatedData = await repo.getGuestQrById(data.id);
//   //   data.used_entries = updatedData.used_entries;
//   //   data.remaining_entries = data.max_entries - updatedData.used_entries;
//   // }
  
//   let data = await repo.scanQr(qrCode);
//   let qrType = 'guest';
//   let qrCodeId = data?.id;
  
//   if (!data) {
//     data = await getPersonalQrByCode(qrCode);
//     qrType = 'personal';
//     qrCodeId = data?.id;
//   }
  
//   if (!data) throw new Error("QR code không hợp lệ hoặc đã bị vô hiệu");
  
//   const now = new Date();
//   let result = "SUCCESS";
//   let errorMessage = null;
  
//   // ✅ CHECK STATUS TRƯỚC TIÊN - LUÔN LUÔN
//   if (data.status === 'REVOKED') {
//     result = "DENIED";
//     errorMessage = "QR code đã bị thu hồi";
//   }
//   else if (data.status !== 'ACTIVE') {
//     result = "DENIED";
//     errorMessage = "QR code đã bị vô hiệu hóa";
//   }
//   // Sau đó mới check thời gian
//   else if (data.status === 'ACTIVE') {
//     const validFrom = data.valid_from;
//     const validTo = data.valid_to || data.expires_at;
    
//     if (validFrom && new Date(validFrom) > now) {
//       result = "DENIED";
//       errorMessage = "QR code chưa có hiệu lực";
//     }
//     else if (validTo && new Date(validTo) < now) {
//       result = "DENIED";
//       errorMessage = "QR code đã hết hạn";
//     }
//     else if (qrType === 'guest' && data.max_entries && data.used_entries >= data.max_entries) {
//       result = "DENIED";
//       errorMessage = "QR code đã được sử dụng hết số lần cho phép";
//     }
//   }
  
//   // Ghi log
//   await repo.createAccessLog({
//     qr_code_id: qrType === 'guest' ? qrCodeId : null,
//     personal_qr_code_id: qrType === 'personal' ? qrCodeId : null,
//     user_id: qrType === 'guest' ? data.host_user_id : data.user_id,
//     scanned_by: scanData.scannedBy,
//     building_id: scanData.building_id || null,
//     direction: scanData.direction || "IN",
//     gate: scanData.gate || null,
//     result: result,
//     qr_type: qrType
//   });
  
//   if (result === "SUCCESS" && qrType === 'guest') {
//     await repo.incrementUsedEntries(data.id);
//     const updatedData = await repo.getGuestQrById(data.id);
//     data.used_entries = updatedData.used_entries;
//     data.remaining_entries = data.max_entries - updatedData.used_entries;
//   }
//   if (errorMessage) {
//     throw new Error(errorMessage);
//   }
  
//   const qrImage = await QRCode.toDataURL(qrCode);
  
//   const response = {
//     id: data.id,
//     qrCode: data.qr_code,
//     status: data.status,
//     qrType: qrType,
//     qrImage: qrImage
//   };
  
//   if (qrType === 'guest') {
//     response.hostName = data.host_name;
//     response.visitorName = data.visitor_name;
//     response.visitorPhone = data.visitor_phone;
//     response.apartmentCode = data.apartment_code;
//     response.usedEntries = data.used_entries;
//     response.maxEntries = data.max_entries;
//     response.remainingEntries = data.max_entries - data.used_entries;
//     response.validFrom = data.valid_from;
//     response.validTo = data.valid_to;
//   } else {
//     response.userName = data.user_name;
//     response.userPhone = data.user_phone;
//     response.userEmail = data.user_email;
//     response.apartmentCode = data.apartment_code;
//     response.expiresAt = data.expires_at;
//   }
  
//   return response;
// };


const scanQr = async (qrCode, scanData = {}) => {
  // Thử tìm guest QR
  let data = await repo.scanQr(qrCode);
  let qrType = 'guest';
  let qrCodeId = data?.id;
  
  // Nếu không tìm thấy, tìm personal QR
  if (!data) {
    data = await getPersonalQrByCode(qrCode);
    qrType = 'personal';
    qrCodeId = data?.id;
  }
  
  if (!data) throw new Error("QR code không hợp lệ hoặc đã bị vô hiệu");
  
  const now = new Date();
  let result = "SUCCESS";
  let errorMessage = null;
  
  // ✅ FIX: Kiểm tra status TRƯỚC (kiểm tra REVOKED, EXPIRED trạng thái)
  if (data.status === 'REVOKED') {
    result = "DENIED";
    errorMessage = "QR code đã bị thu hồi";
  } 
  else if (data.status !== 'ACTIVE') {
    result = "DENIED";
    errorMessage = "QR code đã bị vô hiệu hóa";
  }
  // ✅ FIX: Chỉ check thời gian khi status = ACTIVE
  else {
    const validFrom = data.valid_from;
    const validTo = data.valid_to || data.expires_at;
    
    // Check validFrom
    if (validFrom && new Date(validFrom) > now) {
      result = "DENIED";
      errorMessage = "QR code chưa có hiệu lực";
    }
    // ✅ FIX: Check validTo đúng cách
    else if (validTo && new Date(validTo) < now) {
      result = "DENIED";
      errorMessage = "QR code đã hết hạn";
    }
    // Check max entries (guest QR only)
    else if (qrType === 'guest' && data.max_entries && data.used_entries >= data.max_entries) {
      result = "DENIED";
      errorMessage = "QR code đã được sử dụng hết số lần cho phép";
    }
  }
  
  // ✅ FIX: Throw error NGAY NẾU CÓ LỖI (trước ghi log)
  if (result === "DENIED") {
    // Ghi log DENIED
    await repo.createAccessLog({
      qr_code_id: qrType === 'guest' ? qrCodeId : null,
      personal_qr_code_id: qrType === 'personal' ? qrCodeId : null,
      user_id: qrType === 'guest' ? data.host_user_id : data.user_id,
      scanned_by: scanData.scannedBy,
      building_id: scanData.building_id || null,
      direction: scanData.direction || "IN",
      gate: scanData.gate || null,
      result: "DENIED",
      qr_type: qrType
    });
    
    // Throw error ngay
    throw new Error(errorMessage);
  }
  
  // Chỉ xử lý SUCCESS nếu không có error
  if (qrType === 'guest' && data.max_entries) {
    await repo.incrementUsedEntries(data.id);
    const updatedData = await repo.getGuestQrById(data.id);
    data.used_entries = updatedData.used_entries;
    data.remaining_entries = data.max_entries - updatedData.used_entries;
  }
  
  // Ghi log SUCCESS
  await repo.createAccessLog({
    qr_code_id: qrType === 'guest' ? qrCodeId : null,
    personal_qr_code_id: qrType === 'personal' ? qrCodeId : null,
    user_id: qrType === 'guest' ? data.host_user_id : data.user_id,
    scanned_by: scanData.scannedBy,
    building_id: scanData.building_id || null,
    direction: scanData.direction || "IN",
    gate: scanData.gate || null,
    result: "SUCCESS",
    qr_type: qrType
  });
  
  // Tạo QR image
  const qrImage = await QRCode.toDataURL(qrCode);
  
  // Build response
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

module.exports = { scanQr,getGuestQrHistory, getScanHistoryByGuard };