const { pool } = require("../../configs/database.config");
const { AppError } = require("../../common/app-error");

const isUniqueViolation = (err) => err && err.code === "23505";
const isForeignKeyViolation = (err) => err && err.code === "23503";

const createUtilityMeter = async (entity) => {
  const query = `
    INSERT INTO utility_meters (apartment_id, meter_type, meter_code, installed_date, status)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
  `;
  const values = [entity.apartment_id, entity.meter_type, entity.meter_code, entity.installed_date || null, entity.status || "ACTIVE"];
  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (err) {
    if (isUniqueViolation(err)) throw new AppError(409, "meterCode already exists");
    if (isForeignKeyViolation(err)) throw new AppError(400, "Invalid apartmentId");
    throw err;
  }
};

const getAllUtilityMeters = async ({ meterType, apartmentId, status, page = 0, size = 10 } = {}) => {
  const conditions = [];
  const values = [];
  let index = 1;

  if (status) {
    conditions.push(`status = $${index++}`);
    values.push(status);
  }

  if (meterType) {
    conditions.push(`meter_type = $${index++}`);
    values.push(meterType);
  }

  if (apartmentId) {
    conditions.push(`apartment_id = $${index++}`);
    values.push(apartmentId);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const countQuery = `SELECT COUNT(*)::int AS total FROM utility_meters ${whereClause}`;
  const countResult = await pool.query(countQuery, values);

  const offset = page * size;
  const query = `SELECT * FROM utility_meters ${whereClause} ORDER BY id DESC LIMIT $${index++} OFFSET $${index++}`;
  const result = await pool.query(query, [...values, size, offset]);
  return { rows: result.rows, total: countResult.rows[0]?.total || 0 };
};

const getUtilityMeterById = async (id) => {
  const result = await pool.query(`SELECT * FROM utility_meters WHERE id = $1 AND status <> 'INACTIVE'`, [id]);
  return result.rows[0];
};

const getUtilityMetersByUserId = async ({ userId, page = 0, size = 10, meterType, status } = {}) => {
  const conditions = [
    `rp.user_id = $1`,
    `rp.move_out_date IS NULL`,
    `COALESCE(NULLIF(trim(um.status::text), ''), 'ACTIVE') <> 'INACTIVE'`,
  ];
  const values = [userId];
  let index = 2;

  if (meterType) {
    conditions.push(`um.meter_type = $${index++}`);
    values.push(meterType);
  }
  if (status) {
    conditions.push(`um.status = $${index++}`);
    values.push(status);
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`;
  const countResult = await pool.query(
    `
      SELECT COUNT(*)::int AS total
      FROM utility_meters um
      JOIN resident_profiles rp ON rp.apartment_id = um.apartment_id
      ${whereClause}
    `,
    values
  );

  const offset = page * size;
  const result = await pool.query(
    `
      SELECT
        um.*,
        a.apartment_code AS apartment_code,
        b.name AS building_name
      FROM utility_meters um
      JOIN resident_profiles rp ON rp.apartment_id = um.apartment_id
      LEFT JOIN apartments a ON a.id = um.apartment_id
      LEFT JOIN buildings b ON b.id = a.building_id
      ${whereClause}
      ORDER BY um.id DESC
      LIMIT $${index++} OFFSET $${index++}
    `,
    [...values, size, offset]
  );
  return { rows: result.rows, total: countResult.rows[0]?.total || 0 };
};

const getUtilityMeterByUserAndId = async ({ userId, meterId }) => {
  const result = await pool.query(
    `
      SELECT
        um.*,
        a.apartment_code AS apartment_code,
        b.name AS building_name
      FROM utility_meters um
      JOIN resident_profiles rp ON rp.apartment_id = um.apartment_id
      LEFT JOIN apartments a ON a.id = um.apartment_id
      LEFT JOIN buildings b ON b.id = a.building_id
      WHERE rp.user_id = $1
        AND rp.move_out_date IS NULL
        AND um.id = $2
        AND COALESCE(NULLIF(trim(um.status::text), ''), 'ACTIVE') <> 'INACTIVE'
      LIMIT 1
    `,
    [userId, meterId]
  );
  return result.rows[0];
};

const updateUtilityMeter = async (id, entity) => {
  const fields = [];
  const values = [];
  let index = 1;
  Object.entries(entity).forEach(([key, value]) => {
    if (value !== undefined) {
      fields.push(`${key} = $${index++}`);
      values.push(value);
    }
  });
  values.push(id);
  const query = `UPDATE utility_meters SET ${fields.join(", ")} WHERE id = $${index} AND status <> 'INACTIVE' RETURNING *`;
  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (err) {
    if (isUniqueViolation(err)) throw new AppError(409, "meterCode already exists");
    if (isForeignKeyViolation(err)) throw new AppError(400, "Invalid apartmentId");
    throw err;
  }
};

const deleteUtilityMeter = async (id) => {
  const result = await pool.query(
    `UPDATE utility_meters SET status = 'INACTIVE' WHERE id = $1 AND status <> 'INACTIVE' RETURNING id`,
    [id]
  );
  return result.rows[0];
};

const restoreUtilityMeter = async (id) => {
  const result = await pool.query(
    `UPDATE utility_meters SET status = 'ACTIVE' WHERE id = $1 AND status = 'INACTIVE' RETURNING id`,
    [id]
  );
  return result.rows[0];
};

module.exports = {
  createUtilityMeter,
  getAllUtilityMeters,
  getUtilityMeterById,
  getUtilityMetersByUserId,
  getUtilityMeterByUserAndId,
  updateUtilityMeter,
  deleteUtilityMeter,
  restoreUtilityMeter,
};
