const repo = require("./maintenance.repository");
const mapper = require("./maintenance.mapper");
const createMaintenanceRequest = async (reqBody) => {
  // Generate request code if not provided
  if (!reqBody.requestCode) {
    const timestamp = Date.now().toString().slice(-8);
    reqBody.requestCode = `MR-${timestamp}`;
  }
  
  const entity = mapper.toEntity(reqBody);
  const result = await repo.createMaintenanceRequest(entity);

  return {
    id: result.id,
    requestCode: reqBody.requestCode,
  };
};

const getAllMaintenanceRequests = async (query) => {
  const { 
    page = 0, 
    size = 10, 
    status = null, 
    priority = null,
    buildingId = null,
    search = null 
  } = query;

  const result = await repo.getAllMaintenanceRequests({ 
    page: Number(page), 
    size: Number(size), 
    status, 
    priority,
    buildingId,
    search 
  });

  return {
    data: result.rows.map(mapper.toResponse),
    size: result.rows.length,
    totalElements: result.total,
    totalPages: Math.ceil(result.total / size),
    page: Number(page),
    pageSize: Number(size),
  };
};

const getMaintenanceRequestById = async (id) => {
  const data = await repo.getMaintenanceRequestById(id);

  if (!data) {
    throw new Error("Maintenance request not found");
  }

  return mapper.toResponse(data);
};

const updateMaintenanceRequest = async (id, reqBody) => {
  // Check if request exists
  const existing = await repo.getMaintenanceRequestById(id);
  if (!existing) {
    throw new Error("Maintenance request not found");
  }

  const entity = mapper.toEntity(reqBody);
  const updated = await repo.updateMaintenanceRequest(id, entity);

  if (!updated) {
    throw new Error("Update failed");
  }

  return mapper.toResponse(updated);
};

const deleteMaintenanceRequest = async (id) => {
  // Check if request exists
  const existing = await repo.getMaintenanceRequestById(id);
  if (!existing) {
    throw new Error("Maintenance request not found");
  }

  const deleted = await repo.deleteMaintenanceRequest(id);

  if (!deleted) {
    throw new Error("Delete failed");
  }

  return { id: deleted.id };
};

const updateStatus = async (id, status) => {
  // Check if request exists
  const existing = await repo.getMaintenanceRequestById(id);
  if (!existing) {
    throw new Error("Maintenance request not found");
  }

  const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
  if (!validStatuses.includes(status)) {
    throw new Error("Invalid status");
  }

  const updated = await repo.updateStatus(id, status);

  if (!updated) {
    throw new Error("Update status failed");
  }

  return mapper.toResponse(updated);
};

const assignTechnician = async (id, technicianId, technicianName) => {
  // Check if request exists
  const existing = await repo.getMaintenanceRequestById(id);
  if (!existing) {
    throw new Error("Maintenance request not found");
  }

  if (!technicianId || !technicianName) {
    throw new Error("Technician ID and name are required");
  }

  const updated = await repo.assignTechnician(id, technicianId, technicianName);

  if (!updated) {
    throw new Error("Assign technician failed");
  }

  return mapper.toResponse(updated);
};

const getStatistics = async (buildingId) => {
  const stats = await repo.getStatistics(buildingId);
  return stats;
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