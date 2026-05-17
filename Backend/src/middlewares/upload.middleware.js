// middlewares/upload.middleware.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Tạo thư mục uploads nếu chưa có
const uploadDir = "uploads/avatars";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${req.user.username}-${uniqueSuffix}${ext}`);
  },
});

// Filter file type
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Chỉ chấp nhận file ảnh (jpeg, jpg, png, gif, webp)"));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter,
});
// ==========================================
const chatDir = "uploads/chat";
if (!fs.existsSync(chatDir)) {
  fs.mkdirSync(chatDir, { recursive: true });
}

const chatStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, chatDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `chat-${uniqueSuffix}${ext}`); // Đặt tên file là chat-...
  },
});

const chatFilter = (req, file, cb) => {
  // Chat thì cho phép ảnh, PDF, Word, Excel, TXT, ZIP...
  // Ở đây chúng ta làm ngược lại: Chặn các file nguy hiểm (exe, sh, bat)
  const blockedTypes = /exe|sh|bat|cmd|msi/;
  const extname = blockedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );

  if (extname) {
    return cb(
      new Error("Hệ thống không cho phép gửi file thực thi nguy hiểm!"),
    );
  }
  cb(null, true);
};

const uploadAttachment = multer({
  storage: chatStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // Chat thì hào phóng cho 20MB
  fileFilter: chatFilter,
});
module.exports = { upload, uploadAttachment };
