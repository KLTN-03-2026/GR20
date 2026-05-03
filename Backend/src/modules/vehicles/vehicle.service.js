const repo = require("./vehicle.repository");
const mapper = require("./vehicle.mapper");
const requestParser = require("./vehicle.request");
const { AppError } = require("../../common/app-error");

const create = async (body) => {
  const parsed = requestParser.parseCreate(body);
  const entity = mapper.toEntity(parsed);
  const created = await repo.create(entity);
  return mapper.toResponse(created);
};

const getAll = async (query) => {
  const parsed = requestParser.parseList(query);
  const result = await repo.getAll(parsed);
  return {
    data: result.rows.map(mapper.toResponse),
    size: result.rows.length,
    totalElements: result.total,
    totalPages: Math.ceil(result.total / parsed.size),
    page: parsed.page,
    pageSize: parsed.size,
  };
};

const getById = async (id) => {
  const parsedId = requestParser.parsePathId(id);
  const found = await repo.getById(parsedId);
  if (!found) throw new AppError(404, "Vehicle not found");
  return mapper.toResponse(found);
};

const update = async (id, body) => {
  const parsedId = requestParser.parsePathId(id);
  const parsed = requestParser.parseUpdate(body);
  const entity = mapper.toEntity(parsed);
  const updated = await repo.update(parsedId, entity);
  if (!updated) throw new AppError(404, "Vehicle not found");
  return mapper.toResponse(updated);
};

const deleteById = async (id) => {
  const parsedId = requestParser.parsePathId(id);
  const deleted = await repo.softDelete(parsedId);
  if (!deleted) throw new AppError(404, "Vehicle not found");
  return { id: deleted.id };
};

module.exports = { create, getAll, getById, update, deleteById };
