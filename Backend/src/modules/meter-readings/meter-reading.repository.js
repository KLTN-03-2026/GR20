const { pool } = require("../../configs/database.config");
const { AppError } = require("../../common/app-error");
const ERROR_CODES = require("./meter-reading-errors");

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
    if (isForeignKeyViolation(err))
      throw new AppError(400, "Invalid meterId", undefined, ERROR_CODES.INVALID_METER_ID_FOR_READING);
    throw err;
  }
};

const getAllMeterReadings = async ({ page = 0, size = 10, apartmentId, billingMonth, billingYear } = {}) => {
  const hasPeriod = billingMonth != null && billingYear != null;
  const hasApt = apartmentId != null && apartmentId !== undefined && String(apartmentId) !== "";

  const params = [];
  let idx = 1;
  const cond = [];
  if (hasApt) {
    cond.push(`um.apartment_id = $${idx++}`);
    params.push(Number(apartmentId));
  }
  if (hasPeriod) {
    cond.push(`mr.reading_date >= make_date($${idx++}, $${idx++}, 1)`);
    params.push(billingYear, billingMonth);
    cond.push(`mr.reading_date < (make_date($${idx++}, $${idx++}, 1) + INTERVAL '1 month')`);
    params.push(billingYear, billingMonth);
  }

  const offset = page * size;
  const whereClause = cond.length ? `WHERE ${cond.join(" AND ")}` : "";

  if (hasApt || hasPeriod) {
    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total FROM meter_readings mr JOIN utility_meters um ON um.id = mr.meter_id ${whereClause}`,
      params
    );
    const lim = idx;
    const off = idx + 1;
    const result = await pool.query(
      `SELECT mr.* FROM meter_readings mr JOIN utility_meters um ON um.id = mr.meter_id ${whereClause} ORDER BY mr.reading_date DESC, mr.id DESC LIMIT $${lim} OFFSET $${off}`,
      [...params, size, offset]
    );
    return { rows: result.rows, total: countResult.rows[0]?.total || 0 };
  }

  const countResult = await pool.query(`SELECT COUNT(*)::int AS total FROM meter_readings mr`);
  const result = await pool.query(
    `SELECT mr.* FROM meter_readings mr ORDER BY mr.reading_date DESC, mr.id DESC LIMIT $1 OFFSET $2`,
    [size, offset]
  );
  return { rows: result.rows, total: countResult.rows[0]?.total || 0 };
};

const getMeterReadingById = async (id) => {
  const result = await pool.query(`SELECT * FROM meter_readings WHERE id = $1 AND deleted_at IS NULL`, [id]);
  return result.rows[0];
};

const getMeterReadingsByUserId = async ({
  userId,
  page = 0,
  size = 10,
  meterType,
  apartmentId,
  billingMonth,
  billingYear,
} = {}) => {
  const conditions = [`rp.user_id = $1`, `rp.move_out_date IS NULL`, `mr.deleted_at IS NULL`];
  const values = [userId];
  let index = 2;

  if (meterType) {
    conditions.push(`um.meter_type = $${index++}`);
    values.push(meterType);
  }

  if (apartmentId != null && apartmentId !== undefined) {
    conditions.push(`um.apartment_id = $${index++}`);
    values.push(Number(apartmentId));
  }

  if (billingMonth != null && billingYear != null) {
    conditions.push(`mr.reading_date >= make_date($${index++}, $${index++}, 1)`);
    values.push(billingYear, billingMonth);
    conditions.push(`mr.reading_date < (make_date($${index++}, $${index++}, 1) + INTERVAL '1 month')`);
    values.push(billingYear, billingMonth);
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
    if (isForeignKeyViolation(err))
      throw new AppError(400, "Invalid meterId", undefined, ERROR_CODES.INVALID_METER_ID_FOR_READING);
    throw err;
  }
};

/**
 * Xóa cứng bản ghi chỉ số. Không cho phép nếu căn hộ của đồng hồ còn cư dân ACTIVE.
 */
const deleteMeterReading = async (id) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const rRes = await client.query(
      `
      SELECT mr.id, um.apartment_id
      FROM meter_readings mr
      LEFT JOIN utility_meters um ON um.id = mr.meter_id
      WHERE mr.id = $1
      `,
      [id],
    );
    const row = rRes.rows[0];
    if (!row) {
      await client.query("ROLLBACK");
      return null;
    }

    if (row.apartment_id != null) {
      const cRes = await client.query(
        `SELECT COUNT(*)::int AS c FROM resident_profiles
         WHERE apartment_id = $1 AND move_out_date IS NULL AND status = 'ACTIVE'`,
        [row.apartment_id],
      );
      const cnt = cRes.rows[0]?.c ?? 0;
      if (cnt > 0) {
        await client.query("ROLLBACK");
        throw new AppError(
          400,
          "Căn hộ đang có cư dân, không được xóa chỉ số công tơ.",
          undefined,
          ERROR_CODES.METER_READING_DELETE_BLOCKED_RESIDENTS,
        );
      }
    }

    await client.query(`DELETE FROM meter_readings WHERE id = $1`, [id]);
    await client.query("COMMIT");
    return { id: row.id };
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch (_) {
      /* ignore */
    }
    throw err;
  } finally {
    client.release();
  }
};

const restoreMeterReading = async (id) => {
  const result = await pool.query(
    `UPDATE meter_readings SET deleted_at = NULL WHERE id = $1 AND deleted_at IS NOT NULL RETURNING id`,
    [id]
  );
  return result.rows[0];
};

/** Chỉ số mới của tháng hiện tại: chỉ số cũ = chỉ số mới (current) của lần ghi gần nhất trước đầu tháng `readingDate`. */
const getSuggestedPreviousReading = async (meterId, readingDate) => {
  const r = await pool.query(
    `
      SELECT current_reading
      FROM meter_readings
      WHERE meter_id = $1
        AND deleted_at IS NULL
        AND reading_date < date_trunc('month', $2::date)
      ORDER BY reading_date DESC, id DESC
      LIMIT 1
    `,
    [meterId, readingDate]
  );
  if (!r.rows[0]) return null;
  return Number(r.rows[0].current_reading);
};

module.exports = {
  createMeterReading,
  getAllMeterReadings,
  getMeterReadingById,
  getMeterReadingsByUserId,
  getMeterReadingsByUserAndMeterId,
  getSuggestedPreviousReading,
  updateMeterReading,
  deleteMeterReading,
  restoreMeterReading,
};
