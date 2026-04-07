const { pool } = require("../../configs/database.config");

const createBuilding = async (building) => {
  const query = `
    INSERT INTO buildings (name, code, address, total_floors, total_apartments, year_built, status)
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    RETURNING id
  `;

  const values = [
    building.name,
    building.code,
    building.address,
    building.total_floors,
    building.total_apartments,
    building.year_built,
    building.status,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

const getAllBuildings = async ({ page = 0, size = 10 }) => {
  const offset = page * size;

  const dataQuery = `
    SELECT * FROM buildings
    ORDER BY id ASC
    LIMIT $1 OFFSET $2
  `;

  const countQuery = `SELECT COUNT(*) FROM buildings`;

  const data = await pool.query(dataQuery, [size, offset]);
  const count = await pool.query(countQuery);

  return {
    rows: data.rows,
    total: parseInt(count.rows[0].count),
  };
};

// GET BY ID
const getBuildingById = async (id) => {
  const query = `SELECT * FROM buildings WHERE id = $1`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const updateBuilding = async (id, building) => {
  const fields = [];
  const values = [];
  let index = 1;

  if (building.name !== undefined) {
    fields.push(`name = $${index++}`);
    values.push(building.name);
  }

  if (building.code !== undefined) {
    fields.push(`code = $${index++}`);
    values.push(building.code);
  }

  if (building.address !== undefined) {
    fields.push(`address = $${index++}`);
    values.push(building.address);
  }

  if (building.total_floors !== undefined) {
    fields.push(`total_floors = $${index++}`);
    values.push(building.total_floors);
  }

  if (building.total_apartments !== undefined) {
    fields.push(`total_apartments = $${index++}`);
    values.push(building.total_apartments);
  }

  if (building.year_built !== undefined) {
    fields.push(`year_built = $${index++}`);
    values.push(building.year_built);
  }

  if (building.status !== undefined) {
    fields.push(`status = $${index++}`);
    values.push(building.status);
  }

  if (fields.length === 0) {
    throw new Error("No fields to update");
  }

  values.push(id);

  const query = `
    UPDATE buildings
    SET ${fields.join(", ")}
    WHERE id = $${index}
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

// DELETE
const deleteBuilding = async (id) => {
  const query = `
    UPDATE buildings
    SET status = 'CLOSED'
    WHERE id = $1
    RETURNING id
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  createBuilding,
  getAllBuildings,
  getBuildingById,
  updateBuilding,
  deleteBuilding,
};
