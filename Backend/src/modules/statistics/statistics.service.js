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
