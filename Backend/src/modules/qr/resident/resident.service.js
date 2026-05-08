const repo = require("./resident.repository");
const mapper = require("../common/qr.mapper");
const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");
const { pool } = require("../common/base.repository");

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

const getGuestQrsByHost = async (hostUserId, queryParams = {}) => {
  const { limit, page, onlyValid, search, fromDate, toDate } = queryParams;

  const pageNum = page ? parseInt(page) : 1;
  const pageSize = limit ? parseInt(limit) : 10;
  const offset = (pageNum - 1) * pageSize;

  // ✅ Xử lý fromDate và toDate để lọc theo valid_to
  let fromDateTime = null;
  let toDateTime = null;

  if (fromDate) {
    fromDateTime = !fromDate.includes("T") ? `${fromDate}T00:00:00` : fromDate;
  }
  if (toDate) {
    toDateTime = !toDate.includes("T") ? `${toDate}T23:59:59` : toDate;
  }

  const result = await repo.getGuestQrsByHost(hostUserId, {
    limit: pageSize,
    offset: offset,
    onlyValid: onlyValid === "true",
    search: search || "",
    validFromDate: fromDateTime, // valid_to >= fromDate
    validToDate: toDateTime, // valid_to <= toDate
  });

  const mappedData = result.data.map(mapper.toGuestQrResponse);

  return {
    data: mappedData,
    size: mappedData.length,
    totalElements: result.total,
    totalPages: Math.ceil(result.total / pageSize),
    page: pageNum,
    pageSize: pageSize,
  };
};

const getApartmentByUserId = async (userId) => {
  return await repo.getApartmentByUserId(userId);
};

const createGuestQr = async (reqBody) => {
  // ✅ Đảm bảo hostUserId được truyền đúng
  const entity = mapper.toGuestQrEntity({
    hostUserId: reqBody.hostUserId, // Phải có giá trị
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
    if (
      updateData.visitorName !== undefined ||
      updateData.visitorPhone !== undefined ||
      updateData.visitorIdCard !== undefined
    ) {
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

const getGuestQrById = async (id) => {
  const data = await repo.getGuestQrById(id);
  if (!data) throw new Error("Guest QR not found");

  const qrImage = await QRCode.toDataURL(data.qr_code);
  return { ...mapper.toGuestQrResponse(data), qrImage };
};

const getPersonalQrHistory = async (userId, options) => {
  const { page = 1, limit = 10 } = options;
  return await repo.getPersonalQrHistory(userId, page, limit);
};

const getMyGuestQrs = async (userId, queryParams = {}) => {
  const { page = 1, limit = 10, search = "", status = "" } = queryParams;

  const result = await repo.getMyGuestQrs(userId, {
    page: parseInt(page),
    limit: parseInt(limit),
    search: search || "",
    status: status || "",
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

const getMyGuestQrById = async (qrId, userId) => {
  return await repo.getMyGuestQrById(qrId, userId);
};

const updateMyGuestQrStatus = async (qrId, userId, status) => {
  return await repo.updateMyGuestQrStatus(qrId, userId, status);
};

// const updateMyGuestQrValidTo = async (qrId, userId, newValidTo, maxEntries, visitorName, visitorPhone, visitorIdCard) => {
//   return await repo.updateMyGuestQrValidTo(qrId, userId, newValidTo, maxEntries, visitorName, visitorPhone, visitorIdCard);
// };
const updateMyGuestQrValidTo = async (
  qrId,
  userId,
  newValidTo,
  maxEntries,
  visitorName,
  visitorPhone,
  visitorIdCard,
) => {
  return await repo.updateMyGuestQrValidTo(
    qrId,
    userId,
    newValidTo,
    maxEntries,
    visitorName,
    visitorPhone,
    visitorIdCard,
  );
};

const getMyGuestQrHistory = async (qrId, userId, queryParams = {}) => {
  const { page = 1, limit = 10, fromDate = null, toDate = null } = queryParams;

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

module.exports = {
  getPersonalQrByUserId,
  getGuestQrsByHost,
  createGuestQr,
  updateGuestQr,
  deleteGuestQr,
  getGuestQrById,
  getApartmentByUserId,
  getPersonalQrHistory,
  getMyGuestQrs,
  getMyGuestQrById,
  updateMyGuestQrStatus,
  updateMyGuestQrValidTo,
  getMyGuestQrHistory,
};
