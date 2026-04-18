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



module.exports = { loadByUserName };
