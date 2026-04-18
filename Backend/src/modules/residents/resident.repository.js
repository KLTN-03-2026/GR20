const { pool } = require("../../configs/database.config");

const createResident = async (resident) => {
  const query = `
    INSERT INTO resident_profiles (user_id, apartment_id, relationship, move_in_date, move_out_date, status)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id
  `;

  const values = [
    resident.user_id,
    resident.apartment_id,
    resident.relationship,
    resident.move_in_date,
    resident.move_out_date,
    resident.status,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

const getAllResidents = async ({ page = 0, size = 10, buildingId, status }) => {
  const offset = page * size;
  let dataQuery = `
    SELECT 
      rp.id,
      rp.user_id,
      rp.apartment_id,
      rp.relationship,
      rp.move_in_date,
      rp.move_out_date,
      rp.status,
      rp.created_at,
      u.full_name,
      u.email,
      u.phone,
      u.avatar_url,
      a.apartment_code as apartment_number,
      b.name as building_name
    FROM resident_profiles rp
    JOIN users u ON rp.user_id = u.id
    JOIN apartments a ON rp.apartment_id = a.id
    JOIN buildings b ON a.building_id = b.id
    WHERE rp.move_out_date IS NULL
  `;

  let countQuery = `
    SELECT COUNT(*) 
    FROM resident_profiles rp
    WHERE rp.move_out_date IS NULL
  `;

  const queryParams = [];
  let paramIndex = 1;

  if (buildingId) {
    dataQuery += ` AND b.id = $${paramIndex}`;
    countQuery += ` AND EXISTS (SELECT 1 FROM apartments a WHERE a.id = rp.apartment_id AND a.building_id = $${paramIndex})`;
    queryParams.push(buildingId);
    paramIndex++;
  }

  if (status) {
    dataQuery += ` AND rp.status = $${paramIndex}`;
    countQuery += ` AND rp.status = $${paramIndex}`;
    queryParams.push(status);
    paramIndex++;
  }

  dataQuery += ` ORDER BY rp.id ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  queryParams.push(size, offset);

  const data = await pool.query(dataQuery, queryParams);
  
  const countResult = await pool.query(
    countQuery,
    queryParams.slice(0, queryParams.length - 2)
  );

  return {
    rows: data.rows,
    total: parseInt(countResult.rows[0].count),
  };
};

const getResidentById = async (id) => {
  const query = `
    SELECT 
      rp.id,
      rp.user_id,
      rp.apartment_id,
      rp.relationship,
      rp.move_in_date,
      rp.move_out_date,
      rp.status,
      rp.created_at,
      u.full_name,
      u.email,
      u.phone,
      u.avatar_url,
      a.apartment_code as apartment_number,
      b.name as building_name
    FROM resident_profiles rp
    JOIN users u ON rp.user_id = u.id
    JOIN apartments a ON rp.apartment_id = a.id
    JOIN buildings b ON a.building_id = b.id
    WHERE rp.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const getResidentsByApartmentId = async (apartmentId) => {
  const query = `
    SELECT 
      rp.id,
      rp.user_id,
      rp.apartment_id,
      rp.relationship,
      rp.move_in_date,
      rp.move_out_date,
      rp.status,
      rp.created_at,
      u.full_name,
      u.email,
      u.phone,
      u.avatar_url,
      a.apartment_code as apartment_number,
      b.name as building_name
    FROM resident_profiles rp
    JOIN users u ON rp.user_id = u.id
    JOIN apartments a ON rp.apartment_id = a.id
    JOIN buildings b ON a.building_id = b.id
    WHERE rp.apartment_id = $1 AND rp.move_out_date IS NULL
    ORDER BY rp.id ASC
  `;
  const result = await pool.query(query, [apartmentId]);
  return result.rows;
};

const getUserApartments = async (userId) => {
  const query = `
    SELECT 
      rp.apartment_id,
      rp.relationship,
      rp.status,
      a.apartment_code as apartment_number,
      b.name as building_name
    FROM resident_profiles rp
    JOIN apartments a ON rp.apartment_id = a.id
    JOIN buildings b ON a.building_id = b.id
    WHERE rp.user_id = $1 AND rp.move_out_date IS NULL
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
};

const updateResident = async (id, resident) => {
  const fields = [];
  const values = [];
  let index = 1;

  if (resident.relationship !== undefined) {
    fields.push(`relationship = $${index++}`);
    values.push(resident.relationship);
  }

  if (resident.move_in_date !== undefined) {
    fields.push(`move_in_date = $${index++}`);
    values.push(resident.move_in_date);
  }

  if (resident.move_out_date !== undefined) {
    fields.push(`move_out_date = $${index++}`);
    values.push(resident.move_out_date);
  }

  if (resident.status !== undefined) {
    fields.push(`status = $${index++}`);
    values.push(resident.status);
  }

  if (fields.length === 0) {
    throw new Error("No fields to update");
  }

  values.push(id);

  const query = `
    UPDATE resident_profiles
    SET ${fields.join(", ")}
    WHERE id = $${index}
    RETURNING id
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

const deleteResident = async (id) => {
  // Soft delete - set move_out_date and status to INACTIVE
  const query = `
    UPDATE resident_profiles
    SET move_out_date = CURRENT_DATE, status = 'MOVED_OUT'
    WHERE id = $1
    RETURNING id
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const getResidentByUserAndApartment = async (userId, apartmentId) => {
  const query = `
    SELECT id FROM resident_profiles 
    WHERE user_id = $1 AND apartment_id = $2 AND move_out_date IS NULL
  `;
  const result = await pool.query(query, [userId, apartmentId]);
  return result.rows[0];
};

module.exports = {
  createResident,
  getAllResidents,
  getResidentById,
  getResidentsByApartmentId,
  getUserApartments,
  updateResident,
  deleteResident,
  getResidentByUserAndApartment,
};