const { pool } = require("../../configs/database.config");
const { AppError } = require("../../common/app-error");

// ================= HELPER =================
const isForeignKeyViolation = (err) => err && err.code === "23503";

// ================= CREATE =================
const createFloor = async (floor) => {
  const query = `
    INSERT INTO floors (building_id, floor_number, name)
    VALUES ($1, $2, $3)
    RETURNING id
  `;

  const values = [floor.building_id, floor.floor_number, floor.name];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (err) {
    if (isForeignKeyViolation(err)) {
      throw new AppError(400, "Invalid building_id (building does not exist)");
    }
    throw err;
  }
};

// ================= GET ALL (PAGINATION) =================
/** @param {{ page?: number, size?: number, buildingIds?: null|number[] }} opts — buildingIds null = mọi tòa; [] = không dòng nào */
const getAllFloors = async ({ page = 0, size = 10, buildingIds }) => {
  if (buildingIds && buildingIds.length === 0) {
    return { rows: [], total: 0 };
  }

  const offset = page * size;
  const values = [];
  let where = `WHERE is_deleted = TRUE`;

  if (buildingIds && buildingIds.length > 0) {
    values.push(buildingIds);
    where += ` AND building_id = ANY($${values.length}::bigint[])`;
  }

  const lim = values.length + 1;
  const off = values.length + 2;

  const dataQuery = `
    SELECT * FROM floors
    ${where}
    ORDER BY building_id ASC, floor_number ASC, id ASC
    LIMIT $${lim} OFFSET $${off}
  `;

  const countQuery = `SELECT COUNT(*)::int FROM floors ${where}`;

  const data = await pool.query(dataQuery, [...values, size, offset]);
  const count = await pool.query(countQuery, values);

  return {
    rows: data.rows,
    total: parseInt(count.rows[0].count, 10),
  };
};

// ================= GET BY ID =================
const getFloorById = async (id) => {
  const query = `
    SELECT * FROM floors
    WHERE id = $1 AND is_deleted = TRUE
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// ================= UPDATE =================
const updateFloor = async (id, floor) => {
  const fields = [];
  const values = [];
  let index = 1;

  if (floor.building_id !== undefined) {
    fields.push(`building_id = $${index++}`);
    values.push(floor.building_id);
  }

  if (floor.floor_number !== undefined) {
    fields.push(`floor_number = $${index++}`);
    values.push(floor.floor_number);
  }

  if (floor.name !== undefined) {
    fields.push(`name = $${index++}`);
    values.push(floor.name);
  }

  if (fields.length === 0) {
    throw new AppError(400, "No fields to update");
  }

  values.push(id);

  const query = `
    UPDATE floors
    SET ${fields.join(", ")}
    WHERE id = $${index} AND is_deleted = TRUE
    RETURNING *
  `;

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (err) {
    if (isForeignKeyViolation(err)) {
      throw new AppError(400, "Invalid building_id (building does not exist)");
    }
    throw err;
  }
};

// ================= SOFT DELETE =================
const softDeleteFloor = async (id) => {
  const query = `
    UPDATE floors
    SET is_deleted = FALSE
    WHERE id = $1 AND is_deleted = TRUE
    RETURNING id, is_deleted
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const getFloorsByBuilding = async (buildingId) => {
  const query = `
    SELECT * FROM floors 
    WHERE building_id = $1 AND deleted_at IS NULL 
    ORDER BY floor_number ASC
  `;
  const result = await pool.query(query, [buildingId]);
  return { rows: result.rows };
};

module.exports = {
  createFloor,
  getAllFloors,
  getFloorById,
  updateFloor,
  softDeleteFloor,
  getFloorsByBuilding,
};
