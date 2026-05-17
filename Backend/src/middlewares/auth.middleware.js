const jwt = require("jsonwebtoken");

const getJwtSecret = () => process.env.JWT_SECRET || "your_secret_key";

/**
 * Bắt buộc Bearer + JWT hợp lệ → gán req.user (payload đã ký lúc login).
 * Giống SecurityContextHolder / Nest request.user — controller/service chỉ đọc req.user.
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    if (decoded.sub != null && decoded.id == null) {
      decoded.id = decoded.sub;
    }
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

/** @deprecated Dùng tên authenticate; giữ alias để route cũ không đổi import */
const verifyToken = authenticate;

/** Không bắt buộc đăng nhập — có Bearer hợp lệ thì set req.user (GET /buildings công khai, v.v.) */
const optionalVerifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return next();
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    if (decoded.sub != null && decoded.id == null) {
      decoded.id = decoded.sub;
    }
    req.user = decoded;
  } catch {
    req.user = undefined;
  }
  next();
};

module.exports = {
  authenticate,
  verifyToken,
  optionalVerifyToken,
};
