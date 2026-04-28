const { pool } = require("../../configs/database.config");
const { AppError } = require("../../common/app-error");

const isUniqueViolation = (err) => err && err.code === "23505";
const isForeignKeyViolation = (err) => err && err.code === "23503";

const floorBelongsToBuilding = async ({ floorId, buildingId }) => {
  const query = `
    SELECT 1
    FROM floors
    WHERE id = $1
      AND building_id = $2
      AND deleted_at IS NULL
    LIMIT 1
  `;
  const result = await pool.query(query, [floorId, buildingId]);
  return Boolean(result.rows[0]);
};

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
    if (isForeignKeyViolation(err)) {
      throw new AppError(
        400,
        "Invalid buildingId/floorId/ownerUserId (foreign key does not exist)"
      );
    }
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
const getAllApartments = async ({
  page = 0,
  size = 10,
  search,
  buildingId,
  floorId,
  status,
}) => {
  const offset = page * size;
  const values = [];
  const conditions = [];

  if (search) {
    values.push(`%${search}%`);
    const p = values.length;
    conditions.push(`(apartment_code ILIKE $${p} OR floor_id::text ILIKE $${p})`);
  }
  if (buildingId !== undefined) {
    values.push(buildingId);
    conditions.push(`building_id = $${values.length}`);
  }
  if (floorId !== undefined) {
    values.push(floorId);
    conditions.push(`floor_id = $${values.length}`);
  }
  if (status !== undefined) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  values.push(size);
  values.push(offset);
  const limitParam = values.length - 1;
  const offsetParam = values.length;

  const dataQuery = `
    SELECT * FROM apartments
    ${where}
    ORDER BY id ASC
    LIMIT $${limitParam} OFFSET $${offsetParam}
  `;

  const countQuery = `SELECT COUNT(*) FROM apartments ${where}`;

  const data = await pool.query(dataQuery, values);
  const countValues = values.slice(0, values.length - 2);
  const count = await pool.query(countQuery, countValues);

  return {
    rows: data.rows,
    total: parseInt(count.rows[0].count),
  };
};

const getApartmentsByBuilding = async ({
  buildingId,
  page = 0,
  size = 10,
  search,
  status,
}) => {
  const offset = page * size;
  const values = [buildingId];
  const conditions = [`building_id = $1`];

  if (search) {
    values.push(`%${search}%`);
    const p = values.length;
    conditions.push(`(apartment_code ILIKE $${p} OR floor_id::text ILIKE $${p})`);
  }
  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }
  const where = `WHERE ${conditions.join(" AND ")}`;

  const dataQuery = `
    SELECT * FROM apartments
    ${where}
    ORDER BY id ASC
    LIMIT $${values.length + 1} OFFSET $${values.length + 2}
  `;

  const countQuery = `SELECT COUNT(*) FROM apartments ${where}`;

  const data = await pool.query(dataQuery, [...values, size, offset]);
  const count = await pool.query(countQuery, values);

  return {
    rows: data.rows,
    total: parseInt(count.rows[0].count),
  };
};

const getApartmentsByFloor = async ({ floorId, page = 0, size = 10, search, status }) => {
  const offset = page * size;
  const values = [floorId];
  const conditions = [`floor_id = $1`];

  if (search) {
    values.push(`%${search}%`);
    const p = values.length;
    conditions.push(`(apartment_code ILIKE $${p} OR floor_id::text ILIKE $${p})`);
  }
  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }
  const where = `WHERE ${conditions.join(" AND ")}`;

  const dataQuery = `
    SELECT * FROM apartments
    ${where}
    ORDER BY id ASC
    LIMIT $${values.length + 1} OFFSET $${values.length + 2}
  `;

  const countQuery = `SELECT COUNT(*) FROM apartments ${where}`;

  const data = await pool.query(dataQuery, [...values, size, offset]);
  const count = await pool.query(countQuery, values);

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
    throw new AppError(400, "No fields to update");
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
    if (isForeignKeyViolation(err)) {
      throw new AppError(
        400,
        "Invalid buildingId/floorId/ownerUserId (foreign key does not exist)"
      );
    }
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
  floorBelongsToBuilding,
};