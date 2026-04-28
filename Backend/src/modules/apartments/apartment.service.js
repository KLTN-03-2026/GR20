const repo = require("./apartment.repository");
const mapper = require("./apartment.mapper");
const { AppError } = require("../../common/app-error");
const {
  parseCreateApartment,
  parseUpdateApartment,
  parseApartmentListQuery,
} = require("./apartment.request");

// CREATE
const createApartment = async (reqBody) => {
  const parsed = parseCreateApartment(reqBody);
  const isValidFloor = await repo.floorBelongsToBuilding({
    floorId: parsed.floorId,
    buildingId: parsed.buildingId,
  });
  if (!isValidFloor) {
    throw new AppError(400, "Selected floor does not belong to building");
  }
  const entity = mapper.toEntity(parsed);
  const result = await repo.createApartment(entity);

  return {
    id: result.id,
  };
};

// GET ALL
const getAllApartments = async (query) => {
  const {
    page = 0,
    size = 10,
    search,
    buildingId,
    floorId,
    status,
  } = parseApartmentListQuery(query);

  const result = await repo.getAllApartments({
    page,
    size,
    search,
    buildingId,
    floorId,
    status,
  });

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
  const { page = 0, size = 10, search, status } = parseApartmentListQuery(query);
  const result = await repo.getApartmentsByBuilding({
    buildingId,
    page,
    size,
    search,
    status,
  });

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
  const { page = 0, size = 10, search, status } = parseApartmentListQuery(query);
  const result = await repo.getApartmentsByFloor({
    floorId,
    page,
    size,
    search,
    status,
  });

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
  const current = await repo.getApartmentById(id);
  if (!current) {
    throw new AppError(404, "Apartment not found");
  }

  const nextBuildingId = parsed.buildingId ?? current.building_id;
  const nextFloorId = parsed.floorId ?? current.floor_id;
  const isValidFloor = await repo.floorBelongsToBuilding({
    floorId: nextFloorId,
    buildingId: nextBuildingId,
  });
  if (!isValidFloor) {
    throw new AppError(400, "Selected floor does not belong to building");
  }

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