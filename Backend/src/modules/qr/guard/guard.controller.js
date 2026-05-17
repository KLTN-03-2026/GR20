const service = require("./guard.service");

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
    
    // Nếu yêu cầu PIN thì trả về REQUIRE_PIN (không ghi log)
    if (data.requiresPin) {
      return res.json({
        operationType: "Success",
        message: "QR hợp lệ, vui lòng nhập PIN",
        code: "REQUIRE_PIN",
        data,
        timestamp: new Date()
      });
    }
    
    // QR không cần PIN -> SUCCESS (đã ghi log)
    res.json({
      operationType: "Success",
      message: "QR hợp lệ",
      code: "OK",
      data,
      timestamp: new Date()
    });
  } catch (err) {
    console.error('Scan error:', err.message);
    res.status(400).json({
      operationType: "Failed",
      message: err.message,
      code: "INVALID_QR"
    });
  }
};

const verifyPin = async (req, res) => {
  try {
    const { qrCode, pinCode, scanMetadata } = req.body;
    const scannedBy = req.user?.sub || req.user?.id;
    
    if (!qrCode || !pinCode) {
      return res.status(400).json({
        operationType: "Failed",
        message: "Thiếu qrCode hoặc pinCode",
        code: "MISSING_FIELDS"
      });
    }
    
    // 👇 Truyền scanMetadata (chứa buildingId, direction, gate) cho verifyPin
    const result = await service.verifyPin(
      qrCode, 
      pinCode, 
      scannedBy,
      scanMetadata || {}  // 👈 THÊM metadata từ lúc scan
    );
    
    res.json({
      operationType: "Success",
      message: "PIN chính xác, mở cửa thành công",
      code: "OK",
      data: {
        success: result.success,
        message: result.message,
        qrData: result.qrData
      },
      timestamp: new Date()
    });
  } catch (err) {
    console.error('Verify PIN error:', err.message);
    res.status(400).json({
      operationType: "Failed",
      message: err.message,
      code: err.code || "INVALID_PIN"
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
    
    res.json({
      operationType: "Success",
      message: "Get history successfully",
      code: "OK",
      data: data.data || [],
      size: data.data?.length || 0,
      totalElements: data.totalElements || 0,
      totalPages: data.totalPages || 0,
      page: data.page || 1,
      pageSize: data.pageSize || 10,
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

module.exports = { scanQr, verifyPin, getGuestQrHistory };

