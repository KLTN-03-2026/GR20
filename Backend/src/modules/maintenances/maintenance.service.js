const repo = require("./maintenance.repository");

// Cư dân tạo yêu cầu
const createMaintenanceRequest = async (reqBody, userId) => {
  // Lấy thông tin apartment của user
  const userInfo = await repo.getUserApartment(userId);
  
  if (!userInfo || !userInfo.apartment_id) {
    throw new Error("User does not have an apartment assigned");
  }
  
  const requestData = {
    ...reqBody,
    apartment_id: userInfo.apartment_id,
    user_id: userId,
    reported_by: userId
  };
  
  const result = await repo.createMaintenanceRequest(requestData);
  return result;
};
// Cư dân xem danh sách yêu cầu của mình
const getMyMaintenanceRequests = async (query, userId) => {
  const { page = 0, size = 10, status = null, priority = null } = query;

  const result = await repo.getMyMaintenanceRequests({
    page: Number(page),
    size: Number(size),
    status,
    priority,
    userId
  });

  return {
    data: result.rows,
    size: result.rows.length,
    totalElements: result.total,
    totalPages: Math.ceil(result.total / size),
    page: Number(page),
    pageSize: Number(size),
  };
};

// Cư dân xem chi tiết 1 yêu cầu
const getMaintenanceRequestById = async (id, userId) => {
  const data = await repo.getMaintenanceRequestById(id, userId);
  if (!data) {
    throw new Error("Maintenance request not found or you don't have permission");
  }
  return data;
};

// Cư dân cập nhật yêu cầu
const updateMaintenanceRequest = async (id, userId, reqBody) => {
  const updated = await repo.updateMaintenanceRequest(id, userId, reqBody);
  if (!updated) {
    throw new Error("Cannot update: Request not found, not yours, or already processed");
  }
  return updated;
};

// Cư dân xóa yêu cầu
const deleteMaintenanceRequest = async (id, userId) => {
  const deleted = await repo.deleteMaintenanceRequest(id, userId);
  if (!deleted) {
    throw new Error("Cannot delete: Request not found, not yours, or already processed");
  }
  return { id: deleted.id };
};

// Nhân viên cập nhật trạng thái
const updateStatusByStaff = async (id, status, note) => {
  const validStatuses = ['OPEN', 'IN_PROGRESS', 'DONE', 'CANCELLED'];
  if (!validStatuses.includes(status)) {
    throw new Error("Invalid status");
  }
  
  const updated = await repo.updateStatusByStaff(id, status, note);
  if (!updated) {
    throw new Error("Maintenance request not found");
  }
  return updated;
};

// Nhân viên phân công kỹ thuật viên
const assignTechnician = async (id, technicianId, technicianName) => {
  const updated = await repo.assignTechnician(id, technicianId, technicianName);
  if (!updated) {
    throw new Error("Maintenance request not found");
  }
  return updated;
};

module.exports = {
  createMaintenanceRequest,
  getMyMaintenanceRequests,
  getMaintenanceRequestById,
  updateMaintenanceRequest,
  deleteMaintenanceRequest,
  updateStatusByStaff,
  assignTechnician,
};