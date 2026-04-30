

const service = require("./guard.service");

// const scanQr = async (req, res) => {
//   try {
//     const { direction, gate, building_id } = req.query;
    
    
//     // Lấy user_id từ token (người quét - bảo vệ)
//     const scannedBy = req.user?.sub || req.user?.id;
    
//     if (!scannedBy) {
//       return res.status(401).json({ message: 'Unauthorized: Cannot identify user' });
//     }
    
//     const data = await service.scanQr(req.params.qrCode, {
//       direction,
//       gate,
//       building_id: building_id ? parseInt(building_id) : null,
//       scannedBy
//     });
    
//     res.json({ 
//       operationType: "Success", 
//       message: "QR hợp lệ", 
//       code: "OK", 
//       data, 
//       timestamp: new Date() 
//     });
//   } catch (err) {
//     console.error('Scan error:', err.message);
//     res.status(400).json({ message: err.message });
//   }
// };


const scanQr = async (req, res) => {
  try {
    const { direction, gate, building_id } = req.query;
    const scannedBy = req.user?.sub || req.user?.id;
    
    if (!scannedBy) {
      return res.status(401).json({
        operationType: "Failed",
        message: 'Unauthorized: Cannot identify user',
        code: "UNAUTHORIZED"
      });
    }
    
    const data = await service.scanQr(req.params.qrCode, {
      direction,
      gate,
      building_id: building_id ? parseInt(building_id) : null,
      scannedBy
    });
    
    // ✅ FIX: Chỉ trả OK khi thực sự success
    res.json({
      operationType: "Success",
      message: "QR hợp lệ",
      code: "OK",
      data,
      timestamp: new Date()
    });
  } catch (err) {
    console.error('Scan error:', err.message);
    
    // ✅ FIX: Trả code khác OK khi có lỗi
    res.status(400).json({
      operationType: "Failed",
      message: err.message,
      code: "INVALID_QR"  // Thay vì OK
    });
  }
};

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

module.exports = { scanQr, getGuestQrHistory };