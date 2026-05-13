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
