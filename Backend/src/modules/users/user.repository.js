const { pool } = require("../../configs/database.config");
const { AppError } = require("../../common/app-error");

const isUniqueViolation = (err) => err && err.code === "23505";
const parseBool = (value) => {
  if (value === undefined || value === null || value === "") return undefined;
  if (value === true || value === "true" || value === "1") return true;
  if (value === false || value === "false" || value === "0") return false;
  return undefined;
};

const saveUser = async (user) => {
  const query = `
    INSERT INTO users (
      username, password, email, phone, full_name, date_of_birth, gender, id_card, avatar_url, role_id
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
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

const getAllUsers = async ({ page = 0, size = 10, role, search, isActive }) => {
  const offset = Number(page) * Number(size);
  const values = [];
  const conditions = [];

  if (role) {
    values.push(role);
    conditions.push(`LOWER(r.name) = LOWER($${values.length})`);
  }
  if (search) {
    values.push(`%${search}%`);
    conditions.push(
      `(u.username ILIKE $${values.length} OR u.full_name ILIKE $${values.length} OR u.email ILIKE $${values.length})`
    );
  }
  const active = parseBool(isActive);
  if (active !== undefined) {
    values.push(active);
    conditions.push(`u.is_active = $${values.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  values.push(size);
  values.push(offset);
  const limitParam = values.length - 1;
  const offsetParam = values.length;

  const dataQuery = `
    SELECT
      u.id, u.username, u.email, u.phone, u.full_name, u.date_of_birth,
      u.gender, u.id_card, u.avatar_url, u.role_id, r.name AS role_name,
      u.is_active, u.created_at, u.updated_at
    FROM users u
    LEFT JOIN roles r ON r.id = u.role_id
    ${where}
    ORDER BY u.id ASC
    LIMIT $${limitParam} OFFSET $${offsetParam}
  `;

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM users u
    LEFT JOIN roles r ON r.id = u.role_id
    ${where}
  `;

  const data = await pool.query(dataQuery, values);
  const countValues = values.slice(0, values.length - 2);
  const count = await pool.query(countQuery, countValues);

  return {
    rows: data.rows,
    total: parseInt(count.rows[0].total),
  };
};

const findUserById = async (id) => {
  const query = `
    SELECT
      u.id, u.username, u.email, u.phone, u.full_name, u.date_of_birth,
      u.gender, u.id_card, u.avatar_url, u.role_id, r.name AS role_name,
      u.is_active, u.created_at, u.updated_at
    FROM users u
    LEFT JOIN roles r ON r.id = u.role_id
    WHERE u.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const updateUser = async (id, user) => {
  const fields = [];
  const values = [];
  let index = 1;

  const append = (column, value) => {
    fields.push(`${column} = $${index++}`);
    values.push(value);
  };

  if (user.username !== undefined) append("username", user.username);
  if (user.password !== undefined) append("password", user.password);
  if (user.email !== undefined) append("email", user.email);
  if (user.phone !== undefined) append("phone", user.phone);
  if (user.full_name !== undefined) append("full_name", user.full_name);
  if (user.date_of_birth !== undefined) append("date_of_birth", user.date_of_birth);
  if (user.gender !== undefined) append("gender", user.gender);
  if (user.id_card !== undefined) append("id_card", user.id_card);
  if (user.avatar_url !== undefined) append("avatar_url", user.avatar_url);
  if (user.role_id !== undefined) append("role_id", user.role_id);
  if (user.is_active !== undefined) append("is_active", user.is_active);
  fields.push("updated_at = NOW()");

  if (fields.length === 0) {
    throw new AppError(400, "No fields to update");
  }

  values.push(id);
  const query = `
    UPDATE users
    SET ${fields.join(", ")}
    WHERE id = $${index}
    RETURNING id
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

const setUserActiveState = async (id, isActive) => {
  const query = `
    UPDATE users
    SET is_active = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING id, is_active
  `;
  const result = await pool.query(query, [isActive, id]);
  return result.rows[0];
};

module.exports = {
  saveUser,
  getAllUsers,
  findUserById,
  updateUser,
  setUserActiveState,
};
