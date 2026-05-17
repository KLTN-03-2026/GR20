const { pool } = require("../../configs/database.config");
const { AppError } = require("../../common/app-error");
const ERROR_CODES = require("./building-errors");

const isUniqueViolation = (err) => err && err.code === "23505";

const createBuilding = async (building) => {
  const query = `
    INSERT INTO buildings (name, code, address, total_floors, total_apartments, year_built, status)
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    RETURNING id
  `;

  const values = [
    building.name,
    building.code,
    building.address,
    building.total_floors,
    building.total_apartments,
    building.year_built,
    building.status,
  ];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw new AppError(
        409,
        "A building with this code already exists",
        { constraint: err.constraint },
        ERROR_CODES.BUILDING_CODE_CONFLICT
      );
    }
    throw err;
  }
};

const getAllBuildings = async ({
  page = 0,
  size = 10,
  search,
  status,
  buildingIds,
  includeApartments = false,
}) => {
  if (buildingIds && buildingIds.length === 0) {
    return { rows: [], total: 0 };
  }

  const offset = page * size;
  const values = [];
  const conditions = [];

  if (search) {
    values.push(`%${search}%`);
    conditions.push(
      `(b.name ILIKE $${values.length} OR b.code ILIKE $${values.length} OR b.address ILIKE $${values.length})`,
    );
  }

  if (status) {
    values.push(status);
    conditions.push(`b.status = $${values.length}`);
  }

  if (buildingIds && buildingIds.length > 0) {
    values.push(buildingIds);
    conditions.push(`b.id = ANY($${values.length}::bigint[])`);
  }

  const where =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const apartmentsSql = includeApartments
    ? `,
    COALESCE((
      SELECT json_agg(
        json_build_object(
          'id', a.id,
          'apartmentCode', a.apartment_code,
          'status', a.status,
          'floorNumber', f.floor_number,
          'ownerName', u.full_name
        ) ORDER BY f.floor_number NULLS LAST, a.apartment_code
      )
      FROM apartments a
      LEFT JOIN floors f ON f.id = a.floor_id
      LEFT JOIN users u ON u.id = a.owner_user_id
      WHERE a.building_id = b.id AND a.status::text <> 'MAINTENANCE'
    ), '[]'::json) AS apartments`
    : "";

  const dataQuery = `
    SELECT b.* ${apartmentsSql},
    (SELECT COUNT(*)::int FROM floors f WHERE f.building_id = b.id) AS linked_floor_count,
    (
      SELECT COUNT(*)::int FROM apartments a
      WHERE a.building_id = b.id AND a.status::text != 'MAINTENANCE'
    ) AS linked_apartment_count
    FROM buildings b
    ${where}
    ORDER BY b.id ASC
    LIMIT $${values.length + 1} OFFSET $${values.length + 2}
  `;

  const countQuery = `SELECT COUNT(*)::int FROM buildings b ${where}`;

  const data = await pool.query(dataQuery, [...values, size, offset]);
  const count = await pool.query(countQuery, values);

  return {
    rows: data.rows,
    total: parseInt(count.rows[0].count, 10),
  };
};

// GET BY ID
const getBuildingById = async (id) => {
  const query = `
    SELECT b.*,
      (SELECT COUNT(*)::int FROM floors f WHERE f.building_id = b.id) AS linked_floor_count,
      (
        SELECT COUNT(*)::int FROM apartments a
        WHERE a.building_id = b.id AND a.status::text != 'MAINTENANCE'
      ) AS linked_apartment_count
    FROM buildings b
    WHERE b.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

/** Số tầng / căn thực tế gắn với tòa (dùng trước khi đóng tòa) */
const getBuildingResourceCounts = async (buildingId) => {
  const floorRes = await pool.query(
    `SELECT COUNT(*)::int AS c FROM floors WHERE building_id = $1`,
    [buildingId]
  );
  const aptRes = await pool.query(
    `SELECT COUNT(*)::int AS c FROM apartments WHERE building_id = $1 AND status::text != 'MAINTENANCE'`,
    [buildingId]
  );
  return {
    floorCount: Number(floorRes.rows[0]?.c || 0),
    apartmentCount: Number(aptRes.rows[0]?.c || 0),
  };
};

const updateBuilding = async (id, building) => {
  const fields = [];
  const values = [];
  let index = 1;

  if (building.name !== undefined) {
    fields.push(`name = $${index++}`);
    values.push(building.name);
  }

  if (building.code !== undefined) {
    fields.push(`code = $${index++}`);
    values.push(building.code);
  }

  if (building.address !== undefined) {
    fields.push(`address = $${index++}`);
    values.push(building.address);
  }

  if (building.total_floors !== undefined) {
    fields.push(`total_floors = $${index++}`);
    values.push(building.total_floors);
  }

  if (building.total_apartments !== undefined) {
    fields.push(`total_apartments = $${index++}`);
    values.push(building.total_apartments);
  }

  if (building.year_built !== undefined) {
    fields.push(`year_built = $${index++}`);
    values.push(building.year_built);
  }

  if (building.status !== undefined) {
    fields.push(`status = $${index++}`);
    values.push(building.status);
  }

  if (fields.length === 0) {
    throw new Error("No fields to update");
  }

  values.push(id);

  const query = `
    UPDATE buildings
    SET ${fields.join(", ")}
    WHERE id = $${index}
    RETURNING *
  `;

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw new AppError(
        409,
        "A building with this code already exists",
        { constraint: err.constraint },
        ERROR_CODES.BUILDING_CODE_CONFLICT
      );
    }
    throw err;
  }
};

// DELETE
const deleteBuilding = async (id) => {
  const query = `
    UPDATE buildings
    SET status = 'CLOSED'
    WHERE id = $1 AND status <> 'CLOSED'
    RETURNING id
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  createBuilding,
  getAllBuildings,
  getBuildingById,
  getBuildingResourceCounts,
  updateBuilding,
  deleteBuilding,
};
