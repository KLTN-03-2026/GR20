const express = require("express");
const router = express.Router();

const employeeRoutes = require("../modules/employees/employee.route");
const buildingRoute = require("../modules/buildings/buildings.route");

const userRoute = require("../modules/profile/user.router");
const qrRoute = require("../modules/qr/qr.router");
const roleRoute = require("../modules/roles/roles.route");
const authRoute = require("../modules/auth/auth.route");
const floorRoute = require("../modules/floors/floors.route");
const notificationRoute = require("../modules/notifications/notification.route");
const residentRoute = require("../modules/residents/resident.route");
const maintenanceRoute = require("../modules/maintenances/maintenance.route");
const notificationAdminRoute = require("../modules/notificationsADMIN/notificationADMIN.route");
const chatRoute = require("../modules/chat/chat.route");

router.use("/buildings", buildingRoute);

router.use("/employees", employeeRoutes);
router.use("/roles", roleRoute);
router.use("/users", userRoute);
router.use("/auth", authRoute);
router.use("/floors", floorRoute);
router.use("/qr", qrRoute);
router.use("/notifications", notificationRoute);
router.use("/admin/notifications", notificationAdminRoute);
router.use("/residents", residentRoute);
router.use("/maintenances", maintenanceRoute);
router.use("/chat", chatRoute);

module.exports = router;
