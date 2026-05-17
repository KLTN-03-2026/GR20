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

  const assignedWhere = [
    "rp.move_out_date IS NULL",
    "rp.apartment_id IS NOT NULL",
  ];
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
      (
        SELECT rp3.id FROM resident_profiles rp3
        WHERE rp3.user_id = u.id
          AND rp3.move_out_date IS NULL
          AND rp3.apartment_id IS NULL
        ORDER BY rp3.id DESC
        LIMIT 1
      ) AS profile_id,
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
      AND (
        u.role_id = 5
        OR LOWER(TRIM(r.name)) = ANY(ARRAY[${RESIDENT_ROLE_NAMES.map((n) => `'${n}'`).join(", ")}])
      )
      AND NOT EXISTS (
        SELECT 1 FROM resident_profiles rp2
        WHERE rp2.user_id = u.id
          AND rp2.move_out_date IS NULL
          AND rp2.apartment_id IS NOT NULL
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
    ORDER BY created_at DESC NULLS LAST, full_name ASC NULLS LAST, profile_id ASC NULLS LAST
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

const getResidentById = async (id) => {
  const query = `
    SELECT 
      rp.id AS profile_id,
      u.id AS user_id,
      rp.apartment_id,
      rp.relationship,
      rp.move_in_date,
      rp.move_out_date,
      rp.status::text AS status,
      rp.created_at AS profile_created_at,
      u.full_name,
      u.email,
      u.phone,
      u.avatar_url,
      a.apartment_code AS apartment_number,
      b.name AS building_name
    FROM resident_profiles rp
    JOIN users u ON rp.user_id = u.id
    LEFT JOIN apartments a ON rp.apartment_id = a.id
    LEFT JOIN buildings b ON a.building_id = b.id
    WHERE rp.id = $1
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

/** Chi tiết theo user_id — tài khoản chưa gán căn hoặc hồ sơ chưa có apartment_id */
const getResidentByUserId = async (userId) => {
  const query = `
    SELECT
      rp.id AS profile_id,
      u.id AS user_id,
      rp.apartment_id,
      rp.relationship::text AS relationship,
      rp.move_in_date,
      rp.move_out_date,
      CASE
        WHEN rp.id IS NULL OR rp.apartment_id IS NULL THEN 'UNASSIGNED'
        ELSE rp.status::text
      END AS status,
      COALESCE(rp.created_at, u.created_at) AS profile_created_at,
      u.full_name,
      u.email,
      u.phone,
      u.avatar_url,
      a.apartment_code AS apartment_number,
      b.name AS building_name
    FROM users u
    LEFT JOIN LATERAL (
      SELECT *
      FROM resident_profiles
      WHERE user_id = u.id AND move_out_date IS NULL
      ORDER BY
        CASE WHEN apartment_id IS NULL THEN 0 ELSE 1 END,
        id DESC
      LIMIT 1
    ) rp ON true
    LEFT JOIN apartments a ON rp.apartment_id = a.id
    LEFT JOIN buildings b ON a.building_id = b.id
    WHERE u.id = $1
      AND u.is_active = true
      AND u.role_id = 5
  `;

  const result = await pool.query(query, [userId]);
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

const getUnassignedProfileByUserId = async (userId) => {
  const query = `
    SELECT id FROM resident_profiles
    WHERE user_id = $1
      AND move_out_date IS NULL
      AND apartment_id IS NULL
    ORDER BY id DESC
    LIMIT 1
  `;
  const result = await pool.query(query, [userId]);
  return result.rows[0] || null;
};

const assignUnassignedProfile = async (profileId, resident) => {
  const query = `
    UPDATE resident_profiles
    SET apartment_id = $2,
        relationship = $3,
        move_in_date = COALESCE($4, CURRENT_DATE),
        status = COALESCE($5::resident_status_enum, 'ACTIVE'::resident_status_enum),
        updated_at = NOW()
    WHERE id = $1
    RETURNING id
  `;
  const result = await pool.query(query, [
    profileId,
    resident.apartment_id,
    resident.relationship,
    resident.move_in_date,
    resident.status || "ACTIVE",
  ]);
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
  getResidentByUserId,
  getResidentsByApartmentId,
  getUserApartments,
  updateResident,
  deleteResident,
  getResidentByUserAndApartment,
  getUnassignedProfileByUserId,
  assignUnassignedProfile,
  getActiveOwnerForApartment,
  setApartmentOwnerAndOccupied,
};