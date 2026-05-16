const { pool } = require("../../configs/database.config");

const deactivateActivePricingByMeterType = async (meterType, client = pool) => {
  await client.query(
    `UPDATE utility_pricing SET is_active = false WHERE meter_type = $1 AND is_active = true`,
    [meterType]
  );
};

const createUtilityPricing = async (entity) => {
  const query = `
    INSERT INTO utility_pricing (meter_type, price_per_unit, unit, effective_from, is_active)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
  `;
  const values = [entity.meter_type, entity.price_per_unit, entity.unit, entity.effective_from, entity.is_active ?? true];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const getActivePricingByMeterType = async (meterType, client = pool) => {
  const result = await client.query(
    `SELECT * FROM utility_pricing WHERE meter_type = $1 AND is_active = true ORDER BY effective_from DESC, id DESC LIMIT 1`,
    [meterType]
  );
  return result.rows[0];
};

const getAllActiveUtilityPricing = async () => {
  const result = await pool.query(
    `SELECT * FROM utility_pricing WHERE is_active = true ORDER BY meter_type ASC, effective_from DESC, id DESC`
  );
  return result.rows;
};

const getAllUtilityPricing = async ({ page = 0, size = 10, meterType, isActive } = {}) => {
  const conditions = [];
  const values = [];
  let index = 1;

  if (meterType) {
    conditions.push(`meter_type = $${index++}`);
    values.push(meterType);
  }
  if (typeof isActive === "boolean") {
    conditions.push(`is_active = $${index++}`);
    values.push(isActive);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const countResult = await pool.query(`SELECT COUNT(*)::int AS total FROM utility_pricing ${whereClause}`, values);
  const offset = page * size;
  const result = await pool.query(
    `SELECT * FROM utility_pricing ${whereClause} ORDER BY is_active DESC, effective_from DESC, id DESC LIMIT $${index++} OFFSET $${index++}`,
    [...values, size, offset]
  );
  return { rows: result.rows, total: countResult.rows[0]?.total || 0 };
};

const getUtilityPricingById = async (id) => {
  const result = await pool.query(`SELECT * FROM utility_pricing WHERE id = $1`, [id]);
  return result.rows[0];
};

const updateUtilityPricing = async (id, entity) => {
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
  const query = `UPDATE utility_pricing SET ${fields.join(", ")} WHERE id = $${index} RETURNING *`;
  const result = await pool.query(query, values);
  return result.rows[0];
};

const deleteUtilityPricing = async (id) => {
  const result = await pool.query(`DELETE FROM utility_pricing WHERE id = $1 RETURNING id`, [id]);
  return result.rows[0];
};

const restoreUtilityPricing = async (id) => {
  const result = await pool.query(`UPDATE utility_pricing SET is_active = true WHERE id = $1 RETURNING id`, [id]);
  return result.rows[0];
};

/** Có bản giá ACTIVE khác id (cùng meter_type) — chặn khôi phục cho đến khi xóa bản đang hoạt động. */
const hasOtherActivePricingForMeterType = async (meterType, excludeId) => {
  const r = await pool.query(
    `SELECT id FROM utility_pricing WHERE meter_type = $1 AND is_active = true AND id <> $2 LIMIT 1`,
    [meterType, excludeId]
  );
  return Boolean(r.rows[0]);
};

module.exports = {
  deactivateActivePricingByMeterType,
  createUtilityPricing,
  getActivePricingByMeterType,
  getAllActiveUtilityPricing,
  getAllUtilityPricing,
  getUtilityPricingById,
  updateUtilityPricing,
  deleteUtilityPricing,
  restoreUtilityPricing,
  hasOtherActivePricingForMeterType,
};
