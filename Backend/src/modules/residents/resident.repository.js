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

const RESIDENT_ROLE_NAMES = ["người dùng", "user", "resident"];

const getAllResidents = async ({
  page = 0,
  size = 10,
  buildingIds,
  status,
  filterByBuilding = false,
}) => {
  const offset = page * size;
  const queryParams = [];
  let paramIndex = 1;

  const assignedWhere = ["rp.move_out_date IS NULL"];
  if (buildingIds && buildingIds.length > 0) {
    assignedWhere.push(`b.id = ANY($${paramIndex}::bigint[])`);
    queryParams.push(buildingIds);
    paramIndex++;
  }
  if (status && status !== "UNASSIGNED") {
    assignedWhere.push(`rp.status = $${paramIndex}`);
    queryParams.push(status);
    paramIndex++;
  }

  const onlyUnassigned = status === "UNASSIGNED";
  const includeUnassigned =
    !filterByBuilding && (!status || status === "UNASSIGNED");

  const assignedSelect = `
    SELECT
      rp.id AS profile_id,
      rp.user_id,
      rp.apartment_id,
      rp.relationship::text AS relationship,
      rp.move_in_date,
      rp.move_out_date,
      rp.status::text AS status,
      rp.created_at,
      u.full_name,
      u.email,
      u.phone,
      u.avatar_url,
      a.apartment_code AS apartment_number,
      b.name AS building_name,
      false AS is_unassigned
    FROM resident_profiles rp
    JOIN users u ON rp.user_id = u.id
    JOIN apartments a ON rp.apartment_id = a.id
    JOIN buildings b ON a.building_id = b.id
    WHERE ${assignedWhere.join(" AND ")}
  `;

  const unassignedSelect = `
    SELECT
      NULL::bigint AS profile_id,
      u.id AS user_id,
      NULL::bigint AS apartment_id,
      NULL::text AS relationship,
      NULL::date AS move_in_date,
      NULL::date AS move_out_date,
      'UNASSIGNED'::text AS status,
      u.created_at,
      u.full_name,
      u.email,
      u.phone,
      u.avatar_url,
      NULL::varchar AS apartment_number,
      NULL::varchar AS building_name,
      true AS is_unassigned
    FROM users u
    INNER JOIN roles r ON r.id = u.role_id AND r.deleted_at IS NULL
    WHERE u.is_active = true
      AND LOWER(TRIM(r.name)) = ANY(ARRAY[${RESIDENT_ROLE_NAMES.map((n) => `'${n}'`).join(", ")}])
      AND NOT EXISTS (
        SELECT 1 FROM resident_profiles rp2
        WHERE rp2.user_id = u.id AND rp2.move_out_date IS NULL
      )
  `;

  const parts = [];
  if (!onlyUnassigned) {
    parts.push(assignedSelect);
  }
  if (includeUnassigned) {
    parts.push(unassignedSelect);
  }

  if (parts.length === 0) {
    return { rows: [], total: 0 };
  }

  const combinedSql = parts.join(" UNION ALL ");
  const countQuery = `WITH combined AS (${combinedSql}) SELECT COUNT(*)::int AS count FROM combined`;
  const dataQuery = `
    WITH combined AS (${combinedSql})
    SELECT * FROM combined
    ORDER BY is_unassigned DESC, full_name ASC NULLS LAST, profile_id ASC NULLS LAST
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const countResult = await pool.query(countQuery, queryParams);
  queryParams.push(size, offset);
  const data = await pool.query(dataQuery, queryParams);

  return {
    rows: data.rows,
    total: countResult.rows[0].count,
  };
};

// resident.repository.js
const getResidentById = async (id) => {
  console.log('REPO - Looking for id:', id);
  
  const query = `
    SELECT 
      rp.id as profile_id,
      u.id as user_id,
      rp.apartment_id,
      rp.relationship,
      rp.move_in_date,
      rp.move_out_date,
      COALESCE(rp.status, 'ACTIVE'::resident_status_enum) as status,
      rp.created_at as profile_created_at,
      u.full_name,
      u.email,
      u.phone,
      u.avatar_url,
      a.apartment_code as apartment_number,
      b.name as building_name
    FROM users u
    LEFT JOIN resident_profiles rp ON u.id = rp.user_id
    LEFT JOIN apartments a ON rp.apartment_id = a.id
    LEFT JOIN buildings b ON a.building_id = b.id
    WHERE u.id = $1 AND u.role_id = 5
  `;
  
  const result = await pool.query(query, [id]);
  
  // Nếu chưa có profile, tự động tạo với status ACTIVE
  if (result.rows.length > 0 && !result.rows[0].profile_id) {
    console.log('Creating resident profile for user', id);
    
    await pool.query(`
      INSERT INTO resident_profiles (user_id, status, move_in_date)
      VALUES ($1, 'ACTIVE', CURRENT_DATE)
    `, [id]);
    
    // Query lại
    const newResult = await pool.query(query, [id]);
    return newResult.rows[0] || null;
  }
  
  return result.rows[0] || null;
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

/** Chủ hộ đang ACTIVE (đồng bộ logic với apartment.repository addResident) */
const getActiveOwnerForApartment = async (apartmentId) => {
  const query = `
    SELECT rp.id, u.full_name
    FROM resident_profiles rp
    JOIN users u ON rp.user_id = u.id
    WHERE rp.apartment_id = $1
      AND rp.relationship = 'OWNER'
      AND rp.status = 'ACTIVE'
    LIMIT 1
  `;
  const result = await pool.query(query, [apartmentId]);
  return result.rows[0] || null;
};

const setApartmentOwnerAndOccupied = async (apartmentId, userId) => {
  const query = `
    UPDATE apartments
    SET owner_user_id = $1, status = 'OCCUPIED', updated_at = NOW()
    WHERE id = $2
    RETURNING id
  `;
  const result = await pool.query(query, [userId, apartmentId]);
  return result.rows[0] || null;
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
  getActiveOwnerForApartment,
  setApartmentOwnerAndOccupied,
};