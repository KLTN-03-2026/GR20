const repo = require("./user.repository");
const mapper = require("./user.mapper");
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const getUserById = async (id) => {
  const data = await repo.getUserById(id);

  if (!data) {
    throw new Error("User not found");
  }

  return mapper.toResponse(data);
};

const createUser = async (reqBody) => {
  const entity = mapper.toEntity(reqBody);
  const result = await repo.createUser(entity);

  return { id: result.id };
};

const getAllUsers = async (query) => {
  // const { page = 0, size = 10 } = query;
  const page = parseInt(query.page) || 0
  const size = parseInt(query.size) || 10

  const result = await repo.getAllUsers({ page, size });

  return {
    data: result.rows.map(mapper.toListResponse),
    pagination:{
      page: page,
      pageSize: size,
      totalElements: result.total,
      totalPages: Math.ceil(result.total / size),
    }  
  };
};

const updateUser = async (id, reqBody) => {
  const entity = mapper.toUpdateEntity(reqBody);
  const updated = await repo.updateUser(id, entity);

  if (!updated) throw new Error("Update failed");

  return mapper.toResponse(updated);
};

const deleteUser = async (id) => {
  const deleted = await repo.deleteUser(id);

  if (!deleted) throw new Error("User not found");

  return { id: deleted.id };
};

const getMe = async (username) => {
  const data = await repo.getUserByUsername(username);
  
  if (!data) {
    throw new Error("User not found");
  }
  
  return mapper.toResponse(data);
};

const updateMe = async (username, reqBody) => {
  // Kiểm tra user tồn tại
  const existingUser = await repo.getUserByUsername(username);
  
  if (!existingUser) {
    throw new Error("User not found");
  }
  
  // Tạo entity update
  const entity = mapper.toUpdateEntity(reqBody);
  const updated = await repo.updateUserByUsername(username, entity);
  
  if (!updated) throw new Error("Update failed");
  
  return mapper.toResponse(updated);
};

const changePassword = async (username, oldPassword, newPassword) => {
  const user = await repo.getUserByUsername(username);
  
  if (!user) {
    throw new Error("User not found");
  }
  
  // ✅ So sánh trực tiếp (KHÔNG AN TOÀN)
  if (oldPassword !== user.password) {
    throw new Error("Mật khẩu hiện tại không đúng");
  }
  
  // ✅ Lưu mật khẩu mới dạng text thường
  const updated = await repo.updatePassword(username, newPassword);
  
  if (!updated) throw new Error("Change password failed");
  
  return { message: "Password changed successfully" };
};
const uploadAvatar = async (username, file) => {
  const user = await repo.getUserByUsername(username);
  
  if (!user) {
    throw new Error("User not found");
  }
  
  // Xóa avatar cũ nếu có
  const fs = require('fs');
  const path = require('path');
  
  if (user.avatar_url) {
    const oldAvatarPath = path.join(__dirname, '../../', user.avatar_url);
    if (fs.existsSync(oldAvatarPath)) {
      fs.unlinkSync(oldAvatarPath);
    }
  }
  
  // Tạo URL cho avatar mới
  const avatarUrl = `/uploads/avatars/${file.filename}`;
  
  // Cập nhật database
  const updated = await repo.updateAvatarUrl(username, avatarUrl);
  
  if (!updated) throw new Error("Upload avatar failed");
  
  return { avatarUrl };
};
module.exports = { getMe, getUserById,createUser,getAllUsers,updateUser,deleteUser,updateMe,changePassword,uploadAvatar };