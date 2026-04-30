const express = require("express");
const router = express.Router();
const controller = require("./admin.controller");
const { verifyToken } = require("../../../middlewares/auth.middleware");
const { requireRole } = require("../../../middlewares/role.middleware");

router.use(verifyToken);
router.use(requireRole(['ADMIN']));

router.get("/personal/list", controller.getAllPersonalQrs);
router.post("/personal", controller.createPersonalQr);
router.put("/personal/:id", controller.updatePersonalQr);
router.delete("/personal/:id", controller.revokePersonalQr);
// router.get("/personal/:id", controller.getPersonalQrByUserId);

// ✅ ĐỔI THỨ TỰ: /all phải ở TRƯỚC /:userId
router.get("/history/all", controller.getAllResidentAccessHistory);
router.get("/history/:userId", controller.getResidentAccessHistory);

module.exports = router;