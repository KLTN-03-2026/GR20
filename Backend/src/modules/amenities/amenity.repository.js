const { pool } = require("../../configs/database.config");
const { AppError } = require("../../common/app-error");

// CREATE
const createAmenity = async (entity) => {
  const query = `
    INSERT INTO amenities (building_id, name, description, location, operating_hours, image_url, status, closed_reason)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id
  `;
  const values = [
    entity.building_id, entity.name, entity.description, entity.location,
    entity.operating_hours, entity.image_url, entity.status, entity.closed_reason,
  ];
  const result = await pool.query(query, values);
  return { id: result.rows[0].id };
};

// GET ALL BY BUILDING
const getAmenitiesByBuilding = async ({ buildingId, page = 0, size = 10, status }) => {
  const offset = page * size;
  const params = [buildingId];
  let paramIndex = 2;

  let dataQuery = `
    SELECT a.*, b.name as building_name
    FROM amenities a
    LEFT JOIN buildings b ON a.building_id = b.id
    WHERE a.building_id = $1
  `;

  let countQuery = `SELECT COUNT(*) FROM amenities WHERE building_id = $1`;

  if (status) {
    dataQuery += ` AND a.status = $${paramIndex}`;
    countQuery += ` AND status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  dataQuery += ` ORDER BY a.id ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(size, offset);

  const data = await pool.query(dataQuery, params);
  const count = await pool.query(countQuery, [buildingId, ...(status ? [status] : [])]);

  return { rows: data.rows, total: parseInt(count.rows[0].count) };
};

// GET BY ID
const getAmenityById = async (id) => {
  const query = `
    SELECT a.*, b.name as building_name
    FROM amenities a
    LEFT JOIN buildings b ON a.building_id = b.id
    WHERE a.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// UPDATE
const updateAmenity = async (id, entity) => {
  const fields = [];
  const values = [];
  let index = 1;

  if (entity.name !== undefined) { fields.push(`name = $${index++}`); values.push(entity.name); }
  if (entity.description !== undefined) { fields.push(`description = $${index++}`); values.push(entity.description); }
  if (entity.location !== undefined) { fields.push(`location = $${index++}`); values.push(entity.location); }
  if (entity.operating_hours !== undefined) { fields.push(`operating_hours = $${index++}`); values.push(entity.operating_hours); }
  if (entity.image_url !== undefined) { fields.push(`image_url = $${index++}`); values.push(entity.image_url); }
  if (entity.status !== undefined) { fields.push(`status = $${index++}`); values.push(entity.status); }
  if (entity.closed_reason !== undefined) { fields.push(`closed_reason = $${index++}`); values.push(entity.closed_reason); }

  if (fields.length === 0) throw new AppError(400, "No fields to update");

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const query = `UPDATE amenities SET ${fields.join(", ")} WHERE id = $${index} RETURNING *`;
  const result = await pool.query(query, values);
  if (result.rows.length === 0) throw new AppError(404, "Amenity not found");
  return result.rows[0];
};

// DELETE
const deleteAmenity = async (id) => {
  const query = `DELETE FROM amenities WHERE id = $1 RETURNING id`;
  const result = await pool.query(query, [id]);
  if (result.rows.length === 0) throw new AppError(404, "Amenity not found");
  return result.rows[0];
};

module.exports = { createAmenity, getAmenitiesByBuilding, getAmenityById, updateAmenity, deleteAmenity };