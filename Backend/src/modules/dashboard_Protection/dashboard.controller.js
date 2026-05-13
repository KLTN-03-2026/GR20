// controllers/dashboard.controller.js
const service = require("./dashboard.service");

const getDashboardStats = async (req, res) => {
  try {
    const guardUserId = req.user?.sub || req.user?.id;
    const { buildingId } = req.query;
    
    if (!guardUserId) {
      return res.status(401).json({
        operationType: "Failed",
        message: "Unauthorized",
        code: "UNAUTHORIZED"
      });
    }
    
    const data = await service.getGuardDashboardStats(guardUserId, buildingId);
    
    res.json({
      operationType: "Success",
      message: "Get dashboard statistics successfully",
      code: "OK",
      data: data,
      timestamp: new Date()
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({
      operationType: "Error",
      message: err.message,
      code: "INTERNAL_ERROR",
      timestamp: new Date()
    });
  }
};

module.exports = { getDashboardStats };