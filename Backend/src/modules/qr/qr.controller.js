const service = require("./qr.service");

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
// const createGuestQr = async (req, res) => {
//   try {
//     const hostUserId = req.user.id;  // ✅ Lấy từ token
//     console.log('✅ Creating QR for user:', hostUserId);  // Debug
    
//     const data = await service.createGuestQr({ 
//       ...req.body, 
//       hostUserId  // 👈 Phải truyền vào
//     });
    
//     res.status(201).json({ 
//       operationType: "Success", 
//       message: "Create guest QR successfully", 
//       code: "CREATED", 
//       data, 
//       timestamp: new Date() 
//     });
//   } catch (err) {
//     console.error('❌ Error:', err.message);
//     res.status(500).json({ message: err.message });
//   }
// };

// ─── DANH SÁCH QR KHÁCH (Có lọc, phân trang, sắp xếp) ───────────────────────────────────
const getGuestQrsByHost = async (req, res) => {
  try {
    // const { userId } = req.params;
    const userId = req.user.sub;  // 👈 Lấy từ token
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
// const scanQr = async (req, res) => {
//   try {
//     const { direction, gate, building_id } = req.query;
//     const data = await service.scanQr(req.params.qrCode, {
//       direction,
//       gate,
//       building_id: building_id ? parseInt(building_id) : null
//     });
//     res.json({ 
//       operationType: "Success", 
//       message: "QR hợp lệ", 
//       code: "OK", 
//       data, 
//       timestamp: new Date() 
//     });
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// };

// qr.controller.js
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

// const getGuestQrHistory = async (req, res) => {
//   try {
//     // const data = await service.getGuestQrHistory(req.params.userId);
//     const userId = req.user.sub;  // 👈 Lấy từ token
//     const data = await service.getGuestQrHistory(userId);
//     res.json({ operationType: "Success", message: "Get QR history successfully", code: "OK", data, timestamp: new Date() });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// qr.controller.js
// qr.controller.js
const getGuestQrHistory = async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?.id;
    const userRole = req.user?.role;
    
    console.log('User ID:', userId);
    console.log('User Role:', userRole);
    
    let data;
    
    // Nếu là bảo vệ, lấy lịch sử quét của chính họ
    if (userRole === 'Bảo vệ' || userRole === 'SECURITY' || userRole === 'GUARD') {
      data = await service.getScanHistoryByGuard(userId);
    } 
    // Nếu là cư dân, lấy lịch sử QR của họ
    else {
      data = await service.getGuestQrHistory(userId);
    }
    
    res.json({ 
      operationType: "Success", 
      message: "Get history successfully", 
      code: "OK", 
      data, 
      timestamp: new Date() 
    });
  } catch (err) {
    console.error('History error:', err);
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