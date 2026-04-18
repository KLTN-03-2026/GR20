const { pool } = require("../../configs/database.config");

const createMaintenanceRequest = async (request) => {
  const query = `
    INSERT INTO maintenance_requests (
      request_code, title, description, priority, status, 
      building_id, apartment_id, unit, reported_by, reporter_name, 
      reporter_phone, reported_at, scheduled_date, completed_at, 
      technician_id, technician_name, estimated_cost, actual_cost, notes
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
    RETURNING id
  `;

  const values = [
    request.request_code,
    request.title,
    request.description,
    request.priority,
    request.status,
    request.building_id,
    request.apartment_id,
    request.unit,
    request.reported_by,
    request.reporter_name,
    request.reporter_phone,
    request.reported_at,
    request.scheduled_date,
    request.completed_at,
    request.technician_id,
    request.technician_name,
    request.estimated_cost,
    request.actual_cost,
    request.notes,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

const getAllMaintenanceRequests = async ({ 
  page = 0, 
  size = 10, 
  status = null, 
  priority = null,
  buildingId = null,
  search = null 
}) => {
  const offset = page * size;
  let conditions = [];
  let values = [];
  let index = 1;

  if (status && status !== 'all') {
    conditions.push(`status = $${index++}`);
    values.push(status);
  }

  if (priority && priority !== 'all') {
    conditions.push(`priority = $${index++}`);
    values.push(priority);
  }

  if (buildingId) {
    conditions.push(`building_id = $${index++}`);
    values.push(buildingId);
  }

  if (search) {
    conditions.push(`(title ILIKE $${index++} OR request_code ILIKE $${index++} OR description ILIKE $${index++})`);
    values.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const dataQuery = `
    SELECT * FROM maintenance_requests
    ${whereClause}
    ORDER BY 
      CASE priority 
        WHEN 'HIGH' THEN 1 
        WHEN 'MEDIUM' THEN 2 
        WHEN 'LOW' THEN 3 
      END,
      reported_at DESC
    LIMIT $${index++} OFFSET $${index++}
  `;

  const countQuery = `
    SELECT COUNT(*) FROM maintenance_requests
    ${whereClause}
  `;

  const dataValues = [...values, size, offset];
  const data = await pool.query(dataQuery, dataValues);
  
  const countValues = [...values];
  const count = await pool.query(countQuery, countValues);

  return {
    rows: data.rows,
    total: parseInt(count.rows[0].count),
  };
};

const getMaintenanceRequestById = async (id) => {
  const query = `SELECT * FROM maintenance_requests WHERE id = $1`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const updateMaintenanceRequest = async (id, request) => {
  const fields = [];
  const values = [];
  let index = 1;

  const updatableFields = [
    'request_code', 'title', 'description', 'priority', 'status',
    'building_id', 'apartment_id', 'unit', 'reported_by', 'reporter_name',
    'reporter_phone', 'reported_at', 'scheduled_date', 'completed_at',
    'technician_id', 'technician_name', 'estimated_cost', 'actual_cost', 'notes'
  ];

  for (const field of updatableFields) {
    if (request[field] !== undefined) {
      fields.push(`${field} = $${index++}`);
      values.push(request[field]);
    }
  }

  if (fields.length === 0) {
    throw new Error("No fields to update");
  }

  values.push(id);

  const query = `
    UPDATE maintenance_requests
    SET ${fields.join(", ")}, updated_at = NOW()
    WHERE id = $${index}
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

const deleteMaintenanceRequest = async (id) => {
  const query = `
    UPDATE maintenance_requests
    SET status = 'CANCELLED', updated_at = NOW()
    WHERE id = $1
    RETURNING id
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const updateStatus = async (id, status) => {
  const completedAt = status === 'COMPLETED' ? new Date() : null;
  
  const query = `
    UPDATE maintenance_requests
    SET status = $1, completed_at = $2, updated_at = NOW()
    WHERE id = $3
    RETURNING *
  `;

  const result = await pool.query(query, [status, completedAt, id]);
  return result.rows[0];
};

const assignTechnician = async (id, technicianId, technicianName) => {
  const query = `
    UPDATE maintenance_requests
    SET technician_id = $1, technician_name = $2, status = 'IN_PROGRESS', updated_at = NOW()
    WHERE id = $3
    RETURNING *
  `;

  const result = await pool.query(query, [technicianId, technicianName, id]);
  return result.rows[0];
};

const getStatistics = async (buildingId = null) => {
  let conditions = [];
  let values = [];
  let index = 1;

  if (buildingId) {
    conditions.push(`building_id = $${index++}`);
    values.push(buildingId);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const query = `
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending,
      COUNT(CASE WHEN status = 'IN_PROGRESS' THEN 1 END) as in_progress,
      COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed,
      COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) as cancelled,
      COUNT(CASE WHEN priority = 'HIGH' THEN 1 END) as high_priority,
      COUNT(CASE WHEN priority = 'MEDIUM' THEN 1 END) as medium_priority,
      COUNT(CASE WHEN priority = 'LOW' THEN 1 END) as low_priority
    FROM maintenance_requests
    ${whereClause}
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

module.exports = {
  createMaintenanceRequest,
  getAllMaintenanceRequests,
  getMaintenanceRequestById,
  updateMaintenanceRequest,
  deleteMaintenanceRequest,
  updateStatus,
  assignTechnician,
  getStatistics,
};