const repo = require("./role.repository");
const mapper = require("./role.mapper");
const { AppError } = require("../../common/app-error");
const { parseCreateRole, parseUpdateRole } = require("./role.request");

const saveRole = async (reqBody) => {
  const parsed = parseCreateRole(reqBody);
  const entity = mapper.toEntity(parsed);
  const result = await repo.saveRole(entity);
  return { id: result.id };
};

const getAllRoles = async (query) => {
  const { page = 0, size = 10, search } = query;
  const result = await repo.getAllRoles({ page, size, search });

  return {
    data: result.rows.map(mapper.toResponse),
    size: result.rows.length,
    totalElements: result.total,
    totalPages: Math.ceil(result.total / size),
    page: Number(page),
    pageSize: Number(size),
  };
};

const seedDefaultRoles = async () => {
  const defaults = [
    { name: "admin", description: "Quản trị hệ thống" },
    { name: "manager", description: "Quản lí" },
    { name: "employee", description: "Nhân viên" },
    { name: "security", description: "Bảo vệ" },
    { name: "user", description: "Người dùng" },
  ];

  const created = [];
  const existing = [];

  for (const role of defaults) {
    const found = await repo.findRoleByName(role.name);
    if (found) {
      existing.push(found.id);
      continue;
    }
    const result = await repo.saveRole(role);
    created.push(result.id);
  }

  return {
    created,
    existing,
  };
};

const findRoleById = async (id) => {
  const data = await repo.findRoleById(id);
  if (!data) {
    throw new AppError(404, "Role not found");
  }
  return mapper.toResponse(data);
};

const updateRole = async (id, reqBody) => {
  const parsed = parseUpdateRole(reqBody);
  const entity = mapper.toEntity(parsed);
  const updated = await repo.updateRole(id, entity);
  if (!updated) {
    throw new AppError(404, "Role not found");
  }
  return mapper.toResponse(updated);
};

const deleteRole = async (id) => {
  const deleted = await repo.deleteRole(id);
  if (!deleted) {
    throw new AppError(404, "Role not found");
  }
  return { id: deleted.id };
};

module.exports = {
  saveRole,
  getAllRoles,
  seedDefaultRoles,
  findRoleById,
  updateRole,
  deleteRole,
};
