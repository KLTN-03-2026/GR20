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

// Lấy chi tiết 1 yêu cầu
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

// Nhân viên cập nhật trạng thái (bỏ updated_at)
const updateStatusByStaff = async (id, status, note = null) => {
  const completedAt = status === 'DONE' ? new Date() : null;
  
  const query = `
    UPDATE maintenance_requests
    SET status = $1, completed_at = $2, staff_note = $3
    WHERE id = $4
    RETURNING *
  `;
  const result = await pool.query(query, [status, completedAt, note, id]);
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
  console.log('📌 Columns in maintenance_requests:', result.rows.map(r => r.column_name));
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

module.exports = {
  createMaintenanceRequest,
  getMyMaintenanceRequests,
  getMaintenanceRequestById,
  updateMaintenanceRequest,
  deleteMaintenanceRequest,
  updateStatusByStaff,
  assignTechnician,
  checkColumns,
  getUserApartment,
};