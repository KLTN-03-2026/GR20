const repo = require("./resident.repository");
const mapper = require("../common/qr.mapper");
const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");
const { pool } = require("../common/base.repository");


// ==================== GUEST QR SERVICES ====================


// Lấy danh sách guest QR của cư dân
const getMyGuestQrs = async (userId, queryParams = {}) => {
  const { page = 1, limit = 10, search = '', status = '' } = queryParams;
  
  const result = await repo.getMyGuestQrs(userId, {
    page: parseInt(page),
    limit: parseInt(limit),
    search: search,
    status: status
  });
  
  return {
    data: result.data,
    totalElements: result.total,
    totalPages: result.totalPages,
    page: result.page,
    pageSize: result.limit,
    size: result.data.length
  };
};

// Lấy chi tiết guest QR
const getMyGuestQrById = async (qrId, userId) => {
  const result = await repo.getMyGuestQrById(qrId, userId);
  if (!result) {
    throw new Error("QR không tồn tại hoặc không thuộc quyền của bạn");
  }
  return result;
};

// Cập nhật trạng thái guest QR
const updateMyGuestQrStatus = async (qrId, userId, status) => {
  const result = await repo.updateMyGuestQrStatus(qrId, userId, status);
  if (!result) {
    throw new Error("Không thể cập nhật trạng thái QR");
  }
  return result;
};

// Cập nhật thời hạn và thông tin guest QR
const updateMyGuestQrValidTo = async (
  qrId,
  userId,
  newValidTo,
  maxEntries,
  visitorName,
  visitorPhone,
  visitorIdCard,
  pinCode
) => {
  const result = await repo.updateMyGuestQrValidTo(
    qrId,
    userId,
    newValidTo,
    maxEntries,
    visitorName,
    visitorPhone,
    visitorIdCard,
    pinCode
  );
  return result;
};

// Lấy lịch sử quét của guest QR
const getMyGuestQrHistory = async (qrId, userId, queryParams = {}) => {
  const { page = 1, limit = 10, fromDate = null, toDate = null } = queryParams;
  
  // Format date nếu có
  let fromDateTime = fromDate;
  let toDateTime = toDate;
  
  if (fromDate && !fromDate.includes("T")) {
    fromDateTime = `${fromDate}T00:00:00`;
  }
  if (toDate && !toDate.includes("T")) {
    toDateTime = `${toDate}T23:59:59`;
  }
  
  const result = await repo.getMyGuestQrHistory(qrId, userId, {
    page: parseInt(page),
    limit: parseInt(limit),
    fromDate: fromDateTime,
    toDate: toDateTime
  });
  
  return {
    data: result.data,
    totalElements: result.totalElements,
    totalPages: result.totalPages,
    page: result.page,
    pageSize: result.pageSize,
    size: result.size
  };
};

// ==================== PERSONAL QR SERVICES ====================

// Lấy personal QR
const getPersonalQrByUserId = async (userId) => {
  const result = await repo.getPersonalQrByUserId(userId);
  if (!result) {
    throw new Error("Personal QR not found. Please contact admin.");
  }
  return result;
};

const getPersonalQrHistory = async (userId, options = {}) => {
  const {
    page = 1,
    limit = 10,
    result = null,
    search = null,
    fromDate = null,
    toDate = null
  } = options;
  
  // ✅ Đảm bảo page và limit là số nguyên
  const validPage = parseInt(page) || 1;
  const validLimit = parseInt(limit) || 10;
  
  const resultData = await repo.getPersonalQrHistory(userId, {
    page: validPage,
    limit: validLimit,
    result,
    search,
    fromDate,
    toDate
  });
  
  return {
    data: resultData.data,
    totalElements: resultData.total,
    totalPages: resultData.totalPages,
    page: resultData.page,
    pageSize: resultData.limit,
    size: resultData.data.length
  };
};

// Lấy apartment theo user
const getApartmentByUserId = async (userId) => {
  const result = await repo.getApartmentByUserId(userId);
  return result;
};

// ==================== ACCESS LOG SERVICES ====================

// Ghi log quét với snapshot
const recordAccessLog = async (scanData) => {
  return await repo.createAccessLogWithSnapshot(scanData);
};

module.exports = {
  // Guest QR
  getMyGuestQrs,
  getMyGuestQrById,
  updateMyGuestQrStatus,
  updateMyGuestQrValidTo,
  getMyGuestQrHistory,
  
  // Personal QR
  getPersonalQrByUserId,
  getPersonalQrHistory,
  getApartmentByUserId,
  
  // Access Log
  recordAccessLog
};