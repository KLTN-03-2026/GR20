// const service = require("../admin/admin.service");
// const QRCode = require("qrcode");
// const { v4: uuidv4 } = require("uuid");

// // ==================== ADMIN: PERSONAL QR ====================

// // Tạo personal QR cho cư dân (ADMIN)
// const createPersonalQr = async (req, res) => {
//   try {
//     if (req.user.role !== 'ADMIN') {
//       return res.status(403).json({ message: 'Forbidden: Only admin can create personal QR' });
//     }

//     const { userId, apartmentId, expiresAt } = req.body;

//     if (!userId) {
//       return res.status(400).json({ message: 'Missing required field: userId' });
//     }

//     const qrCodeValue = `PERSONAL_${uuidv4()}`;

//     const data = await service.createPersonalQr({
//       userId,
//       apartmentId,
//       qrCode: qrCodeValue,
//       expiresAt: expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
//       createdBy: req.user.id
//     });

//     res.status(201).json({
//       operationType: "Success",
//       message: "Personal QR created successfully",
//       code: "CREATED",
//       data,
//       timestamp: new Date()
//     });
//   } catch (err) {
//     console.error('Error:', err);
//     res.status(500).json({ message: err.message });
//   }
// };

// // Lấy danh sách tất cả personal QR (ADMIN)
// const getAllPersonalQrs = async (req, res) => {
//   try {
//     if (req.user.role !== 'ADMIN') {
//       return res.status(403).json({ message: 'Forbidden: Only admin can access' });
//     }

//     const { page, limit, search, status, hasQrOnly } = req.query;

//     const data = await service.getAllPersonalQrs({
//       page: page || 1,
//       limit: limit || 10,
//       search: search || '',
//       status: status || '',
//       hasQrOnly: hasQrOnly || false
//     });

//     res.json({
//       operationType: "Success",
//       message: "Get all personal QRs successfully",
//       code: "OK",
//       data: data.data,
//       size: data.size,
//       totalElements: data.totalElements,
//       totalPages: data.totalPages,
//       page: data.page,
//       pageSize: data.pageSize,
//       timestamp: new Date()
//     });
//   } catch (err) {
//     console.error('Error:', err);
//     res.status(500).json({ message: err.message });
//   }
// };

// // Cập nhật personal QR (ADMIN)
// const updatePersonalQr = async (req, res) => {
//   try {
//     if (req.user.role !== 'ADMIN') {
//       return res.status(403).json({
//         message: 'Forbidden: Only admin can update personal QR'
//       });
//     }

//     const { id } = req.params;
//     const { status, expiresAt, apartmentId } = req.body;

//     const existingQr = await service.getPersonalQrById(id);
//     if (!existingQr) {
//       return res.status(404).json({ message: 'Personal QR not found' });
//     }

//     const data = await service.updatePersonalQr(id, {
//       status,
//       expiresAt,
//       apartmentId
//     });

//     res.json({
//       operationType: "Success",
//       message: "Update personal QR successfully",
//       code: "OK",
//       data,
//       timestamp: new Date()
//     });
//   } catch (err) {
//     console.error('Error:', err);
//     res.status(500).json({ message: err.message });
//   }
// };

// // Thu hồi personal QR (ADMIN)
// const revokePersonalQr = async (req, res) => {
//   try {
//     if (req.user.role !== 'ADMIN') {
//       return res.status(403).json({ message: 'Forbidden: Only admin can revoke personal QR' });
//     }

//     const { id } = req.params;

//     const data = await service.revokePersonalQr(id);

//     res.json({
//       operationType: "Success",
//       message: "Personal QR revoked successfully",
//       code: "OK",
//       data,
//       timestamp: new Date()
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ==================== ADMIN: ACCESS HISTORY ====================

// // Lấy lịch sử ra vào của cư dân theo user_id (ADMIN)
// const getResidentAccessHistory = async (req, res) => {
//   try {
//     if (req.user.role !== 'ADMIN') {
//       return res.status(403).json({ message: 'Forbidden: Only admin can access' });
//     }

//     const { userId } = req.params;
//     const { page, limit, search, result, fromDate, toDate } = req.query;

//     const data = await service.getResidentAccessHistory(userId, {
//       page: page || 1,
//       limit: limit || 10,
//       search: search || '',
//       result: result || '',
//       fromDate: fromDate || null,
//       toDate: toDate || null
//     });

//     res.json({
//       operationType: "Success",
//       message: "Get resident access history successfully",
//       code: "OK",
//       data: data.data,
//       size: data.size,
//       totalElements: data.totalElements,
//       totalPages: data.totalPages,
//       page: data.page,
//       pageSize: data.pageSize,
//       timestamp: new Date()
//     });
//   } catch (err) {
//     console.error('Error:', err);
//     res.status(500).json({ message: err.message });
//   }
// };

// // Lấy lịch sử quét của tất cả cư dân (ADMIN)
// const getAllResidentAccessHistory = async (req, res) => {
//   try {
//     if (req.user.role !== 'ADMIN') {
//       return res.status(403).json({ message: 'Forbidden: Only admin can access' });
//     }

//     const { page, limit, search, result, fromDate, toDate } = req.query;

//     const data = await service.getAllResidentAccessHistory({
//       page: page || 1,
//       limit: limit || 10,
//       search: search || '',
//       result: result || '',
//       fromDate: fromDate || null,
//       toDate: toDate || null
//     });

//     res.json({
//       operationType: "Success",
//       message: "Get all resident access history successfully",
//       code: "OK",
//       data: data.data,
//       size: data.size,
//       totalElements: data.totalElements,
//       totalPages: data.totalPages,
//       page: data.page,
//       pageSize: data.pageSize,
//       timestamp: new Date()
//     });
//   } catch (err) {
//     console.error('Error:', err);
//     res.status(500).json({ message: err.message });
//   }
// };

// module.exports = {
//   createPersonalQr,
//   getAllPersonalQrs,
//   updatePersonalQr,
//   revokePersonalQr,
//   getResidentAccessHistory,
//   getAllResidentAccessHistory
// };

const service = require("../admin/admin.service");
// const service = require("../admin/admin.service");
// const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");

// Lấy danh sách personal QR
const getAllPersonalQrs = async (req, res) => {
  try {
    const { page, limit, search, status, hasQrOnly } = req.query;

    const data = await service.getAllPersonalQrs(
      {
        page,
        limit,
        search,
        status,
        hasQrOnly,
      },
      req.user, // 👈 QUAN TRỌNG
    );

    res.json({
      operationType: "Success",
      message: "Get all personal QRs successfully",
      code: "OK",
      data: data.data,
      size: data.size,
      totalElements: data.totalElements,
      totalPages: data.totalPages,
      page: data.page,
      pageSize: data.pageSize,
      timestamp: new Date(),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Tạo personal QR
const createPersonalQr = async (req, res) => {
  try {
    // Chỉ ADMIN mới được tạo
    if (req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "Forbidden: Only admin can create personal QR" });
    }

    const { userId, apartmentId, expiresAt } = req.body;

    // Tạo mã QR duy nhất
    const qrCodeValue = `PERSONAL_${uuidv4()}`;

    const data = await service.createPersonalQr({
      userId,
      apartmentId,
      qrCode: qrCodeValue,
      expiresAt: expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      createdBy: req.user.id,
    });

    res.status(201).json({
      operationType: "Success",
      message: "Personal QR created successfully",
      code: "CREATED",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Cập nhật personal QR
const updatePersonalQr = async (req, res) => {
  try {
    // Kiểm tra role ADMIN
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Forbidden: Only admin can update personal QR",
      });
    }

    const { id } = req.params;
    const { status, expiresAt, apartmentId } = req.body;

    // Kiểm tra QR tồn tại
    const existingQr = await service.getPersonalQrById(id);
    if (!existingQr) {
      return res.status(404).json({ message: "Personal QR not found" });
    }

    const data = await service.updatePersonalQr(id, {
      status,
      expiresAt,
      apartmentId,
    });

    res.json({
      operationType: "Success",
      message: "Update personal QR successfully",
      code: "OK",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Thu hồi personal QR
const revokePersonalQr = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "Forbidden: Only admin can revoke personal QR" });
    }

    const { id } = req.params;

    const data = await service.revokePersonalQr(id);

    res.json({
      operationType: "Success",
      message: "Personal QR revoked successfully",
      code: "OK",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy lịch sử quét theo cư dân

const getResidentAccessHistory = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "Forbidden: Only admin can access" });
    }

    const { userId } = req.params;
    const { page, limit, search, result, fromDate, toDate } = req.query;

    const data = await service.getResidentAccessHistory(userId, {
      page: page || 1,
      limit: limit || 10,
      search: search || "",
      result: result || "",
      fromDate: fromDate || null,
      toDate: toDate || null,
    });

    res.json({
      operationType: "Success",
      message: "Get resident access history successfully",
      code: "OK",
      data: data.data,
      size: data.size,
      totalElements: data.totalElements,
      totalPages: data.totalPages,
      page: data.page,
      pageSize: data.pageSize,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// // Lấy tất cả lịch sử ra vào

const getAllResidentAccessHistory = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "Forbidden: Only admin can access" });
    }

    const { page, limit, search, result, fromDate, toDate } = req.query;

    const data = await service.getAllResidentAccessHistory({
      page: page || 1,
      limit: limit || 10,
      search: search || "",
      result: result || "",
      fromDate: fromDate || null,
      toDate: toDate || null,
    });

    res.json({
      operationType: "Success",
      message: "Get all resident access history successfully",
      code: "OK",
      data: data.data,
      size: data.size,
      totalElements: data.totalElements,
      totalPages: data.totalPages,
      page: data.page,
      pageSize: data.pageSize,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ==================== GUEST QR CONTROLLERS ====================

// Lấy lịch sử quét của guest QR

const getGuestQrHistory = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "Forbidden: Only admin can access" });
    }

    const { id } = req.params;
    const { page, limit, fromDate, toDate, search } = req.query;

    const existingGuestQr = await service.getGuestQrById(id);
    if (!existingGuestQr) {
      return res.status(404).json({ message: "Guest QR not found" });
    }

    const data = await service.getGuestQrHistory(id, {
      page: page || 1,
      limit: limit || 10,
      fromDate: fromDate || null,
      toDate: toDate || null,
      search: search || "",
    });

    res.json({
      operationType: "Success",
      message: "Get guest QR history successfully",
      code: "OK",
      data: data.data,
      size: data.size,
      totalElements: data.totalElements,
      totalPages: data.totalPages,
      page: data.page,
      pageSize: data.pageSize,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: err.message });
  }
};

const createGuestQr = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "Forbidden: Only admin can create guest QR" });
    }

    const {
      hostUserId,
      apartmentId,
      validFrom,
      validTo,
      maxEntries,
      status,
      visitorName,
      visitorPhone,
      visitorIdCard,
      visitorId,
      adminValidToOriginal, // 👈 Thêm trường này
    } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!hostUserId || !apartmentId || !validTo) {
      return res.status(400).json({
        message: "Missing required fields: hostUserId, apartmentId, validTo",
      });
    }

    const data = await service.createGuestQr({
      hostUserId,
      apartmentId,
      validFrom: validFrom || new Date(),
      validTo,
      maxEntries: maxEntries || 1,
      status: status || "ACTIVE",
      visitorName,
      visitorPhone,
      visitorIdCard,
      visitorId,
      adminValidToOriginal: adminValidToOriginal || validTo, // 👈 Lưu original date
    });

    res.status(201).json({
      operationType: "Success",
      message: "Guest QR created successfully",
      code: "CREATED",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: err.message });
  }
};
// Cập nhật guest QR
// const updateGuestQr = async (req, res) => {
//   try {
//     if (req.user.role !== 'ADMIN') {
//       return res.status(403).json({ message: 'Forbidden: Only admin can update guest QR' });
//     }

//     const { id } = req.params;
//     const {
//       validFrom,
//       validTo,
//       maxEntries,
//       status,
//       apartmentId,
//       hostUserId,
//       visitorName,      // 👈 THÊM
//       visitorPhone,     // 👈 THÊM
//       visitorIdCard     // 👈 THÊM
//     } = req.body;

//     const existingQr = await service.getGuestQrById(id);
//     if (!existingQr) {
//       return res.status(404).json({ message: 'Guest QR not found' });
//     }

//     const data = await service.updateGuestQr(id, {
//       validFrom,
//       validTo,
//       maxEntries,
//       status,
//       apartmentId,
//       hostUserId,
//       visitorName,      // 👈 THÊM
//       visitorPhone,     // 👈 THÊM
//       visitorIdCard     // 👈 THÊM
//     });

//     res.json({
//       operationType: "Success",
//       message: "Guest QR updated successfully",
//       code: "OK",
//       data,
//       timestamp: new Date()
//     });
//   } catch (err) {
//     console.error('Error:', err);
//     res.status(500).json({ message: err.message });
//   }
// };

const updateGuestQr = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "Forbidden: Only admin can update guest QR" });
    }

    const { id } = req.params;
    const {
      validFrom,
      validTo,
      maxEntries,
      status,
      apartmentId,
      hostUserId,
      visitorName,
      visitorPhone,
      visitorIdCard,
      adminValidToOriginal, // 👈 THÊM trường này
    } = req.body;

    const existingQr = await service.getGuestQrById(id);
    if (!existingQr) {
      return res.status(404).json({ message: "Guest QR not found" });
    }

    const data = await service.updateGuestQr(id, {
      validFrom,
      validTo,
      maxEntries,
      status,
      apartmentId,
      hostUserId,
      visitorName,
      visitorPhone,
      visitorIdCard,
      adminValidToOriginal, // 👈 TRUYỀN xuống service
    });

    res.json({
      operationType: "Success",
      message: "Guest QR updated successfully",
      code: "OK",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Xóa guest QR (soft delete)
const deleteGuestQr = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "Forbidden: Only admin can delete guest QR" });
    }

    const { id } = req.params;

    const existingQr = await service.getGuestQrById(id);
    if (!existingQr) {
      return res.status(404).json({ message: "Guest QR not found" });
    }

    const data = await service.deleteGuestQr(id);

    res.json({
      operationType: "Success",
      message: "Guest QR revoked successfully",
      code: "OK",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Lấy chi tiết guest QR
const getGuestQrDetail = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "Forbidden: Only admin can access" });
    }

    const { id } = req.params;

    const data = await service.getGuestQrById(id);
    if (!data) {
      return res.status(404).json({ message: "Guest QR not found" });
    }

    res.json({
      operationType: "Success",
      message: "Get guest QR detail successfully",
      code: "OK",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: err.message });
  }
};
// Lấy danh sách cư dân
const getAllGuestQrs = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "Forbidden: Only admin can access" });
    }

    const { page, limit, search, status } = req.query;

    const data = await service.getAllGuestQrs({
      page: page || 1,
      limit: limit || 10,
      search: search || "",
      apartmentId: status || "",
    });

    res.json({
      operationType: "Success",
      message: "Get all residents successfully",
      code: "OK",
      data: data.data,
      size: data.size,
      totalElements: data.totalElements,
      totalPages: data.totalPages,
      page: data.page,
      pageSize: data.pageSize,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Lấy danh sách cư dân (để cấp QR khách)
// const getAllResidents = async (req, res) => {
//   try {
//     if (req.user.role !== 'ADMIN') {
//       return res.status(403).json({ message: 'Forbidden: Only admin can access' });
//     }

//     const { page, limit, search, apartmentId } = req.query;

//     const data = await service.getAllResidents({
//       page: page || 1,
//       limit: limit || 10,
//       search: search || '',
//       status: apartmentId || ''
//     });

//     res.json({
//       operationType: "Success",
//       message: "Get all residents successfully",
//       code: "OK",
//       data: data.data,
//       size: data.size,
//       totalElements: data.totalElements,
//       totalPages: data.totalPages,
//       page: data.page,
//       pageSize: data.pageSize,
//       timestamp: new Date()
//     });
//   } catch (err) {
//     console.error('Error:', err);
//     res.status(500).json({ message: err.message });
//   }
// };

const getAllResidents = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "Forbidden: Only admin can access" });
    }

    const { page, limit, search, apartmentId, hasQrOnly, noQrOnly } = req.query;

    const data = await service.getAllResidents({
      page: page || 1,
      limit: limit || 10,
      search: search || "",
      apartmentId: apartmentId || "",
      hasQrOnly: hasQrOnly || false,
      noQrOnly: noQrOnly || false,
    });

    res.json({
      operationType: "Success",
      message: "Get all residents successfully",
      code: "OK",
      data: data.data,
      size: data.size,
      totalElements: data.totalElements,
      totalPages: data.totalPages,
      page: data.page,
      pageSize: data.pageSize,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllPersonalQrs,
  createPersonalQr,
  updatePersonalQr,
  revokePersonalQr,
  getResidentAccessHistory,
  getAllResidentAccessHistory,
  getAllGuestQrs,
  createGuestQr,
  updateGuestQr,
  deleteGuestQr,
  getGuestQrDetail,
  getGuestQrHistory,
  getAllResidents,
};
