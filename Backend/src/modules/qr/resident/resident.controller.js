
const service = require("./resident.service");
const QRCode = require("qrcode"); 

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
    res.status(500).json({ message: err.message });
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

const getGuestQrHistory = async (req, res) => {
  try {
    const userId = req.user.sub || req.user.id;
    const { page, limit, search, result, fromDate, toDate, qrType } = req.query;
    const data = await service.getGuestQrHistory(userId, { page, limit, search, result, fromDate, toDate, qrType });
    res.json({ operationType: "Success", data: data.data, totalElements: data.totalElements, totalPages: data.totalPages, page: data.page, pageSize: data.pageSize });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = 
{ getMyPersonalQr, 
  getGuestQrsByHost, 
  createGuestQr, 
  updateGuestQr, 
  deleteGuestQr, 
  getGuestQrById, 
  getGuestQrHistory };