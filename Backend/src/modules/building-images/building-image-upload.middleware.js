const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = "uploads/buildings";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `building-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const isImageMime = typeof file.mimetype === "string" && file.mimetype.startsWith("image/");
  if (isImageMime) {
    return cb(null, true);
  }

  cb(new Error("Only image files are allowed"));
};

const buildingImageUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

module.exports = { buildingImageUpload };
