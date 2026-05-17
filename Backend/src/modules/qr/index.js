// const express = require("express");
// const router = express.Router();

// const adminRoutes = require("./admin/admin.routes");
// const residentRoutes = require("./resident/resident.routes");
// const guardRoutes = require("./guard/guard.routes");

// // Mount các router con
// router.use("/admin", adminRoutes);
// router.use("/resident", residentRoutes);
// router.use("/guard", guardRoutes);

// module.exports = router;

const express = require("express");
const router = express.Router();

const adminRoutes = require("./admin/admin.routes");
const residentRoutes = require("./resident/resident.routes");
const guardRoutes = require("./guard/guard.routes");

router.use("/admin", adminRoutes);
router.use("/resident", residentRoutes);
router.use("/guard", guardRoutes);

module.exports = router;