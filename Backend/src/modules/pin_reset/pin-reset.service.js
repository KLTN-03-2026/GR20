// modules/pin-reset/pin-reset.service.js
const crypto = require('crypto');
const repo = require('./pin-reset.repository');
const { sendEmail } = require('../../configs/email.config');

// Tạo mã PIN ngẫu nhiên 4 số
const generateRandomPin = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Tạo token ngẫu nhiên
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Gửi email reset PIN
const requestPinReset = async (email, qrCode = null) => {
  // 1. Tìm user theo email
  const user = await repo.findUserByEmail(email);
  if (!user) {
    throw new Error('Email không tồn tại trong hệ thống');
  }

  // 2. Tìm QR code của user
  let qr = null;
  let qrType = null;
  
  if (qrCode) {
    // Nếu có mã QR cụ thể
    qr = await repo.findGuestQrByCode(qrCode);
    if (qr) {
      qrType = 'guest';
    } else {
      qr = await repo.findPersonalQrByCode(qrCode);
      if (qr) {
        qrType = 'personal';
      }
    }
    if (!qr) {
      throw new Error('Mã QR không tồn tại hoặc không thuộc sở hữu của bạn');
    }
  } else {
    // Lấy QR mặc định
    qr = await repo.findGuestQrByHostId(user.id);
    if (qr) {
      qrType = 'guest';
    } else {
      qr = await repo.findPersonalQrByUserId(user.id);
      if (qr) {
        qrType = 'personal';
      }
    }
  }

  if (!qr) {
    throw new Error('Bạn chưa có mã QR nào trong hệ thống');
  }

  // 3. Tạo token
  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); //hết hạn 1 giờ

  await repo.saveResetToken(user.id, token, expiresAt, qrType);

  // await repo.saveResetToken(user.id, token, expiresAt);

  // 4. Tạo link reset PIN
  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-pin?token=${token}&qrCode=${qr.qr_code}&type=${qrType}`;

  // 5. Gửi email
const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <style>
      body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
      .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
      .header { text-align: center; border-bottom: 2px solid #005ab7; padding-bottom: 20px; margin-bottom: 20px; }
      .logo { font-size: 24px; font-weight: bold; color: #005ab7; }
      .title { font-size: 20px; font-weight: bold; color: #333; margin: 20px 0; }
      .qr-code { background: #f0f0f0; padding: 15px; border-radius: 12px; text-align: center; margin: 20px 0; }
      .qr-code span { font-family: monospace; font-size: 14px; color: #005ab7; font-weight: bold; }
     .button { 
  background-color: #005ab7;
  color: #ffffff !important;
  padding: 14px 28px; 
  text-decoration: none; 
  border-radius: 12px; 
  display: inline-block; 
  margin: 20px 0;
  font-weight: bold;
  font-size: 16px;
  border: 1px solid #005ab7;
}
      .button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 90, 183, 0.4);
      }
      .footer { text-align: center; font-size: 12px; color: #888; margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px; }
      .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; font-size: 13px; border-radius: 8px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">🏠 Homelink AI</div>
        <p style="color: #666; margin-top: 5px;">Hệ thống quản lý cư dân thông minh</p>
      </div>
      
      <div class="title">🔐 Yêu cầu đặt lại mã PIN</div>
      
      <p>Xin chào <strong>${user.full_name}</strong>,</p>
      
      <p>Chúng tôi nhận được yêu cầu đặt lại mã PIN cho mã QR của bạn.</p>
      
      <div class="qr-code">
        <p style="margin-bottom: 8px; font-weight: bold;">📱 Mã QR của bạn:</p>
        <span>${qr.qr_code}</span>
      </div>
      
      <p>Nhấn vào nút bên dưới để đặt lại mã PIN mới:</p>
      
      <div style="text-align: center;">
       <a 
  href="${resetLink}" 
  class="button"
  style="color:#ffffff !important; text-decoration:none;"
>
  🔄 Đặt lại mã PIN ngay
</a>
      </div>
      
      <div class="warning">
        ⚠️ Liên kết này sẽ hết hạn sau <strong>1 giờ</strong>. Nếu bạn không yêu cầu đặt lại PIN, vui lòng bỏ qua email này.
      </div>
      
      <p>Nếu nút trên không hoạt động, hãy copy link sau vào trình duyệt:</p>
      <p style="word-break: break-all; font-size: 12px; color: #666; background: #f5f5f5; padding: 10px; border-radius: 8px;">${resetLink}</p>
      
      <div class="footer">
        <p>Homelink AI - Giải pháp quản lý cư dân thông minh</p>
        <p>© 2024 Homelink AI. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
`;


  const subject = '🔐 Đặt lại mã PIN - Homelink AI';
  
  await sendEmail(email, subject, html);
  
  return {
    success: true,
    message: 'Email đặt lại PIN đã được gửi',
    email: email,
    qrCode: qr.qr_code,
    qrType: qrType
  };
};

// Reset PIN mới
// const resetPin = async (token, newPin = null) => {
//   // 1. Tìm token
//   const resetToken = await repo.findResetToken(token);
//   if (!resetToken) {
//     throw new Error('Token không hợp lệ hoặc đã hết hạn');
//   }

//   // 2. Tìm QR code của user
//   let qr = null;
//   let qrType = null;
  
//   qr = await repo.findGuestQrByHostId(resetToken.user_id);
//   if (qr) {
//     qrType = 'guest';
//   } else {
//     qr = await repo.findPersonalQrByUserId(resetToken.user_id);
//     if (qr) {
//       qrType = 'personal';
//     }
//   }

//   if (!qr) {
//     throw new Error('Không tìm thấy mã QR');
//   }

//   // 3. Tạo PIN mới (nếu không được cung cấp)
//   const newPinCode = newPin || generateRandomPin();

//   // 4. Cập nhật PIN
//   if (qrType === 'guest') {
//     await repo.updateGuestQrPin(qr.id, newPinCode, true);
//   } else {
//     await repo.updatePersonalQrPin(qr.id, newPinCode, true);
//   }

//   // 5. Đánh dấu token đã dùng
//   await repo.markTokenAsUsed(token);

//   return {
//     success: true,
//     message: 'Mã PIN đã được đặt lại thành công',
//     newPin: newPinCode,
//     qrCode: qr.qr_code,
//     qrType: qrType
//   };
// };

const resetPin = async (token, newPin = null) => {
  // 1. Tìm token
  const resetToken = await repo.findResetToken(token);
  if (!resetToken) {
    throw new Error('Token không hợp lệ hoặc đã hết hạn');
  }

  // 2. Tìm QR code dựa vào qr_type từ token hoặc tìm cả 2 loại
  let qr = null;
  let qrType = null;
  
  // 👉 ƯU TIÊN TÌM THEO qr_type nếu có trong token
  if (resetToken.qr_type === 'guest') {
    qr = await repo.findGuestQrByHostId(resetToken.user_id);
    if (qr) qrType = 'guest';
  } else if (resetToken.qr_type === 'personal') {
    qr = await repo.findPersonalQrByUserId(resetToken.user_id);
    if (qr) qrType = 'personal';
  }
  
  // Nếu không tìm thấy theo type, thử tìm cả 2
  if (!qr) {
    qr = await repo.findGuestQrByHostId(resetToken.user_id);
    if (qr) {
      qrType = 'guest';
    } else {
      qr = await repo.findPersonalQrByUserId(resetToken.user_id);
      if (qr) qrType = 'personal';
    }
  }

  if (!qr) {
    throw new Error('Không tìm thấy mã QR');
  }

  // 3. Tạo PIN mới
  const newPinCode = newPin || generateRandomPin();

  // 4. Cập nhật PIN theo đúng loại
  if (qrType === 'guest') {
    await repo.updateGuestQrPin(qr.id, newPinCode, true);
  } else {
    await repo.updatePersonalQrPin(qr.id, newPinCode, true);
  }

  // 5. Đánh dấu token đã dùng
  await repo.markTokenAsUsed(token);

  return {
    success: true,
    message: 'Mã PIN đã được đặt lại thành công',
    newPin: newPinCode,
    qrCode: qr.qr_code,
    qrType: qrType
  };
};

// Gửi PIN hiện tại qua email
const sendCurrentPin = async (email, qrCode = null) => {
  const user = await repo.findUserByEmail(email);
  if (!user) {
    throw new Error('Email không tồn tại trong hệ thống');
  }

  let qr = null;
  let qrType = null;
  
  if (qrCode) {
    qr = await repo.findGuestQrByCode(qrCode);
    if (qr) {
      qrType = 'guest';
    } else {
      qr = await repo.findPersonalQrByCode(qrCode);
      if (qr) {
        qrType = 'personal';
      }
    }
  } else {
    qr = await repo.findGuestQrByHostId(user.id);
    if (qr) {
      qrType = 'guest';
    } else {
      qr = await repo.findPersonalQrByUserId(user.id);
      if (qr) {
        qrType = 'personal';
      }
    }
  }

  if (!qr) {
    throw new Error('Không tìm thấy mã QR');
  }

  if (!qr.pin_code) {
    throw new Error('Mã QR này chưa được cài đặt PIN');
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
      <h2 style="color: #005ab7;">🔐 Mã PIN của bạn</h2>
      <p>Xin chào <strong>${user.full_name}</strong>,</p>
      <p>Mã PIN cho mã QR <strong>${qr.qr_code}</strong> là:</p>
      <div style="background: #f0f0f0; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; border-radius: 12px; margin: 20px 0;">
        ${qr.pin_code}
      </div>
      <p style="color: #666; font-size: 12px;">Vui lòng không chia sẻ mã PIN này với người khác.</p>
      <hr style="margin: 20px 0;">
      <p style="color: #999; font-size: 11px;">Homelink AI - Hệ thống quản lý cư dân thông minh</p>
    </div>
  `;

  await sendEmail(email, '🔐 Mã PIN của bạn - Homelink AI', html);
  
  return {
    success: true,
    message: 'Mã PIN đã được gửi đến email của bạn',
    email: email,
    qrCode: qr.qr_code
  };
};

module.exports = {
  requestPinReset,
  resetPin,
  sendCurrentPin,
};