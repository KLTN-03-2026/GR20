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

const updateUser = async (id, user) => {
  const fields = [];
  const values = [];
  let index = 1;

  if (user.email !== undefined) {
    fields.push(`email = $${index++}`);
    values.push(user.email);
  }
  if (user.full_name !== undefined) {
    fields.push(`full_name = $${index++}`);
    values.push(user.full_name);
  }
  if (user.phone !== undefined) {
    fields.push(`phone = $${index++}`);
    values.push(user.phone);
  }
  if (user.gender !== undefined) {
    fields.push(`gender = $${index++}`);
    values.push(user.gender);
  }
  if (user.date_of_birth !== undefined) {
    fields.push(`date_of_birth = $${index++}`);
    values.push(user.date_of_birth);
  }
  if (user.avatar_url !== undefined) {
    fields.push(`avatar_url = $${index++}`);
    values.push(user.avatar_url);
  }
  // if (user.role_id !== undefined) {
  //   fields.push(`role_id = $${index++}`);
  //   values.push(user.role_id);
  // }

  if (fields.length === 0) throw new Error("No fields to update");

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const query = `
    UPDATE users
    SET ${fields.join(", ")}
    WHERE id = $${index}
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

const deleteUser = async (id) => {
  const query = `
    UPDATE users
    SET is_active = false, updated_at = NOW()
    WHERE id = $1
    RETURNING id
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = { getUserById, createUser,getAllUsers,updateUser,deleteUser  };