// Create Request DTO
class CreateMaintenanceRequest {
  constructor({
    requestCode,
    title,
    description,
    priority,
    status,
    buildingId,
    apartmentId,
    unit,
    reportedBy,
    reporterName,
    reporterPhone,
    reportedAt,
    scheduledDate,
    technicianId,
    technicianName,
    estimatedCost,
    notes,
  }) {
    this.requestCode = requestCode;
    this.title = title;
    this.description = description;
    this.priority = priority;
    this.status = status;
    this.buildingId = buildingId;
    this.apartmentId = apartmentId;
    this.unit = unit;
    this.reportedBy = reportedBy;
    this.reporterName = reporterName;
    this.reporterPhone = reporterPhone;
    this.reportedAt = reportedAt;
    this.scheduledDate = scheduledDate;
    this.technicianId = technicianId;
    this.technicianName = technicianName;
    this.estimatedCost = estimatedCost;
    this.notes = notes;
  }
}

// Update Request DTO
class UpdateMaintenanceRequest {
  constructor({
    title,
    description,
    priority,
    status,
    scheduledDate,
    completedAt,
    technicianId,
    technicianName,
    estimatedCost,
    actualCost,
    notes,
  }) {
    this.title = title;
    this.description = description;
    this.priority = priority;
    this.status = status;
    this.scheduledDate = scheduledDate;
    this.completedAt = completedAt;
    this.technicianId = technicianId;
    this.technicianName = technicianName;
    this.estimatedCost = estimatedCost;
    this.actualCost = actualCost;
    this.notes = notes;
  }
}

// Update Status DTO
class UpdateStatusRequest {
  constructor({ status }) {
    this.status = status;
  }
}

// Assign Technician DTO
class AssignTechnicianRequest {
  constructor({ technicianId, technicianName }) {
    this.technicianId = technicianId;
    this.technicianName = technicianName;
  }
}

// Response DTO
class MaintenanceResponse {
  constructor(maintenance) {
    this.id = maintenance.id;
    this.requestCode = maintenance.requestCode;
    this.title = maintenance.title;
    this.description = maintenance.description;
    this.priority = maintenance.priority;
    this.status = maintenance.status;
    this.buildingId = maintenance.buildingId;
    this.apartmentId = maintenance.apartmentId;
    this.unit = maintenance.unit;
    this.reportedBy = maintenance.reportedBy;
    this.reporterName = maintenance.reporterName;
    this.reporterPhone = maintenance.reporterPhone;
    this.reportedAt = maintenance.reportedAt;
    this.scheduledDate = maintenance.scheduledDate;
    this.completedAt = maintenance.completedAt;
    this.technicianId = maintenance.technicianId;
    this.technicianName = maintenance.technicianName;
    this.estimatedCost = maintenance.estimatedCost;
    this.actualCost = maintenance.actualCost;
    this.notes = maintenance.notes;
    this.createdAt = maintenance.createdAt;
    this.updatedAt = maintenance.updatedAt;
  }
}

// Statistics Response DTO
class StatisticsResponse {
  constructor(stats) {
    this.total = parseInt(stats.total) || 0;
    this.pending = parseInt(stats.pending) || 0;
    this.inProgress = parseInt(stats.in_progress) || 0;
    this.completed = parseInt(stats.completed) || 0;
    this.cancelled = parseInt(stats.cancelled) || 0;
    this.highPriority = parseInt(stats.high_priority) || 0;
    this.mediumPriority = parseInt(stats.medium_priority) || 0;
    this.lowPriority = parseInt(stats.low_priority) || 0;
  }
}

module.exports = {
  CreateMaintenanceRequest,
  UpdateMaintenanceRequest,
  UpdateStatusRequest,
  AssignTechnicianRequest,
  MaintenanceResponse,
  StatisticsResponse,
};