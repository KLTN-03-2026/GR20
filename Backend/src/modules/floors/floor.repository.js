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

  const values = [
    floor.building_id,
    floor.floor_number,
    floor.name,
  ];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (err) {
    if (isForeignKeyViolation(err)) {
      throw new AppError(
        400,
        "Invalid building_id (building does not exist)"
      );
    }
    throw err;
  }
};


// ================= GET ALL (PAGINATION) =================
const getAllFloors = async ({ page = 0, size = 10 }) => {
  const offset = page * size;

  const dataQuery = `
    SELECT * FROM floors
    WHERE deleted_at IS NULL
    ORDER BY id ASC
    LIMIT $1 OFFSET $2
  `;

  const countQuery = `
    SELECT COUNT(*) FROM floors
    WHERE deleted_at IS NULL
  `;

  const data = await pool.query(dataQuery, [size, offset]);
  const count = await pool.query(countQuery);

  return {
    rows: data.rows,
    total: parseInt(count.rows[0].count),
  };
};


// ================= GET BY ID =================
const getFloorById = async (id) => {
  const query = `
    SELECT * FROM floors
    WHERE id = $1 AND deleted_at IS NULL
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
    WHERE id = $${index} AND deleted_at IS NULL
    RETURNING *
  `;

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (err) {
    if (isForeignKeyViolation(err)) {
      throw new AppError(
        400,
        "Invalid building_id (building does not exist)"
      );
    }
    throw err;
  }
};


// ================= SOFT DELETE =================
const deleteFloor = async (id) => {
  const query = `
    UPDATE floors
    SET deleted_at = NOW()
    WHERE id = $1 AND deleted_at IS NULL
    RETURNING id
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0];
};


module.exports = {
  createFloor,
  getAllFloors,
  getFloorById,
  updateFloor,
  deleteFloor,
};