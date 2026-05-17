const { pool } = require("../../configs/database.config");
const { AppError } = require("../../common/app-error");

const isForeignKeyViolation = (err) => err && err.code === "23503";
const isUniqueViolation = (err) => err && err.code === "23505";

const create = async (entity) => {
  const query = `
    INSERT INTO vehicles (owner_id, apartment_id, plate_number, vehicle_type, color, status)
    VALUES ($1, $2, $3, $4, $5, COALESCE($6, 'ACTIVE'))
    RETURNING *
  `;
  try {
    const result = await pool.query(query, [
      entity.owner_id ?? null,
      entity.apartment_id ?? null,
      entity.plate_number,
      entity.vehicle_type,
      entity.color ?? null,
      entity.status ?? null,
    ]);
    return result.rows[0];
  } catch (err) {
    if (isForeignKeyViolation(err)) throw new AppError(400, "Invalid ownerId or apartmentId");
    if (isUniqueViolation(err)) throw new AppError(400, "Plate number already exists");
    throw err;
  }
};

const getAll = async ({ page = 0, size = 10, search, status, ownerId, apartmentId }) => {
  const offset = page * size;
  const conditions = [];
  const values = [];

  if (search) {
    values.push(`%${search}%`);
    conditions.push(`(plate_number ILIKE $${values.length} OR color ILIKE $${values.length})`);
  }
  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }
  if (ownerId) {
    values.push(ownerId);
    conditions.push(`owner_id = $${values.length}`);
  }
  if (apartmentId) {
    values.push(apartmentId);
    conditions.push(`apartment_id = $${values.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const dataValues = [...values, size, offset];
  const dataQuery = `
    SELECT * FROM vehicles
    ${whereClause}
    ORDER BY created_at DESC, id DESC
    LIMIT $${values.length + 1} OFFSET $${values.length + 2}
  `;
  const countQuery = `SELECT COUNT(*)::int AS total FROM vehicles ${whereClause}`;

  const dataResult = await pool.query(dataQuery, dataValues);
  const countResult = await pool.query(countQuery, values);
  return { rows: dataResult.rows, total: countResult.rows[0]?.total || 0 };
};

const getById = async (id) => {
  const result = await pool.query(`SELECT * FROM vehicles WHERE id = $1`, [id]);
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
  const query = `UPDATE vehicles SET ${fields.join(", ")} WHERE id = $${index} RETURNING *`;
  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (err) {
    if (isForeignKeyViolation(err)) throw new AppError(400, "Invalid ownerId or apartmentId");
    if (isUniqueViolation(err)) throw new AppError(400, "Plate number already exists");
    throw err;
  }
};

const softDelete = async (id) => {
  const result = await pool.query(`UPDATE vehicles SET status = 'REMOVED' WHERE id = $1 RETURNING id`, [id]);
  return result.rows[0];
};

module.exports = { create, getAll, getById, update, softDelete };
