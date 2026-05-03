const { pool } = require("../../configs/database.config");
const { AppError } = require("../../common/app-error");

const isForeignKeyViolation = (err) => err && err.code === "23503";

// CREATE
const createContract = async (entity) => {
  try {
    const result = await pool.query(
      `INSERT INTO contracts 
      (resident_id, apartment_id, contract_type, status, start_date, end_date, monthly_rent, deposit, note)
      VALUES (
        $1, $2,
        $3::public.contract_type_enum,
        COALESCE($4::public.contract_status_enum, 'PENDING'::public.contract_status_enum),
        $5, $6, $7, $8, $9
      )
      RETURNING id`,
      [
        entity.residentId,
        entity.apartmentId,
        entity.contractType,
        entity.status,
        entity.startDate,
        entity.endDate,
        entity.monthlyRent,
        entity.deposit,
        entity.note,
      ]
    );
    return result.rows[0];
  } catch (err) {
    if (isForeignKeyViolation(err)) throw new AppError(400, "Invalid residentId or apartmentId");
    throw err;
  }
};

// GET LIST (FILTER + PAGINATION)
const getContracts = async ({ status, contractType, page, size, search, residentId, apartmentId }) => {
  await pool
    .query(
      `
    UPDATE contracts
    SET status = 'EXPIRED'::public.contract_status_enum, updated_at = NOW()
    WHERE status = 'ACTIVE'::public.contract_status_enum AND end_date < CURRENT_DATE
  `,
    )
    .catch(() => {});

  const offset = page * size;
  const conditions = [];
  const values = [];

  if (status) {
    values.push(status);
    conditions.push(`c.status = $${values.length}::public.contract_status_enum`);
  }
  if (contractType) {
    values.push(contractType);
    conditions.push(`c.contract_type = $${values.length}::public.contract_type_enum`);
  }
  if (residentId) {
    values.push(residentId);
    conditions.push(`c.resident_id = $${values.length}`);
  }
  if (apartmentId) {
    values.push(apartmentId);
    conditions.push(`c.apartment_id = $${values.length}`);
  }
  if (search) {
    values.push(`%${search}%`);
    conditions.push(`(COALESCE(u.full_name, '') ILIKE $${values.length} OR COALESCE(a.apartment_code, '') ILIKE $${values.length})`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  /** Luôn JOIN u,a để WHERE search an toàn và COUNT khớp danh sách */
  const fromJoin = `
    FROM contracts c
    LEFT JOIN users u ON c.resident_id = u.id
    LEFT JOIN apartments a ON c.apartment_id = a.id
  `;

  /** Tên hiển thị: full_name → username → ID user (khớp FK) để không bị hàng chỉ có "—" khi full_name trống hoặc dữ liệu cũ */
  const residentDisplaySql = `
    COALESCE(
      NULLIF(TRIM(u.full_name), ''),
      NULLIF(TRIM(u.username), ''),
      CASE WHEN c.resident_id IS NOT NULL THEN '(User #' || c.resident_id::text || ')'
      END
    )`;

  const dataQuery = `
    SELECT
      c.id,
      c.resident_id,
      ${residentDisplaySql} AS resident_name,
      c.apartment_id,
      a.apartment_code AS apartment_code,
      c.contract_type,
      c.status,
      c.start_date,
      c.end_date,
      c.monthly_rent,
      c.deposit,
      c.note
    ${fromJoin}
    ${whereClause}
    ORDER BY c.id DESC
    LIMIT $${values.length + 1} OFFSET $${values.length + 2}
  `;

  const countQuery = `SELECT COUNT(*)::int AS total ${fromJoin} ${whereClause}`;
  const dataValues = [...values, size, offset];
  const rows = await pool.query(dataQuery, dataValues);
  const countResult = await pool.query(countQuery, values);
  return { rows: rows.rows, total: countResult.rows[0]?.total || 0 };
};

// GET DETAIL
const getById = async (id) => {
  const result = await pool.query(
    `SELECT
       c.*,
       COALESCE(
         NULLIF(TRIM(u.full_name), ''),
         NULLIF(TRIM(u.username), ''),
         CASE WHEN c.resident_id IS NOT NULL THEN '(User #' || c.resident_id::text || ')'
         END
       ) AS resident_name,
       a.apartment_code AS apartment_code
     FROM contracts c
     LEFT JOIN users u ON c.resident_id = u.id
     LEFT JOIN apartments a ON c.apartment_id = a.id
     WHERE c.id = $1`,
    [id]
  );
  return result.rows[0];
};

// UPDATE
const updateContract = async (id, entity) => {
  const fields = [];
  const values = [];
  let index = 1;
  const map = {
    residentId: "resident_id",
    apartmentId: "apartment_id",
    contractType: "contract_type",
    status: "status",
    startDate: "start_date",
    endDate: "end_date",
    monthlyRent: "monthly_rent",
    deposit: "deposit",
    note: "note",
  };
  Object.entries(entity).forEach(([key, value]) => {
    if (value !== undefined && map[key]) {
      if (key === "status") {
        fields.push(`${map[key]} = $${index++}::public.contract_status_enum`);
      } else if (key === "contractType") {
        fields.push(`${map[key]} = $${index++}::public.contract_type_enum`);
      } else {
        fields.push(`${map[key]} = $${index++}`);
      }
      values.push(value);
    }
  });
  if (!fields.length) throw new AppError(400, "No fields to update");
  values.push(id);
  try {
    const result = await pool.query(
      `UPDATE contracts SET ${fields.join(", ")}, updated_at = NOW() WHERE id = $${index} RETURNING *`,
      values
    );
    return result.rows[0];
  } catch (err) {
    if (isForeignKeyViolation(err)) throw new AppError(400, "Invalid residentId or apartmentId");
    throw err;
  }
};

// DELETE (TERMINATE)
const terminateContract = async (id) => {
  const result = await pool.query(
    `UPDATE contracts SET status = 'TERMINATED'::public.contract_status_enum, updated_at = NOW() WHERE id = $1 RETURNING id`,
    [id]
  );
  return result.rows[0];
};

// RENEW
const renewContract = async (id, data) => {
  const result = await pool.query(
    `UPDATE contracts SET end_date=$1, monthly_rent=$2, status='ACTIVE'::public.contract_status_enum, updated_at = NOW() WHERE id=$3 RETURNING *`,
    [data.newEndDate, data.newMonthlyRent, id]
  );
  return result.rows[0];
};

module.exports = {
  createContract,
  getContracts,
  getById,
  updateContract,
  terminateContract,
  renewContract,
};