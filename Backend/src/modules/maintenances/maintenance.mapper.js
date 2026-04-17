const toEntity = (req) => {
  return {
    request_code: req.requestCode,
    title: req.title,
    description: req.description,
    priority: req.priority || "MEDIUM",
    status: req.status || "PENDING",
    building_id: req.buildingId,
    apartment_id: req.apartmentId,
    unit: req.unit,
    reported_by: req.reportedBy,
    reporter_name: req.reporterName,
    reporter_phone: req.reporterPhone,
    reported_at: req.reportedAt || new Date(),
    scheduled_date: req.scheduledDate,
    completed_at: req.completedAt,
    technician_id: req.technicianId,
    technician_name: req.technicianName,
    estimated_cost: req.estimatedCost,
    actual_cost: req.actualCost,
    notes: req.notes,
  };
};

const toResponse = (row) => {
  if (!row) return null;
  
  return {
    id: row.id,
    requestCode: row.request_code,
    title: row.title,
    description: row.description,
    priority: row.priority,
    status: row.status,
    buildingId: row.building_id,
    apartmentId: row.apartment_id,
    unit: row.unit,
    reportedBy: row.reported_by,
    reporterName: row.reporter_name,
    reporterPhone: row.reporter_phone,
    reportedAt: row.reported_at,
    scheduledDate: row.scheduled_date,
    completedAt: row.completed_at,
    technicianId: row.technician_id,
    technicianName: row.technician_name,
    estimatedCost: row.estimated_cost,
    actualCost: row.actual_cost,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

module.exports = { toEntity, toResponse };