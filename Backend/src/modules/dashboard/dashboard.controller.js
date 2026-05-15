const dashboardService = require("./dashboard.service");

const getDashboardStats = async (req, res) => {
  try {
    // ĐÃ SỬA: Lấy id từ req.user.sub (dựa theo log token của bạn)
    const currentUserId = req.user?.sub;

    const stats = await dashboardService.getStats(currentUserId);

    return res.status(200).json({
      status: "success",
      message: "Lấy dữ liệu thống kê thành công!",
      data: stats,
    });
  } catch (error) {
    console.error("Lỗi Dashboard Controller:", error);
    return res.status(500).json({
      status: "error",
      message: "Lỗi máy chủ nội bộ",
    });
  }
};

module.exports = {
  getDashboardStats,
};
