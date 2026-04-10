const { pool } = require("../../configs/database.config");

const createUser = async (user) => {
  const query = `
    INSERT INTO users (username, password, email, full_name, gender, role_id, is_active, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())
    RETURNING id
  `;

  const values = [
    user.username,
    user.password,
    user.email,
    user.full_name,
    user.gender,
    user.role_id,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

const getUserById = async (id) => {
  const query = `
    SELECT 
      u.*,
      r.name AS role
    FROM users u
    LEFT JOIN roles r ON r.id = u.role_id
    WHERE u.id = $1
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const getAllUsers = async ({ page = 0, size = 10 }) => {
  const offset = page * size;

  const dataQuery = `
    SELECT 
      u.*,
      r.name AS role
    FROM users u
    LEFT JOIN roles r ON r.id = u.role_id
    ORDER BY u.id ASC
    LIMIT $1 OFFSET $2
  `;

  const countQuery = `SELECT COUNT(*) FROM users`;

  const data = await pool.query(dataQuery, [size, offset]);
  const count = await pool.query(countQuery);

  return {
    rows: data.rows,
    total: parseInt(count.rows[0].count),
  };
};

module.exports = { getUserById, createUser,getAllUsers  };