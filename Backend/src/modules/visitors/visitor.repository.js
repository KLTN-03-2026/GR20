const { pool } = require("../../configs/database.config");
const { AppError } = require("../../common/app-error");

const isForeignKeyViolation = (err) => err && err.code === "23503";

const create = async (entity) => {
  const query = `
    INSERT INTO visitors (host_user_id, name, phone, id_card)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  try {
    const result = await pool.query(query, [
      entity.host_user_id ?? null,
      entity.name,
      entity.phone ?? null,
      entity.id_card ?? null,
    ]);
    return result.rows[0];
  } catch (err) {
    if (isForeignKeyViolation(err)) throw new AppError(400, "Invalid hostUserId");
    throw err;
  }
};

const getAll = async ({ page = 0, size = 10, search, hostUserId }) => {
  const offset = page * size;
  const conditions = [];
  const values = [];

  if (search) {
    values.push(`%${search}%`);
    conditions.push(`(name ILIKE $${values.length} OR phone ILIKE $${values.length} OR id_card ILIKE $${values.length})`);
  }
  if (hostUserId) {
    values.push(hostUserId);
    conditions.push(`host_user_id = $${values.length}`);
  }
  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const dataValues = [...values, size, offset];
  const dataQuery = `
    SELECT * FROM visitors
    ${whereClause}
    ORDER BY created_at DESC, id DESC
    LIMIT $${values.length + 1} OFFSET $${values.length + 2}
  `;
  const countQuery = `SELECT COUNT(*)::int AS total FROM visitors ${whereClause}`;

  const dataResult = await pool.query(dataQuery, dataValues);
  const countResult = await pool.query(countQuery, values);
  return { rows: dataResult.rows, total: countResult.rows[0]?.total || 0 };
};

const getById = async (id) => {
  const result = await pool.query(`SELECT * FROM visitors WHERE id = $1`, [id]);
  return result.rows[0];
};

const update = async (id, entity) => {
  const fields = [];
  const values = [];
  let index = 1;

  Object.entries(entity).forEach(([key, value]) => {
    if (value !== undefined) {
      fields.push(`${key} = $${index++}`);
      values.push(value);
    }
  });

  if (!fields.length) throw new AppError(400, "No fields to update");
  values.push(id);

  const query = `UPDATE visitors SET ${fields.join(", ")} WHERE id = $${index} RETURNING *`;
  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (err) {
    if (isForeignKeyViolation(err)) throw new AppError(400, "Invalid hostUserId");
    throw err;
  }
};

const deleteById = async (id) => {
  const result = await pool.query(`DELETE FROM visitors WHERE id = $1 RETURNING id`, [id]);
  return result.rows[0];
};

module.exports = { create, getAll, getById, update, deleteById };
