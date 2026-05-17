const repo = require("./amenity.repository");
const mapper = require("./amenity.mapper");
const { parseCreate, parseUpdate } = require("./amenity.request");

const createAmenity = async (buildingId, body) => {
  const parsed = parseCreate(body);
  const entity = mapper.toEntity({ ...parsed, buildingId });
  return await repo.createAmenity(entity);
};

const getAmenitiesByBuilding = async (buildingId, query) => {
  const { page = 0, size = 10, status } = query;
  const result = await repo.getAmenitiesByBuilding({ buildingId, page: Number(page), size: Number(size), status });
  return {
    data: result.rows.map(mapper.toResponse),
    size: result.rows.length,
    totalElements: result.total,
    totalPages: Math.ceil(result.total / size),
    page: Number(page),
    pageSize: Number(size),
  };
};

const getAmenityById = async (id) => {
  const data = await repo.getAmenityById(id);
  if (!data) throw new AppError(404, "Amenity not found");
  return mapper.toResponse(data);
};

const updateAmenity = async (id, body) => {
  const parsed = parseUpdate(body);
  const entity = mapper.toEntity(parsed);
  return await repo.updateAmenity(id, entity);
};

const deleteAmenity = async (id) => {
  return await repo.deleteAmenity(id);
};

module.exports = { createAmenity, getAmenitiesByBuilding, getAmenityById, updateAmenity, deleteAmenity };