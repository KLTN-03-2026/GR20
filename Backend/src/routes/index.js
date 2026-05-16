// const express = require("express");
// const router = express.Router();

// const employeeRoutes = require("../modules/employees/employee.route");
// const buildingRoute = require("../modules/buildings/buildings.route");

// const userRoute = require("../modules/profile/user.router");
// const qrRoute = require("../modules/qr/qr.router");
// const roleRoute = require("../modules/roles/roles.route");
// const authRoute = require("../modules/auth/auth.route");
// const floorRoute = require("../modules/floors/floors.route");
// const notificationRoute = require("../modules/notifications/notification.route");
// const residentRoute = require("../modules/residents/resident.route");
// const maintenanceRoute = require("../modules/maintenances/maintenance.route");
// const securityResidentRoute = require("../modules/security/security.resident.routes");
// const notificationAdminRoute = require("../modules/notificationsADMIN/notificationADMIN.route");
// const adminRoutes = require("../modules/qr/admin/admin.routes");
// const residentRoutes = require("../modules/qr/resident/resident.routes");
// const guardRoutes = require("../modules/qr/guard/guard.routes");

// router.use("/admin", adminRoutes);      // /api/qr/admin/*
// router.use("/resident", residentRoutes); // /api/qr/resident/*
// router.use("/guard", guardRoutes);      // /api/qr/guard/*
// router.use("/buildings", buildingRoute);

// router.use("/employees", employeeRoutes);
// router.use("/roles", roleRoute);
// router.use("/users", userRoute);
// router.use("/auth", authRoute);
// router.use("/floors", floorRoute);
// router.use("/qr", qrRoute);
// router.use("/notifications", notificationRoute);
// router.use("/admin/notifications", notificationAdminRoute);
// router.use("/residents", residentRoute);
// router.use("/maintenances", maintenanceRoute);
// router.use("/security", securityResidentRoute);
// router.use("/security-residents", securityResidentRoute);
// module.exports = router;

const express = require("express");
const router = express.Router();

const employeeRoutes = require("../modules/employees/employee.route");
const buildingRoute = require("../modules/buildings/buildings.route");
const buildingImageRoute = require("../modules/building-images/building-images.route");
const buildingAssignmentRoute = require("../modules/building-assignments/building-assignments.route");

const userRoute = require("../modules/profile/user.router");
// const qrRoute = require("../modules/qr/index");
// const qrRoute = require("../modules/qr/qr.router")
// const roleRoute = require("../modules/roles/roles.route");
const qrRoute = require("../modules/qr/index");
const roleRoute = require("../modules/roles/roles.route");
const authRoute = require("../modules/auth/auth.route");
const floorRoute = require("../modules/floors/floors.route");
const apartmentRoute = require("../modules/apartments/apartment.route");
const notificationRoute = require("../modules/notifications/notification.route");
const residentRoute = require("../modules/residents/resident.route");
const maintenanceRoute = require("../modules/maintenances/maintenance.route");
const securityResidentRoute = require("../modules/security/security.resident.routes");

const chatRoute = require("../modules/chat/chat.route");
const maintenanceAssignmentsRoute = require("../modules/maintenance-assignments/maintenance-assignments.route");
const notificationAdminRoute = require("../modules/notificationsADMIN/notificationADMIN.route");
const utilityMeterRoute = require("../modules/utility-meters/utility-meter.route");
const utilityPricingRoute = require("../modules/utility-pricing/utility-pricing.route");
const meterReadingRoute = require("../modules/meter-readings/meter-reading.route");
const billingRoute = require("../modules/billing/billing.route");
const invoiceRoute = require("../modules/invoices/invoice.route");
const invoiceItemRoute = require("../modules/invoice-items/invoice-item.route");
const paymentRoute = require("../modules/payments/payment.route");
const vehicleRoute = require("../modules/vehicles/vehicle.route");
const visitorRoute = require("../modules/visitors/visitor.route");
const contractRoute = require("../modules/contracts/contract.route");
const amenityRoute = require("../modules/amenities/amenity.route");
const statisticsRoute = require("../modules/statistics/statistics.route");
const dashboardProtection = require("../modules/dashboard_Protection/dashboard.routes");

router.use("/uploads", express.static("uploads"));

router.use("/qr", qrRoute);
router.use("/dashboard", dashboardProtection);

// Các routes khác
router.use("/buildings", buildingRoute);
router.use("/building-images", buildingImageRoute);
router.use("/building-assignments", buildingAssignmentRoute);

router.use("/employees", employeeRoutes);
router.use("/roles", roleRoute);
router.use("/users", userRoute);
router.use("/auth", authRoute);
router.use("/floors", floorRoute);
router.use("/apartments", apartmentRoute);
router.use("/qr", qrRoute);
router.use("/notifications", notificationRoute);
router.use("/admin/notifications", notificationAdminRoute);
router.use("/residents", residentRoute);
router.use("/maintenances", maintenanceRoute);
router.use("/chat", chatRoute);
router.use("/security", securityResidentRoute);
router.use("/security-residents", securityResidentRoute);
router.use("/maintenance-assignments", maintenanceAssignmentsRoute);
router.use("/utility-meters", utilityMeterRoute);
router.use("/utility-pricing", utilityPricingRoute);
router.use("/meter-readings", meterReadingRoute);
router.use("/billing", billingRoute);
router.use("/invoices", invoiceRoute);
router.use("/invoice-items", invoiceItemRoute);
router.use("/payments", paymentRoute);
router.use("/vehicles", vehicleRoute);
router.use("/visitors", visitorRoute);
router.use("/contracts", contractRoute);
router.use("/statistics", statisticsRoute);

router.use("/amenities", amenityRoute);
router.use("/buildings/:buildingId/amenities", amenityRoute);

module.exports = router;
