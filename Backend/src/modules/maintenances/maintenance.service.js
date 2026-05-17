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

// ==================== NHÂN VIÊN/QUẢN LÝ ====================

// Lấy tất cả yêu cầu bảo trì (cho staff)
const getAllMaintenanceRequests = async (query, userRole) => {
  // Kiểm tra quyền
  const allowedRoles = ['Nhân viên', 'Quản lý', 'Admin', 'Chủ chung cư'];
  if (!allowedRoles.includes(userRole)) {
    throw new Error("Unauthorized: Only staff and management can view all requests");
  }

  const { 
    page = 0, 
    size = 10, 
    status = null, 
    priority = null,
    apartmentId = null,
    buildingId = null,
    fromDate = null,
    toDate = null
  } = query;

  const result = await repo.getAllMaintenanceRequests({
    page: Number(page),
    size: Number(size),
    status,
    priority,
    apartmentId: apartmentId ? Number(apartmentId) : null,
    buildingId: buildingId ? Number(buildingId) : null,
    fromDate,
    toDate
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

// Lấy chi tiết yêu cầu (cho staff - không cần kiểm tra quyền sở hữu)
// const getMaintenanceRequestByIdForStaff = async (id, userRole) => {
//   // Kiểm tra quyền
//   const allowedRoles = ['Nhân viên', 'Quản lý', 'Admin', 'Chủ chung cư'];
//   if (!allowedRoles.includes(userRole)) {
//     throw new Error("Unauthorized: Only staff and management can view request details");
//   }
  
//   const data = await repo.getMaintenanceRequestByIdForStaff(id);
//   if (!data) {
//     throw new Error("Maintenance request not found");
//   }
  
//   // Lấy comments
//   const comments = await repo.getComments(id);
  
//   return {
//     ...data,
//     comments
//   };
// };
// Lấy chi tiết yêu cầu (cho staff - không cần kiểm tra quyền sở hữu)
const getMaintenanceRequestByIdForStaff = async (id, userRole) => {
  // Kiểm tra quyền
  const allowedRoles = ['Nhân viên', 'Quản lý', 'Admin', 'Chủ chung cư'];
  if (!allowedRoles.includes(userRole)) {
    throw new Error("Unauthorized: Only staff and management can view request details");
  }
  
  const data = await repo.getMaintenanceRequestByIdForStaff(id);
  if (!data) {
    throw new Error("Maintenance request not found");
  }
  
  // Lấy comments nếu có bảng maintenance_comments
  let comments = [];
  try {
    comments = await repo.getComments(id);
  } catch (err) {
    // Bảng comments chưa có, bỏ qua
    console.log("Comments table not found, skipping...");
  }
  
  // Format dữ liệu trả về
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    priority: data.priority,
    status: data.status,
    createdAt: data.created_at,
    reportedAt: data.reported_at,
    apartment: {
      id: data.apartment_id,
      code: data.apartment_code,
      area: data.apartment_area
    },
    building: {
      name: data.building_name,
      address: data.building_address
    },
    resident: {
      id: data.reported_by,
      name: data.resident_name,
      phone: data.resident_phone,
      email: data.resident_email
    },
    technician: data.technician_name ? {
      name: data.technician_name,
      phone: data.technician_phone,
      assignedDate: data.assigned_date
    } : null,
    comments: comments
  };
};


// Lấy thống kê
const getMaintenanceStatistics = async (query, userRole) => {
  const allowedRoles = ['Nhân viên', 'Quản lý', 'Admin', 'Chủ chung cư'];
  if (!allowedRoles.includes(userRole)) {
    throw new Error("Unauthorized: Only staff and management can view statistics");
  }

  const { buildingId = null, fromDate = null, toDate = null } = query;
  
  const stats = await repo.getMaintenanceStatistics({
    buildingId: buildingId ? Number(buildingId) : null,
    fromDate,
    toDate
  });
  
  // Đảm bảo tất cả các giá trị đều là số
  return {
    total: parseInt(stats?.total || 0),
    pending: parseInt(stats?.pending || 0),
    inProgress: parseInt(stats?.in_progress || 0),
    completed: parseInt(stats?.completed || 0),
    cancelled: parseInt(stats?.cancelled || 0),
    urgentPriority: parseInt(stats?.urgent_priority || 0),
    highPriority: parseInt(stats?.high_priority || 0),
    mediumPriority: parseInt(stats?.medium_priority || 0),
    lowPriority: parseInt(stats?.low_priority || 0),
    avgCompletionHours: 0 // Tạm thời để 0 vì không có completed_at
  };
};

// Thêm comment
const addComment = async (requestId, userId, userName, comment, userRole) => {
  const allowedRoles = ['Nhân viên', 'Quản lý', 'Admin', 'Chủ chung cư'];
  if (!allowedRoles.includes(userRole)) {
    throw new Error("Unauthorized: Only staff can add comments");
  }
  
  if (!comment || comment.trim() === '') {
    throw new Error("Comment cannot be empty");
  }
  
  const result = await repo.addComment(requestId, userId, userName, comment);
  return result;
};

module.exports = {
  createMaintenanceRequest,
  getMyMaintenanceRequests,
  getMaintenanceRequestById,
  updateMaintenanceRequest,
  deleteMaintenanceRequest,
  updateStatusByStaff,
  assignTechnician,
  getAllMaintenanceRequests,
  getMaintenanceRequestByIdForStaff,
  getMaintenanceStatistics,
  addComment,
};