const express = require("express");
const router = express.Router();

const buildingRoute = require("../modules/buildings/buildings.route");
const userRoute = require("../modules/user/user.router");
const qrRoute = require("../modules/qr/qr.router"); // ← thêm

router.use("/buildings", buildingRoute);
router.use("/users", userRoute);
router.use("/qr", qrRoute); // ← thêm

module.exports = router;