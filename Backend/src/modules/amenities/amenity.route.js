const express = require("express");
const router = express.Router({ mergeParams: true });
const controller = require("./amenity.controller");
const multer = require('multer');
const path = require('path');

router.post("/", controller.createAmenity);
router.get("/", controller.getAmenitiesByBuilding);
router.get("/:id", controller.getAmenityById);
router.put("/:id", controller.updateAmenity);
router.delete("/:id", controller.deleteAmenity);

const storage = multer.diskStorage({
  destination: './uploads/amenities',
  filename: (req, file, cb) => {
    cb(null, `amenity-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

// Upload ảnh tiện ích
router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    const imageUrl = `/uploads/amenities/${req.file.filename}`;
    res.json({ operationType: "Success", data: { imageUrl } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;