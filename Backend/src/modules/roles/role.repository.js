const { pool } = require("../../configs/database.config");
const { AppError } = require("../../common/app-error");

const isUniqueViolation = (err) => err && err.code === "23505";

const saveRole = async (role) => {
  const query = `
    INSERT INTO roles (name, description)
    VALUES ($1, $2)
    RETURNING id
  `;
  try {
    const result = await pool.query(query, [role.name, role.description]);
    return result.rows[0];
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw new AppError(409, "A role with this name already exists", {
        constraint: err.constraint,
      });
    }
    throw err;
  }
};

const getAllRoles = async ({ page = 0, size = 10, search }) => {
  const offset = page * size;
  const values = [];
  const conditions = [];

  if (search) {
    values.push(`%${search}%`);
    conditions.push(
      `(name ILIKE $${values.length} OR description ILIKE $${values.length})`
    );
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  values.push(size);
  values.push(offset);
  const limitParam = values.length - 1;
  const offsetParam = values.length;

  const dataQuery = `
    SELECT * FROM roles
    ${where}
    ORDER BY id ASC
    LIMIT $${limitParam} OFFSET $${offsetParam}
  `;
  const countQuery = `SELECT COUNT(*) FROM roles ${where}`;

  const data = await pool.query(dataQuery, values);
  const countValues = values.slice(0, values.length - 2);
  const count = await pool.query(countQuery, countValues);

  return {
    rows: data.rows,
    total: parseInt(count.rows[0].count),
  };
};

const findRoleById = async (id) => {
  const query = `SELECT * FROM roles WHERE id = $1`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const findRoleByName = async (name) => {
  const query = `SELECT * FROM roles WHERE LOWER(name) = LOWER($1)`;
  const result = await pool.query(query, [name]);
  return result.rows[0];
};

const updateRole = async (id, role) => {
  const fields = [];
  const values = [];
  let index = 1;

  if (role.name !== undefined) {
    fields.push(`name = $${index++}`);
    values.push(role.name);
  }
  if (role.description !== undefined) {
    fields.push(`description = $${index++}`);
    values.push(role.description);
  }
  if (fields.length === 0) {
    throw new AppError(400, "No fields to update");
  }

  values.push(id);
  const query = `
    UPDATE roles
    SET ${fields.join(", ")}
    WHERE id = $${index}
    RETURNING *
  `;

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw new AppError(409, "A role with this name already exists", {
        constraint: err.constraint,
      });
    }
    throw err;
  }
};

const deleteRole = async (id) => {
  const query = `
    DELETE FROM roles
    WHERE id = $1
    RETURNING id
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  saveRole,
  getAllRoles,
  findRoleById,
  findRoleByName,
  updateRole,
  deleteRole,
};
