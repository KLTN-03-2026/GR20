const repo = require("./building.repository");
const mapper = require("./building.mapper");
const { AppError } = require("../../common/app-error");
const {
  parseCreateBuilding,
  parseUpdateBuilding,
  parsePathId,
  parseBuildingPagination,
} = require("./building.request");

const createBuilding = async (reqBody) => {
  const parsed = parseCreateBuilding(reqBody);
  const entity = mapper.toEntity(parsed);
  const result = await repo.createBuilding(entity);

  return {
    id: result.id,
  };
};

const getAllBuildings = async (query) => {
  const { page, size, search, status } = parseBuildingPagination(query);

  const result = await repo.getAllBuildings({ page, size, search, status });

  return {
    data: result.rows.map(mapper.toResponse),
    size: result.rows.length,
    totalElements: result.total,
    totalPages: Math.ceil(result.total / size),
    page: Number(page),
    pageSize: Number(size),
  };
};

const getBuildingById = async (id) => {
  const parsedId = parsePathId(id);
  const data = await repo.getBuildingById(parsedId);

  if (!data) {
    throw new AppError(404, "Building not found");
  }

  return mapper.toResponse(data);
};

// UPDATE
const updateBuilding = async (id, reqBody) => {
  const parsedId = parsePathId(id);
  const parsed = parseUpdateBuilding(reqBody);
  const entity = mapper.toEntity(parsed);

  const updated = await repo.updateBuilding(parsedId, entity);

  if (!updated) {
    throw new AppError(404, "Building not found");
  }

  return mapper.toResponse(updated);
};

// DELETE
const deleteBuilding = async (id) => {
  const parsedId = parsePathId(id);
  const deleted = await repo.deleteBuilding(parsedId);

  if (!deleted) {
    throw new AppError(404, "Building not found");
  }

  return { id: deleted.id };
};

module.exports = {
  createBuilding,
  getAllBuildings,
  getBuildingById,
  updateBuilding,
  deleteBuilding,
};
