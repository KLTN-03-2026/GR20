const express = require("express");
const router = express.Router();
const employeeRoutes = require("../modules/employees/employee.route");
const buildingRoute = require("../modules/buildings/buildings.route");
const userRoute = require("../modules/user/user.router");
const qrRoute = require("../modules/qr/qr.router"); // ← thêm
const roleRoute = require("../modules/roles/roles.route");
const authRoute = require("../modules/auth/auth.route");
const floorRoute = require("../modules/floors/floors.route");
// Sau này nhóm code chức năng khác thì import thêm: const residentRoute = require('../modules/residents/residents.route');

router.use("/buildings", buildingRoute);
router.use("/employees", employeeRoutes);
router.use("/roles", roleRoute);
router.use("/users", userRoute);
router.use("/auth", authRoute);
router.use("/floors", floorRoute);
// router.use('/residents', residentRoute);
router.use("/qr", qrRoute);

module.exports = router;
