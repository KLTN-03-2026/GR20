const repo = require("./building.repository");
const mapper = require("./building.mapper");
const { AppError } = require("../../common/app-error");
const ERROR_CODES = require("./building-errors");
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

const { buildingIdsFromUser } = require("../../common/building-scope");

// const getAllBuildings = async (query, user) => {
//   const parsed = parseBuildingPagination(query);
//   const {
//     page,
//     size,
//     search,
//     status,
//     includeApartments: includeApartmentsParam,
//   } = parsed;

//   const buildingIds = buildingIdsFromUser(user);

//   let includeApartments = includeApartmentsParam;
//   if (includeApartments === undefined) {
//     includeApartments = Boolean(
//       user &&
//         user.role !== "ADMIN" &&
//         buildingIds !== null &&
//         buildingIds.length > 0,
//     );
//   }

//   const result = await repo.getAllBuildings({
//     page,
//     size,
//     search,
//     status,
//     buildingIds,
//     includeApartments,
//   });

//   return {
//     data: result.rows.map(mapper.toResponse),
//     size: result.rows.length,
//     totalElements: result.total,
//     totalPages: Math.ceil(result.total / size) || 0,
//     page: Number(page),
//     pageSize: Number(size),
//   };
// };
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
    throw new AppError(404, "Building not found", undefined, ERROR_CODES.BUILDING_NOT_FOUND);
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
    throw new AppError(404, "Building not found", undefined, ERROR_CODES.BUILDING_NOT_FOUND);
  }

  return mapper.toResponse(updated);
};

// DELETE
const deleteBuilding = async (id) => {
  const parsedId = parsePathId(id);
  const counts = await repo.getBuildingResourceCounts(parsedId);
  if (counts.floorCount > 0 || counts.apartmentCount > 0) {
    throw new AppError(
      409,
      "Cannot close building while it still has floors or active apartments. Remove them first.",
      {
        floorCount: counts.floorCount,
        apartmentCount: counts.apartmentCount,
      },
      ERROR_CODES.BUILDING_HAS_LINKED_DATA
    );
  }

  const deleted = await repo.deleteBuilding(parsedId);

  if (!deleted) {
    throw new AppError(404, "Building not found", undefined, ERROR_CODES.BUILDING_NOT_FOUND);
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
