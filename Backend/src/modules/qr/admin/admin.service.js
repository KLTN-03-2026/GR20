const repo = require("../admin/admin.repository");
const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");
const { pool } = require("../../../configs/database.config");
const mapper = require("../common/qr.mapper");
const { buildingIdsFromUser } = require("../../../common/building-scope");

// Kiểm tra user có thuộc căn hộ không
const checkUserBelongsToApartment = async (userId, apartmentId) => {
  const query = `
    SELECT 1 FROM resident_profiles 
    WHERE user_id = $1 AND apartment_id = $2 AND status = 'ACTIVE'
    UNION
    SELECT 1 FROM apartments 
    WHERE owner_user_id = $1 AND id = $2
    LIMIT 1
  `;
  const result = await pool.query(query, [userId, apartmentId]);
  return result.rows.length > 0;
};

const getAllPersonalQrs = async (queryParams = {}, currentUser) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    status = "",
    hasQrOnly = false,
  } = queryParams;

  const result = await repo.getAllPersonalQrs(
    {
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      status,
      hasQrOnly: hasQrOnly === "true",
    },
    currentUser, // 👈 PASS DOWN
  );

  return {
    data: result.data,
    size: result.data.length,
    totalElements: result.total,
    totalPages: result.totalPages,
    page: result.page,
    pageSize: result.limit,
  };
};

// const createPersonalQr = async (data) => {
//   const isValid = await checkUserBelongsToApartment(
//     data.userId,
//     data.apartmentId,
//   );

//   if (!isValid) {
//     throw new Error("User does not belong to this apartment");
//   }

//   const query = `
//     INSERT INTO qr_codes (user_id, apartment_id, qr_code, expires_at, status)
//     VALUES ($1, $2, $3, $4, 'ACTIVE')
//     RETURNING *
//   `;
//   const result = await pool.query(query, [
//     data.userId,
//     data.apartmentId,
//     data.qrCode,
//     data.expiresAt,
//   ]);
//   return result.rows[0];
// };

const createPersonalQr = async (data) => {
  const isValid = await checkUserBelongsToApartment(data.userId, data.apartmentId);

  if (!isValid) {
    throw new Error("User does not belong to this apartment");
  }

  const query = `
    INSERT INTO qr_codes (user_id, apartment_id, qr_code, expires_at, status, pin_code, pin_failed_count, pin_locked)
    VALUES ($1, $2, $3, $4, 'ACTIVE', $5, 0, false)
    RETURNING *
  `;
  const result = await pool.query(query, [
    data.userId,
    data.apartmentId,
    data.qrCode,
    data.expiresAt,
    data.pinCode  // 👈 Thêm PIN
  ]);
  
  return result.rows[0];
};


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

// const updatePersonalQr = async (id, updateData) => {
//   const fields = [];
//   const values = [];
//   let idx = 1;

//   if (updateData.status !== undefined) {
//     fields.push(`status = $${idx++}`);
//     values.push(updateData.status);
//   }
//   if (updateData.expiresAt !== undefined) {
//     fields.push(`expires_at = $${idx++}`);
//     values.push(updateData.expiresAt);
//   }
//   if (updateData.apartmentId !== undefined) {
//     fields.push(`apartment_id = $${idx++}`);
//     values.push(updateData.apartmentId);
//   }

//    if (updateData.pin_code !== undefined) {
//     fields.push(`pin_code = $${idx++}`);
//     values.push(updateData.pin_code);
//   }

//   if (fields.length === 0) {
//     throw new Error("No fields to update");
//   }

//   values.push(id);
//   const query = `
//     UPDATE qr_codes 
//     SET ${fields.join(", ")} 
//     WHERE id = $${idx}
//     RETURNING *
//   `;
//   const result = await pool.query(query, values);

//   if (result.rows.length === 0) {
//     throw new Error("Personal QR not found");
//   }

//   return result.rows[0];
// };

// Trong admin.service.js - updatePersonalQr
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
  if (updateData.pin_code !== undefined) {
    fields.push(`pin_code = $${idx++}`);
    values.push(updateData.pin_code);
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

  if (result.rows.length === 0) {
    throw new Error("Personal QR not found");
  }

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

const getResidentAccessHistory = async (userId, queryParams = {}) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    result = "",
    fromDate = null,
    toDate = null,
  } = queryParams;

  let fromDateTime = fromDate;
  let toDateTime = toDate;

  if (fromDate && !fromDate.includes("T")) {
    fromDateTime = `${fromDate}T00:00:00`;
  }
  if (toDate && !toDate.includes("T")) {
    toDateTime = `${toDate}T23:59:59`;
  }

  const resultData = await repo.getResidentAccessHistory(userId, {
    page: parseInt(page),
    limit: parseInt(limit),
    search: search || "",
    result: result || "",
    fromDate: fromDateTime || null,
    toDate: toDateTime || null,
  });

  return {
    data: resultData.data,
    size: resultData.data.length,
    totalElements: resultData.total,
    totalPages: resultData.totalPages,
    page: resultData.page,
    pageSize: resultData.limit,
  };
};

// const getAllResidentAccessHistory = async (queryParams = {}) => {
//   const {
//     page = 1,
//     limit = 10,
//     search = "",
//     result = "",
//     fromDate = null,
//     toDate = null,
//   } = queryParams;

//   let fromDateTime = fromDate;
//   let toDateTime = toDate;

//   if (fromDate && !fromDate.includes("T")) {
//     fromDateTime = `${fromDate}T00:00:00`;
//   }
//   if (toDate && !toDate.includes("T")) {
//     toDateTime = `${toDate}T23:59:59`;
//   }

//   const resultData = await repo.getAllResidentAccessHistory({
//     page: parseInt(page),
//     limit: parseInt(limit),
//     search: search || "",
//     result: result || "",
//     fromDate: fromDateTime,
//     toDate: toDateTime,
//   });

//   return {
//     data: resultData.data,
//     size: resultData.data.length,
//     totalElements: resultData.total,
//     totalPages: resultData.totalPages,
//     page: resultData.page,
//     pageSize: resultData.limit,
//   };
// };

const getAllResidentAccessHistory = async (queryParams = {}) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    result = "",
    fromDate = null,
    toDate = null,
  } = queryParams;

  let fromDateTime = fromDate;
  let toDateTime = toDate;

  if (fromDate && !fromDate.includes("T")) {
    fromDateTime = `${fromDate}T00:00:00`;
  }
  if (toDate && !toDate.includes("T")) {
    toDateTime = `${toDate}T23:59:59`;
  }

  const resultData = await repo.getAllResidentAccessHistory({
    page: parseInt(page),
    limit: parseInt(limit),
    search: search || "",
    result: result || "",
    fromDate: fromDateTime,
    toDate: toDateTime,
  });

  return {
    data: resultData.data,
    size: resultData.data.length,
    totalElements: resultData.total,
    totalPages: resultData.totalPages,
    page: resultData.page,
    pageSize: resultData.limit,
  };
};

const createGuestQr = async (data) => {
  // KIỂM TRA: user có thuộc căn hộ không?
  const isValid = await checkUserBelongsToApartment(data.hostUserId, data.apartmentId);

  if (!isValid) {
    throw new Error("User does not belong to this apartment");
  }

  // Tạo mã QR duy nhất
  const qrCodeValue = `GUEST_${uuidv4()}`;

  const result = await repo.createGuestQr({
    hostUserId: data.hostUserId,
    apartmentId: data.apartmentId,
    qrCode: qrCodeValue,
    validFrom: data.validFrom,
    validTo: data.validTo,
    maxEntries: data.maxEntries || 1,
    status: data.status || "ACTIVE",
    visitorName: data.visitorName,
    visitorPhone: data.visitorPhone,
    visitorIdCard: data.visitorIdCard,
    pinCode: data.pinCode,  // 👈 Thêm PIN
    adminValidToOriginal: data.adminValidToOriginal,
  });

  const qrImage = await repo.generateQrCodeImage(qrCodeValue);

  return {
    ...result,
    qr_image: qrImage,
  };
};
const getGuestQrById = async (id) => {
  return await repo.getGuestQrById(id);
};

const updateGuestQr = async (id, updateData) => {
  return await repo.updateGuestQr(id, updateData);
};

const deleteGuestQr = async (id) => {
  return await repo.deleteGuestQr(id);
};

// ==================== GUEST QR HISTORY SERVICES ====================

const getGuestQrHistory = async (guestQrId, queryParams = {}) => {
  const { page = 1, limit = 10, fromDate = null, toDate = null } = queryParams;

  let fromDateTime = fromDate;
  let toDateTime = toDate;

  if (fromDate && !fromDate.includes("T")) {
    fromDateTime = `${fromDate}T00:00:00`;
  }
  if (toDate && !toDate.includes("T")) {
    toDateTime = `${toDate}T23:59:59`;
  }

  const result = await repo.getGuestQrHistory(guestQrId, {
    page: parseInt(page),
    limit: parseInt(limit),
    fromDate: fromDateTime,
    toDate: toDateTime,
  });

  return {
    data: result.data,
    size: result.size,
    totalElements: result.totalElements,
    totalPages: result.totalPages,
    page: result.page,
    pageSize: result.pageSize,
  };
};


const getAllResidents = async (queryParams = {}) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    apartmentId = "",
    hasQrOnly = false,
    noQrOnly = false,
  } = queryParams;

  const result = await repo.getAllResidents({
    page: parseInt(page),
    limit: parseInt(limit),
    search: search || "",
    apartmentId: apartmentId || "",
    hasQrOnly: hasQrOnly === "true",
    noQrOnly: noQrOnly === "true",
  });

  return {
    data: result.data,
    size: result.data.length,
    totalElements: result.total,
    totalPages: result.totalPages,
    page: result.page,
    pageSize: result.limit,
  };
};

const getAllGuestQrs = async (queryParams = {}) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    status = "",
    // ❌ XÓA apartmentId
  } = queryParams;

  const result = await repo.getAllGuestQrs({
    page: parseInt(page),
    limit: parseInt(limit),
    search: search || "",
    status: status || "",
    // ❌ XÓA apartmentId
  });

  return {
    data: result.data,
    size: result.data.length,
    totalElements: result.total,
    totalPages: result.totalPages,
    page: result.page,
    pageSize: result.limit,
  };
};
module.exports = {
  getAllPersonalQrs,
  createPersonalQr,
  updatePersonalQr,
  getPersonalQrById,
  revokePersonalQr,
  getResidentAccessHistory,
  getAllResidentAccessHistory,
  getAllGuestQrs,
  createGuestQr,
  getGuestQrById,
  updateGuestQr,
  deleteGuestQr,
  getGuestQrHistory,
  getAllResidents,
  // getGuestQrById
};
