const { pool } = require("../../../src/configs/database.config");


const getResidentList = async (options = {}) => {
  const {
    page = 0,
    size = 20,
    keyword = ''
  } = options;

  const offset = page * size;
  let conditions = [`u.role_id = 5`, `rp.status = 'ACTIVE'`];
  let params = [];
  let paramIndex = 1;

  // Tìm kiếm theo keyword - cần JOIN thêm bảng apartments cho điều kiện tìm kiếm
  if (keyword && keyword.trim()) {
    conditions.push(`(u.full_name ILIKE $${paramIndex} OR u.phone ILIKE $${paramIndex} OR a.apartment_code ILIKE $${paramIndex})`);
    params.push(`%${keyword.trim()}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 
    ? `WHERE ${conditions.join(' AND ')}` 
    : '';

  // Query lấy dữ liệu với phân trang (đã có JOIN apartments)
  const dataQuery = `
    SELECT DISTINCT ON (u.id)
      u.id,
      u.full_name,
      u.email,
      u.phone,
      u.avatar_url,
      u.is_active,
      u.created_at,
      rp.status AS resident_status,
      a.apartment_code,
      b.name AS building_name,
      f.floor_number
    FROM users u
    INNER JOIN resident_profiles rp ON rp.user_id = u.id
    INNER JOIN apartments a ON a.id = rp.apartment_id
    LEFT JOIN floors f ON f.id = a.floor_id
    LEFT JOIN buildings b ON b.id = f.building_id
    ${whereClause}
    ORDER BY u.id, rp.created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const dataResult = await pool.query(dataQuery, [...params, size, offset]);

  // ✅ SỬA: Query lấy tổng số - cần JOIN thêm apartments nếu có điều kiện tìm kiếm theo apartment_code
  let countQuery = `
    SELECT COUNT(DISTINCT u.id) as total
    FROM users u
    INNER JOIN resident_profiles rp ON rp.user_id = u.id
  `;
  
  // Nếu có keyword và điều kiện tìm kiếm liên quan đến apartment_code, cần JOIN apartments
  if (keyword && keyword.trim()) {
    countQuery += `
      INNER JOIN apartments a ON a.id = rp.apartment_id
    `;
  }
  
  countQuery += ` ${whereClause}`;

  const countResult = await pool.query(countQuery, params);

  return {
    rows: dataResult.rows,
    total: parseInt(countResult.rows[0]?.total || 0)
  };
};

// Lấy thông tin cá nhân cư dân
const getPersonalInfo = async (residentId) => {
  const query = `
    SELECT 
      u.id,
      u.full_name,
      u.avatar_url,
      u.phone,
      u.email,
      u.date_of_birth,
      u.gender,
      u.id_card,
      u.is_active,
      u.created_at
    FROM users u
    WHERE u.id = $1
  `;

  const result = await pool.query(query, [residentId]);
  return result.rows[0];
};

// Lấy thông tin cư trú (chỉ lấy ACTIVE)
const getResidenceInfo = async (residentId) => {
  const query = `
    SELECT 
      a.apartment_code,
      b.name AS building_name,
      f.floor_number,
      rp.relationship,
      rp.move_in_date,
      rp.status
    FROM resident_profiles rp
    INNER JOIN apartments a ON a.id = rp.apartment_id
    LEFT JOIN floors f ON f.id = a.floor_id
    LEFT JOIN buildings b ON b.id = f.building_id
    WHERE rp.user_id = $1 AND rp.status = 'ACTIVE'
    ORDER BY rp.created_at DESC
    LIMIT 1
  `;

  const result = await pool.query(query, [residentId]);
  return result.rows[0];
};

// Lấy apartment_id từ residentId
const getApartmentIdByResidentId = async (residentId) => {
  const query = `
    SELECT apartment_id
    FROM resident_profiles
    WHERE user_id = $1 AND status = 'ACTIVE'
    LIMIT 1
  `;

  const result = await pool.query(query, [residentId]);
  return result.rows[0]?.apartment_id;
};

// Lấy danh sách hợp đồng
const getContracts = async (residentId, apartmentId) => {
  const query = `
    SELECT 
      contract_type,
      start_date,
      end_date,
      status
    FROM contracts
    WHERE (resident_id = $1 OR apartment_id = $2)
    ORDER BY created_at DESC
  `;

  const result = await pool.query(query, [residentId, apartmentId]);
  return result.rows;
};

// Lấy người ở cùng căn hộ
const getFamilyMembers = async (apartmentId, currentUserId) => {
  const query = `
    SELECT 
      u.id,
      u.full_name,
      u.phone,
      u.avatar_url,
      u.gender,
      rp.relationship,
      rp.move_in_date
    FROM resident_profiles rp
    INNER JOIN users u ON u.id = rp.user_id
    WHERE rp.apartment_id = $1 
      AND rp.status = 'ACTIVE'
      AND u.id != $2
    ORDER BY 
      CASE rp.relationship 
        WHEN 'OWNER' THEN 1
        WHEN 'FAMILY' THEN 2
        WHEN 'TENANT' THEN 3
        ELSE 4
      END
  `;

  const result = await pool.query(query, [apartmentId, currentUserId]);
  return result.rows;
};

// Lấy lần quét gần nhất
const getLastAccessLog = async (residentId) => {
  const query = `
    SELECT scan_time, result, gate
    FROM access_logs
    WHERE user_id = $1
    ORDER BY scan_time DESC
    LIMIT 1
  `;

  const result = await pool.query(query, [residentId]);
  return result.rows[0];
};

// Lấy lịch sử quét gần đây (7 ngày)

const getRecentAccessLogs = async (residentId) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const query = `
    SELECT scan_time, result
    FROM access_logs
    WHERE user_id = $1 AND scan_time >= $2
    ORDER BY scan_time DESC
    LIMIT 10
  `;

  const result = await pool.query(query, [residentId, sevenDaysAgo]);
  console.log('Recent logs found:', result.rows.length); // Debug
  return result.rows;
};
module.exports = {
  getResidentList,
  getPersonalInfo,
  getResidenceInfo,
  getApartmentIdByResidentId,
  getContracts,
  getFamilyMembers,
  getLastAccessLog,
  getRecentAccessLogs,
};