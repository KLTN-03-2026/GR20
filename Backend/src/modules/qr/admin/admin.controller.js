const service = require("../admin/admin.service");

const { v4: uuidv4 } = require("uuid");
const QRCode = require("qrcode");
// Lấy danh sách personal QR
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

// Trong admin.controller.js - getAllPersonalQrs
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

const createPersonalQr = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "Forbidden: Only admin can create personal QR" });
    }

    const { userId, apartmentId, expiresAt, pinCode } = req.body; // 👈 Thêm pinCode

    if (!userId) {
      return res
        .status(400)
        .json({ message: "Missing required field: userId" });
    }

    // Tạo mã QR duy nhất
    const qrCodeValue = `PERSONAL_${uuidv4()}`;

    const data = await service.createPersonalQr({
      userId,
      apartmentId,
      qrCode: qrCodeValue,
      expiresAt: expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      pinCode: pinCode || null, // 👈 Thêm PIN (nếu có)
      createdBy: req.user.id,
    });

    // Tạo QR image để trả về
    const qrImage = await QRCode.toDataURL(qrCodeValue);

    res.status(201).json({
      operationType: "Success",
      message: "Personal QR created successfully",
      code: "CREATED",
      data: {
        ...data,
        qr_image: qrImage,
      },
      timestamp: new Date(),
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Cập nhật personal QR
// const updatePersonalQr = async (req, res) => {
//   try {
//     // Kiểm tra role ADMIN
//     if (req.user.role !== 'ADMIN') {
//       return res.status(403).json({
//         operationType: "Failed",
//         message: 'Forbidden: Only admin can update personal QR',
//         code: "FORBIDDEN",
//         timestamp: new Date()
//       });
//     }

//     const { id } = req.params;
//     const { status, expiresAt, apartmentId, pin_code } = req.body;

//     // Kiểm tra QR tồn tại
//     const existingQr = await service.getPersonalQrById(id);
//     if (!existingQr) {
//       return res.status(404).json({
//         operationType: "Failed",
//         message: 'Personal QR not found',
//         code: "NOT_FOUND",
//         timestamp: new Date()
//       });
//     }

//     const data = await service.updatePersonalQr(id, {
//       status,
//       expiresAt,
//       apartmentId,
//       pin_code
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
//     res.status(500).json({
//       operationType: "Error",
//       message: err.message,
//       code: "INTERNAL_ERROR",
//       timestamp: new Date()
//     });
//   }
// };
// Trong admin.controller.js - updatePersonalQr
const updatePersonalQr = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        operationType: "Failed",
        message: "Forbidden: Only admin can update personal QR",
        code: "FORBIDDEN",
        timestamp: new Date(),
      });
    }

    const { id } = req.params;
    const { status, expiresAt, apartmentId, pin_code } = req.body;

    const existingQr = await service.getPersonalQrById(id);
    if (!existingQr) {
      return res.status(404).json({
        operationType: "Failed",
        message: "Personal QR not found",
        code: "NOT_FOUND",
        timestamp: new Date(),
      });
    }

    const data = await service.updatePersonalQr(id, {
      status,
      expiresAt,
      apartmentId,
      pin_code,
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
    res.status(500).json({
      operationType: "Error",
      message: err.message,
      code: "INTERNAL_ERROR",
      timestamp: new Date(),
    });
  }
};
// const updatePersonalQr = async (req, res) => {
//   try {
//     // Kiểm tra role ADMIN
//     if (req.user.role !== 'ADMIN') {
//       return res.status(403).json({
//         message: 'Forbidden: Only admin can update personal QR'
//       });
//     }

//     const { id } = req.params;
//     const { status, expiresAt, apartmentId } = req.body;

//     // Kiểm tra QR tồn tại
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
      pinCode, // 👈 Thêm PIN cho guest QR
    } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!hostUserId || !apartmentId || !validTo) {
      return res.status(400).json({
        message: "Missing required fields: hostUserId, apartmentId, validTo",
      });
    }

    if (!visitorName) {
      return res
        .status(400)
        .json({ message: "Missing required field: visitorName" });
    }

    const data = await service.createGuestQr({
      hostUserId,
      apartmentId,
      validFrom: validFrom || new Date(),
      validTo,
      maxEntries: maxEntries || 1,
      status: status || "ACTIVE",
      visitorName,
      visitorPhone: visitorPhone || null,
      visitorIdCard: visitorIdCard || null,
      pinCode: pinCode || null, // 👈 Thêm PIN
      adminValidToOriginal: validTo, // Lưu original date
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

// Trong admin.controller.js - updateGuestQr
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
      adminValidToOriginal,
      pin_code, // 👈 Thêm pin_code
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
      adminValidToOriginal,
      pin_code, // 👈 Truyền pin_code xuống service
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
//       visitorName,
//       visitorPhone,
//       visitorIdCard,
//       adminValidToOriginal  // 👈 THÊM trường này
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
//       visitorName,
//       visitorPhone,
//       visitorIdCard,
//       adminValidToOriginal  // 👈 TRUYỀN xuống service
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
