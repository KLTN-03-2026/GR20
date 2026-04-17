const repo = require("./apartment.repository");
const mapper = require("./apartment.mapper");
const { AppError } = require("../../common/app-error");
const {
  parseCreateApartment,
  parseUpdateApartment,
} = require("./apartment.request");

// CREATE
const createApartment = async (reqBody) => {
  const parsed = parseCreateApartment(reqBody);
  const entity = mapper.toEntity(parsed);
  const result = await repo.createApartment(entity);

  return {
    id: result.id,
  };
};

// GET ALL
const getAllApartments = async (query) => {
  const { page = 0, size = 10 } = query;

  const result = await repo.getAllApartments({ page, size });

  return {
    data: result.rows.map(mapper.toResponse),
    size: result.rows.length,
    totalElements: result.total,
    totalPages: Math.ceil(result.total / size),
    page: Number(page),
    pageSize: Number(size),
  };
};

const getApartmentsByBuilding = async (buildingId, query) => {
  const { page = 0, size = 10 } = query;
  const result = await repo.getApartmentsByBuilding({ buildingId, page, size });

  return {
    data: result.rows.map(mapper.toResponse),
    size: result.rows.length,
    totalElements: result.total,
    totalPages: Math.ceil(result.total / size),
    page: Number(page),
    pageSize: Number(size),
  };
};

const getApartmentsByFloor = async (floorId, query) => {
  const { page = 0, size = 10 } = query;
  const result = await repo.getApartmentsByFloor({ floorId, page, size });

  return {
    data: result.rows.map(mapper.toResponse),
    size: result.rows.length,
    totalElements: result.total,
    totalPages: Math.ceil(result.total / size),
    page: Number(page),
    pageSize: Number(size),
  };
};

// GET BY ID
const getApartmentById = async (id) => {
  const data = await repo.getApartmentById(id);

  if (!data) {
    throw new AppError(404, "Apartment not found");
  }

  return mapper.toResponse(data);
};

// UPDATE
const updateApartment = async (id, reqBody) => {
  const parsed = parseUpdateApartment(reqBody);
  const entity = mapper.toEntity(parsed);

  const updated = await repo.updateApartment(id, entity);

  if (!updated) {
    throw new AppError(404, "Apartment not found");
  }

  return mapper.toResponse(updated);
};

// DELETE
const deleteApartment = async (id) => {
  const deleted = await repo.deleteApartment(id);

  if (!deleted) {
    throw new AppError(404, "Apartment not found");
  }

  return { id: deleted.id };
};

module.exports = {
  createApartment,
  getAllApartments,
  getApartmentsByBuilding,
  getApartmentsByFloor,
  getApartmentById,
  updateApartment,
  deleteApartment,
};