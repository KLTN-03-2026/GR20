const { pool } = require("../../configs/database.config");
const { AppError } = require("../../common/app-error");

// CREATE
const createContract = async (entity) => {
  // Kiểm tra căn hộ đã có hợp đồng ACTIVE/PENDING/EXPIRED chưa
  const existing = await pool.query(
    `SELECT id, status FROM contracts 
     WHERE apartment_id = $1 
     AND status IN ('ACTIVE', 'PENDING', 'EXPIRED') 
     LIMIT 1`,
    [entity.apartment_id],
  );

  if (entity.status === "ACTIVE") {
    await pool.query(
      `UPDATE resident_profiles SET move_in_date = $1 
     WHERE apartment_id = $2 AND relationship = 'OWNER' AND status = 'ACTIVE'`,
      [entity.start_date, entity.apartment_id],
    );
  }

  if (existing.rows.length > 0) {
    const currentStatus = existing.rows[0].status;
    if (currentStatus === 'ACTIVE') {
      throw new AppError(400, 'Căn hộ này đang có hợp đồng ACTIVE');
    }
    if (currentStatus === 'PENDING') {
      throw new AppError(400, 'Căn hộ này đang có hợp đồng PENDING chờ duyệt');
    }
    if (currentStatus === 'EXPIRED') {
      throw new AppError(400, 'Căn hộ này đang có hợp đồng EXPIRED. Vui lòng chấm dứt trước khi tạo mới');
    }
  }

  const query = `
    INSERT INTO contracts (
      resident_id, apartment_id, contract_type, status, 
      start_date, end_date, monthly_rent, deposit, note
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING id
  `;

  const values = [
    entity.resident_id,
    entity.apartment_id,
    entity.contract_type,
    entity.status || 'PENDING',
    entity.start_date,
    entity.end_date,
    entity.monthly_rent || 0,
    entity.deposit || 0,
    entity.note || null,
  ];

  try {
    const result = await pool.query(query, values);
    return { id: parseInt(result.rows[0].id) };
  } catch (err) {
    console.error("SQL Error:", err);
    if (err.code === '23505') {
      throw new AppError(409, "Contract already exists for this apartment");
    }
    if (err.code === '23503') {
      throw new AppError(400, "Invalid resident_id or apartment_id");
    }
    if (err.code === '22P02') {
      throw new AppError(400, "Invalid contract_type value");
    }
    throw err;
  }
};

// GET LIST (FILTER + PAGINATION) + AUTO UPDATE EXPIRED
const getContracts = async ({ status, contractType, page = 1, size = 10 }) => {
  // 🆕 Tự động chuyển ACTIVE → EXPIRED nếu đã hết hạn
  await pool.query(`
    UPDATE contracts 
    SET status = 'EXPIRED', updated_at = NOW() 
    WHERE status = 'ACTIVE' AND end_date < CURRENT_DATE
  `);

  const offset = (page - 1) * size;

  let query = `
    SELECT 
      c.id,
      c.resident_id,
      u.full_name as resident_name,
      c.apartment_id,
      a.apartment_code,
      c.contract_type,
      c.status,
      c.start_date,
      c.end_date,
      c.monthly_rent,
      c.deposit
    FROM contracts c
    LEFT JOIN users u ON c.resident_id = u.id
    LEFT JOIN apartments a ON c.apartment_id = a.id
    WHERE 1=1
  `;

  const params = [];
  let paramIndex = 1;

  if (status) {
    query += ` AND c.status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  if (contractType) {
    query += ` AND c.contract_type = $${paramIndex}`;
    params.push(contractType);
    paramIndex++;
  }

  query += ` ORDER BY c.id DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(size, offset);

  const dataResult = await pool.query(query, params);

  let countQuery = `SELECT COUNT(*) as total FROM contracts WHERE 1=1`;
  const countParams = [];
  let countParamIndex = 1;

  if (status) {
    countQuery += ` AND status = $${countParamIndex}`;
    countParams.push(status);
    countParamIndex++;
  }

  if (contractType) {
    countQuery += ` AND contract_type = $${countParamIndex}`;
    countParams.push(contractType);
  }

  const countResult = await pool.query(countQuery, countParams);

  return {
    rows: dataResult.rows,
    total: parseInt(countResult.rows[0].total),
  };
};

// GET DETAIL
const getById = async (id) => {
    await pool.query(`
    UPDATE contracts SET status = 'EXPIRED', updated_at = NOW() 
    WHERE status = 'ACTIVE' AND end_date < CURRENT_DATE
  `);
  const query = `
    SELECT 
      c.*,
      json_build_object(
        'id', a.id,
        'apartmentNumber', a.apartment_code,
        'buildingName', b.name
      ) as apartment,
      json_build_object(
        'id', u.id,
        'fullName', u.full_name,
        'phone', u.phone,
        'email', u.email
      ) as signer
    FROM contracts c
    LEFT JOIN apartments a ON c.apartment_id = a.id
    LEFT JOIN buildings b ON a.building_id = b.id
    LEFT JOIN users u ON c.resident_id = u.id
    WHERE c.id = $1
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// UPDATE
const updateContract = async (id, entity) => {
  const fields = [];
  const values = [];
  let paramIndex = 1;

  if (entity.status === "ACTIVE") {
    await pool.query(
      `UPDATE resident_profiles SET move_in_date = $1 
     WHERE apartment_id = (
       SELECT apartment_id FROM contracts WHERE id = $2
     ) AND relationship = 'OWNER' AND status = 'ACTIVE'`,
      [entity.start_date, id],
    );
  }

  if (entity.status !== undefined) {
    fields.push(`status = $${paramIndex}`);
    values.push(entity.status);
    paramIndex++;
  }

  if (entity.endDate !== undefined) {
    fields.push(`end_date = $${paramIndex}`);
    values.push(entity.endDate);
    paramIndex++;
  }

  if (entity.monthlyRent !== undefined) {
    fields.push(`monthly_rent = $${paramIndex}`);
    values.push(entity.monthlyRent);
    paramIndex++;
  }

  if (entity.note !== undefined) {
    fields.push(`note = $${paramIndex}`);
    values.push(entity.note);
    paramIndex++;
  }

  if (fields.length === 0) {
    throw new AppError(400, "No fields to update");
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const query = `
    UPDATE contracts 
    SET ${fields.join(', ')} 
    WHERE id = $${paramIndex}
    RETURNING id
  `;

  const result = await pool.query(query, values);

  if (result.rows.length === 0) {
    throw new AppError(404, "Contract not found");
  }
};

// TERMINATE
const terminateContract = async (id) => {
  const query = `
    UPDATE contracts 
    SET status = 'TERMINATED', updated_at = NOW() 
    WHERE id = $1
    RETURNING id
  `;

  const result = await pool.query(query, [id]);

  if (result.rows.length === 0) {
    throw new AppError(404, "Contract not found");
  }
};

// RENEW
const renewContract = async (id, data) => {
  const query = `
    UPDATE contracts 
    SET end_date = $1, monthly_rent = $2, status = 'ACTIVE', updated_at = NOW() 
    WHERE id = $3
    RETURNING id
  `;

  const result = await pool.query(query, [data.newEndDate, data.newMonthlyRent, id]);

  if (result.rows.length === 0) {
    throw new AppError(404, "Contract not found");
  }
};

module.exports = {
  createContract,
  getContracts,
  getById,
  updateContract,
  terminateContract,
  renewContract,
};