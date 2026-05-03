const repo = require("./building-assignment.repository");
const mapper = require("./building-assignment.mapper");
const { AppError } = require("../../common/app-error");
const {
  parseCreateBuildingAssignment,
  parseUpdateBuildingAssignment,
  parsePathId,
  parseListQuery,
} = require("./building-assignment.request");

const saveBuildingAssignment = async (reqBody) => {
  const parsed = parseCreateBuildingAssignment(reqBody);
  const entity = mapper.toEntity(parsed);
  const result = await repo.saveBuildingAssignment(entity);
  return { id: result.id };
};

const getAllBuildingAssignments = async (query) => {
  const parsed = parseListQuery(query);
  const result = await repo.getAllBuildingAssignments(parsed);
  return {
    data: result.rows.map(mapper.toResponse),
    size: result.rows.length,
    totalElements: result.total,
    totalPages: Math.ceil(result.total / parsed.size),
    page: Number(parsed.page),
    pageSize: Number(parsed.size),
  };
};

const findBuildingAssignmentById = async (id) => {
  const parsedId = parsePathId(id);
  const data = await repo.findBuildingAssignmentById(parsedId);
  if (!data) {
    throw new AppError(404, "Building assignment not found");
  }
  return mapper.toResponse(data);
};

const updateBuildingAssignment = async (id, reqBody) => {
  const parsedId = parsePathId(id);
  const parsed = parseUpdateBuildingAssignment(reqBody);
  const entity = mapper.toEntity(parsed);
  if (parsed.isActive !== undefined) {
    entity.is_active = parsed.isActive;
  }
  const updated = await repo.updateBuildingAssignment(parsedId, entity);
  if (!updated) {
    throw new AppError(404, "Building assignment not found");
  }
  return findBuildingAssignmentById(parsedId);
};

const softDeleteBuildingAssignment = async (id) => {
  const parsedId = parsePathId(id);
  const deleted = await repo.softDeleteBuildingAssignment(parsedId);
  if (!deleted) {
    throw new AppError(404, "Building assignment not found");
  }
  return { id: deleted.id };
};

module.exports = {
  saveBuildingAssignment,
  getAllBuildingAssignments,
  findBuildingAssignmentById,
  updateBuildingAssignment,
  softDeleteBuildingAssignment,
};
