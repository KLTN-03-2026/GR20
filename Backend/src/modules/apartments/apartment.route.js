const express = require("express");
const router = express.Router({ mergeParams: true });
const controller = require("./apartment.controller");
const multer = require('multer');
const path = require('path');
const { pool } = require("../../configs/database.config");

// Residents routes
router.patch('/residents/:id/move-out', controller.moveOutResident);
router.put('/residents/:id', controller.updateResident);

// Upload config
const storage = multer.diskStorage({
  destination: './uploads/apartments',
  filename: (req, file, cb) => {
    cb(null, `apartment-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

// Upload image route
router.post('/:id/upload-image', upload.single('image'), async (req, res) => {
  try {
    const imageUrl = `/uploads/apartments/${req.file.filename}`;
    await pool.query('UPDATE apartments SET image_url = $1 WHERE id = $2', [imageUrl, req.params.id]);
    res.json({ operationType: "Success", data: { imageUrl } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CRUD
router.post("/", controller.createApartment);
router.get("/", controller.getAllApartments);
router.get('/stats', controller.getStats);
router.get('/available', controller.getAvailableApartments);
router.post('/:id/residents', controller.addResident);

// Filter
router.get("/building/:buildingId", controller.getByBuilding);
router.get("/floor/:floorId", controller.getByFloor);

// :id LAST
router.get("/:id", controller.getApartmentById);
router.put("/:id", controller.updateApartment);
router.delete("/:id", controller.deleteApartment);

module.exports = router;