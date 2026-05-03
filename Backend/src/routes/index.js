const express = require("express");
const router = express.Router();

const employeeRoutes = require("../modules/employees/employee.route");
const buildingRoute = require("../modules/buildings/buildings.route");
const buildingImageRoute = require("../modules/building-images/building-images.route");
const buildingAssignmentRoute = require("../modules/building-assignments/building-assignments.route");

const userRoute = require("../modules/profile/user.router");
const qrRoute = require("../modules/qr/qr.router");
const roleRoute = require("../modules/roles/roles.route");
const authRoute = require("../modules/auth/auth.route");
const floorRoute = require("../modules/floors/floors.route");
const apartmentRoute = require("../modules/apartments/apartment.route");
const notificationRoute = require("../modules/notifications/notification.route");
const residentRoute = require("../modules/residents/resident.route");
const maintenanceRoute = require("../modules/maintenances/maintenance.route");
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

module.exports = router;
