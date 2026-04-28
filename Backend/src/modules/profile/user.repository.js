const { pool } = require("../../configs/database.config");
const { AppError } = require("../../common/app-error");

const isUniqueViolation = (err) => err && err.code === "23505";
const parseBool = (value) => {
  if (value === undefined || value === null || value === "") return undefined;
  if (value === true || value === "true" || value === "1") return true;
  if (value === false || value === "false" || value === "0") return false;
  return undefined;
};

const createUser = async (user) => {
  const query = `
    INSERT INTO users (
      username, password, email, phone, full_name, date_of_birth, gender, id_card, avatar_url, role_id, is_active, created_at, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, NOW(), NOW())
    RETURNING id
  `;

  const values = [
    user.username,
    user.password,
    user.email,
    user.phone,
    user.full_name,
    user.date_of_birth,
    user.gender,
    user.id_card,
    user.avatar_url,
    user.role_id,
  ];
  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw new AppError(409, "Username or email already exists", {
        constraint: err.constraint,
      });
    }
    throw err;
  }
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

const getAllUsers = async ({ page = 0, size = 10, role, search, isActive }) => {
  const offset = page * size;
  const values = [];
  const conditions = [];

  if (role) {
    values.push(role);
    conditions.push(`LOWER(TRIM(r.name)) = LOWER(TRIM($${values.length}))`);
  }
  if (search) {
    values.push(`%${search}%`);
    conditions.push(
      `(u.username ILIKE $${values.length} OR u.full_name ILIKE $${values.length} OR u.email ILIKE $${values.length} OR u.phone ILIKE $${values.length})`
    );
  }
  const active = parseBool(isActive);
  if (active !== undefined) {
    values.push(active);
    conditions.push(`u.is_active = $${values.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const dataQuery = `
    SELECT 
      u.*,
      r.name AS role
    FROM users u
    LEFT JOIN roles r ON r.id = u.role_id
    ${where}
    ORDER BY u.id ASC
    LIMIT $${values.length + 1} OFFSET $${values.length + 2}
  `;

  const countQuery = `
    SELECT COUNT(*)
    FROM users u
    LEFT JOIN roles r ON r.id = u.role_id
    ${where}
  `;

  const data = await pool.query(dataQuery, [...values, size, offset]);
  const count = await pool.query(countQuery, values);

  return {
    rows: data.rows,
    total: parseInt(count.rows[0].count),
  };
};

const updateUser = async (id, user) => {
  const fields = [];
  const values = [];
  let index = 1;

  if (user.username !== undefined) {
    fields.push(`username = $${index++}`);
    values.push(user.username);
  }
  if (user.password !== undefined) {
    fields.push(`password = $${index++}`);
    values.push(user.password);
  }
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
  if (user.id_card !== undefined) {
    fields.push(`id_card = $${index++}`);
    values.push(user.id_card);
  }
  if (user.role_id !== undefined) {
    fields.push(`role_id = $${index++}`);
    values.push(user.role_id);
  }
  if (user.is_active !== undefined) {
    fields.push(`is_active = $${index++}`);
    values.push(user.is_active);
  }

  if (fields.length === 0) throw new Error("No fields to update");

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const query = `
    UPDATE users
    SET ${fields.join(", ")}
    WHERE id = $${index}
    RETURNING *
  `;

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw new AppError(409, "Username or email already exists", {
        constraint: err.constraint,
      });
    }
    throw err;
  }
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
const getUserByUsername = async (username) => {
  const query = `
    SELECT 
      u.*,
      r.name AS role
    FROM users u
    LEFT JOIN roles r ON r.id = u.role_id
    WHERE u.username = $1 AND u.is_active = true
  `;

  const result = await pool.query(query, [username]);
  return result.rows[0];
};

const updateUserByUsername = async (username, user) => {
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

  if (fields.length === 0) throw new Error("No fields to update");

  fields.push(`updated_at = NOW()`);
  values.push(username);

  const query = `
    UPDATE users
    SET ${fields.join(", ")}
    WHERE username = $${index} AND is_active = true
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

// const updatePassword = async (username, hashedPassword) => {
//   const query = `
//     UPDATE users
//     SET password = $1, updated_at = NOW()
//     WHERE username = $2 AND is_active = true
//     RETURNING id
//   `;

//   const result = await pool.query(query, [hashedPassword, username]);
//   return result.rows[0];
// };

const updatePassword = async (username, newPassword) => {
  const query = `
    UPDATE users
    SET password = $1, updated_at = NOW()
    WHERE username = $2 AND is_active = true
    RETURNING id
  `;

  // ✅ Lưu trực tiếp, không hash
  const result = await pool.query(query, [newPassword, username]);
  return result.rows[0];
};

const updateAvatarUrl = async (username, avatarUrl) => {
  const query = `
    UPDATE users
    SET avatar_url = $1, updated_at = NOW()
    WHERE username = $2 AND is_active = true
    RETURNING id
  `;

  const result = await pool.query(query, [avatarUrl, username]);
  return result.rows[0];
};



module.exports = { getUserById, createUser,getAllUsers,updateUser,deleteUser,getUserByUsername,updateUserByUsername,updatePassword,updateAvatarUrl  };