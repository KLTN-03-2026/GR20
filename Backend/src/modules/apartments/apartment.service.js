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

const toPagedListResponse = (result, pageRaw, sizeRaw) => {
  const page = Math.max(0, Number(pageRaw) || 0);
  const size = Math.max(1, Number(sizeRaw) || 10);
  return {
    data: result.rows.map(mapper.toResponse),
    size: result.rows.length,
    totalElements: result.total,
    totalPages: Math.max(1, Math.ceil(result.total / size)),
    page,
    pageSize: size,
  };
};

// GET ALL (hỗ trợ ?buildingId=&floorId=&search=&page=&size=)
const getAllApartments = async (query) => {
  const { page = 0, size = 10, buildingId, floorId, search } = query;
  const result = await repo.findApartmentsWithDetails({
    page,
    size,
    buildingId,
    floorId,
    search,
  });
  return toPagedListResponse(result, page, size);
};

const getApartmentsByBuilding = async (buildingId, query) => {
  const { page = 0, size = 10, search } = query;
  const result = await repo.findApartmentsWithDetails({
    buildingId,
    page,
    size,
    search,
  });
  return toPagedListResponse(result, page, size);
};

const getApartmentsByFloor = async (floorId, query) => {
  const { page = 0, size = 10, search } = query;
  const result = await repo.findApartmentsWithDetails({
    floorId,
    page,
    size,
    search,
  });
  return toPagedListResponse(result, page, size);
};

// GET BY ID
const getApartmentById = async (id) => {
  if (id === undefined || id === null || String(id).trim() === "") {
    throw new AppError(400, "Invalid apartment id");
  }
  const idStr = String(id).trim();
  if (!/^\d+$/.test(idStr)) {
    throw new AppError(404, "Apartment not found");
  }

  const data = await repo.getApartmentById(idStr);

  if (!data) {
    throw new AppError(404, "Apartment not found");
  }

  return mapper.toDetailResponse(data);
};

const getAvailableApartments = async () => {
  const rows = await repo.getAvailableApartments();
  return rows.map(mapper.toResponse);
};

const getDashboardStats = async () => repo.getDashboardStats();

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
  getAvailableApartments,
  getDashboardStats,
  updateApartment,
  deleteApartment,
};