const { pool } = require("../../configs/database.config");
const { AppError } = require("../../common/app-error");

// CREATE
const createContract = async (entity) => {
  console.log("=== REPOSITORY ===");
  console.log("entity:", entity);
  console.log("resident_id:", entity.resident_id);

  const query = `
    INSERT INTO contracts (
      resident_id, apartment_id, contract_type, status, 
      start_date, end_date, monthly_rent, deposit, note
    )
    VALUES ($1, $2, $3, 'ACTIVE', $4, $5, $6, $7, $8)
    RETURNING id
  `;

  const values = [
    entity.resident_id,
    entity.apartment_id,
    entity.contract_type,
    entity.start_date,
    entity.end_date,
    entity.monthly_rent || 0,
    entity.deposit || 0,
    entity.note || null,
  ];

  console.log("SQL values:", values);

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

// GET LIST (FILTER + PAGINATION)
const getContracts = async ({ status, contractType, page = 1, size = 10 }) => {
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