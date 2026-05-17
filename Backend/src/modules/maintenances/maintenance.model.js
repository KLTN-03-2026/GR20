class MaintenanceRequest {
  constructor({
    id,
    request_code,
    title,
    description,
    priority,
    status,
    building_id,
    apartment_id,
    unit,
    reported_by,
    reporter_name,
    reporter_phone,
    reported_at,
    scheduled_date,
    completed_at,
    technician_id,
    technician_name,
    estimated_cost,
    actual_cost,
    notes,
    created_at,
    updated_at,
  }) {
    this.id = id;
    this.requestCode = request_code;
    this.title = title;
    this.description = description;
    this.priority = priority;
    this.status = status;
    this.buildingId = building_id;
    this.apartmentId = apartment_id;
    this.unit = unit;
    this.reportedBy = reported_by;
    this.reporterName = reporter_name;
    this.reporterPhone = reporter_phone;
    this.reportedAt = reported_at;
    this.scheduledDate = scheduled_date;
    this.completedAt = completed_at;
    this.technicianId = technician_id;
    this.technicianName = technician_name;
    this.estimatedCost = estimated_cost;
    this.actualCost = actual_cost;
    this.notes = notes;
    this.createdAt = created_at;
    this.updatedAt = updated_at;
  }
}

module.exports = MaintenanceRequest;