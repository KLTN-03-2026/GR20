const express = require("express");
const router = express.Router();
const controller = require("./building-images.controller");
const {
  buildingImageUpload,
} = require("./building-image-upload.middleware");

const uploadSingleImage = (req, res, next) => {
  buildingImageUpload.single("image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        message: err.message || "Upload failed",
      });
    }
    next();
  });
};

router.post("/", controller.createBuildingImage);
router.post("/upload", uploadSingleImage, controller.uploadBuildingImage);
router.get("/buildings/:buildingId", controller.getAllByBuildingId);
router.delete("/:id", controller.softDeleteBuildingImage);

module.exports = router;
