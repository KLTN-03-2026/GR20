const { pool } = require("../../configs/database.config");
const { AppError } = require("../../common/app-error");

const isUniqueViolation = (err) => err && err.code === "23505";

const createApartment = async (apartment) => {
  const query = `
    INSERT INTO apartments (
      building_id, owner_user_id, floor_id, apartment_code, area, bedrooms, bathrooms, balcony_direction, status
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
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
      throw new AppError(409, "An apartment with this code already exists", { constraint: err.constraint });
    }
    throw err;
  }
};

const getAllApartments = async ({ page = 0, size = 10, buildingId, floorId, search }) => {
  const offset = page * size;
  const params = [];
  let paramIndex = 1;
  let dataQuery = `
    SELECT a.*, b.name as building_name, f.floor_number, u.full_name as owner_name
    FROM apartments a
    LEFT JOIN buildings b ON a.building_id = b.id
    LEFT JOIN floors f ON a.floor_id = f.id
    LEFT JOIN users u ON a.owner_user_id = u.id
    WHERE a.status != 'MAINTENANCE'
  `;

  if (buildingId) {
    dataQuery += ` AND a.building_id = $${paramIndex}`;
    params.push(buildingId);
    paramIndex++;
  }
  if (floorId) {
    dataQuery += ` AND a.floor_id = $${paramIndex}`;
    params.push(floorId);
    paramIndex++;
  }
  if (search) {
    dataQuery += ` AND a.apartment_code ILIKE $${paramIndex}`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  let countQuery = `SELECT COUNT(*) FROM apartments a WHERE a.status != 'MAINTENANCE'`;
  const countParams = [];
  let countParamIndex = 1;
  if (buildingId) {
    countQuery += ` AND a.building_id = $${countParamIndex++}`;
    countParams.push(buildingId);
  }
  if (floorId) {
    countQuery += ` AND a.floor_id = $${countParamIndex++}`;
    countParams.push(floorId);
  }
  if (search) {
    countQuery += ` AND a.apartment_code ILIKE $${countParamIndex++}`;
    countParams.push(`%${search}%`);
  }

  dataQuery += ` ORDER BY a.id ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(size, offset);
  const data = await pool.query(dataQuery, params);
  const count = await pool.query(countQuery, countParams);
  return { rows: data.rows, total: parseInt(count.rows[0].count) };
};

const getApartmentsByBuilding = async ({ buildingId, page = 0, size = 10 }) => {
  const offset = page * size;
  const dataQuery = `
    SELECT a.*, b.name as building_name, f.floor_number, u.full_name as owner_name
    FROM apartments a
    LEFT JOIN buildings b ON a.building_id = b.id
    LEFT JOIN floors f ON a.floor_id = f.id
    LEFT JOIN users u ON a.owner_user_id = u.id
    WHERE building_id = $1 AND status != 'MAINTENANCE'
    ORDER BY id ASC
    LIMIT $2 OFFSET $3
  `;
  const countQuery = `SELECT COUNT(*) FROM apartments WHERE building_id = $1 AND status != 'MAINTENANCE'`;
  const data = await pool.query(dataQuery, [buildingId, size, offset]);
  const count = await pool.query(countQuery, [buildingId]);
  return { rows: data.rows, total: parseInt(count.rows[0].count) };
};

const getApartmentsByFloor = async ({ floorId, page = 0, size = 10 }) => {
  const offset = page * size;
  const dataQuery = `
    SELECT a.*, b.name as building_name, f.floor_number, u.full_name as owner_name
    FROM apartments a
    LEFT JOIN buildings b ON a.building_id = b.id
    LEFT JOIN floors f ON a.floor_id = f.id
    LEFT JOIN users u ON a.owner_user_id = u.id
    WHERE floor_id = $1 AND status != 'MAINTENANCE'
    ORDER BY id ASC
    LIMIT $2 OFFSET $3
  `;
  const countQuery = `SELECT COUNT(*) FROM apartments WHERE floor_id = $1 AND status != 'MAINTENANCE'`;
  const data = await pool.query(dataQuery, [floorId, size, offset]);
  const count = await pool.query(countQuery, [floorId]);
  return { rows: data.rows, total: parseInt(count.rows[0].count) };
};

const getApartmentById = async (id) => {
  const query = `
    SELECT a.*, b.name as building_name, f.floor_number,
      json_build_object('id', owner.id, 'fullName', owner.full_name, 'phone', owner.phone, 'email', owner.email, 'avatarUrl', owner.avatar_url) as owner,
      COALESCE((SELECT json_agg(json_build_object('id', rp.id, 'fullName', u.full_name, 'phone', u.phone, 'relationship', rp.relationship, 'moveInDate', rp.move_in_date))
        FROM resident_profiles rp JOIN users u ON rp.user_id = u.id
        WHERE rp.apartment_id = a.id AND rp.status = 'ACTIVE'), '[]'::json) as residents,
      (SELECT json_build_object('id', c.id, 'contractType', c.contract_type, 'status', c.status, 'startDate', c.start_date, 'endDate', c.end_date, 'monthlyRent', c.monthly_rent)
        FROM contracts c WHERE c.apartment_id = a.id AND c.status = 'ACTIVE' LIMIT 1) as current_contract
    FROM apartments a
    LEFT JOIN buildings b ON a.building_id = b.id
    LEFT JOIN floors f ON a.floor_id = f.id
    LEFT JOIN users owner ON a.owner_user_id = owner.id
    WHERE a.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const updateApartment = async (id, apartment) => {
  const existing = await getApartmentById(id);
  if (!existing) throw new AppError(404, "Apartment not found");
  const fields = [];
  const values = [];
  let index = 1;
  if (apartment.building_id !== undefined) { fields.push(`building_id = $${index++}`); values.push(apartment.building_id); }
  if (apartment.owner_user_id !== undefined) { fields.push(`owner_user_id = $${index++}`); values.push(apartment.owner_user_id); }
  if (apartment.floor_id !== undefined) { fields.push(`floor_id = $${index++}`); values.push(apartment.floor_id); }
  if (apartment.apartment_code !== undefined) { fields.push(`apartment_code = $${index++}`); values.push(apartment.apartment_code); }
  if (apartment.area !== undefined) { fields.push(`area = $${index++}`); values.push(apartment.area); }
  if (apartment.bedrooms !== undefined) { fields.push(`bedrooms = $${index++}`); values.push(apartment.bedrooms); }
  if (apartment.bathrooms !== undefined) { fields.push(`bathrooms = $${index++}`); values.push(apartment.bathrooms); }
  if (apartment.balcony_direction !== undefined) { fields.push(`balcony_direction = $${index++}`); values.push(apartment.balcony_direction); }
  if (apartment.status !== undefined) { fields.push(`status = $${index++}`); values.push(apartment.status); }
  if (fields.length === 0) throw new AppError(400, "No fields to update");
  fields.push(`updated_at = NOW()`);
  values.push(id);
  const query = `UPDATE apartments SET ${fields.join(", ")} WHERE id = $${index} AND status != 'MAINTENANCE' RETURNING *`;
  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (err) {
    if (isUniqueViolation(err)) throw new AppError(409, "An apartment with this code already exists", { constraint: err.constraint });
    throw err;
  }
};

const deleteApartment = async (id) => {
  const existing = await getApartmentById(id);
  if (!existing) throw new AppError(404, "Apartment not found or already deleted");
  const query = `UPDATE apartments SET status = 'MAINTENANCE', updated_at = NOW() WHERE id = $1 AND status != 'MAINTENANCE' RETURNING id`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const addResident = async (apartmentId, data) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const username = data.phone || `user_${Date.now()}`;
    const newUser = await client.query(
      `INSERT INTO users (username, password, full_name, phone, email, is_active)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING id, full_name`,
      [username, "123456", data.fullName, data.phone, data.email || null]
    );
    const userId = newUser.rows[0].id;
    await client.query(
      `INSERT INTO resident_profiles (user_id, apartment_id, relationship, move_in_date, status)
       VALUES ($1, $2, $3, $4, 'ACTIVE')
       RETURNING id`,
      [userId, apartmentId, data.relationship, data.moveInDate]
    );
    await client.query("COMMIT");
    return { id: userId, fullName: data.fullName, username, password: "123456" };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  createApartment,
  getAllApartments,
  getApartmentsByBuilding,
  getApartmentsByFloor,
  getApartmentById,
  updateApartment,
  deleteApartment,
  addResident,
};
