const repo = require("./apartment.repository");
const mapper = require("./apartment.mapper");
const { AppError } = require("../../common/app-error");
const {
  parseCreateApartment,
  parseUpdateApartment,
} = require("./apartment.request");
const {
  getScopedBuildingIdsForList,
} = require("../../utils/access/scoped-building-access");

// CREATE
const createApartment = async (reqBody) => {
  const parsed = parseCreateApartment(reqBody);
  const entity = mapper.toEntity(parsed);
  const result = await repo.createApartment(entity);

  return {
    id: result.id,
  };
};

/** currentUser = req.user sau router.use(authenticate) */
const getAllApartments = async (query, currentUser) => {
  const { page = 0, size = 10, floorId, search } = query;
  const sizeNum = Number(size);
  const pageNum = Number(page);

  const scope = getScopedBuildingIdsForList(currentUser, query);

  if (scope.deny) {
    return {
      data: [],
      size: 0,
      totalElements: 0,
      totalPages: 0,
      page: pageNum,
      pageSize: sizeNum,
    };
  }

  const { buildingIds } = scope;

  if (Array.isArray(buildingIds) && buildingIds.length === 0) {
    return {
      data: [],
      size: 0,
      totalElements: 0,
      totalPages: 0,
      page: pageNum,
      pageSize: sizeNum,
    };
  }

  const result = await repo.getAllApartments({
    page: pageNum,
    size: sizeNum,
    floorId: floorId || undefined,
    search: search || undefined,
    buildingIds,
  });

  return {
    data: result.rows.map(mapper.toResponse),
    size: result.rows.length,
    totalElements: result.total,
    totalPages: Math.ceil(result.total / sizeNum) || 0,
    page: pageNum,
    pageSize: sizeNum,
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

const getApartmentById = async (id) => {
  const data = await repo.getApartmentById(id);

  if (!data) {
    throw new AppError(404, "Apartment not found");
  }

  return mapper.toResponse(data);
};

const updateApartment = async (id, reqBody) => {
  const parsed = parseUpdateApartment(reqBody);
  const entity = mapper.toEntity(parsed);

  const updated = await repo.updateApartment(id, entity);

  if (!updated) {
    throw new AppError(404, "Apartment not found");
  }

  return mapper.toResponse(updated);
};

const deleteApartment = async (id) => {
  const deleted = await repo.deleteApartment(id);

  if (!deleted) {
    throw new AppError(404, "Apartment not found");
  }

  return { id: deleted.id };
};

const addResident = async (apartmentId, body) => {
  return await repo.addResident(apartmentId, body);
};

module.exports = {
  createApartment,
  getAllApartments,
  getApartmentsByBuilding,
  getApartmentsByFloor,
  getApartmentById,
  updateApartment,
  deleteApartment,
  addResident,
};
