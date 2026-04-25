const service = require("./qr.service");
const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");
const repo = require("./qr.repository");

const getPersonalQr = async (req, res) => {
  try {
    const userId = req.user.id;
    // const data = await service.getPersonalQr(req.params.userId);
     const data = await service.getPersonalQr(userId);
    res.json({ operationType: "Success", message: "Get personal QR successfully", code: "OK", data, timestamp: new Date() });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
const createGuestQr = async (req, res) => {
  try {
    const hostUserId = req.user.sub || req.user.id;
    
    const { 
      visitorName, 
      visitorPhone, 
      visitorIdCard, 
      validFrom, 
      validTo, 
      maxEntries 
    } = req.body;
    
    if (!visitorName || !visitorPhone || !validFrom || !validTo) {
      return res.status(400).json({ 
        message: 'Missing required fields: visitorName, visitorPhone, validFrom, validTo' 
      });
    }
    
    // Lấy apartment của user (từ resident_profiles hoặc owner)
    const apartment = await service.getApartmentByUserId(hostUserId);
    
    if (!apartment) {
      return res.status(400).json({ 
        message: 'User does not have an apartment. Please assign an apartment first.' 
      });
    }
    
    const data = await service.createGuestQr({
      hostUserId,
      apartmentId: apartment.id,
      visitorName,
      visitorPhone,
      visitorIdCard: visitorIdCard || null,
      validFrom,
      validTo,
      maxEntries: maxEntries || 1
    });
    
    res.status(201).json({ 
      operationType: "Success", 
      message: "Create guest QR successfully", 
      code: "CREATED", 
      data, 
      timestamp: new Date() 
    });
  } catch (err) {
    console.error('❌ Error:', err.message);
    res.status(500).json({ message: err.message });
  }
};
// controllers/qrcode.controller.js
const getGuestQrsByHost = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { limit, page, onlyValid, search, fromDate, toDate } = req.query;  // ✅ fromDate, toDate
    
    const data = await service.getGuestQrsByHost(userId, {
      limit,
      page,
      onlyValid,
      search,
      fromDate,  // ✅ fromDate
      toDate     // ✅ toDate
    });
    
    res.json({ 
      operationType: "Success", 
      message: "success", 
      code: "OK", 
      data: data.data,
      size: data.size,
      totalElements: data.totalElements,
      totalPages: data.totalPages,
      page: data.page,
      pageSize: data.pageSize,
      timestamp: new Date() 
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ 
      operationType: "Error",
      message: err.message, 
      code: "INTERNAL_ERROR",
      timestamp: new Date() 
    });
  }
};
// const getGuestQrsByHost = async (req, res) => {
//   try {
//     const userId = req.user.sub;
//     const { limit, page, onlyValid, search } = req.query;
    
//     const data = await service.getGuestQrsByHost(userId, {
//       limit,
//       page,
//       onlyValid,
//       search
//     });
    
//     res.json({ 
//       operationType: "Success", 
//       message: "success", 
//       code: "OK", 
//       ...data,
//       timestamp: new Date() 
//     });
//   } catch (err) {
//     res.status(500).json({ 
//       operationType: "Error",
//       message: err.message, 
//       code: "INTERNAL_ERROR",
//       timestamp: new Date() 
//     });
//   }
// };



const getGuestQrById = async (req, res) => {
  try {
    const data = await service.getGuestQrById(req.params.id);
    
    // 📌 Luôn tạo mới ảnh, KHÔNG dùng ảnh từ database
    const freshQrImage = await QRCode.toDataURL(data.qrCode, {
      width: 512,
      scale: 6,
      margin: 2,
      errorCorrectionLevel: 'H'
    });
    
    // Ghi đè hoàn toàn
    data.qrImage = freshQrImage;
    
    res.json({ 
      operationType: "Success", 
      message: "Get guest QR successfully", 
      code: "OK", 
      data, 
      timestamp: new Date() 
    });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
// const getGuestQrById = async (req, res) => {
//   try {
//     const data = await service.getGuestQrById(req.params.id);
//     res.json({ operationType: "Success", message: "Get guest QR successfully", code: "OK", data, timestamp: new Date() });
//   } catch (err) {
//     res.status(404).json({ message: err.message });
//   }
// };


const scanQr = async (req, res) => {
  try {
    const { direction, gate, building_id } = req.query;
    
    // ✅ Kiểm tra req.user tồn tại
    console.log('req.user:', req.user); // Debug xem có dữ liệu không
    
    // Lấy user_id từ token (người quét - bảo vệ)
    const scannedBy = req.user?.sub || req.user?.id;
    
    if (!scannedBy) {
      return res.status(401).json({ message: 'Unauthorized: Cannot identify user' });
    }
    
    const data = await service.scanQr(req.params.qrCode, {
      direction,
      gate,
      building_id: building_id ? parseInt(building_id) : null,
      scannedBy
    });
    
    res.json({ 
      operationType: "Success", 
      message: "QR hợp lệ", 
      code: "OK", 
      data, 
      timestamp: new Date() 
    });
  } catch (err) {
    console.error('Scan error:', err.message);
    res.status(400).json({ message: err.message });
  }
};


const updateGuestQr = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      visitorName, 
      visitorPhone, 
      visitorIdCard, 
      validFrom, 
      validTo, 
      maxEntries,
      status 
    } = req.body;
    
    // Kiểm tra QR tồn tại và thuộc về user hiện tại
    const existingQr = await service.getGuestQrById(id);
    if (!existingQr) {
      return res.status(404).json({ message: 'QR code not found' });
    }
    
    const userId = req.user.sub || req.user.id;
    if (existingQr.hostUserId !== userId) {
      return res.status(403).json({ message: 'You do not have permission to update this QR' });
    }
    
    const data = await service.updateGuestQr(id, {
      visitorName,
      visitorPhone,
      visitorIdCard,
      validFrom,
      validTo,
      maxEntries,
      status
    });
    
    res.json({ 
      operationType: "Success", 
      message: "Update guest QR successfully", 
      code: "OK", 
      data, 
      timestamp: new Date() 
    });
  } catch (err) {
    console.error('❌ Error:', err.message);
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


// // controllers/qrcode.controller.js
// const getGuestQrHistory = async (req, res) => {
//   try {
//     const userId = req.user.sub || req.user.id;
//     const userRole = req.user.role;
    
//     let data;
    
//     // Nếu là BẢO VỆ -> lấy lịch sử quét của chính họ
//     if (userRole === 'Bảo vệ' || userRole === 'SECURITY' || userRole === 'GUARD') {
//       data = await service.getScanHistoryByGuard(userId);
//     } 
//     // Nếu là CƯ DÂN -> lấy lịch sử QR của họ
//     else {
//       data = await service.getGuestQrHistory(userId);
//     }
    
//     res.json({
//       operationType: "Success",
//       message: "Get history successfully",
//       code: "OK",
//       data: data,
//       timestamp: new Date()
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// controllers/qrcode.controller.js
const getGuestQrHistory = async (req, res) => {
  try {
    const userId = req.user.sub || req.user.id;
    const userRole = req.user.role;
    
    const { page, limit, search, result, fromDate, toDate, qrType } = req.query;
    
    let data;
    
    if (userRole === 'Bảo vệ' || userRole === 'SECURITY' || userRole === 'GUARD') {
      data = await service.getScanHistoryByGuard(userId, {
        page: page || 1,
        limit: limit || 10,
        search: search || '',
        result: result || '',
        fromDate: fromDate || null,
        toDate: toDate || null,
        qrType: qrType || ''
      });
    } else {
      data = await service.getGuestQrHistory(userId, {
        page: page || 1,
        limit: limit || 10,
        search: search || '',
        result: result || '',
        fromDate: fromDate || null,
        toDate: toDate || null,
        qrType: qrType || ''
      });
    }
    
    // ✅ Đảm bảo trả về đầy đủ các field
    res.json({
      operationType: "Success",
      message: "Get history successfully",
      code: "OK",
      data: data.data || [],           // Mảng dữ liệu
      size: data.data?.length || 0,    // Số lượng phần tử hiện tại
      totalElements: data.totalElements || 0,  // Tổng số bản ghi
      totalPages: data.totalPages || 0,        // Tổng số trang
      page: data.page || 1,                    // Trang hiện tại
      pageSize: data.pageSize || 10,           // Số bản ghi mỗi trang
      timestamp: new Date()
    });
  } catch (err) {
    console.error('History error:', err);
    res.status(500).json({
      operationType: "Error",
      message: err.message,
      code: "INTERNAL_ERROR",
      timestamp: new Date()
    });
  }
};

const createPersonalQr = async (req, res) => {
  try {
    // Chỉ ADMIN mới được tạo
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden: Only admin can create personal QR' });
    }
    
    const { userId, apartmentId, expiresAt } = req.body;
    
    // Kiểm tra user tồn tại - Cần có hàm getUserById trong repo
    // Tạm thời bỏ qua hoặc tạo hàm này
    // const user = await repo.getUserById(userId);
    // if (!user) {
    //   return res.status(404).json({ message: 'User not found' });
    // }
    
    // Tạo mã QR duy nhất
    const qrCodeValue = `PERSONAL_${uuidv4()}`;
    
    const data = await service.createPersonalQr({
      userId,
      apartmentId,
      qrCode: qrCodeValue,
      expiresAt: expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      createdBy: req.user.id
    });
    
    res.status(201).json({
      operationType: "Success",
      message: "Personal QR created successfully",
      code: "CREATED",
      data,
      timestamp: new Date()
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: err.message });
  }
};
// qr.controller.js
const getMyPersonalQr = async (req, res) => {
  try {
    const userId = req.user.sub || req.user.id;
    
    const data = await service.getPersonalQrByUserId(userId);
    
    if (!data) {
      return res.status(404).json({ message: 'Personal QR not found. Please contact admin.' });
    }
    
    // Tạo ảnh QR với kích thước lớn hơn
    const qrImage = await QRCode.toDataURL(data.qr_code, {
      width: 526,           // Chiều rộng lớn hơn (mặc định 256)
      margin: 4,            // Margin rộng hơn
      scale: 10,            // Scale lớn hơn (mặc định 4)
      errorCorrectionLevel: 'H',  // Mức độ sửa lỗi cao
    });
    
    res.json({
      operationType: "Success",
      message: "Get personal QR successfully",
      code: "OK",
      data: { ...data, qrImage },
      timestamp: new Date()
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: err.message });
  }
};




// Thêm controller mới để cấp QR
const grantQrToResident = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden: Only admin can access' });
    }
    
    const { userId } = req.params;
    const { expiresAt } = req.body;
    
    // Kiểm tra user có phải cư dân không
    const userCheck = await pool.query(
      `SELECT id, role FROM users WHERE id = $1 AND role = 'RESIDENT'`,
      [userId]
    );
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: 'User not found or is not a resident' });
    }

    // Kiểm tra đã có QR code chưa
    const existingQr = await pool.query(
      `SELECT id FROM qr_codes WHERE user_id = $1 AND type = 'PERSONAL' AND status != 'REVOKED'`,
      [userId]
    );

    if (existingQr.rows.length > 0) {
      return res.status(400).json({ message: 'Resident already has an active QR code' });
    }

    // Tạo QR code mới
    const qrCode = `PERSONAL_${uuidv4()}`;
    const result = await pool.query(
      `INSERT INTO qr_codes (user_id, qr_code, type, expires_at, status, created_at)
       VALUES ($1, $2, 'PERSONAL', $3, 'ACTIVE', NOW())
       RETURNING *`,
      [userId, qrCode, expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)]
    );
    
    res.json({
      operationType: "Success",
      message: "QR code granted successfully",
      code: "OK",
      data: result.rows[0],
      timestamp: new Date()
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: err.message });
  }
};


const revokePersonalQr = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden: Only admin can revoke personal QR' });
    }
    
    const { id } = req.params;
    
    const data = await service.revokePersonalQr(id);
    
    res.json({
      operationType: "Success",
      message: "Personal QR revoked successfully",
      code: "OK",
      data,
      timestamp: new Date()
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPersonalQrByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // TODO: Implement get personal QR by user id
    res.json({
      operationType: "Success",
      message: "Get personal QR by user id successfully",
      data: { userId },
      timestamp: new Date()
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Lấy lịch sử ra vào của cư dân theo user_id (ADMIN)
// controllers/qrcode.controller.js
const getResidentAccessHistory = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden: Only admin can access' });
    }
    
    const { userId } = req.params;
    const { page, limit, search, result, fromDate, toDate } = req.query;
    
    const data = await service.getResidentAccessHistory(userId, {
      page: page || 1,
      limit: limit || 10,
      search: search || '',
      result: result || '',
      fromDate: fromDate || null,
      toDate: toDate || null
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
      timestamp: new Date()
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: err.message });
  }
};

const getAllPersonalQrs = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden: Only admin can access' });
    }
    
    const { page, limit, search, status, hasQrOnly } = req.query;
    
    const data = await service.getAllPersonalQrs({
      page: page || 1,
      limit: limit || 10,
      search: search || '',
      status: status || '',
      hasQrOnly: hasQrOnly || false
    });
    
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
      timestamp: new Date()
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Lấy lịch sử quét của tất cả cư dân
const getAllResidentAccessHistory = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden: Only admin can access' });
    }
    
    const { page, limit, search, result, fromDate, toDate } = req.query;
    
    const data = await service.getAllResidentAccessHistory({
      page: page || 1,
      limit: limit || 10,
      search: search || '',
      result: result || '',
      fromDate: fromDate || null,
      toDate: toDate || null
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
      timestamp: new Date()
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: err.message });
  }
};

// qr.controller.js
const updatePersonalQr = async (req, res) => {
  try {
    // Kiểm tra role ADMIN
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        message: 'Forbidden: Only admin can update personal QR' 
      });
    }
    
    const { id } = req.params;
    const { status, expiresAt, apartmentId } = req.body;
    
    // Kiểm tra QR tồn tại
    const existingQr = await service.getPersonalQrById(id);
    if (!existingQr) {
      return res.status(404).json({ message: 'Personal QR not found' });
    }
    
    const data = await service.updatePersonalQr(id, {
      status,
      expiresAt,
      apartmentId
    });
    
    res.json({
      operationType: "Success",
      message: "Update personal QR successfully",
      code: "OK",
      data,
      timestamp: new Date()
    });
  } catch (err) {
    console.error('Error:', err);
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
  createPersonalQr,
  getMyPersonalQr,
  revokePersonalQr,
  getPersonalQrByUserId ,
  getAllPersonalQrs,
  getResidentAccessHistory,
  getAllResidentAccessHistory,
  updatePersonalQr
};