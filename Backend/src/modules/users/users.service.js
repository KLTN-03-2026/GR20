const bcrypt = require("bcrypt");
const repo = require("./user.repository");
const mapper = require("./user.mapper");
const { AppError } = require("../../common/app-error");
const { parseCreateUser, parseUpdateUser } = require("./user.request");
const roleRepo = require("../roles/role.repository");

const DEFAULT_ROLE_NAME = "user";
const SALT_ROUNDS = 10;

const resolveRoleId = async (roleName) => {
  const targetRole = roleName || DEFAULT_ROLE_NAME;
  const role = await roleRepo.findRoleByName(targetRole);
  if (!role) {
    throw new AppError(400, `Role '${targetRole}' not found`);
  }
  return role.id;
};

const saveUser = async (reqBody) => {
  const parsed = parseCreateUser(reqBody);
  const roleId = await resolveRoleId(parsed.roleName);
  const hashedPassword = await bcrypt.hash(parsed.password, SALT_ROUNDS);
  const entity = mapper.toEntity({ ...parsed, password: hashedPassword }, roleId);
  const result = await repo.saveUser(entity);
  return { id: result.id };
};

const getAllUsers = async (query) => {
  const { page = 0, size = 10, role, search, isActive } = query;
  const result = await repo.getAllUsers({ page, size, role, search, isActive });
  return {
    data: result.rows.map(mapper.toResponse),
    size: result.rows.length,
    totalElements: result.total,
    totalPages: Math.ceil(result.total / size),
    page: Number(page),
    pageSize: Number(size),
  };
};

const findUserById = async (id) => {
  const data = await repo.findUserById(id);
  if (!data) {
    throw new AppError(404, "User not found");
  }
  return mapper.toResponse(data);
};

const updateUser = async (id, reqBody) => {
  const parsed = parseUpdateUser(reqBody);
  const patch = { ...parsed };

  if (patch.password) {
    patch.password = await bcrypt.hash(patch.password, SALT_ROUNDS);
  }

  let roleId;
  if (patch.roleName !== undefined) {
    roleId = await resolveRoleId(patch.roleName);
  }

  const entity = mapper.toEntity(patch, roleId);
  if (patch.isActive !== undefined) {
    entity.is_active = patch.isActive;
  }

  const updated = await repo.updateUser(id, entity);
  if (!updated) {
    throw new AppError(404, "User not found");
  }
  return findUserById(id);
};

const deleteOrRestoreUser = async (id, restore = false) => {
  const updated = await repo.setUserActiveState(id, restore);
  if (!updated) {
    throw new AppError(404, "User not found");
  }
  return { id: updated.id, isActive: updated.is_active };
};

module.exports = {
  saveUser,
  getAllUsers,
  findUserById,
  updateUser,
  deleteOrRestoreUser,
};
