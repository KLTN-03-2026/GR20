const express = require("express");
const router = express.Router();

// 1. Import route của chức năng vào
const buildingRoute = require("../modules/buildings/buildings.route");
// Sau này nhóm code chức năng khác thì import thêm: const residentRoute = require('../modules/residents/residents.route');

// 2. Gắn tiền tố cho nó
router.use("/buildings", buildingRoute);
// router.use('/residents', residentRoute);

module.exports = router;
