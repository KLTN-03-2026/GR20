const { pool } = require("../../configs/database.config");
const { AppError } = require("../../common/app-error");

const isForeignKeyViolation = (err) => err && err.code === "23503";

const create = async ({ request_id, technical_id }) => {
  const query = `
    INSERT INTO maintenance_assignments (request_id, technical_id)
    VALUES ($1, $2)
    RETURNING *
  `;
  try {
    const result = await pool.query(query, [request_id, technical_id]);
    return result.rows[0];
  } catch (err) {
    if (isForeignKeyViolation(err)) {
      throw new AppError(400, "Invalid requestId or technicalId");
    }
    throw err;
  }
};

const getAll = async ({ page = 0, size = 10, requestId, technicalId }) => {
  const offset = page * size;
  const values = [];
  const conditions = [];

  if (requestId !== undefined) {
    values.push(requestId);
    conditions.push(`request_id = $${values.length}`);
  }
  if (technicalId !== undefined) {
    values.push(technicalId);
    conditions.push(`technical_id = $${values.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  values.push(size);
  values.push(offset);
  const limitParam = values.length - 1;
  const offsetParam = values.length;

  const dataQuery = `
    SELECT * FROM maintenance_assignments
    ${where}
    ORDER BY assigned_at DESC, id DESC
    LIMIT $${limitParam} OFFSET $${offsetParam}
  `;
  const countQuery = `SELECT COUNT(*) FROM maintenance_assignments ${where}`;

  const data = await pool.query(dataQuery, values);
  const countValues = values.slice(0, values.length - 2);
  const count = await pool.query(countQuery, countValues);
  return { rows: data.rows, total: parseInt(count.rows[0].count) };
};

const getById = async (id) => {
  const result = await pool.query(`SELECT * FROM maintenance_assignments WHERE id = $1`, [id]);
  return result.rows[0];
};

const deleteById = async (id) => {
  const result = await pool.query(`DELETE FROM maintenance_assignments WHERE id = $1 RETURNING id`, [id]);
  return result.rows[0];
};

module.exports = { create, getAll, getById, deleteById };

