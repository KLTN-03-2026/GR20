const { pool } = require("../../configs/database.config");
const { AppError } = require("../../common/app-error");

const isForeignKeyViolation = (err) => err && err.code === "23503";

const createMeterReading = async (entity) => {
  const query = `
    INSERT INTO meter_readings (meter_id, reading_date, previous_reading, current_reading, consumption)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
  `;
  try {
    const result = await pool.query(query, [
      entity.meter_id,
      entity.reading_date,
      entity.previous_reading,
      entity.current_reading,
      entity.consumption,
    ]);
    return result.rows[0];
  } catch (err) {
    if (isForeignKeyViolation(err)) throw new AppError(400, "Invalid meterId");
    throw err;
  }
};

const getAllMeterReadings = async ({ page = 0, size = 10 } = {}) => {
  const countResult = await pool.query(`SELECT COUNT(*)::int AS total FROM meter_readings`);
  const offset = page * size;
  const result = await pool.query(
    `SELECT * FROM meter_readings ORDER BY reading_date DESC, id DESC LIMIT $1 OFFSET $2`,
    [size, offset]
  );
  return { rows: result.rows, total: countResult.rows[0]?.total || 0 };
};

const getMeterReadingById = async (id) => {
  const result = await pool.query(`SELECT * FROM meter_readings WHERE id = $1 AND deleted_at IS NULL`, [id]);
  return result.rows[0];
};

const getMeterReadingsByUserId = async ({ userId, page = 0, size = 10, meterType } = {}) => {
  const conditions = [`rp.user_id = $1`, `rp.move_out_date IS NULL`, `mr.deleted_at IS NULL`];
  const values = [userId];
  let index = 2;

  if (meterType) {
    conditions.push(`um.meter_type = $${index++}`);
    values.push(meterType);
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`;
  const countResult = await pool.query(
    `
      SELECT COUNT(*)::int AS total
      FROM meter_readings mr
      JOIN utility_meters um ON um.id = mr.meter_id
      JOIN resident_profiles rp ON rp.apartment_id = um.apartment_id
      ${whereClause}
    `,
    values
  );

  const offset = page * size;
  const result = await pool.query(
    `
      SELECT mr.*
      FROM meter_readings mr
      JOIN utility_meters um ON um.id = mr.meter_id
      JOIN resident_profiles rp ON rp.apartment_id = um.apartment_id
      ${whereClause}
      ORDER BY mr.reading_date DESC, mr.id DESC
      LIMIT $${index++} OFFSET $${index++}
    `,
    [...values, size, offset]
  );
  return { rows: result.rows, total: countResult.rows[0]?.total || 0 };
};

const getMeterReadingsByUserAndMeterId = async ({
  userId,
  meterId,
  page = 0,
  size = 10,
  fromMonth,
  fromYear,
  toMonth,
  toYear,
} = {}) => {
  const conditions = [`rp.user_id = $1`, `rp.move_out_date IS NULL`, `mr.deleted_at IS NULL`, `mr.meter_id = $2`];
  const values = [userId, meterId];
  let index = 3;

  if (fromMonth && fromYear) {
    conditions.push(`mr.reading_date >= make_date($${index++}, $${index++}, 1)`);
    values.push(fromYear, fromMonth);
  }
  if (toMonth && toYear) {
    conditions.push(`mr.reading_date < (make_date($${index++}, $${index++}, 1) + INTERVAL '1 month')`);
    values.push(toYear, toMonth);
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`;
  const countResult = await pool.query(
    `
      SELECT COUNT(*)::int AS total
      FROM meter_readings mr
      JOIN utility_meters um ON um.id = mr.meter_id
      JOIN resident_profiles rp ON rp.apartment_id = um.apartment_id
      ${whereClause}
    `,
    values
  );

  const offset = page * size;
  const result = await pool.query(
    `
      SELECT mr.*
      FROM meter_readings mr
      JOIN utility_meters um ON um.id = mr.meter_id
      JOIN resident_profiles rp ON rp.apartment_id = um.apartment_id
      ${whereClause}
      ORDER BY mr.reading_date DESC, mr.id DESC
      LIMIT $${index++} OFFSET $${index++}
    `,
    [...values, size, offset]
  );
  return { rows: result.rows, total: countResult.rows[0]?.total || 0 };
};

const updateMeterReading = async (id, entity) => {
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
  const query = `UPDATE meter_readings SET ${fields.join(", ")} WHERE id = $${index} AND deleted_at IS NULL RETURNING *`;
  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (err) {
    if (isForeignKeyViolation(err)) throw new AppError(400, "Invalid meterId");
    throw err;
  }
};

const deleteMeterReading = async (id) => {
  const result = await pool.query(
    `UPDATE meter_readings SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id`,
    [id]
  );
  return result.rows[0];
};

const restoreMeterReading = async (id) => {
  const result = await pool.query(
    `UPDATE meter_readings SET deleted_at = NULL WHERE id = $1 AND deleted_at IS NOT NULL RETURNING id`,
    [id]
  );
  return result.rows[0];
};

module.exports = {
  createMeterReading,
  getAllMeterReadings,
  getMeterReadingById,
  getMeterReadingsByUserId,
  getMeterReadingsByUserAndMeterId,
  updateMeterReading,
  deleteMeterReading,
  restoreMeterReading,
};
