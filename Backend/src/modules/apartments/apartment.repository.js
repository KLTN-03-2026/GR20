const { pool } = require("../../configs/database.config");
const { AppError } = require("../../common/app-error");

const isUniqueViolation = (err) => err && err.code === "23505";

// CREATE
const createApartment = async (apartment) => {
  const query = `
    INSERT INTO apartments (
      building_id,
      owner_user_id,
      floor_id,
      apartment_code,
      area,
      bedrooms,
      bathrooms,
      balcony_direction,
      status
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING id
  `;

  const values = [
    apartment.building_id,
    apartment.owner_user_id,
    apartment.floor_id,
    apartment.apartment_code,
    apartment.area,
    apartment.bedrooms,
    apartment.bathrooms,
    apartment.balcony_direction,
    apartment.status,
  ];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw new AppError(
        409,
        "An apartment with this code already exists",
        { constraint: err.constraint }
      );
    }
    throw err;
  }
};

const buildListWhereClause = ({ buildingId, floorId, search }) => {
  const conditions = [];
  const values = [];
  let idx = 1;

  const numOrNull = (v) => {
    if (v === undefined || v === null || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const bId = numOrNull(buildingId);
  const fId = numOrNull(floorId);

  if (bId !== null) {
    conditions.push(`a.building_id = $${idx++}`);
    values.push(bId);
  }
  if (fId !== null) {
    conditions.push(`a.floor_id = $${idx++}`);
    values.push(fId);
  }
  if (search !== undefined && String(search).trim() !== "") {
    const term = String(search).trim();
    conditions.push(`(
      a.apartment_code ILIKE '%' || $${idx}::text || '%'
      OR COALESCE(b.name, '') ILIKE '%' || $${idx}::text || '%'
      OR COALESCE(u.full_name::text, '') ILIKE '%' || $${idx}::text || '%'
      OR COALESCE(u.username::text, '') ILIKE '%' || $${idx}::text || '%'
    )`);
    values.push(term);
    idx += 1;
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  return { whereClause, values };
};

/** Danh sách có join tòa nhà — tầng — chủ sở hữu (+ lọc buildingId / floorId / search) */
const findApartmentsWithDetails = async ({
  page = 0,
  size = 10,
  buildingId,
  floorId,
  search,
}) => {
  const limit = Math.max(1, Math.min(500, Number(size) || 10));
  const pageNum = Math.max(0, Number(page) || 0);
  const offset = pageNum * limit;

  const { whereClause, values } = buildListWhereClause({
    buildingId,
    floorId,
    search,
  });

  const countQuery = `
    SELECT COUNT(*) AS cnt
    FROM apartments a
    LEFT JOIN buildings b ON a.building_id = b.id
    LEFT JOIN floors f ON a.floor_id = f.id
    LEFT JOIN users u ON a.owner_user_id = u.id
    ${whereClause}
  `;

  const limPos = values.length + 1;
  const offPos = values.length + 2;

  const dataQuery = `
    SELECT
      a.*,
      b.name AS building_name,
      f.floor_number,
      COALESCE(NULLIF(trim(COALESCE(u.full_name::text, '')), ''), NULLIF(trim(COALESCE(u.username::text, '')), '')) AS owner_name
    FROM apartments a
    LEFT JOIN buildings b ON a.building_id = b.id
    LEFT JOIN floors f ON a.floor_id = f.id
    LEFT JOIN users u ON a.owner_user_id = u.id
    ${whereClause}
    ORDER BY a.id ASC
    LIMIT $${limPos} OFFSET $${offPos}
  `;

  const data = await pool.query(dataQuery, [...values, limit, offset]);
  const count = await pool.query(countQuery, values);

  const totalRow = count.rows[0]?.cnt ?? 0;

  return {
    rows: data.rows,
    total: parseInt(String(totalRow), 10) || 0,
  };
};

// GET ALL — dùng findApartmentsWithDetails (backward compatible signature)
const getAllApartments = async (opts = {}) =>
  findApartmentsWithDetails({ page: opts.page ?? 0, size: opts.size ?? 10, ...opts });

const getApartmentsByBuilding = async ({ buildingId, page = 0, size = 10 }) =>
  findApartmentsWithDetails({ buildingId, page, size });

const getApartmentsByFloor = async ({ floorId, page = 0, size = 10 }) =>
  findApartmentsWithDetails({ floorId, page, size });

// GET BY ID — tòa nhà, tầng, chủ, danh sách cư dân (resident_profiles ACTIVE), HĐ ACTIVE gần nhất
const getApartmentById = async (id) => {
  const query = `
    SELECT
      a.*,
      b.name AS building_name,
      f.floor_number,
      COALESCE(
        NULLIF(trim(COALESCE(owner.full_name::text, '')), ''),
        NULLIF(trim(COALESCE(owner.username::text, '')), '')
      ) AS owner_name,
      CASE WHEN owner.id IS NOT NULL THEN
        json_build_object(
          'id', owner.id,
          'fullName', COALESCE(NULLIF(trim(COALESCE(owner.full_name::text, '')), ''), owner.username::text),
          'phone', owner.phone,
          'email', owner.email,
          'avatarUrl', owner.avatar_url
        )
      END AS owner,
      COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'id', rp.id,
              'fullName', COALESCE(NULLIF(trim(COALESCE(u.full_name::text, '')), ''), u.username::text),
              'phone', u.phone,
              'relationship', rp.relationship::text,
              'moveInDate', rp.move_in_date
            ) ORDER BY rp.id
          )
          FROM resident_profiles rp
          INNER JOIN users u ON u.id = rp.user_id
          WHERE rp.apartment_id = a.id
            AND rp.status = 'ACTIVE'::public.resident_status_enum
        ),
        '[]'::json
      ) AS residents,
      (
        SELECT json_build_object(
          'id', c.id,
          'contractType', c.contract_type::text,
          'status', c.status::text,
          'startDate', c.start_date,
          'endDate', c.end_date,
          'monthlyRent', COALESCE(c.monthly_rent, 0)
        )
        FROM contracts c
        WHERE c.apartment_id = a.id
          AND c.status = 'ACTIVE'::public.contract_status_enum
        ORDER BY c.id DESC
        LIMIT 1
      ) AS "currentContract"
    FROM apartments a
    LEFT JOIN buildings b ON a.building_id = b.id
    LEFT JOIN floors f ON a.floor_id = f.id
    LEFT JOIN users owner ON a.owner_user_id = owner.id
    WHERE a.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

/** Căn còn trống — dùng form hợp đồng */
const getAvailableApartments = async () => {
  const result = await pool.query(
    `SELECT * FROM apartments WHERE status = 'AVAILABLE' ORDER BY apartment_code ASC, id ASC`
  );
  return result.rows;
};

/** Thống kê dashboard (widget AI): tỉ lệ lấp đầy & hợp đồng sắp hết hạn */
const getDashboardStats = async () => {
  const occResult = await pool.query(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status = 'OCCUPIED')::int AS occupied
    FROM apartments
  `);
  const row = occResult.rows[0] || { total: 0, occupied: 0 };
  const total = row.total ?? 0;
  const occupancyRate = total > 0 ? Math.round((row.occupied / total) * 100) : 0;

  let expiringContracts = 0;
  try {
    const exp = await pool.query(`
      SELECT COUNT(*)::int AS cnt
      FROM contracts
      WHERE COALESCE(status, '') IN ('ACTIVE', 'active')
        AND end_date IS NOT NULL
        AND end_date::date <= (CURRENT_DATE + INTERVAL '30 days')
        AND end_date::date >= CURRENT_DATE
    `);
    expiringContracts = exp.rows[0]?.cnt ?? 0;
  } catch (_) {
    expiringContracts = 0;
  }

  return { occupancyRate, expiringContracts };
};

// UPDATE
const updateApartment = async (id, apartment) => {
  const fields = [];
  const values = [];
  let index = 1;

  if (apartment.building_id !== undefined) {
    fields.push(`building_id = $${index++}`);
    values.push(apartment.building_id);
  }

  if (apartment.owner_user_id !== undefined) {
    fields.push(`owner_user_id = $${index++}`);
    values.push(apartment.owner_user_id);
  }

  if (apartment.floor_id !== undefined) {
    fields.push(`floor_id = $${index++}`);
    values.push(apartment.floor_id);
  }

  if (apartment.apartment_code !== undefined) {
    fields.push(`apartment_code = $${index++}`);
    values.push(apartment.apartment_code);
  }

  if (apartment.area !== undefined) {
    fields.push(`area = $${index++}`);
    values.push(apartment.area);
  }

  if (apartment.bedrooms !== undefined) {
    fields.push(`bedrooms = $${index++}`);
    values.push(apartment.bedrooms);
  }

  if (apartment.bathrooms !== undefined) {
    fields.push(`bathrooms = $${index++}`);
    values.push(apartment.bathrooms);
  }

  if (apartment.balcony_direction !== undefined) {
    fields.push(`balcony_direction = $${index++}`);
    values.push(apartment.balcony_direction);
  }

  if (apartment.status !== undefined) {
    fields.push(`status = $${index++}`);
    values.push(apartment.status);
  }

  if (fields.length === 0) {
    throw new Error("No fields to update");
  }

  values.push(id);

  const query = `
    UPDATE apartments
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
        "An apartment with this code already exists",
        { constraint: err.constraint }
      );
    }
    throw err;
  }
};

// DELETE (SOFT DELETE)
const deleteApartment = async (id) => {
  const query = `
    UPDATE apartments
    SET status = 'INACTIVE'
    WHERE id = $1
    RETURNING id
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  createApartment,
  getAllApartments,
  findApartmentsWithDetails,
  getApartmentsByBuilding,
  getApartmentsByFloor,
  getApartmentById,
  getAvailableApartments,
  getDashboardStats,
  updateApartment,
  deleteApartment,
};