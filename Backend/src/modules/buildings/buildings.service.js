const repo = require("./building.repository");
const mapper = require("./building.mapper");

const createBuilding = async (reqBody) => {
  const entity = mapper.toEntity(reqBody);
  const result = await repo.createBuilding(entity);

  return {
    id: result.id,
  };
};

const getAllBuildings = async (query) => {
  const { page = 0, size = 10 } = query;

  const result = await repo.getAllBuildings({ page, size });

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
  const data = await repo.getBuildingById(id);

  if (!data) {
    throw new Error("Building not found");
  }

  return mapper.toResponse(data);
};

// UPDATE
const updateBuilding = async (id, reqBody) => {
  const entity = mapper.toEntity(reqBody);

  const updated = await repo.updateBuilding(id, entity);

  if (!updated) {
    throw new Error("Update failed");
  }

  return mapper.toResponse(updated);
};

// DELETE
const deleteBuilding = async (id) => {
  const deleted = await repo.deleteBuilding(id);

  if (!deleted) {
    throw new Error("Delete failed");
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
