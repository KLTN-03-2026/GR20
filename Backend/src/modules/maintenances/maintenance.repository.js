const { pool } = require("../../configs/database.config");

// Cư dân tạo yêu cầu mới
const createMaintenanceRequest = async (request) => {
  const query = `
    INSERT INTO maintenance_requests (
      title, description, priority, status, 
      apartment_id, user_id, reported_by, reported_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
    RETURNING *
  `;

  const values = [
    request.title,
    request.description,
    request.priority || 'MEDIUM',
    'OPEN',
    request.apartment_id,
    request.user_id,
    request.reported_by
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

// Lấy danh sách yêu cầu của riêng cư dân
const getMyMaintenanceRequests = async ({ 
  page = 0, 
  size = 10, 
  status = null, 
  priority = null,
  userId = null
}) => {
  const offset = page * size;
  
  let query = `
    SELECT * FROM maintenance_requests 
    WHERE reported_by = $1
  `;
  let values = [userId];
  let paramCount = 2;

  if (status && status !== 'all') {
    query += ` AND status = $${paramCount++}`;
    values.push(status);
  }

  if (priority && priority !== 'all') {
    query += ` AND priority = $${paramCount++}`;
    values.push(priority);
  }

  query += ` ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
  values.push(size, offset);

  let countQuery = `SELECT COUNT(*) FROM maintenance_requests WHERE reported_by = $1`;
  let countValues = [userId];
  let countParamCount = 2;

  if (status && status !== 'all') {
    countQuery += ` AND status = $${countParamCount++}`;
    countValues.push(status);
  }

  if (priority && priority !== 'all') {
    countQuery += ` AND priority = $${countParamCount++}`;
    countValues.push(priority);
  }

  const data = await pool.query(query, values);
  const count = await pool.query(countQuery, countValues);

  return {
    rows: data.rows,
    total: parseInt(count.rows[0].count),
  };
};

// Lấy chi tiết 1 yêu cầu cư dân
const getMaintenanceRequestById = async (id, userId) => {
  const query = `
    SELECT * FROM maintenance_requests 
    WHERE id = $1 AND reported_by = $2
  `;
  const result = await pool.query(query, [id, userId]);
  return result.rows[0];
};

// Cư dân cập nhật yêu cầu (bỏ updated_at)
const updateMaintenanceRequest = async (id, userId, request) => {
  const fields = [];
  const values = [];
  let index = 1;

  if (request.title !== undefined) {
    fields.push(`title = $${index++}`);
    values.push(request.title);
  }
  if (request.description !== undefined) {
    fields.push(`description = $${index++}`);
    values.push(request.description);
  }
  if (request.priority !== undefined) {
    fields.push(`priority = $${index++}`);
    values.push(request.priority);
  }

  if (fields.length === 0) {
    throw new Error("No fields to update");
  }

  values.push(id);
  values.push(userId);

  // Bỏ updated_at = NOW() vì cột không tồn tại
  const query = `
    UPDATE maintenance_requests
    SET ${fields.join(", ")}
    WHERE id = $${index++} AND reported_by = $${index++} AND status = 'OPEN'
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

// Cư dân xóa yêu cầu
const deleteMaintenanceRequest = async (id, userId) => {
  const query = `
    DELETE FROM maintenance_requests
    WHERE id = $1 AND reported_by = $2 AND status = 'OPEN'
    RETURNING id
  `;
  const result = await pool.query(query, [id, userId]);
  return result.rows[0];
};

// Nhân viên cập nhật trạng thái
const updateStatusByStaff = async (id, status, note = null) => {
  // Kiểm tra status hợp lệ
  const validStatuses = ['OPEN', 'IN_PROGRESS', 'DONE', 'CANCELLED'];
  if (!validStatuses.includes(status)) {
    throw new Error("Invalid status");
  }
  
  // Chỉ cập nhật status, không có completed_at và staff_note
  const query = `
    UPDATE maintenance_requests
    SET status = $1
    WHERE id = $2
    RETURNING *
  `;
  const result = await pool.query(query, [status, id]);
  return result.rows[0];
};

// Nhân viên phân công kỹ thuật viên (bỏ updated_at)
const assignTechnician = async (id, technicianId, technicianName) => {
  const query = `
    UPDATE maintenance_requests
    SET technician_id = $1, technician_name = $2, status = 'IN_PROGRESS'
    WHERE id = $3
    RETURNING *
  `;
  const result = await pool.query(query, [technicianId, technicianName, id]);
  return result.rows[0];
};

// Kiểm tra xem cột có tồn tại không (dùng để debug)
const checkColumns = async () => {
  const query = `
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'maintenance_requests'
  `;
  const result = await pool.query(query);
  console.log('Columns in maintenance_requests:', result.rows.map(r => r.column_name));
  return result.rows;
};

// Lấy thông tin apartment từ bảng resident_profiles
const getUserApartment = async (userId) => {
  const query = `
    SELECT rp.apartment_id, rp.relationship, rp.status as resident_status, 
           a.apartment_code, a.building_id, a.area, a.status as apartment_status
    FROM public.resident_profiles rp
    LEFT JOIN public.apartments a ON rp.apartment_id = a.id
    WHERE rp.user_id = $1 
      AND rp.status = 'ACTIVE'
    ORDER BY rp.created_at DESC
    LIMIT 1
  `;
  const result = await pool.query(query, [userId]);
  return result.rows[0];
};

// ==================== NHÂN VIÊN/QUẢN LÝ ====================

// Lấy tất cả yêu cầu bảo trì (cho nhân viên, quản lý, admin, chủ chung cư)
const getAllMaintenanceRequests = async ({ 
  page = 0, 
  size = 10, 
  status = null, 
  priority = null,
  apartmentId = null,
  buildingId = null,
  fromDate = null,
  toDate = null 
}) => {
  const offset = page * size;
  
  let query = `
    SELECT mr.*, 
           a.apartment_code, 
           b.name as building_name,
           COALESCE(u.full_name, 'Unknown') as resident_name,
           u.phone as resident_phone                         
    FROM maintenance_requests mr
    LEFT JOIN apartments a ON mr.apartment_id = a.id
    LEFT JOIN buildings b ON a.building_id = b.id
    LEFT JOIN users u ON mr.reported_by = u.id              
    WHERE 1=1
  `;
  let values = [];
  let paramCount = 1;

  if (status && status !== 'all') {
    query += ` AND mr.status = $${paramCount++}`;
    values.push(status);
  }

  if (priority && priority !== 'all') {
    query += ` AND mr.priority = $${paramCount++}`;
    values.push(priority);
  }

  if (apartmentId) {
    query += ` AND mr.apartment_id = $${paramCount++}`;
    values.push(apartmentId);
  }

  if (buildingId) {
    query += ` AND a.building_id = $${paramCount++}`;
    values.push(buildingId);
  }

  if (fromDate) {
    query += ` AND mr.reported_at >= $${paramCount++}`;
    values.push(fromDate);
  }

  if (toDate) {
    query += ` AND mr.reported_at <= $${paramCount++}`;
    values.push(toDate);
  }

  query += ` ORDER BY mr.reported_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
  values.push(size, offset);

  // Count query
  let countQuery = `
    SELECT COUNT(*) FROM maintenance_requests mr
    LEFT JOIN apartments a ON mr.apartment_id = a.id
    WHERE 1=1
  `;
  let countValues = [];
  let countParamCount = 1;

  if (status && status !== 'all') {
    countQuery += ` AND mr.status = $${countParamCount++}`;
    countValues.push(status);
  }

  if (priority && priority !== 'all') {
    countQuery += ` AND mr.priority = $${countParamCount++}`;
    countValues.push(priority);
  }

  if (apartmentId) {
    countQuery += ` AND mr.apartment_id = $${countParamCount++}`;
    countValues.push(apartmentId);
  }

  if (buildingId) {
    countQuery += ` AND a.building_id = $${countParamCount++}`;
    countValues.push(buildingId);
  }

  if (fromDate) {
    countQuery += ` AND mr.reported_at >= $${countParamCount++}`;
    countValues.push(fromDate);
  }

  if (toDate) {
    countQuery += ` AND mr.reported_at <= $${countParamCount++}`;
    countValues.push(toDate);
  }

  const data = await pool.query(query, values);
  const count = await pool.query(countQuery, countValues);

  return {
    rows: data.rows,
    total: parseInt(count.rows[0].count),
  };
};

// Lấy chi tiết 1 yêu cầu (cho nhân viên - không cần userId)
// const getMaintenanceRequestByIdForStaff = async (id) => {
//   const query = `
//     SELECT mr.*, 
//            a.apartment_code, 
//            a.area as apartment_area,
//            b.name as building_name,
//            b.address as building_address,
//            COALESCE(u.full_name, 'Unknown') as resident_name,  
//            u.phone as resident_phone,                       
//            u.email as resident_email                        
//     FROM maintenance_requests mr
//     LEFT JOIN apartments a ON mr.apartment_id = a.id
//     LEFT JOIN buildings b ON a.building_id = b.id
//     LEFT JOIN users u ON mr.reported_by = u.id             
//     WHERE mr.id = $1
//   `;
//   const result = await pool.query(query, [id]);
//   return result.rows[0];
// };
// Lấy chi tiết 1 yêu cầu (cho nhân viên - không cần userId)
const getMaintenanceRequestByIdForStaff = async (id) => {
  const query = `
    SELECT 
      mr.id,
      mr.title,
      mr.description,
      mr.priority,
      mr.status,
      mr.created_at,
      mr.reported_at,
      mr.reported_by,
      mr.apartment_id,
      mr.user_id,
      -- Thông tin từ bảng apartments
      a.apartment_code,
      a.area as apartment_area,
      -- Thông tin từ bảng buildings
      b.name as building_name,
      b.address as building_address,
      -- Thông tin từ bảng users (người gửi yêu cầu)
      u.full_name as resident_name,
      u.phone as resident_phone,
      u.email as resident_email,
      -- Thông tin từ bảng users (kỹ thuật viên nếu có)
      tech.full_name as technician_name,
      tech.phone as technician_phone,
      -- Thông tin từ bảng maintenance_assignments
      ma.assigned_at as assigned_date
    FROM maintenance_requests mr
    LEFT JOIN apartments a ON mr.apartment_id = a.id
    LEFT JOIN buildings b ON a.building_id = b.id
    LEFT JOIN users u ON mr.reported_by = u.id
    LEFT JOIN maintenance_assignments ma ON mr.id = ma.request_id
    LEFT JOIN users tech ON ma.technical_id = tech.id
    WHERE mr.id = $1
  `;
  
  const result = await pool.query(query, [id]);
  
  if (result.rows.length === 0) {
    return null;
  }
  
  return result.rows[0];
};


// Lấy thống kê yêu cầu bảo trì
const getMaintenanceStatistics = async ({ 
  buildingId = null,
  fromDate = null,
  toDate = null 
}) => {
  let query = `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'OPEN' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as in_progress,
      SUM(CASE WHEN status = 'DONE' THEN 1 ELSE 0 END) as completed,
      SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled,
      SUM(CASE WHEN priority = 'URGENT' THEN 1 ELSE 0 END) as urgent_priority,
      SUM(CASE WHEN priority = 'HIGH' THEN 1 ELSE 0 END) as high_priority,
      SUM(CASE WHEN priority = 'MEDIUM' THEN 1 ELSE 0 END) as medium_priority,
      SUM(CASE WHEN priority = 'LOW' THEN 1 ELSE 0 END) as low_priority
    FROM maintenance_requests mr
    LEFT JOIN apartments a ON mr.apartment_id = a.id
    WHERE 1=1
  `;
  let values = [];
  let paramCount = 1;

  if (buildingId) {
    query += ` AND a.building_id = $${paramCount++}`;
    values.push(buildingId);
  }

  if (fromDate) {
    query += ` AND mr.reported_at >= $${paramCount++}`;
    values.push(fromDate);
  }

  if (toDate) {
    query += ` AND mr.reported_at <= $${paramCount++}`;
    values.push(toDate);
  }

  const result = await pool.query(query, values);
  return result.rows[0];
};

// Thêm comment vào yêu cầu
const addComment = async (requestId, userId, userName, comment) => {
  // Kiểm tra bảng maintenance_comments đã tồn tại chưa, nếu chưa thì tạo
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS maintenance_comments (
      id SERIAL PRIMARY KEY,
      request_id INTEGER NOT NULL REFERENCES maintenance_requests(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL,
      user_name VARCHAR(255) NOT NULL,
      comment TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await pool.query(createTableQuery);
  
  const query = `
    INSERT INTO maintenance_comments (request_id, user_id, user_name, comment, created_at)
    VALUES ($1, $2, $3, $4, NOW())
    RETURNING *
  `;
  const result = await pool.query(query, [requestId, userId, userName, comment]);
  return result.rows[0];
};

// Lấy comments của yêu cầu
const getComments = async (requestId) => {
  const query = `
    SELECT * FROM maintenance_comments 
    WHERE request_id = $1 
    ORDER BY created_at ASC
  `;
  const result = await pool.query(query, [requestId]);
  return result.rows;
};

module.exports = {
  // (cho cư dân)
  createMaintenanceRequest,
  getMyMaintenanceRequests,
  getMaintenanceRequestById,
  updateMaintenanceRequest,
  deleteMaintenanceRequest,
  updateStatusByStaff,
  assignTechnician,
  getUserApartment,
  // (cho nhân viên/quản lý)
  getAllMaintenanceRequests,
  getMaintenanceRequestByIdForStaff,
  getMaintenanceStatistics,
  addComment,
  getComments,
  // debug
  checkColumns,
};