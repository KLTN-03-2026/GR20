const dashboardRepo = require("./dashboard.repository");

const getStats = async (userId) => {
  // Thêm các hàm mới vào Promise.all để chạy song song cho mượt
  const [
    pendingCount,
    inProgressCount,
    doneTodayCount,
    overdueCount,
    myTasksCount,
    priorityStats, // Mới
    apartmentStats, // Mới
    highPriorityAlerts, // Mới
    overloadedTechs, // Mới
  ] = await Promise.all([
    dashboardRepo.countPending(),
    dashboardRepo.countInProgress(),
    dashboardRepo.countDoneToday(),
    dashboardRepo.countOverdue(),
    dashboardRepo.countMyTasks(userId),
    dashboardRepo.getRequestsByPriority(),
    dashboardRepo.getRequestsByApartment(),
    dashboardRepo.getHighPriorityOverdue(),
    dashboardRepo.getOverloadedTechsCount(),
  ]);

  return {
    overviewCards: {
      pending: pendingCount,
      inProgress: inProgressCount,
      doneToday: doneTodayCount,
      overdue: overdueCount,
      myTasks: myTasksCount,
    },
    // Đổ dữ liệu Biểu đồ
    charts: {
      byPriority: priorityStats, // Trả về mảng: [{ priority: 'HIGH', count: 5 }, ...]
      byApartment: apartmentStats, // Trả về mảng: [{ apartmentCode: 'A101', count: 3 }, ...]
    },
    // Đổ dữ liệu Cảnh báo
    alerts: {
      highPriorityOverdue: highPriorityAlerts,
      overloadedTechs: overloadedTechs,
    },
    performance: {}, // Lát mình làm tiếp 3.4, 3.5
  };
};

module.exports = {
  getStats,
};
