const { pool } = require("../../configs/database.config");

/** buildingIds undefined/null → không lọc. [] → lọc theo danh sách rỗng (= không có bản ghi). */
const addBuildingFilter = (alias, buildingIds, params) => {
  if (buildingIds === undefined || buildingIds === null) return "";
  params.push(buildingIds);
  return ` AND ${alias}.building_id = ANY($${params.length}::bigint[])`;
};

const activeResidentJoin = `
  FROM resident_profiles rp
  INNER JOIN apartments a ON a.id = rp.apartment_id
  WHERE rp.status = 'ACTIVE' AND rp.move_out_date IS NULL
`;

exports.countActiveResidents = async (buildingIds) => {
  const params = [];
  let sql = `SELECT COUNT(*)::int AS c ${activeResidentJoin}`;
  sql += addBuildingFilter("a", buildingIds, params);
  const r = await pool.query(sql, params);
  return r.rows[0]?.c ?? 0;
};

/** Cư dân có bản ghi tạo trong năm (minh họa “mới ghép”) */
exports.countResidentsCreatedInYear = async (year, buildingIds) => {
  const params = [year];
  let sql = `
    SELECT COUNT(*)::int AS c ${activeResidentJoin}
    AND EXTRACT(YEAR FROM rp.created_at::timestamptz) = $1`;
  sql += addBuildingFilter("a", buildingIds, params);
  const r = await pool.query(sql, params);
  return r.rows[0]?.c ?? 0;
};

exports.countResidentsByMonthInYear = async (year, buildingIds) => {
  const params = [year];
  let sql = `
    SELECT EXTRACT(MONTH FROM rp.created_at::timestamptz)::int AS month, COUNT(*)::int AS count
    ${activeResidentJoin}
    AND EXTRACT(YEAR FROM rp.created_at::timestamptz) = $1`;
  sql += addBuildingFilter("a", buildingIds, params);
  sql += ` GROUP BY 1 ORDER BY 1`;
  const r = await pool.query(sql, params);
  return r.rows;
};

exports.countResidentsByRelationship = async (buildingIds) => {
  const params = [];
  let sql = `
    SELECT rp.relationship::text AS relationship, COUNT(*)::int AS count
    ${activeResidentJoin}`;
  sql += addBuildingFilter("a", buildingIds, params);
  sql += ` GROUP BY rp.relationship ORDER BY count DESC`;
  const r = await pool.query(sql, params);
  return r.rows;
};

exports.countOccupiedApartments = async (buildingIds) => {
  const params = [];
  let sql = `SELECT COUNT(*)::int AS c FROM apartments a WHERE a.status = 'OCCUPIED'`;
  sql += addBuildingFilter("a", buildingIds, params);
  const r = await pool.query(sql, params);
  return r.rows[0]?.c ?? 0;
};

exports.apartmentsByStatus = async (buildingIds) => {
  const params = [];
  let sql = `
    SELECT a.status::text AS status, COUNT(*)::int AS count
    FROM apartments a
    WHERE 1=1`;
  sql += addBuildingFilter("a", buildingIds, params);
  sql += ` GROUP BY a.status ORDER BY count DESC`;
  const r = await pool.query(sql, params);
  return r.rows;
};

exports.apartmentsByBuilding = async (buildingIds) => {
  const params = [];
  let having = "";
  if (buildingIds != null) {
    params.push(buildingIds);
    having = ` WHERE b.id = ANY($1::bigint[])`;
  }
  const sql = `
    SELECT
      b.id::text AS building_id,
      b.name AS building_name,
      COUNT(*) FILTER (WHERE a.id IS NOT NULL AND a.status = 'OCCUPIED')::int AS occupied,
      COUNT(*) FILTER (WHERE a.id IS NOT NULL AND a.status = 'AVAILABLE')::int AS available,
      COUNT(*) FILTER (WHERE a.id IS NOT NULL AND a.status = 'MAINTENANCE')::int AS maintenance
    FROM buildings b
    LEFT JOIN apartments a ON a.building_id = b.id
    ${having}
    GROUP BY b.id, b.name
    ORDER BY b.name
  `;
  const r = await pool.query(sql, params.length ? params : []);
  return r.rows;
};

/** Tổng thanh toán thành công trong năm (VNĐ) */
exports.sumPaidInYear = async (year, buildingIds) => {
  const params = [year];
  let sql = `
    SELECT COALESCE(SUM(p.amount::numeric), 0)::numeric AS total
    FROM payments p
    INNER JOIN invoices i ON i.id = p.invoice_id
    INNER JOIN apartments apt ON apt.id = i.apartment_id
    WHERE p.status = 'SUCCESS'
    AND EXTRACT(YEAR FROM COALESCE(p.payment_date::timestamptz, p.created_at::timestamptz)) = $1`;
  sql += addBuildingFilter("apt", buildingIds, params);
  const r = await pool.query(sql, params);
  return r.rows[0]?.total ?? 0;
};

/** Nợ: hóa đơn chưa thanh toán đủ (PENDING/OVERDUE) — theo năm tạo HĐ */
exports.sumOutstandingInvoicesInYear = async (year, buildingIds) => {
  const params = [year];
  let sql = `
    SELECT COALESCE(SUM(i.total_amount::numeric), 0)::numeric AS total
    FROM invoices i
    INNER JOIN apartments apt ON apt.id = i.apartment_id
    WHERE i.status IN ('PENDING', 'OVERDUE')
    AND EXTRACT(YEAR FROM i.created_at::timestamptz) = $1`;
  sql += addBuildingFilter("apt", buildingIds, params);
  const r = await pool.query(sql, params);
  return r.rows[0]?.total ?? 0;
};

/** Tổng giá trị HĐ theo năm — dùng cho tỷ lệ thanh toán (PAID / tổng) */
exports.invoiceTotalsInYear = async (year, buildingIds) => {
  const params = [year];
  let sql = `
    SELECT
      COALESCE(SUM(i.total_amount::numeric) FILTER (WHERE i.status::text = 'PAID'), 0)::numeric AS paid_total,
      COALESCE(SUM(i.total_amount::numeric), 0)::numeric AS all_total
    FROM invoices i
    INNER JOIN apartments apt ON apt.id = i.apartment_id
    WHERE EXTRACT(YEAR FROM i.created_at::timestamptz) = $1`;
  sql += addBuildingFilter("apt", buildingIds, params);
  const r = await pool.query(sql, params);
  return {
    paidTotal: parseFloat(r.rows[0]?.paid_total || 0),
    allTotal: parseFloat(r.rows[0]?.all_total || 0),
  };
};

exports.financeByQuarter = async (year, buildingIds) => {
  const out = [];
  for (let q = 1; q <= 4; q++) {
    const params = [year, q];
    let sqlCollected = `
      SELECT COALESCE(SUM(p.amount::numeric), 0)::numeric AS v
      FROM payments p
      INNER JOIN invoices i ON i.id = p.invoice_id
      INNER JOIN apartments apt ON apt.id = i.apartment_id
      WHERE p.status = 'SUCCESS'
      AND EXTRACT(YEAR FROM COALESCE(p.payment_date::timestamptz, p.created_at::timestamptz)) = $1
      AND EXTRACT(QUARTER FROM COALESCE(p.payment_date::timestamptz, p.created_at::timestamptz)) = $2`;
    const p1 = [...params];
    let     idx = 3;
    if (buildingIds != null) {
      sqlCollected += ` AND apt.building_id = ANY($${idx}::bigint[])`;
      p1.push(buildingIds);
    }
    const collected = await pool.query(sqlCollected, p1);

    let sqlDebt = `
      SELECT COALESCE(SUM(i.total_amount::numeric), 0)::numeric AS v
      FROM invoices i
      INNER JOIN apartments apt ON apt.id = i.apartment_id
      WHERE i.status IN ('PENDING', 'OVERDUE')
      AND EXTRACT(YEAR FROM i.created_at::timestamptz) = $1
      AND EXTRACT(QUARTER FROM i.created_at::timestamptz) = $2`;
    const p2 = [...params];
    idx = 3;
    if (buildingIds != null) {
      sqlDebt += ` AND apt.building_id = ANY($${idx}::bigint[])`;
      p2.push(buildingIds);
    }
    const debt = await pool.query(sqlDebt, p2);

    out.push({
      quarter: `Q${q}`,
      collected: parseFloat(collected.rows[0]?.v || 0),
      debt: parseFloat(debt.rows[0]?.v || 0),
    });
  }
  return out;
};

/** Nhóm nhanh item_name → % (top 6 + gộp còn lại) */
exports.feeStructureByItemName = async (year, buildingIds) => {
  const params = [year];
  let sql = `
    SELECT COALESCE(TRIM(ii.item_name), 'Khác') AS name, SUM(ii.amount::numeric) AS amt
    FROM invoice_items ii
    INNER JOIN invoices i ON i.id = ii.invoice_id
    INNER JOIN apartments apt ON apt.id = i.apartment_id
    WHERE EXTRACT(YEAR FROM i.created_at::timestamptz) = $1`;
  sql += addBuildingFilter("apt", buildingIds, params);
  sql += ` GROUP BY 1 ORDER BY amt DESC`;
  const r = await pool.query(sql, params);
  const rows = r.rows.map((x) => ({
    name: x.name,
    amount: parseFloat(x.amt || 0),
  }));
  const total = rows.reduce((s, x) => s + x.amount, 0);
  if (total <= 0) return [];
  const top = rows.slice(0, 6);
  const rest = rows.slice(6).reduce((s, x) => s + x.amount, 0);
  const result = top.map((x) => ({
    name: x.name,
    percent: Math.round((1000 * x.amount) / total) / 10,
  }));
  if (rest > 0) {
    result.push({
      name: "Khác (gộp)",
      percent: Math.round((1000 * rest) / total) / 10,
    });
  }
  return result;
};

exports.maintenanceCountsByStatusInYear = async (year, buildingIds) => {
  const params = [year];
  let sql = `
    SELECT mr.status::text AS status, COUNT(*)::int AS count
    FROM maintenance_requests mr
    INNER JOIN apartments a ON a.id = mr.apartment_id
    WHERE EXTRACT(YEAR FROM mr.created_at::timestamptz) = $1`;
  sql += addBuildingFilter("a", buildingIds, params);
  sql += ` GROUP BY mr.status`;
  const r = await pool.query(sql, params);
  return r.rows;
};

exports.maintenanceCountByMonthInYear = async (year, buildingIds) => {
  const params = [year];
  let sql = `
    SELECT EXTRACT(MONTH FROM mr.created_at::timestamptz)::int AS month, COUNT(*)::int AS count
    FROM maintenance_requests mr
    INNER JOIN apartments a ON a.id = mr.apartment_id
    WHERE EXTRACT(YEAR FROM mr.created_at::timestamptz) = $1`;
  sql += addBuildingFilter("a", buildingIds, params);
  sql += ` GROUP BY 1 ORDER BY 1`;
  const r = await pool.query(sql, params);
  return r.rows;
};

exports.countMaintenanceTotalInYear = async (year, buildingIds) => {
  const params = [year];
  let sql = `
    SELECT COUNT(*)::int AS c
    FROM maintenance_requests mr
    INNER JOIN apartments a ON a.id = mr.apartment_id
    WHERE EXTRACT(YEAR FROM mr.created_at::timestamptz) = $1`;
  sql += addBuildingFilter("a", buildingIds, params);
  const r = await pool.query(sql, params);
  return r.rows[0]?.c ?? 0;
};

const addBuildingFilterOnBuildings = (buildingIds, params) => {
  if (buildingIds === undefined || buildingIds === null) return "";
  params.push(buildingIds);
  return ` AND b.id = ANY($${params.length}::bigint[])`;
};

exports.countBuildings = async (buildingIds) => {
  const params = [];
  let sql = `SELECT COUNT(*)::int AS c FROM buildings b WHERE 1=1`;
  sql += addBuildingFilterOnBuildings(buildingIds, params);
  const r = await pool.query(sql, params.length ? params : []);
  return r.rows[0]?.c ?? 0;
};

exports.revenueByMonthInYear = async (year, buildingIds) => {
  const params = [year];
  let sql = `
    SELECT
      EXTRACT(MONTH FROM COALESCE(p.payment_date::timestamptz, p.created_at::timestamptz))::int AS month,
      COALESCE(SUM(p.amount::numeric), 0)::numeric AS total
    FROM payments p
    INNER JOIN invoices i ON i.id = p.invoice_id
    INNER JOIN apartments apt ON apt.id = i.apartment_id
    WHERE p.status = 'SUCCESS'
    AND EXTRACT(YEAR FROM COALESCE(p.payment_date::timestamptz, p.created_at::timestamptz)) = $1`;
  sql += addBuildingFilter("apt", buildingIds, params);
  sql += ` GROUP BY 1 ORDER BY 1`;
  const r = await pool.query(sql, params);
  return r.rows;
};

exports.revenueCurrentAndPreviousMonth = async (buildingIds) => {
  const params = [];
  let sql = `
    SELECT
      COALESCE(SUM(p.amount::numeric) FILTER (
        WHERE DATE_TRUNC('month', COALESCE(p.payment_date::timestamptz, p.created_at::timestamptz))
          = DATE_TRUNC('month', CURRENT_DATE)
      ), 0)::numeric AS current_month,
      COALESCE(SUM(p.amount::numeric) FILTER (
        WHERE DATE_TRUNC('month', COALESCE(p.payment_date::timestamptz, p.created_at::timestamptz))
          = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
      ), 0)::numeric AS prev_month
    FROM payments p
    INNER JOIN invoices i ON i.id = p.invoice_id
    INNER JOIN apartments apt ON apt.id = i.apartment_id
    WHERE p.status = 'SUCCESS'`;
  sql += addBuildingFilter("apt", buildingIds, params);
  const r = await pool.query(sql, params.length ? params : []);
  return {
    currentMonth: parseFloat(r.rows[0]?.current_month || 0),
    prevMonth: parseFloat(r.rows[0]?.prev_month || 0),
  };
};

exports.debtByBuilding = async (buildingIds) => {
  const params = [];
  let whereExtra = "";
  if (buildingIds != null) {
    params.push(buildingIds);
    whereExtra = ` WHERE b.id = ANY($1::bigint[])`;
  }
  const sql = `
    SELECT
      b.id::text AS building_id,
      b.name AS building_name,
      COALESCE(SUM(i.total_amount::numeric) FILTER (WHERE i.status IN ('PENDING', 'OVERDUE')), 0)::numeric AS debt_vnd
    FROM buildings b
    LEFT JOIN apartments apt ON apt.building_id = b.id
    LEFT JOIN invoices i ON i.apartment_id = apt.id
    ${whereExtra}
    GROUP BY b.id, b.name
    ORDER BY debt_vnd DESC, b.name
    LIMIT 8
  `;
  const r = await pool.query(sql, params.length ? params : []);
  return r.rows;
};

exports.countInvoicesByStatus = async (buildingIds) => {
  const params = [];
  let sql = `
    SELECT i.status::text AS status, COUNT(*)::int AS count
    FROM invoices i
    INNER JOIN apartments apt ON apt.id = i.apartment_id
    WHERE 1=1`;
  sql += addBuildingFilter("apt", buildingIds, params);
  sql += ` GROUP BY i.status`;
  const r = await pool.query(sql, params.length ? params : []);
  const map = {};
  for (const row of r.rows) map[String(row.status)] = Number(row.count) || 0;
  return map;
};

exports.countStaleMaintenance = async (buildingIds, days = 3) => {
  const params = [days];
  let sql = `
    SELECT COUNT(*)::int AS c
    FROM maintenance_requests mr
    INNER JOIN apartments a ON a.id = mr.apartment_id
    WHERE mr.status IN ('OPEN', 'IN_PROGRESS')
    AND mr.created_at::timestamptz < NOW() - ($1::int * INTERVAL '1 day')`;
  sql += addBuildingFilter("a", buildingIds, params);
  const r = await pool.query(sql, params);
  return r.rows[0]?.c ?? 0;
};

exports.countContractsExpiringWithinDays = async (buildingIds, days = 30) => {
  const params = [days];
  let sql = `
    SELECT COUNT(*)::int AS c
    FROM contracts c
    INNER JOIN apartments apt ON apt.id = c.apartment_id
    WHERE c.status = 'ACTIVE'
    AND c.end_date IS NOT NULL
    AND c.end_date::date >= CURRENT_DATE
    AND c.end_date::date <= CURRENT_DATE + ($1::int * INTERVAL '1 day')`;
  sql += addBuildingFilter("apt", buildingIds, params);
  const r = await pool.query(sql, params);
  return r.rows[0]?.c ?? 0;
};

exports.countActiveQrCodes = async (buildingIds) => {
  const params = [];
  let sql = `
    SELECT COUNT(*)::int AS c
    FROM qr_codes qc
    LEFT JOIN apartments apt ON apt.id = qc.apartment_id
    WHERE qc.status = 'ACTIVE'`;
  if (buildingIds != null) {
    params.push(buildingIds);
    sql += ` AND apt.building_id = ANY($${params.length}::bigint[])`;
  }
  const r = await pool.query(sql, params.length ? params : []);
  return r.rows[0]?.c ?? 0;
};

exports.countActiveStaff = async () => {
  const r = await pool.query(
    `SELECT COUNT(*)::int AS c FROM users WHERE is_active = true AND role_id IN (3, 4)`
  );
  return r.rows[0]?.c ?? 0;
};

exports.recentSuccessfulPayments = async (buildingIds, limit = 5) => {
  const params = [];
  let sql = `
    SELECT
      p.id,
      p.amount::numeric AS amount,
      p.status::text AS status,
      i.invoice_code,
      apt.apartment_code,
      b.name AS building_name
    FROM payments p
    INNER JOIN invoices i ON i.id = p.invoice_id
    INNER JOIN apartments apt ON apt.id = i.apartment_id
    LEFT JOIN buildings b ON b.id = apt.building_id
    WHERE p.status = 'SUCCESS'`;
  sql += addBuildingFilter("apt", buildingIds, params);
  params.push(limit);
  sql += ` ORDER BY COALESCE(p.payment_date::timestamptz, p.created_at::timestamptz) DESC LIMIT $${params.length}`;
  const r = await pool.query(sql, params);
  return r.rows;
};

exports.topBuildingByPaidRevenueYear = async (year, buildingIds) => {
  const params = [year];
  let sql = `
    SELECT
      b.id::text AS building_id,
      b.name AS building_name,
      COALESCE(SUM(p.amount::numeric), 0)::numeric AS revenue_vnd,
      COUNT(*) FILTER (WHERE apt.status = 'OCCUPIED')::int AS occupied,
      COUNT(*) FILTER (WHERE apt.id IS NOT NULL)::int AS total_units
    FROM buildings b
    LEFT JOIN apartments apt ON apt.building_id = b.id
    LEFT JOIN invoices i ON i.apartment_id = apt.id
    LEFT JOIN payments p ON p.invoice_id = i.id
      AND p.status = 'SUCCESS'
      AND EXTRACT(YEAR FROM COALESCE(p.payment_date::timestamptz, p.created_at::timestamptz)) = $1`;
  if (buildingIds != null) {
    params.push(buildingIds);
    sql += ` WHERE b.id = ANY($${params.length}::bigint[])`;
  }
  sql += ` GROUP BY b.id, b.name ORDER BY revenue_vnd DESC NULLS LAST LIMIT 1`;
  const r = await pool.query(sql, params);
  return r.rows[0] || null;
};

exports.occupancyByBuilding = async (buildingIds) => {
  const rows = await exports.apartmentsByBuilding(buildingIds);
  return (rows || []).map((r) => {
    const occupied = Number(r.occupied) || 0;
    const available = Number(r.available) || 0;
    const maintenance = Number(r.maintenance) || 0;
    const total = occupied + available + maintenance;
    const occupancyPercent = total > 0 ? Math.round((1000 * occupied) / total) / 10 : 0;
    return {
      buildingId: r.building_id,
      buildingName: r.building_name || r.building_id,
      occupied,
      total,
      occupancyPercent,
    };
  });
};
