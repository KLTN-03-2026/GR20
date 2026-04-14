const repo = require("./qr.repository");
const mapper = require("./qr.mapper");
const QRCode = require("qrcode");        // ← thư viện generate QR
const { v4: uuidv4 } = require("uuid"); // ← tạo mã unique (có sẵn trong Node)

// ─── QR CÁ NHÂN ───────────────────────────────────────────

const getPersonalQr = async (userId) => {
  const data = await repo.getPersonalQr(userId);
  if (!data) throw new Error("Personal QR not found");

  // Generate ảnh QR từ mã
  const qrImage = await QRCode.toDataURL(data.qr_code);

  return { ...mapper.toPersonalQrResponse(data), qrImage };
};


// Thêm hàm này vào file qr.service.js (đặt sau hàm deleteGuestQr)

const scanQr = async (qrCode) => {
  const data = await repo.scanQr(qrCode);
  if (!data) throw new Error("QR code không hợp lệ hoặc đã bị vô hiệu");
  
  // Kiểm tra thời hạn
  const now = new Date();
  if (data.valid_from && new Date(data.valid_from) > now) {
    throw new Error("QR code chưa có hiệu lực");
  }
  if (data.valid_to && new Date(data.valid_to) < now) {
    throw new Error("QR code đã hết hạn");
  }
  
  // Kiểm tra số lần sử dụng
  if (data.max_entries && data.used_entries >= data.max_entries) {
    throw new Error("QR code đã được sử dụng hết số lần cho phép");
  }
  
  // ✅ THÊM DÒNG NÀY: Tạo QR image từ qrCode
  const qrImage = await QRCode.toDataURL(data.qr_code);
  
  // ✅ TRẢ VỀ có qrImage
  return { ...mapper.toGuestQrResponse(data), qrImage };
};

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

const createGuestQr = async (reqBody) => {
  const entity = mapper.toGuestQrEntity(reqBody);

  const code = `GUEST_${uuidv4()}`;
  const qrString = `http://localhost:8000/api/qr/scan/${code}`;
  entity.guestQr.qr_code = code;

  const result = await repo.createGuestQr(entity);

  // ← Sau khi tạo xong, query lại để có đủ thông tin join
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

const getGuestQrsByHost = async (hostUserId) => {
  const data = await repo.getGuestQrsByHost(hostUserId);
  return data.map(mapper.toGuestQrResponse);
};

const updateGuestQr = async (id, reqBody) => {
  const entity = {
    valid_from: reqBody.validFrom,
    valid_to: reqBody.validTo,
    max_entries: reqBody.maxEntries,
    status: reqBody.status,
  };

  const updated = await repo.updateGuestQr(id, entity);
  if (!updated) throw new Error("Update failed");

  return mapper.toGuestQrResponse(updated);
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

module.exports = {
  getPersonalQr,
  createGuestQr,
  getGuestQrById,
  getGuestQrsByHost,
  updateGuestQr,
  deleteGuestQr,
  getGuestQrHistory,
  scanQr
};