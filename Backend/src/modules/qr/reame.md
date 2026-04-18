const service = require("./qr.service");

const getPersonalQr = async (req, res) => {
try {
const data = await service.getPersonalQr(req.params.userId);
res.json({ operationType: "Success", message: "Get personal QR successfully", code: "OK", data, timestamp: new Date() });
} catch (err) {
res.status(404).json({ message: err.message });
}
};

const createGuestQr = async (req, res) => {
try {
const data = await service.createGuestQr(req.body);
res.status(201).json({ operationType: "Success", message: "Create guest QR successfully", code: "CREATED", data, timestamp: new Date() });
} catch (err) {
res.status(500).json({ message: err.message });
}
};

// ─── DANH SÁCH QR KHÁCH (Có lọc, phân trang, sắp xếp) ───────────────────────────────────
const getGuestQrsByHost = async (req, res) => {
try {
const { userId } = req.params;
const { limit, offset, onlyValid } = req.query;

    const data = await service.getGuestQrsByHost(userId, {
      limit,
      offset,
      onlyValid
    });

    res.json({
      operationType: "Success",
      message: "Get guest QR list successfully",
      code: "OK",
      data,
      timestamp: new Date()
    });

} catch (err) {
res.status(500).json({ message: err.message });
}
};

const getGuestQrById = async (req, res) => {
try {
const data = await service.getGuestQrById(req.params.id);
res.json({ operationType: "Success", message: "Get guest QR successfully", code: "OK", data, timestamp: new Date() });
} catch (err) {
res.status(404).json({ message: err.message });
}
};

// Trong qr.controller.js
const scanQr = async (req, res) => {
try {
const { direction, gate, building_id } = req.query;
const data = await service.scanQr(req.params.qrCode, {
direction,
gate,
building_id: building_id ? parseInt(building_id) : null
});
res.json({
operationType: "Success",
message: "QR hợp lệ",
code: "OK",
data,
timestamp: new Date()
});
} catch (err) {
res.status(400).json({ message: err.message });
}
};

const updateGuestQr = async (req, res) => {
try {
const data = await service.updateGuestQr(req.params.id, req.body);
res.json({ operationType: "Success", message: "Update guest QR successfully", code: "OK", data, timestamp: new Date() });
} catch (err) {
res.status(500).json({ message: err.message });
}
};

const deleteGuestQr = async (req, res) => {
try {
const data = await service.deleteGuestQr(req.params.id);
res.json({ operationType: "Success", message: "Delete guest QR successfully", code: "OK", data, timestamp: new Date() });
} catch (err) {
res.status(404).json({ message: err.message });
}
};

const getGuestQrHistory = async (req, res) => {
try {
const data = await service.getGuestQrHistory(req.params.userId);
res.json({ operationType: "Success", message: "Get QR history successfully", code: "OK", data, timestamp: new Date() });
} catch (err) {
res.status(500).json({ message: err.message });
}
};

module.exports = {
getPersonalQr,
createGuestQr,
getGuestQrsByHost,
getGuestQrById,
scanQr,
updateGuestQr,
deleteGuestQr,
getGuestQrHistory,
};
const toPersonalQrResponse = (row) => ({
id: row.id,
userId: row.user_id,
apartmentId: row.apartment_id,
qrCode: row.qr_code,
expiresAt: row.expires_at,
status: row.status,
createdAt: row.created_at,
});

const toGuestQrResponse = (row) => {
const now = new Date();
const validTo = new Date(row.valid_to);
const isValidDate = !isNaN(validTo.getTime());

// Xác định trạng thái hiển thị
let displayStatus = row.status;

// Nếu status là ACTIVE nhưng đã hết hạn -> chuyển thành EXPIRED
if (row.status === 'ACTIVE' && isValidDate && validTo < now) {
displayStatus = 'EXPIRED';
}

return {
id: row.id,
hostUserId: row.host_user_id,
hostName: row.host_name,
apartmentId: row.apartment_id,
apartmentCode: row.apartment_code,
visitor: {
name: row.visitor_name,
phone: row.visitor_phone,
idCard: row.visitor_id_card,
},
qrCode: row.qr_code,
validFrom: row.valid_from,
validTo: row.valid_to,
maxEntries: row.max_entries,
usedEntries: row.used_entries,
remainingEntries: row.max_entries - row.used_entries,
status: displayStatus, // ← Có thể là ACTIVE, EXPIRED, hoặc REVOKED
isExpired: displayStatus === 'EXPIRED',
isRevoked: displayStatus === 'REVOKED',
isActive: displayStatus === 'ACTIVE',
createdAt: row.created_at,
};
};

const toGuestQrEntity = (req) => ({
visitor: {
host_user_id: req.hostUserId,
name: req.visitorName,
phone: req.visitorPhone,
id_card: req.visitorIdCard,
},
guestQr: {
host_user_id: req.hostUserId,
apartment_id: req.apartmentId,
valid_from: req.validFrom,
valid_to: req.validTo,
max_entries: req.maxEntries || 1,
},
});

module.exports = { toPersonalQrResponse, toGuestQrResponse, toGuestQrEntity };
class QrCode {
constructor({ id, user_id, apartment_id, qr_code, expires_at, status, created_at }) {
this.id = id;
this.userId = user_id;
this.apartmentId = apartment_id;
this.qrCode = qr_code;
this.expiresAt = expires_at;
this.status = status;
this.createdAt = created_at;
}
}

class GuestQrCode {
constructor({ id, host_user_id, apartment_id, qr_code, valid_from, valid_to, max_entries, used_entries, status, created_at }) {
this.id = id;
this.hostUserId = host_user_id;
this.apartmentId = apartment_id;
this.qrCode = qr_code;
this.validFrom = valid_from;
this.validTo = valid_to;
this.maxEntries = max_entries;
this.usedEntries = used_entries;
this.status = status;
this.createdAt = created_at;
}
}

module.exports = { QrCode, GuestQrCode };
const { pool } = require("../../configs/database.config");

// ─── QR CÁ NHÂN ───────────────────────────────────────────
const getPersonalQr = async (userId) => {
const query = `SELECT * FROM qr_codes WHERE user_id = $1 AND status = 'ACTIVE' ORDER BY created_at DESC LIMIT 1`;
const result = await pool.query(query, [userId]);
return result.rows[0];
};

// ─── TẠO KHÁCH + QR KHÁCH ─────────────────────────────────
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

// ─── DANH SÁCH QR KHÁCH (Lấy tất cả trừ REVOKED) ───────────────────────────────────
const getGuestQrsByHost = async (hostUserId, options = {}) => {
const {
limit = 10,
offset = 0,
onlyValid = false // false: lấy hết (kể cả expired), true: chỉ lấy còn hiệu lực
} = options;

let conditions = [`gq.host_user_id = $1`];
let params = [hostUserId];
let paramIndex = 2;

// ✅ Chỉ lọc REVOKED - không hiển thị QR đã bị thu hồi
conditions.push(`gq.status != 'REVOKED'`);

// Nếu onlyValid = true thì chỉ lấy QR còn hiệu lực (chưa hết hạn)
if (onlyValid) {
conditions.push(`gq.valid_from <= NOW()`);
conditions.push(`gq.valid_to >= NOW()`);
conditions.push(`gq.status = 'ACTIVE'`);
}

const whereClause = conditions.length > 0
? `WHERE ${conditions.join(' AND ')}`
: '';

// Query lấy dữ liệu với phân trang
const dataQuery = `     SELECT 
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

// Query lấy tổng số
const countQuery = `     SELECT COUNT(*) as total
    FROM guest_qr_codes gq
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

// ─── CHI TIẾT QR KHÁCH ────────────────────────────────────
const getGuestQrById = async (id) => {
const query = `     SELECT 
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

// ─── QUÉT QR ──────────────────────────────────────────────
const scanQr = async (qrCode) => {
const query = `     SELECT 
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
    WHERE gq.qr_code = $1
  `;
const result = await pool.query(query, [qrCode]);
return result.rows[0];
};
// const scanQr = async (qrCode) => {
// const query = `//     SELECT 
//       gq.*,
//       v.name AS visitor_name,
//       v.phone AS visitor_phone,
//       v.id_card AS visitor_id_card,
//       a.apartment_code,
//       u.full_name AS host_name
//     FROM guest_qr_codes gq
//     LEFT JOIN visitors v ON v.id = gq.visitor_id
//     LEFT JOIN apartments a ON a.id = gq.apartment_id
//     LEFT JOIN users u ON u.id = gq.host_user_id
//     WHERE gq.qr_code = $1
//  `;
// const result = await pool.query(query, [qrCode]);
// return result.rows[0];
// };

// ─── SỬA QR KHÁCH ─────────────────────────────────────────
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

// ─── XÓA QR KHÁCH ─────────────────────────────────────────
const deleteGuestQr = async (id) => {
// const query = `UPDATE guest_qr_codes SET status = 'INACTIVE' WHERE id = $1 RETURNING id`;
// const result = await pool.query(query, [id]);
// return result.rows[0];

     const query = `UPDATE guest_qr_codes SET status = 'REVOKED' WHERE id = $1 RETURNING id`;

const result = await pool.query(query, [id]);
return result.rows[0];
};

// ─── LỊCH SỬ QR KHÁCH ─────────────────────────────────────
// const getGuestQrHistory = async (hostUserId) => {
// const query = `//     SELECT 
//       gq.*,
//       v.name AS visitor_name,
//       v.phone AS visitor_phone,
//       a.apartment_code,
//       u.full_name AS host_name,
//       al.scan_time,
//       al.direction,
//       al.gate,
//       al.result
//     FROM guest_qr_codes gq
//     LEFT JOIN visitors v ON v.id = gq.visitor_id
//     LEFT JOIN apartments a ON a.id = gq.apartment_id
//     LEFT JOIN users u ON u.id = gq.host_user_id
//     LEFT JOIN access_logs al ON al.qr_code_id = gq.id
//     WHERE gq.host_user_id = $1
//     ORDER BY gq.created_at DESC
//  `;
// const result = await pool.query(query, [hostUserId]);
// return result.rows;
// };

// ─── TẠO LOG KHI QUÉT QR ─────────────────────────────────────────
const createAccessLog = async (logData) => {
const query = `     INSERT INTO access_logs (qr_code_id, user_id, building_id, direction, gate, scan_time, result)
    VALUES ($1, $2, $3, $4, $5, NOW(), $6)
    RETURNING *
  `;
const result = await pool.query(query, [
logData.qr_code_id,
logData.user_id || null,
logData.building_id || null,
logData.direction || 'IN',
logData.gate || null,
logData.result || 'SUCCESS'
]);
return result.rows[0];
};

// ─── CẬP NHẬT SỐ LẦN ĐÃ DÙNG ─────────────────────────────────────────
const incrementUsedEntries = async (id) => {
const query = `     UPDATE guest_qr_codes 
    SET used_entries = used_entries + 1 
    WHERE id = $1 
    RETURNING *
  `;
const result = await pool.query(query, [id]);
return result.rows[0];
};

// ─── LẤY LỊCH SỬ QUÉT QR ─────────────────────────────────────────
const getGuestQrHistory = async (hostUserId) => {
const query = `     SELECT 
      gq.*,
      v.name AS visitor_name,
      v.phone AS visitor_phone,
      a.apartment_code,
      u.full_name AS host_name,
      al.scan_time,
      al.direction,
      al.gate,
      al.result
    FROM guest_qr_codes gq
    LEFT JOIN visitors v ON v.id = gq.visitor_id
    LEFT JOIN apartments a ON a.id = gq.apartment_id
    LEFT JOIN users u ON u.id = gq.host_user_id
    LEFT JOIN access_logs al ON al.qr_code_id = gq.id
    WHERE gq.host_user_id = $1
    ORDER BY al.scan_time DESC
  `;
const result = await pool.query(query, [hostUserId]);
return result.rows;
};

module.exports = {
getPersonalQr,
createGuestQr,
getGuestQrsByHost,
getGuestQrById,
scanQr,
updateGuestQr,
deleteGuestQr,
getGuestQrHistory,
createAccessLog, // ← Thêm
incrementUsedEntries
};

const express = require("express");
const router = express.Router();
const controller = require("./qr.controller");

router.get("/personal/:userId", controller.getPersonalQr);

router.post("/guest", controller.createGuestQr);
router.get("/guest/host/:userId", controller.getGuestQrsByHost);
router.get("/guest/history/:userId", controller.getGuestQrHistory);
router.get("/guest/scan/:qrCode", controller.scanQr);

router.get("/guest/:id", controller.getGuestQrById);
router.put("/guest/:id", controller.updateGuestQr);
router.delete("/guest/:id", controller.deleteGuestQr);

module.exports = router;

const repo = require("./qr.repository");
const mapper = require("./qr.mapper");
const QRCode = require("qrcode"); // ← thư viện generate QR
const { v4: uuidv4 } = require("uuid"); // ← tạo mã unique (có sẵn trong Node)
const cron = require('node-cron');
// const { pool } = require("../../configs/database.config");
const { pool } = require("../../configs/database.config.js");

cron.schedule('0 0 \* \* \*', async () => {
try {
const result = await pool.query(`       UPDATE guest_qr_codes 
      SET status = 'EXPIRED' 
      WHERE status = 'ACTIVE' 
        AND valid_to < NOW()
    `);
// QR codes updated
} catch (error) {
// Update error
}
});

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
// const data = await repo.scanQr(qrCode);
// if (!data) throw new Error("QR code không hợp lệ hoặc đã bị vô hiệu");

// const now = new Date();
// let result = "SUCCESS";
// let errorMessage = null;

// // Kiểm tra thời hạn
// if (data.valid_from && new Date(data.valid_from) > now) {
// result = "DENIED";
// errorMessage = "QR code chưa có hiệu lực";
// }
// else if (data.valid_to && new Date(data.valid_to) < now) {
// result = "DENIED";
// errorMessage = "QR code đã hết hạn";
// }
// else if (data.max_entries && data.used_entries >= data.max_entries) {
// result = "DENIED";
// errorMessage = "QR code đã được sử dụng hết số lần cho phép";
// }

// // Ghi log vào access_logs
// await repo.createAccessLog({
// qr_code_id: data.id,
// user_id: data.host_user_id,
// building_id: scanData.building_id || null,
// direction: scanData.direction || "IN",
// gate: scanData.gate || null,
// result: result
// });

// // Nếu có lỗi thì throw
// if (errorMessage) {
// throw new Error(errorMessage);
// }

// // Cập nhật số lần đã sử dụng
// if (data.max_entries > 0) {
// await repo.incrementUsedEntries(data.id);
// }

// // Tạo QR image
// const qrImage = await QRCode.toDataURL(data.qr_code);

// return { ...mapper.toGuestQrResponse(data), qrImage };
// };
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

// Ghi log vào access_logs (nếu có bảng)
if (repo.createAccessLog) {
await repo.createAccessLog({
qr_code_id: data.id,
user_id: data.host_user_id,
building_id: scanData.building_id || null,
direction: scanData.direction || "IN",
gate: scanData.gate || null,
result: result
});
}

// ✅ Nếu thành công, tăng used_entries lên 1
if (result === "SUCCESS") {
await repo.incrementUsedEntries(data.id);
// Lấy lại data mới sau khi cập nhật
const updatedData = await repo.getGuestQrById(data.id);
data.used_entries = updatedData.used_entries;
data.remaining_entries = data.max_entries - updatedData.used_entries;
}

// Nếu có lỗi thì throw
if (errorMessage) {
throw new Error(errorMessage);
}

// Tạo QR image
const qrImage = await QRCode.toDataURL(data.qr_code);

const response = mapper.toGuestQrResponse(data);
return { ...response, qrImage };
};

// const data = await repo.scanQr(qrCode);
// if (!data) throw new Error("QR code không hợp lệ hoặc đã bị vô hiệu");

// // Kiểm tra thời hạn
// const now = new Date();
// if (data.valid_from && new Date(data.valid_from) > now) {
// throw new Error("QR code chưa có hiệu lực");
// }
// if (data.valid_to && new Date(data.valid_to) < now) {
// throw new Error("QR code đã hết hạn");
// }

// // Kiểm tra số lần sử dụng
// if (data.max_entries && data.used_entries >= data.max_entries) {
// throw new Error("QR code đã được sử dụng hết số lần cho phép");
// }

// // ✅ THÊM DÒNG NÀY: Tạo QR image từ qrCode
// const qrImage = await QRCode.toDataURL(data.qr_code);

// // ✅ TRẢ VỀ có qrImage
// return { ...mapper.toGuestQrResponse(data), qrImage };
// };

// const scanQr = async (qrCode) => {
// // Tìm QR code trong database
// const data = await repo.scanQr(qrCode);

// if (!data) {
// throw new Error("QR code không tồn tại hoặc đã bị vô hiệu");
// }

// // Kiểm tra trạng thái
// if (data.status !== 'ACTIVE') {
// throw new Error("QR code đã bị vô hiệu hóa");
// }

// // Kiểm tra thời gian hiệu lực
// const now = new Date();
// const validFrom = new Date(data.valid_from);
// const validTo = new Date(data.valid_to);

// if (validFrom > now) {
// throw new Error(`QR code chưa có hiệu lực. Bắt đầu từ: ${validFrom.toLocaleString()}`);
// }

// if (validTo < now) {
// throw new Error(`QR code đã hết hạn. Hết hạn lúc: ${validTo.toLocaleString()}`);
// }

// // Kiểm tra số lần sử dụng
// if (data.max_entries && data.used_entries >= data.max_entries) {
// throw new Error(`QR code đã được sử dụng hết ${data.max_entries}/${data.max_entries} lần`);
// }

// // (Tùy chọn) Cập nhật số lần đã sử dụng
// // await repo.incrementUsedEntries(data.id);

// return mapper.toGuestQrResponse(data);
// };

// ─── QR KHÁCH ─────────────────────────────────────────────

// const createGuestQr = async (reqBody) => {
// const entity = mapper.toGuestQrEntity(reqBody);

// // Tạo mã QR unique
// const qrString = `GUEST_${uuidv4()}`;
// entity.qr_code = qrString;

// const result = await repo.createGuestQr(entity);

// // Generate ảnh QR
// const qrImage = await QRCode.toDataURL(qrString);

// return { ...mapper.toGuestQrResponse(result), qrImage };
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
// const entity = mapper.toGuestQrEntity(reqBody);

// // Tạo mã code unique
// const code = `GUEST_${uuidv4()}`;

// // QR chứa URL → quét ra mở trình duyệt
// const qrString = `https://homelink.ai/scan/${code}`;

// entity.guestQr.qr_code = code; // lưu code vào DB

// const result = await repo.createGuestQr(entity);

// // Generate ảnh QR chứa URL
// const qrImage = await QRCode.toDataURL(qrString);

// return { ...mapper.toGuestQrResponse(result.guestQr), qrImage };
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
onlyValid: onlyValid === 'true' // Chỉ lọc khi onlyValid=true
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
// const { limit, offset, status, onlyValid } = queryParams;

// const result = await repo.getGuestQrsByHost(hostUserId, {
// limit: limit ? parseInt(limit) : 10,
// offset: offset ? parseInt(offset) : 0,
// status: status || 'ACTIVE',
// onlyValid: onlyValid !== 'false'
// });

// // Map dữ liệu
// const mappedData = result.data.map(mapper.toGuestQrResponse);

// // Trả về đúng structure
// return {
// total: result.total,
// limit: result.limit,
// offset: result.offset,
// data: mappedData
// };
// };

// const getGuestQrsByHost = async (hostUserId) => {
// const data = await repo.getGuestQrsByHost(hostUserId);
// return data.map(mapper.toGuestQrResponse);
// };

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
