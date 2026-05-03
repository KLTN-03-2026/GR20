const { pool } = require("../../configs/database.config");
const { AppError } = require("../../common/app-error");

const isForeignKeyViolation = (err) => err && err.code === "23503";

const parseBool = (value) => {
  if (value === undefined || value === null || value === "") return undefined;
  if (value === true || value === "true" || value === "1") return true;
  if (value === false || value === "false" || value === "0") return false;
  return undefined;
};

const saveBuildingAssignment = async (assignment) => {
  const query = `
    INSERT INTO building_assignments (user_id, building_id, role)
    VALUES ($1, $2, $3)
    RETURNING id
  `;

  try {
    const result = await pool.query(query, [assignment.user_id, assignment.building_id, assignment.role]);
    return result.rows[0];
  } catch (err) {
    if (isForeignKeyViolation(err)) {
      throw new AppError(400, "Invalid userId or buildingId");
    }
    throw err;
  }
};

const getAllBuildingAssignments = async ({ page = 0, size = 10, userId, buildingId, role, isActive, search }) => {
  const offset = Number(page) * Number(size);
  const values = [];
  const conditions = [];

  if (userId !== undefined) {
    values.push(userId);
    conditions.push(`ba.user_id = $${values.length}`);
  }
  if (buildingId !== undefined) {
    values.push(buildingId);
    conditions.push(`ba.building_id = $${values.length}`);
  }
  if (role) {
    values.push(role);
    conditions.push(`LOWER(ba.role) = LOWER($${values.length})`);
  }

  const active = parseBool(isActive);
  if (active !== undefined) {
    values.push(active);
    conditions.push(`ba.is_active = $${values.length}`);
  }

  if (search) {
    values.push(`%${search}%`);
    conditions.push(
      `(u.username ILIKE $${values.length} OR u.full_name ILIKE $${values.length} OR b.name ILIKE $${values.length} OR ba.role ILIKE $${values.length})`
    );
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const dataQuery = `
    SELECT
      ba.id, ba.user_id, ba.building_id, ba.role, ba.assigned_at, ba.is_active,
      u.username, u.full_name,
      b.name AS building_name
    FROM building_assignments ba
    LEFT JOIN users u ON u.id = ba.user_id
    LEFT JOIN buildings b ON b.id = ba.building_id
    ${where}
    ORDER BY ba.id ASC
    LIMIT $${values.length + 1} OFFSET $${values.length + 2}
  `;

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM building_assignments ba
    LEFT JOIN users u ON u.id = ba.user_id
    LEFT JOIN buildings b ON b.id = ba.building_id
    ${where}
  `;

  const data = await pool.query(dataQuery, [...values, size, offset]);
  const count = await pool.query(countQuery, values);

  return {
    rows: data.rows,
    total: parseInt(count.rows[0].total),
  };
};

const findBuildingAssignmentById = async (id) => {
  const query = `
    SELECT
      ba.id, ba.user_id, ba.building_id, ba.role, ba.assigned_at, ba.is_active,
      u.username, u.full_name,
      b.name AS building_name
    FROM building_assignments ba
    LEFT JOIN users u ON u.id = ba.user_id
    LEFT JOIN buildings b ON b.id = ba.building_id
    WHERE ba.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const updateBuildingAssignment = async (id, assignment) => {
  const fields = [];
  const values = [];
  let index = 1;

  const append = (column, value) => {
    fields.push(`${column} = $${index++}`);
    values.push(value);
  };

  if (assignment.user_id !== undefined) append("user_id", assignment.user_id);
  if (assignment.building_id !== undefined) append("building_id", assignment.building_id);
  if (assignment.role !== undefined) append("role", assignment.role);
  if (assignment.is_active !== undefined) append("is_active", assignment.is_active);

  if (fields.length === 0) {
    throw new AppError(400, "No fields to update");
  }

  values.push(id);
  const query = `
    UPDATE building_assignments
    SET ${fields.join(", ")}
    WHERE id = $${index}
    RETURNING id
  `;

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (err) {
    if (isForeignKeyViolation(err)) {
      throw new AppError(400, "Invalid userId or buildingId");
    }
    throw err;
  }
};

const softDeleteBuildingAssignment = async (id) => {
  const query = `
    UPDATE building_assignments
    SET is_active = false
    WHERE id = $1 AND is_active = true
    RETURNING id
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  saveBuildingAssignment,
  getAllBuildingAssignments,
  findBuildingAssignmentById,
  updateBuildingAssignment,
  softDeleteBuildingAssignment,
};
