const repo = require("./statistics.repository");

const MONTH_LABELS = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];

const REL_LABEL = {
  OWNER: "Chủ hộ (OWNER)",
  TENANT: "Thuê (TENANT)",
  FAMILY: "Thành viên (FAMILY)",
  MEMBER: "Thành viên (MEMBER)",
  OTHER: "Khác",
};

const ROOM_STATUS_META = {
  OCCUPIED: { name: "Đang ở", key: "OCCUPIED" },
  AVAILABLE: { name: "Trống", key: "AVAILABLE" },
  MAINTENANCE: { name: "Bảo trì", key: "MAINTENANCE" },
};

const MAINT_STATUS_LABEL = {
  OPEN: "Mở (OPEN)",
  IN_PROGRESS: "Đang làm (IN_PROGRESS)",
  DONE: "Hoàn thành (DONE)",
  CANCELLED: "Hủy (CANCELLED)",
};

const num = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

function fillMonths(rows) {
  const map = new Map();
  for (const r of rows || []) {
    const m = Number(r.month);
    if (m >= 1 && m <= 12) map.set(m, Number(r.count) || 0);
  }
  return MONTH_LABELS.map((month, i) => ({ month, count: map.get(i + 1) || 0 }));
}

/**
 * @param {number} year
 * @param {null | number[]} buildingIds — null: toàn hệ thống; [] hoặc [id]: lọc theo tòa
 */
exports.getDashboard = async (year, buildingIds) => {
  const y = Number(year);
  const safeYear = Number.isFinite(y) && y >= 1970 && y <= 2100 ? y : new Date().getFullYear();
  const scope = buildingIds;

  const [
    activeResidents,
    newThisYear,
    newPrevYear,
    residentMonthRows,
    relRows,
    occupiedCount,
    aptStatusRows,
    aptByBuildingRows,
    paidVnd,
    outstandingVnd,
    invTotals,
    financeQuarter,
    feeStructure,
    maintTotal,
    maintStatusRows,
    maintMonthRows,
  ] = await Promise.all([
    repo.countActiveResidents(scope),
    repo.countResidentsCreatedInYear(safeYear, scope),
    repo.countResidentsCreatedInYear(safeYear - 1, scope),
    repo.countResidentsByMonthInYear(safeYear, scope),
    repo.countResidentsByRelationship(scope),
    repo.countOccupiedApartments(scope),
    repo.apartmentsByStatus(scope),
    repo.apartmentsByBuilding(scope),
    repo.sumPaidInYear(safeYear, scope),
    repo.sumOutstandingInvoicesInYear(safeYear, scope),
    repo.invoiceTotalsInYear(safeYear, scope),
    repo.financeByQuarter(safeYear, scope),
    repo.feeStructureByItemName(safeYear, scope),
    repo.countMaintenanceTotalInYear(safeYear, scope),
    repo.maintenanceCountsByStatusInYear(safeYear, scope),
    repo.maintenanceCountByMonthInYear(safeYear, scope),
  ]);

  const avgPerUnit = occupiedCount > 0 ? Math.round((100 * activeResidents) / occupiedCount) / 100 : 0;
  const paidOnTimePct =
    invTotals.allTotal > 0 ? Math.round((1000 * invTotals.paidTotal) / invTotals.allTotal) / 10 : 0;

  const residents = {
    activeCount: activeResidents,
    newInYear: newThisYear,
    newPrevYear,
    avgPerOccupiedUnit: avgPerUnit,
    byMonth: fillMonths(residentMonthRows),
    relationship: (relRows || []).map((r) => {
      const rel = String(r.relationship || "OTHER");
      return {
        relationship: rel,
        name: REL_LABEL[rel] || rel,
        count: Number(r.count) || 0,
      };
    }),
  };

  const totalAptUnits = (aptStatusRows || []).reduce((s, r) => s + (Number(r.count) || 0), 0);

  const apartments = {
    totalUnits: totalAptUnits,
    byStatus: (aptStatusRows || []).map((r) => {
      const k = String(r.status || "");
      const meta = ROOM_STATUS_META[k] || { name: k, key: k };
      return { ...meta, count: Number(r.count) || 0 };
    }),
    byBuilding: (aptByBuildingRows || []).map((r) => ({
      buildingId: r.building_id,
      buildingName: r.building_name || r.building_id,
      occupied: Number(r.occupied) || 0,
      available: Number(r.available) || 0,
      maintenance: Number(r.maintenance) || 0,
    })),
  };

  /** triệu VNĐ để FE vẽ biểu đồ cùng trục mock */
  const finance = {
    paidYearVnd: num(paidVnd),
    outstandingVnd: num(outstandingVnd),
    paidOnTimePercent: paidOnTimePct,
    byQuarter: financeQuarter.map((q) => ({
      q: q.quarter,
      collectedVnd: q.collected,
      debtVnd: q.debt,
      collectedMillions: Math.round(q.collected / 1e5) / 10,
      debtMillions: Math.round(q.debt / 1e5) / 10,
    })),
    feeStructurePercent: feeStructure,
  };

  const stMap = {};
  for (const row of maintStatusRows || []) {
    stMap[String(row.status)] = Number(row.count) || 0;
  }
  const openProg = (stMap.OPEN || 0) + (stMap.IN_PROGRESS || 0);

  const maintenance = {
    totalYear: maintTotal,
    openInProgress: openProg,
    done: stMap.DONE || 0,
    byMonth: fillMonths(maintMonthRows).map(({ month, count }) => ({ month, total: count })),
    byStatus: (maintStatusRows || []).map((r) => ({
      status: String(r.status),
      name: MAINT_STATUS_LABEL[String(r.status)] || String(r.status),
      count: Number(r.count) || 0,
    })),
  };

  return {
    year: safeYear,
    residents,
    apartments,
    finance,
    maintenance,
  };
};

function fillRevenueMonths(rows) {
  const map = new Map();
  for (const r of rows || []) {
    const m = Number(r.month);
    if (m >= 1 && m <= 12) map.set(m, parseFloat(r.total) || 0);
  }
  return MONTH_LABELS.map((month, i) => ({
    month,
    amountVnd: map.get(i + 1) || 0,
  }));
}

function buildAiInsights({ occupancyPercent, revenueGrowthPercent, topDebtBuilding, expiringContracts }) {
  const insights = [];
  if (occupancyPercent >= 85) {
    insights.push(
      `Dự báo quý tới doanh thu có thể tăng nếu duy trì tỷ lệ lấp đầy ${occupancyPercent}%`
    );
  }
  if (topDebtBuilding && topDebtBuilding.debtVnd > 0) {
    insights.push(
      `"${topDebtBuilding.buildingName}" đang có công nợ cao nhất — nên rà soát công tác thu phí`
    );
  }
  if (expiringContracts > 0) {
    insights.push(
      `Phát hiện ${expiringContracts} hợp đồng sắp hết hạn trong 30 ngày — cần chủ động gia hạn`
    );
  }
  if (revenueGrowthPercent != null && revenueGrowthPercent < 0) {
    insights.push(`Doanh thu tháng này giảm ${Math.abs(revenueGrowthPercent)}% so với tháng trước`);
  }
  if (insights.length === 0) {
    insights.push("Hệ thống đang vận hành ổn định trong kỳ hiện tại");
  }
  return insights.slice(0, 4);
}

function buildAlerts({ overdueCount, overduePercent, staleMaintenance, lowestOccupancyBuilding }) {
  const alerts = [];
  if (overduePercent >= 30) {
    alerts.push({
      type: "error",
      title: `Công nợ quá hạn: ${overduePercent}%`,
      subtitle: "Vượt ngưỡng an toàn 30%",
    });
  } else if (overdueCount > 0) {
    alerts.push({
      type: "error",
      title: `Hóa đơn quá hạn: ${overdueCount}`,
      subtitle: "Cần theo dõi thu hồi kịp thời",
    });
  }
  if (lowestOccupancyBuilding && lowestOccupancyBuilding.occupancyPercent < 75) {
    alerts.push({
      type: "error",
      title: `${lowestOccupancyBuilding.buildingName}: Thanh toán / lấp đầy thấp`,
      subtitle: `Hiện đạt ${lowestOccupancyBuilding.occupancyPercent}% lấp đầy`,
    });
  }
  if (staleMaintenance > 0) {
    alerts.push({
      type: "warning",
      title: `${staleMaintenance} yêu cầu bảo trì`,
      subtitle: "Chưa xử lý trong hơn 3 ngày",
    });
  }
  return alerts;
}

/**
 * Tổng quan hệ thống — trang admin HomePageAdmin
 */
exports.getSystemOverview = async (year, buildingIds) => {
  const y = Number(year);
  const safeYear = Number.isFinite(y) && y >= 1970 && y <= 2100 ? y : new Date().getFullYear();
  const scope = buildingIds;

  const [
    buildingCount,
    aptStatusRows,
    activeResidents,
    occupiedCount,
    revenueMonths,
    monthRevenue,
    feeStructure,
    debtRows,
    invoiceStatusMap,
    staleMaintenance,
    expiringContracts,
    activeQr,
    activeStaff,
    recentPayments,
    topBuilding,
    occupancyRows,
  ] = await Promise.all([
    repo.countBuildings(scope),
    repo.apartmentsByStatus(scope),
    repo.countActiveResidents(scope),
    repo.countOccupiedApartments(scope),
    repo.revenueByMonthInYear(safeYear, scope),
    repo.revenueCurrentAndPreviousMonth(scope),
    repo.feeStructureByItemName(safeYear, scope),
    repo.debtByBuilding(scope),
    repo.countInvoicesByStatus(scope),
    repo.countStaleMaintenance(scope, 3),
    repo.countContractsExpiringWithinDays(scope, 30),
    repo.countActiveQrCodes(scope),
    repo.countActiveStaff(),
    repo.recentSuccessfulPayments(scope, 5),
    repo.topBuildingByPaidRevenueYear(safeYear, scope),
    repo.occupancyByBuilding(scope),
  ]);

  const totalApartments = (aptStatusRows || []).reduce((s, r) => s + (Number(r.count) || 0), 0);
  const occupancyPercent =
    totalApartments > 0 ? Math.round((1000 * occupiedCount) / totalApartments) / 10 : 0;

  const currentMonthVnd = num(monthRevenue.currentMonth);
  const prevMonthVnd = num(monthRevenue.prevMonth);
  let revenueGrowthPercent = null;
  if (prevMonthVnd > 0) {
    revenueGrowthPercent = Math.round((1000 * (currentMonthVnd - prevMonthVnd)) / prevMonthVnd) / 10;
  } else if (currentMonthVnd > 0) {
    revenueGrowthPercent = 100;
  }

  const maxDebt = Math.max(...(debtRows || []).map((r) => parseFloat(r.debt_vnd) || 0), 1);
  const debtByBuilding = (debtRows || []).map((r) => {
    const debtVnd = parseFloat(r.debt_vnd) || 0;
    return {
      buildingId: r.building_id,
      buildingName: r.building_name || r.building_id,
      debtVnd,
      barPercent: Math.round((100 * debtVnd) / maxDebt),
    };
  });

  const topDebtBuilding =
    debtByBuilding.length > 0
      ? { buildingName: debtByBuilding[0].buildingName, debtVnd: debtByBuilding[0].debtVnd }
      : null;

  const pendingCount = (invoiceStatusMap.PENDING || 0) + (invoiceStatusMap.OVERDUE || 0);
  const overdueCount = invoiceStatusMap.OVERDUE || 0;
  const overduePercent =
    pendingCount > 0 ? Math.round((1000 * overdueCount) / pendingCount) / 10 : 0;

  const sortedOcc = [...occupancyRows].sort((a, b) => a.occupancyPercent - b.occupancyPercent);
  const lowestOccupancyBuilding = sortedOcc[0] || null;

  const buildingNames = occupancyRows.map((b) => b.buildingName).filter(Boolean);
  const buildingNamesSummary =
    buildingNames.length <= 2
      ? buildingNames.join(" & ")
      : `${buildingNames.slice(0, 2).join(", ")} +${buildingNames.length - 2} tòa`;

  const recentActivities = [];
  for (const p of recentPayments || []) {
    recentActivities.push({
      category: "Giao dịch",
      categoryIcon: "paid",
      categoryTone: "secondary",
      detail: p.invoice_code
        ? `Hóa đơn ${p.invoice_code}${p.apartment_code ? ` · ${p.apartment_code}` : ""}`
        : "Thanh toán hóa đơn",
      value: num(p.amount),
      valueFormatted: null,
      status: "Thành công",
      statusTone: "success",
    });
  }
  if (expiringContracts > 0) {
    recentActivities.push({
      category: "Hợp đồng hết hạn",
      categoryIcon: "history_edu",
      categoryTone: "error",
      detail: `${expiringContracts} hợp đồng sắp hết hạn`,
      value: null,
      valueFormatted: "Trong 30 ngày",
      status: "Khẩn cấp",
      statusTone: "error",
    });
  }

  let featuredBuilding = null;
  if (topBuilding) {
    const totalUnits = Number(topBuilding.total_units) || 0;
    const occ = Number(topBuilding.occupied) || 0;
    featuredBuilding = {
      buildingId: topBuilding.building_id,
      buildingName: topBuilding.building_name || topBuilding.building_id,
      occupancyPercent: totalUnits > 0 ? Math.round((1000 * occ) / totalUnits) / 10 : 0,
      revenueVnd: parseFloat(topBuilding.revenue_vnd) || 0,
    };
  }

  const topRevenueBuilding =
    featuredBuilding?.buildingName || debtByBuilding[0]?.buildingName || buildingNames[0] || "—";

  return {
    year: safeYear,
    buildingNamesSummary: buildingNamesSummary || "Toàn hệ thống",
    kpis: {
      buildingCount,
      apartmentCount: totalApartments,
      residentCount: activeResidents,
      occupancyPercent,
      revenueThisMonthVnd: currentMonthVnd,
      revenueGrowthPercent,
    },
    revenueByMonth: fillRevenueMonths(revenueMonths),
    revenueStructure: (feeStructure || []).map((x) => ({
      name: x.name,
      percent: x.percent,
    })),
    revenueStructureTotalVnd: currentMonthVnd,
    debtByBuilding,
    alerts: buildAlerts({ overdueCount, overduePercent, staleMaintenance, lowestOccupancyBuilding }),
    aiInsights: buildAiInsights({
      occupancyPercent,
      revenueGrowthPercent,
      topDebtBuilding,
      expiringContracts,
    }),
    quickStats: {
      topRevenueBuilding,
      activeQrCount: activeQr,
      activeStaffCount: activeStaff,
      systemStatus: overduePercent >= 30 || staleMaintenance > 5 ? "attention" : "stable",
    },
    recentActivities: recentActivities.slice(0, 6),
    featuredBuilding,
  };
};
