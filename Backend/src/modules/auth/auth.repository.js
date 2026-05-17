const { pool } = require("../../configs/database.config");

const loadByUserName = async (username) => {
  const query = `
    SELECT
      u.*,
      r.name AS role_name
    FROM users u
    LEFT JOIN roles r ON r.id = u.role_id
    WHERE LOWER(u.username) = LOWER($1)
    LIMIT 1
  `;
  const result = await pool.query(query, [username]);
  return result.rows[0];
};

/** @returns {Promise<number[]>} building ids from active assignments */
const loadActiveBuildingIdsForUser = async (userId) => {
  const result = await pool.query(
    `
    SELECT building_id
    FROM building_assignments
    WHERE user_id = $1 AND is_active = true
    ORDER BY id ASC
    `,
    [userId],
  );
  return result.rows.map((r) => Number(r.building_id));
};

/** @returns {Promise<{ apartmentId: number|null, buildingId: number|null }>} */
const loadResidentApartmentScope = async (userId) => {
  const result = await pool.query(
    `
    SELECT
      rp.apartment_id::bigint AS apartment_id,
      a.building_id::bigint AS building_id
    FROM resident_profiles rp
    INNER JOIN apartments a ON a.id = rp.apartment_id
    WHERE rp.user_id = $1 AND rp.status = 'ACTIVE'
    ORDER BY rp.id ASC
    LIMIT 1
    `,
    [userId],
  );
  const row = result.rows[0];
  if (!row) {
    return { apartmentId: null, buildingId: null };
  }
  return {
    apartmentId: Number(row.apartment_id),
    buildingId: row.building_id != null ? Number(row.building_id) : null,
  };
};

module.exports = {
  loadByUserName,
  loadActiveBuildingIdsForUser,
  loadResidentApartmentScope,
};
