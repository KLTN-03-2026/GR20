const repo = require("./maintenance-assignment.repository");
const mapper = require("./maintenance-assignment.mapper");
const { AppError } = require("../../common/app-error");
const { parseCreate, parseList, parsePathId } = require("./maintenance-assignment.request");

const create = async (body) => {
  const parsed = parseCreate(body);
  const entity = mapper.toEntity(parsed);
  const created = await repo.create(entity);
  return mapper.toResponse(created);
};

const getAll = async (query) => {
  const { page, size, requestId, technicalId } = parseList(query);
  const result = await repo.getAll({ page, size, requestId, technicalId });
  return {
    data: result.rows.map(mapper.toResponse),
    size: result.rows.length,
    totalElements: result.total,
    totalPages: Math.ceil(result.total / Number(size || 10)),
    page: Number(page),
    pageSize: Number(size),
  };
};

const getById = async (id) => {
  const parsedId = parsePathId(id);
  const row = await repo.getById(parsedId);
  if (!row) throw new AppError(404, "Maintenance assignment not found");
  return mapper.toResponse(row);
};

const deleteById = async (id) => {
  const parsedId = parsePathId(id);
  const deleted = await repo.deleteById(parsedId);
  if (!deleted) throw new AppError(404, "Maintenance assignment not found");
  return { id: deleted.id };
};

module.exports = { create, getAll, getById, deleteById };

