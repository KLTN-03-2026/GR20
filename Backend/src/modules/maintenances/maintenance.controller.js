const service = require("./maintenance.service");

// ==================== CƯ DÂN ====================

const createMaintenanceRequest = async (req, res) => {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    const { title, description, priority } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const requestData = {
      title,
      description,
      priority: priority || 'MEDIUM',
    };

    // Gọi service với userId, service sẽ tự lấy apartment_id từ database
    const data = await service.createMaintenanceRequest(requestData, parseInt(userId));

    res.status(201).json({
      success: true,
      message: "Tạo yêu cầu bảo trì thành công",
      data,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cư dân xem danh sách yêu cầu của mình
const getMyMaintenanceRequests = async (req, res) => {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await service.getMyMaintenanceRequests(req.query, parseInt(userId));

    res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cư dân xem chi tiết yêu cầu của mình
const getMaintenanceRequestById = async (req, res) => {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const data = await service.getMaintenanceRequestById(req.params.id, parseInt(userId));

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

// Cư dân cập nhật yêu cầu (chỉ khi đang mở)
const updateMaintenanceRequest = async (req, res) => {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { title, description, priority } = req.body;
    const data = await service.updateMaintenanceRequest(
      req.params.id, 
      parseInt(userId), 
      { title, description, priority }
    );

    res.json({
      success: true,
      message: "Cập nhật yêu cầu thành công",
      data,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Cư dân xóa yêu cầu (chỉ khi đang mở)
const deleteMaintenanceRequest = async (req, res) => {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await service.deleteMaintenanceRequest(req.params.id, parseInt(userId));

    res.json({
      success: true,
      message: "Xóa yêu cầu thành công",
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ==================== NHÂN VIÊN ====================

// Nhân viên cập nhật trạng thái yêu cầu
const updateStatusByStaff = async (req, res) => {
  try {
    const userRole = req.user?.role;
    if (userRole !== 'Nhân viên' && userRole !== 'Quản lý' && userRole !== 'Admin') {
      return res.status(403).json({ message: "Forbidden: Only staff can update status" });
    }

    const { status, note } = req.body;
    const validStatuses = ['OPEN', 'IN_PROGRESS', 'DONE', 'CANCELLED'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const data = await service.updateStatusByStaff(req.params.id, status, note);

    res.json({
      success: true,
      message: "Cập nhật trạng thái thành công",
      data,
    });
  } catch (err) {
    console.error("Error in updateStatusByStaff:", err);
    res.status(500).json({ message: err.message });
  }
};

// Nhân viên phân công kỹ thuật viên
const assignTechnician = async (req, res) => {
  try {
    const userRole = req.user?.role;
    if (userRole !== 'Nhân viên' && userRole !== 'Quản lý' && userRole !== 'Admin') {
      return res.status(403).json({ message: "Forbidden: Only staff can assign technician" });
    }

    const { technicianId, technicianName } = req.body;
    if (!technicianId || !technicianName) {
      return res.status(400).json({ message: "Technician ID and name are required" });
    }

    const data = await service.assignTechnician(req.params.id, technicianId, technicianName);

    res.json({
      success: true,
      message: "Phân công kỹ thuật viên thành công",
      data,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllMaintenanceRequests = async (req, res) => {
  try {
    const userRole = req.user?.role;
    const allowedRoles = ['Nhân viên', 'Quản lý', 'Admin', 'Chủ chung cư'];
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        message: "Forbidden: Only staff and management can view all requests" 
      });
    }

    const result = await service.getAllMaintenanceRequests(req.query, userRole);

    res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Nhân viên xem chi tiết bất kỳ yêu cầu nào (không cần quyền sở hữu)
// const getMaintenanceRequestByIdForStaff = async (req, res) => {
//   try {
//     const userRole = req.user?.role;
//     const allowedRoles = ['Nhân viên', 'Quản lý', 'Admin', 'Chủ chung cư'];
    
//     if (!allowedRoles.includes(userRole)) {
//       return res.status(403).json({ 
//         message: "Forbidden: Only staff and management can view request details" 
//       });
//     }

//     const data = await service.getMaintenanceRequestByIdForStaff(req.params.id, userRole);

//     res.json({
//       success: true,
//       data,
//     });
//   } catch (err) {
//     res.status(404).json({ message: err.message });
//   }
// };
// Nhân viên xem chi tiết bất kỳ yêu cầu nào (không cần quyền sở hữu)
const getMaintenanceRequestByIdForStaff = async (req, res) => {
  try {
    const userRole = req.user?.role;
    const allowedRoles = ['Nhân viên', 'Quản lý', 'Admin', 'Chủ chung cư'];
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        message: "Forbidden: Only staff and management can view request details" 
      });
    }

    const data = await service.getMaintenanceRequestByIdForStaff(req.params.id, userRole);

    res.json({
      success: true,
      message: "Lấy chi tiết yêu cầu thành công",
      data: data,
    });
  } catch (err) {
    console.error("Error in getMaintenanceRequestByIdForStaff:", err);
    res.status(404).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Lấy thống kê yêu cầu bảo trì
const getMaintenanceStatistics = async (req, res) => {
  try {
    const userRole = req.user?.role;
    const allowedRoles = ['Nhân viên', 'Quản lý', 'Admin', 'Chủ chung cư'];
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        message: "Forbidden: Only staff and management can view statistics" 
      });
    }

    const stats = await service.getMaintenanceStatistics(req.query, userRole);

    res.json({
      success: true,
      data: stats,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Thêm comment vào yêu cầu
const addComment = async (req, res) => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.sub;
    const userName = req.user?.name || req.user?.email || 'Staff';
    
    const allowedRoles = ['Nhân viên', 'Quản lý', 'Admin', 'Chủ chung cư'];
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        message: "Forbidden: Only staff can add comments" 
      });
    }

    const { comment } = req.body;
    if (!comment || comment.trim() === '') {
      return res.status(400).json({ message: "Comment is required" });
    }

    const data = await service.addComment(
      req.params.id, 
      parseInt(userId), 
      userName, 
      comment, 
      userRole
    );

    res.json({
      success: true,
      message: "Thêm comment thành công",
      data,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  // Cư dân
  createMaintenanceRequest,
  getMyMaintenanceRequests,
  getMaintenanceRequestById,
  updateMaintenanceRequest,
  deleteMaintenanceRequest,
  // Nhân viên
  updateStatusByStaff,
  assignTechnician,
  getAllMaintenanceRequests,
  getMaintenanceRequestByIdForStaff,
  getMaintenanceStatistics,
  addComment,
};