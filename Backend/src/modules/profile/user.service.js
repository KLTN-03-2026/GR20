const repo = require("./user.repository");
const mapper = require("./user.mapper");
const bcrypt = require('bcrypt');
const { AppError } = require("../../common/app-error");
const roleRepo = require("../roles/role.repository");
const rolesService = require("../roles/roles.service");

const SALT_ROUNDS = 10;
const DEFAULT_ROLE_NAME = "Người Dùng";
const DEFAULT_ROLE_CANDIDATES = [
  "Người Dùng",
  "Người dùng",
  "user",
  "USER",
  "resident",
  "nguoi dung",
];

const resolveRoleId = async (roleName) => {
  const seen = new Set();
  const targetRoleNames = [];
  const add = (name) => {
    const key = String(name).trim().toLowerCase();
    if (!key || seen.has(key)) return;
    seen.add(key);
    targetRoleNames.push(String(name).trim());
  };

  if (roleName) add(roleName);
  DEFAULT_ROLE_CANDIDATES.forEach(add);

  const findRole = async () => {
    for (const candidate of targetRoleNames) {
      const found = await roleRepo.findRoleByName(candidate);
      if (found) return found.id;
    }
    return null;
  };

  let roleId = await findRole();
  if (roleId) return roleId;

  await rolesService.seedDefaultRoles();
  roleId = await findRole();
  if (roleId) return roleId;

  throw new AppError(
    400,
    roleName
      ? `Không tìm thấy vai trò "${roleName}"`
      : `Không tìm thấy vai trò mặc định (${DEFAULT_ROLE_NAME}). Vui lòng liên hệ quản trị viên.`,
  );
};

const getUserById = async (id) => {
  const data = await repo.getUserById(id);

  if (!data) {
    throw new AppError(404, "User not found");
  }

  return mapper.toResponse(data);
};

const createUser = async (reqBody) => {
  const payload = { ...reqBody };
  const roleId = payload.roleId || (await resolveRoleId(payload.roleName));

  if (!payload.password) {
    throw new AppError(400, "Password is required");
  }

  const hashedPassword = await bcrypt.hash(payload.password, SALT_ROUNDS);
  const entity = mapper.toEntity({
    ...payload,
    password: hashedPassword,
    roleId
  });
  const result = await repo.createUser(entity);

  return { id: result.id };
};

const getAllUsers = async (query) => {
  const page = parseInt(query.page) || 0
  const size = parseInt(query.size) || 10
  const role = query.role
  const search = query.search
  const isActive = query.isActive

  const result = await repo.getAllUsers({ page, size, role, search, isActive });

  return {
    data: result.rows.map(mapper.toListResponse),
    size: result.rows.length,
    page,
    pageSize: size,
    totalElements: result.total,
    totalPages: Math.ceil(result.total / size)
  };
};

const updateUser = async (id, reqBody) => {
  const payload = { ...reqBody };

  if (payload.roleName && !payload.roleId) {
    payload.roleId = await resolveRoleId(payload.roleName);
  }

  if (payload.password) {
    payload.password = await bcrypt.hash(payload.password, SALT_ROUNDS);
  }

  const entity = mapper.toUpdateEntity(payload);
  const updated = await repo.updateUser(id, entity);

  if (!updated) throw new AppError(404, "User not found");

  return getUserById(id);
};

const changeUserRole = async (id, roleName) => {
  const roleId = await resolveRoleId(roleName);
  const updated = await repo.updateUser(id, { role_id: roleId });

  if (!updated) {
    throw new AppError(404, "User not found");
  }

  return getUserById(id);
};

const deleteUser = async (id) => {
  const deleted = await repo.deleteUser(id);

  if (!deleted) throw new AppError(404, "User not found");

  return { id: deleted.id };
};

const getMe = async (username) => {
  const data = await repo.getUserByUsername(username);
  
  if (!data) {
    throw new AppError(404, "User not found");
  }
  
  return mapper.toResponse(data);
};

const updateMe = async (username, reqBody) => {
  // Kiểm tra user tồn tại
  const existingUser = await repo.getUserByUsername(username);
  
  if (!existingUser) {
    throw new AppError(404, "User not found");
  }
  
  // Tạo entity update
  const entity = mapper.toUpdateEntity(reqBody);
  const updated = await repo.updateUserByUsername(username, entity);
  
  if (!updated) throw new AppError(404, "User not found");
  
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
module.exports = { getMe, getUserById,createUser,getAllUsers,updateUser,changeUserRole,deleteUser,updateMe,changePassword,uploadAvatar };