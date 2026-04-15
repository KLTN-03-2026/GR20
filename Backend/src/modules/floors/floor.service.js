const repo = require("./floor.repository");
const mapper = require("./floor.mapper");
const { AppError } = require("../../common/app-error");
const {
  parseCreateFloor,
  parseUpdateFloor,
} = require("./floor.request");


// ================= CREATE =================
const createFloor = async (reqBody) => {
  const parsed = parseCreateFloor(reqBody);
  const entity = mapper.toEntity(parsed);

  const result = await repo.createFloor(entity);

  return {
    id: result.id,
  };
};


// ================= GET ALL =================
const getAllFloors = async (query) => {
  const { page = 0, size = 10 } = query;

  const result = await repo.getAllFloors({ page, size });

  return {
    data: result.rows.map(mapper.toResponse),
    size: result.rows.length,
    totalElements: result.total,
    totalPages: Math.ceil(result.total / size),
    page: Number(page),
    pageSize: Number(size),
  };
};


// ================= GET BY ID =================
const getFloorById = async (id) => {
  const data = await repo.getFloorById(id);

  if (!data) {
    throw new AppError(404, "Floor not found");
  }

  return mapper.toResponse(data);
};


// ================= UPDATE =================
const updateFloor = async (id, reqBody) => {
  const parsed = parseUpdateFloor(reqBody);
  const entity = mapper.toEntity(parsed);

  const updated = await repo.updateFloor(id, entity);

  if (!updated) {
    throw new AppError(404, "Floor not found");
  }

  return mapper.toResponse(updated);
};


// ================= DELETE (SOFT) =================
const deleteFloor = async (id) => {
  const deleted = await repo.deleteFloor(id);

  if (!deleted) {
    throw new AppError(404, "Floor not found");
  }

  return {
    id: deleted.id,
  };
};


module.exports = {
  createFloor,
  getAllFloors,
  getFloorById,
  updateFloor,
  deleteFloor,
};