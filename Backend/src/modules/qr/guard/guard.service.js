const repo = require("./guard.repository");
const QRCode = require("qrcode");
const { pool } = require("../common/base.repository");

const getPersonalQrByCode = async (qrCode) => {
  const query = `
    SELECT 
      qc.id,
      qc.user_id,
      qc.apartment_id,
      qc.qr_code,
      qc.expires_at,
      qc.status,
      qc.created_at,
      qc.pin_code,
      qc.pin_failed_count,
      qc.pin_locked,
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

const getBuildingIdByApartmentId = async (apartmentId) => {
  if (!apartmentId) return null;
  
  const query = `
    SELECT building_id 
    FROM apartments 
    WHERE id = $1
  `;
  const result = await pool.query(query, [apartmentId]);
  return result.rows[0]?.building_id || null;
};

const scanQr = async (qrCode, scanData = {}) => {
  // Thử tìm guest QR
  let data = await repo.scanQr(qrCode);
  let qrType = 'guest';
  let qrCodeId = data?.id;
  let buildingId = null;
  
  if (!data) {
    data = await getPersonalQrByCode(qrCode);
    qrType = 'personal';
    qrCodeId = data?.id;
  }
  
  if (!data) throw new Error("QR code không hợp lệ hoặc đã bị vô hiệu");
  
  if (data.apartment_id) {
    buildingId = await getBuildingIdByApartmentId(data.apartment_id);
  }
  
  const now = new Date();
  let resultStatus = "SUCCESS";
  let errorMessage = null;
  
  // ============ KIỂM TRA ĐIỀU KIỆN TỪNG CÁI ============
  
  // 1️⃣ Kiểm tra status
  if (data.status === 'REVOKED') {
    resultStatus = "DENIED";
    errorMessage = "QR code đã bị thu hồi";
  } 
  else if (data.status !== 'ACTIVE') {
    resultStatus = "DENIED";
    errorMessage = "QR code đã bị vô hiệu hóa";
  }
  // 2️⃣ Kiểm tra PIN LOCKED
  else if (data.pin_locked === true) {
    resultStatus = "DENIED";
    errorMessage = "QR đã bị khóa do nhập sai PIN quá 3 lần, vui lòng liên hệ admin";
  }
  // 3️⃣ Kiểm tra validity
  else {
    const validFrom = data.valid_from;
    const validTo = data.valid_to || data.expires_at;
    
    if (validFrom && new Date(validFrom) > now) {
      resultStatus = "DENIED";
      errorMessage = "QR code chưa có hiệu lực";
    }
    else if (validTo && new Date(validTo) < now) {
      resultStatus = "DENIED";
      errorMessage = "QR code đã hết hạn";
    }
    else if (qrType === 'guest' && data.max_entries && data.used_entries >= data.max_entries) {
      resultStatus = "DENIED";
      errorMessage = "QR code đã được sử dụng hết số lần cho phép";
    }
  }
  
  // 🔴 GHI LOG DENIED VÀ THROW ERROR NGAY (KHÔNG TIẾP TỤC)
  if (resultStatus === "DENIED") {
    await repo.createAccessLog({
      qr_code_id: qrType === 'guest' ? qrCodeId : null,
      personal_qr_code_id: qrType === 'personal' ? qrCodeId : null,
      user_id: qrType === 'guest' ? data.host_user_id : data.user_id,
      scanned_by: scanData.scannedBy,
      building_id: buildingId,
      direction: scanData.direction || "IN",
      gate: scanData.gate || null,
      result: "DENIED",
      snapshot_visitor_name: data.visitor_name || data.user_name,
      snapshot_visitor_phone: data.visitor_phone || data.user_phone
    });
    // ✅ THROW ERROR NGAY, KHÔNG TIẾP TỤC XỬ LÝ
    throw new Error(errorMessage);
  }
  
  
  if (data.pin_code && data.pin_code !== null) {
    const baseResponse = {
      id: String(data.id),
      qrCode: data.qr_code,
      status: data.status,
      qrType: qrType,
      qrImage: "",
      requiresPin: true,
      pinFailedCount: data.pin_failed_count || 0,
      maxPinAttempts: 3,
      buildingId: buildingId,              // 👈 THÊM để verifyPin dùng
      scannedBy: scanData.scannedBy,       // 👈 THÊM để verifyPin dùng
      direction: scanData.direction || "IN", // 👈 THÊM để verifyPin dùng
      gate: scanData.gate || null          // 👈 THÊM để verifyPin dùng
    };
    
    if (qrType === 'guest') {
      return {
        ...baseResponse,
        hostName: data.host_name,
        visitorName: data.visitor_name,
        visitorPhone: data.visitor_phone,
        apartmentCode: data.apartment_code,
        validFrom: data.valid_from,
        validTo: data.valid_to,
        usedEntries: data.used_entries,
        maxEntries: data.max_entries
      };
    } else {
      return {
        ...baseResponse,
        userName: data.user_name,
        userPhone: data.user_phone || "",
        userEmail: data.user_email || "",
        apartmentCode: data.apartment_code,
        expiresAt: data.expires_at
      };
    }
  }
  
  // ========== KHÔNG CÓ PIN -> XỬ LÝ BÌNH THƯỜNG ==========
  
  // Xử lý guest QR - tăng used_entries
  if (qrType === 'guest' && data.max_entries) {
    await repo.incrementUsedEntries(data.id);
    const updatedData = await repo.getGuestQrById(data.id);
    data.used_entries = updatedData.used_entries;
  }
  
  // 🔴 GHI LOG SUCCESS (chỉ khi không yêu cầu PIN và không có lỗi)
  await repo.createAccessLog({
    qr_code_id: qrType === 'guest' ? qrCodeId : null,
    personal_qr_code_id: qrType === 'personal' ? qrCodeId : null,
    user_id: qrType === 'guest' ? data.host_user_id : data.user_id,
    scanned_by: scanData.scannedBy,
    building_id: buildingId,
    direction: scanData.direction || "IN",
    gate: scanData.gate || null,
    result: "SUCCESS",
    snapshot_visitor_name: data.visitor_name || data.user_name,
    snapshot_visitor_phone: data.visitor_phone || data.user_phone
  });

  const qrImage = await QRCode.toDataURL(qrCode);
  
  if (qrType === 'guest') {
    return {
      id: String(data.id),
      qrCode: data.qr_code,
      status: data.status,
      qrType: 'guest',
      qrImage: qrImage,
      hostName: data.host_name,
      visitorName: data.visitor_name,
      visitorPhone: data.visitor_phone,
      apartmentCode: data.apartment_code,
      usedEntries: data.used_entries,
      maxEntries: data.max_entries,
      remainingEntries: (data.max_entries || 0) - (data.used_entries || 0),
      validFrom: data.valid_from,
      validTo: data.valid_to
    };
  } else {
    return {
      id: String(data.id),
      qrCode: data.qr_code,
      status: data.status,
      qrType: 'personal',
      qrImage: qrImage,
      userName: data.user_name,
      userPhone: data.user_phone || "",
      userEmail: data.user_email || "",
      apartmentCode: data.apartment_code,
      expiresAt: data.expires_at
    };
  }
};

const verifyPin = async (qrCode, pinCode, scannedBy, scanMetadata = {}) => {
  // Thử tìm guest QR trước
  let data = await repo.scanQr(qrCode);
  let qrType = 'guest';
  
  if (!data) {
    data = await getPersonalQrByCode(qrCode);
    qrType = 'personal';
  }
  
  if (!data) {
    throw new Error("QR code không hợp lệ");
  }
  
  // 👉 THÊM: Kiểm tra QR có bị khóa do PIN không
  if (data.pin_locked === true) {
    throw new Error("QR đã bị khóa do nhập sai PIN quá 3 lần, vui lòng liên hệ admin");
  }
  
  // 👉 THÊM: Kiểm tra QR có bị REVOKED không
  if (data.status === 'REVOKED') {
    throw new Error("QR code đã bị thu hồi");
  }
  
  // 👉 THÊM: Kiểm tra QR có bị EXPIRED không
  const now = new Date();
  const validTo = data.valid_to || data.expires_at;
  const validFrom = data.valid_from;
  
  if (validFrom && new Date(validFrom) > now) {
    throw new Error("QR code chưa có hiệu lực");
  }
  
  if (validTo && new Date(validTo) < now) {
    throw new Error("QR code đã hết hạn");
  }
  
  // 👉 THÊM: Kiểm tra guest QR có hết lượt không
  if (qrType === 'guest' && data.max_entries && data.used_entries >= data.max_entries) {
    throw new Error("QR code đã được sử dụng hết số lần cho phép");
  }
  
  // Kiểm tra PIN
  if (pinCode !== data.pin_code) {
    // Tăng số lần sai
    const newFailedCount = (data.pin_failed_count || 0) + 1;
    
    if (newFailedCount >= 3) {
      if (qrType === 'guest') {
        await pool.query(
          `UPDATE guest_qr_codes SET pin_failed_count = $1, pin_locked = true WHERE id = $2`,
          [newFailedCount, data.id]
        );
      } else {
        await pool.query(
          `UPDATE qr_codes SET pin_failed_count = $1, pin_locked = true WHERE id = $2`,
          [newFailedCount, data.id]
        );
      }
    } else {
      if (qrType === 'guest') {
        await pool.query(
          `UPDATE guest_qr_codes SET pin_failed_count = $1 WHERE id = $2`,
          [newFailedCount, data.id]
        );
      } else {
        await pool.query(
          `UPDATE qr_codes SET pin_failed_count = $1 WHERE id = $2`,
          [newFailedCount, data.id]
        );
      }
    }
    
    // 🔴 GHI LOG NGAY KHI PIN THẤT BẠI
    const buildingId = scanMetadata.buildingId || await getBuildingIdByApartmentId(data.apartment_id);
    await repo.createAccessLog({
      qr_code_id: qrType === 'guest' ? data.id : null,
      personal_qr_code_id: qrType === 'personal' ? data.id : null,
      user_id: qrType === 'guest' ? data.host_user_id : data.user_id,
      scanned_by: scannedBy,
      building_id: buildingId,
      direction: scanMetadata.direction || "IN",
      gate: scanMetadata.gate || null,
      result: "PIN_FAILED",
      snapshot_visitor_name: data.visitor_name || data.user_name,
      snapshot_visitor_phone: data.visitor_phone || data.user_phone
    });
    
    const remaining = 3 - newFailedCount;
    const error = new Error(remaining > 0 ? `Mã PIN không chính xác, còn ${remaining} lần thử` : `Mã PIN không chính xác, bạn đã hết lượt thử. QR đã bị khóa.`);
    error.code = "INVALID_PIN";
    throw error;
  }
  
  // PIN đúng -> reset số lần sai
  if (qrType === 'guest') {
    await pool.query(
      `UPDATE guest_qr_codes SET pin_failed_count = 0, pin_locked = false WHERE id = $1`,
      [data.id]
    );
    
    // 👉 CHỈ CẬP NHẬT used_entries NẾU CÒN LƯỢT (đã kiểm tra ở trên)
    if (data.max_entries && data.used_entries < data.max_entries) {
      await repo.incrementUsedEntries(data.id);
      const updatedData = await repo.getGuestQrById(data.id);
      data.used_entries = updatedData.used_entries;
    }
  } else {
    await pool.query(
      `UPDATE qr_codes SET pin_failed_count = 0, pin_locked = false WHERE id = $1`,
      [data.id]
    );
  }
  
  // 🔴 GHI LOG SUCCESS KHI PIN ĐÚNG
  const buildingId = scanMetadata.buildingId || await getBuildingIdByApartmentId(data.apartment_id);
  await repo.createAccessLog({
    qr_code_id: qrType === 'guest' ? data.id : null,
    personal_qr_code_id: qrType === 'personal' ? data.id : null,
    user_id: qrType === 'guest' ? data.host_user_id : data.user_id,
    scanned_by: scannedBy,
    building_id: buildingId,
    direction: scanMetadata.direction || "IN",
    gate: scanMetadata.gate || null,
    result: "SUCCESS",
    snapshot_visitor_name: data.visitor_name || data.user_name,
    snapshot_visitor_phone: data.visitor_phone || data.user_phone
  });
  
  // Tạo QR image
  const qrImage = await QRCode.toDataURL(qrCode);
  
  // Trả về response theo từng loại
  if (qrType === 'guest') {
    return {
      success: true,
      message: "Door opened",
      qrData: {
        id: String(data.id),
        qrCode: data.qr_code,
        status: data.status,
        qrType: 'guest',
        qrImage: qrImage,
        hostName: data.host_name,
        visitorName: data.visitor_name,
        visitorPhone: data.visitor_phone,
        apartmentCode: data.apartment_code,
        usedEntries: data.used_entries,
        maxEntries: data.max_entries,
        remainingEntries: (data.max_entries || 0) - (data.used_entries || 0),
        validFrom: data.valid_from,
        validTo: data.valid_to
      }
    };
  } else {
    return {
      success: true,
      message: "Door opened",
      qrData: {
        id: String(data.id),
        qrCode: data.qr_code,
        status: data.status,
        qrType: 'personal',
        qrImage: qrImage,
        userName: data.user_name,
        userPhone: data.user_phone || "",
        userEmail: data.user_email || "",
        apartmentCode: data.apartment_code,
        expiresAt: data.expires_at
      }
    };
  }
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

  // 👉 SỬA: Tìm kiếm trên snapshot thay vì JOIN visitors
  if (search && search.trim()) {
    conditions.push(`(al.snapshot_visitor_name ILIKE $${paramIndex} OR al.snapshot_visitor_phone ILIKE $${paramIndex} OR u_full.full_name ILIKE $${paramIndex})`);
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

  const whereClause = conditions.length > 0 
    ? `WHERE ${conditions.join(' AND ')}` 
    : '';

  // 👉 SỬA: Dùng snapshot_visitor_name/phone từ access_logs, bỏ JOIN visitors
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
      CASE 
        WHEN al.qr_code_id IS NOT NULL THEN 'guest'
        ELSE 'personal'
      END AS qr_type,
      COALESCE(gq.qr_code, pq.qr_code) AS qr_code,
      gq.valid_from,
      COALESCE(gq.valid_to, pq.expires_at) AS valid_to,
      a.apartment_code,
      CASE 
        WHEN al.qr_code_id IS NOT NULL THEN creator.full_name
        ELSE 'Admin'
      END AS creator_name,
      guard.full_name AS scanned_by_name
    FROM access_logs al
    LEFT JOIN guest_qr_codes gq ON gq.id = al.qr_code_id
    LEFT JOIN qr_codes pq ON pq.id = al.personal_qr_code_id
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
    LEFT JOIN apartments a ON a.id = COALESCE(gq.apartment_id, pq.apartment_id)
    LEFT JOIN users u_full ON u_full.id = COALESCE(gq.host_user_id, pq.user_id)
    LEFT JOIN users creator ON creator.id = gq.host_user_id
    LEFT JOIN users guard ON guard.id = al.scanned_by
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

module.exports = { scanQr, verifyPin, getGuestQrHistory, getScanHistoryByGuard };