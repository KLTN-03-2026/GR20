const { pool } = require("../../configs/database.config");
const { AppError } = require("../../common/app-error");

const isUniqueViolation = (err) => err && err.code === "23505";

// CREATE
const createApartment = async (apartment) => {
  const query = `
    INSERT INTO apartments (
      building_id,
      owner_user_id,
      floor_id,
      apartment_code,
      area,
      bedrooms,
      bathrooms,
      balcony_direction,
      status
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING id
  `;

  const values = [
    apartment.building_id,
    apartment.owner_user_id,
    apartment.floor_id,
    apartment.apartment_code,
    apartment.area,
    apartment.bedrooms,
    apartment.bathrooms,
    apartment.balcony_direction,
    apartment.status,
  ];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw new AppError(
        409,
        "An apartment with this code already exists",
        { constraint: err.constraint }
      );
    }
    throw err;
  }
};

// GET ALL
const getAllApartments = async ({ page = 0, size = 10 }) => {
  const offset = page * size;

  const dataQuery = `
    SELECT * FROM apartments
    ORDER BY id ASC
    LIMIT $1 OFFSET $2
  `;

  const countQuery = `SELECT COUNT(*) FROM apartments`;

  const data = await pool.query(dataQuery, [size, offset]);
  const count = await pool.query(countQuery);

  return {
    rows: data.rows,
    total: parseInt(count.rows[0].count),
  };
};

const getApartmentsByBuilding = async ({ buildingId, page = 0, size = 10 }) => {
  const offset = page * size;

  const dataQuery = `
    SELECT * FROM apartments
    WHERE building_id = $1
    ORDER BY id ASC
    LIMIT $2 OFFSET $3
  `;

  const countQuery = `
    SELECT COUNT(*) FROM apartments
    WHERE building_id = $1
  `;

  const data = await pool.query(dataQuery, [buildingId, size, offset]);
  const count = await pool.query(countQuery, [buildingId]);

  return {
    rows: data.rows,
    total: parseInt(count.rows[0].count),
  };
};

const getApartmentsByFloor = async ({ floorId, page = 0, size = 10 }) => {
  const offset = page * size;

  const dataQuery = `
    SELECT * FROM apartments
    WHERE floor_id = $1
    ORDER BY id ASC
    LIMIT $2 OFFSET $3
  `;

  const countQuery = `
    SELECT COUNT(*) FROM apartments
    WHERE floor_id = $1
  `;

  const data = await pool.query(dataQuery, [floorId, size, offset]);
  const count = await pool.query(countQuery, [floorId]);

  return {
    rows: data.rows,
    total: parseInt(count.rows[0].count),
  };
};

// GET BY ID
const getApartmentById = async (id) => {
  const query = `SELECT * FROM apartments WHERE id = $1`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// UPDATE
const updateApartment = async (id, apartment) => {
  const fields = [];
  const values = [];
  let index = 1;

  if (apartment.building_id !== undefined) {
    fields.push(`building_id = $${index++}`);
    values.push(apartment.building_id);
  }

  if (apartment.owner_user_id !== undefined) {
    fields.push(`owner_user_id = $${index++}`);
    values.push(apartment.owner_user_id);
  }

  if (apartment.floor_id !== undefined) {
    fields.push(`floor_id = $${index++}`);
    values.push(apartment.floor_id);
  }

  if (apartment.apartment_code !== undefined) {
    fields.push(`apartment_code = $${index++}`);
    values.push(apartment.apartment_code);
  }

  if (apartment.area !== undefined) {
    fields.push(`area = $${index++}`);
    values.push(apartment.area);
  }

  if (apartment.bedrooms !== undefined) {
    fields.push(`bedrooms = $${index++}`);
    values.push(apartment.bedrooms);
  }

  if (apartment.bathrooms !== undefined) {
    fields.push(`bathrooms = $${index++}`);
    values.push(apartment.bathrooms);
  }

  if (apartment.balcony_direction !== undefined) {
    fields.push(`balcony_direction = $${index++}`);
    values.push(apartment.balcony_direction);
  }

  if (apartment.status !== undefined) {
    fields.push(`status = $${index++}`);
    values.push(apartment.status);
  }

  if (fields.length === 0) {
    throw new Error("No fields to update");
  }

  values.push(id);

  const query = `
    UPDATE apartments
    SET ${fields.join(", ")}
    WHERE id = $${index}
    RETURNING *
  `;

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw new AppError(
        409,
        "An apartment with this code already exists",
        { constraint: err.constraint }
      );
    }
    throw err;
  }
};

// DELETE (SOFT DELETE)
const deleteApartment = async (id) => {
  const query = `
    UPDATE apartments
    SET status = 'INACTIVE'
    WHERE id = $1
    RETURNING id
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  createApartment,
  getAllApartments,
  getApartmentsByBuilding,
  getApartmentsByFloor,
  getApartmentById,
  updateApartment,
  deleteApartment,
};