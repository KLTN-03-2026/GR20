
const express = require("express");
const router = express.Router();
const controller = require("./user.controller");
const { verifyToken } = require("../../middlewares/auth.middleware");
const { upload } = require("../../middlewares/upload.middleware");  

router.get("/me", verifyToken, controller.getMe);
router.put("/profile", verifyToken, controller.updateMe);
router.put("/change-password", verifyToken, controller.changePassword);
router.post("/upload-avatar", verifyToken, upload.single('avatar'), controller.uploadAvatar);

router.get("/:id", controller.getUserById);
router.post("/", controller.createUser);
router.get("/", controller.getAllUsers);
router.delete("/:id", controller.deleteUser);

module.exports = router;