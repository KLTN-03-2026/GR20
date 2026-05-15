// modules/pin-reset/pin-reset.controller.js
const service = require('./pin-reset.service');

// Gửi email reset PIN
const requestResetPin = async (req, res) => {
  try {
    const { email, qrCode } = req.body;
    
    if (!email) {
      return res.status(400).json({
        operationType: 'Failed',
        message: 'Vui lòng nhập email',
        code: 'MISSING_EMAIL'
      });
    }
    
    const result = await service.requestPinReset(email, qrCode);
    
    res.json({
      operationType: 'Success',
      message: result.message,
      code: 'OK',
      data: {
        email: result.email,
        qrCode: result.qrCode,
        qrType: result.qrType
      },
      timestamp: new Date()
    });
  } catch (err) {
    console.error('Request reset PIN error:', err);
    res.status(400).json({
      operationType: 'Failed',
      message: err.message,
      code: 'RESET_PIN_ERROR',
      timestamp: new Date()
    });
  }
};

// Thực hiện reset PIN (qua token từ email)
const resetPin = async (req, res) => {
  try {
    const { token, newPin } = req.body;
    
    if (!token) {
      return res.status(400).json({
        operationType: 'Failed',
        message: 'Thiếu token xác thực',
        code: 'MISSING_TOKEN'
      });
    }
    
    const result = await service.resetPin(token, newPin);
    
    res.json({
      operationType: 'Success',
      message: result.message,
      code: 'OK',
      data: {
        newPin: result.newPin,
        qrCode: result.qrCode,
        qrType: result.qrType
      },
      timestamp: new Date()
    });
  } catch (err) {
    console.error('Reset PIN error:', err);
    res.status(400).json({
      operationType: 'Failed',
      message: err.message,
      code: 'RESET_PIN_ERROR',
      timestamp: new Date()
    });
  }
};

// Gửi lại mã PIN hiện tại qua email
const sendPin = async (req, res) => {
  try {
    const { email, qrCode } = req.body;
    
    if (!email) {
      return res.status(400).json({
        operationType: 'Failed',
        message: 'Vui lòng nhập email',
        code: 'MISSING_EMAIL'
      });
    }
    
    const result = await service.sendCurrentPin(email, qrCode);
    
    res.json({
      operationType: 'Success',
      message: result.message,
      code: 'OK',
      data: {
        email: result.email,
        qrCode: result.qrCode
      },
      timestamp: new Date()
    });
  } catch (err) {
    console.error('Send PIN error:', err);
    res.status(400).json({
      operationType: 'Failed',
      message: err.message,
      code: 'SEND_PIN_ERROR',
      timestamp: new Date()
    });
  }
};

module.exports = {
  requestResetPin,
  resetPin,
  sendPin,
};