const service = require("./user.service");
const { AppError } = require("../../common/app-error");

const sendError = (res, err, fallbackStatus = 500) => {
  if (err instanceof AppError) {
    const body = { message: err.message };
    if (err.details !== undefined) {
      body.details = err.details;
    }
    return res.status(err.statusCode).json(body);
  }
  return res.status(fallbackStatus).json({ message: err.message });
};

const getUserById = async (req, res) => {
  try {
    const data = await service.getUserById(req.params.id);

    res.json({
      operationType: "Success",
      message: "Get user detail successfully",
      code: "OK",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err, 404);
  }
};

const createUser = async (req, res) => {
  try {
    const data = await service.createUser(req.body);

    res.status(201).json({
      operationType: "Success",
      message: "Create user successfully",
      code: "CREATED",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

const getAllUsers = async (req, res) => {
  try {
    const result = await service.getAllUsers(req.query);

    res.json({
      operationType: "Success",
      message: "Get user list successfully",
      code: "OK",
      ...result,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

const updateUser = async (req, res) => {
  try {
    const data = await service.updateUser(req.params.id, req.body);

    res.json({
      operationType: "Success",
      message: "Update user successfully",
      code: "OK",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

const changeUserRole = async (req, res) => {
  try {
    const data = await service.changeUserRole(req.params.id, req.body.roleName);

    res.json({
      operationType: "Success",
      message: "Change user role successfully",
      code: "OK",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

const deleteUser = async (req, res) => {
  try {
    const data = await service.deleteUser(req.params.id);

    res.json({
      operationType: "Success",
      message: "Delete user successfully",
      code: "OK",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err, 404);
  }
};

const getMe = async (req, res) => {
  try {
    // Lấy username từ token đã được middleware giải mã
    const username = req.user.username;
    const data = await service.getMe(username);
    
    res.json({
      operationType: "Success",
      message: "Get current user successfully",
      code: "OK",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err, 404);
  }
};

const updateMe = async (req, res) => {
  try {
    // Lấy username từ token
    const username = req.user.username;
    const data = await service.updateMe(username, req.body);
    
    res.json({
      operationType: "Success",
      message: "Update profile successfully",
      code: "OK",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err, 400);
  }
};

// const changePassword = async (req, res) => {
//   try {
//     const username = req.user.username;
//     const { currentPassword, newPassword } = req.body;
    
//     // Validate
//     if (!currentPassword || !newPassword) {
//       return res.status(400).json({
//         message: "Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới"
//       });
//     }
    
//     if (newPassword.length < 8) {
//       return res.status(400).json({
//         message: "Mật khẩu mới phải có ít nhất 8 ký tự"
//       });
//     }
    
//     const result = await service.changePassword(username, currentPassword, newPassword);
    
//     res.json({
//       operationType: "Success",
//       message: "Đổi mật khẩu thành công",
//       code: "OK",
//       data: result,
//       timestamp: new Date(),
//     });
//   } catch (err) {
//     res.status(400).json({
//       message: err.message,
//     });
//   }
// };

// user.controller.js
const changePassword = async (req, res) => {
  try {
    const username = req.user.username;
    const { currentPassword, newPassword } = req.body;
    
    // Validate
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới"
      });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "Mật khẩu mới phải có ít nhất 8 ký tự"
      });
    }
    
    const result = await service.changePassword(username, currentPassword, newPassword);
    
    res.json({
      operationType: "Success",
      message: "Đổi mật khẩu thành công",
      code: "OK",
      data: result,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err, 400);
  }
};

const uploadAvatar = async (req, res) => {
  try {
    const username = req.user.username;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({
        message: "Vui lòng chọn file ảnh"
      });
    }
    
    const result = await service.uploadAvatar(username, file);
    
    res.json({
      operationType: "Success",
      message: "Upload avatar thành công",
      code: "OK",
      data: result,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err, 400);
  }
};

module.exports = { getMe,getUserById,createUser,getAllUsers,updateUser,changeUserRole,deleteUser,updateMe,changePassword,uploadAvatar };