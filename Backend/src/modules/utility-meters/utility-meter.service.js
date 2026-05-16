const repo = require("./utility-meter.repository");
const mapper = require("./utility-meter.mapper");
const { AppError } = require("../../common/app-error");
const ERROR_CODES = require("./utility-meter-errors");
const {
  parseCreateUtilityMeter,
  parseUpdateUtilityMeter,
  parsePathId,
  parseUtilityMeterFilters,
  parseUtilityMeterUserQuery,
} = require("./utility-meter.request");

const createUtilityMeter = async (body) => {
  const entity = mapper.toEntity(parseCreateUtilityMeter(body));
  const result = await repo.createUtilityMeter(entity);
  return { id: result.id };
};

const getAllUtilityMeters = async (query) => {
  const filters = parseUtilityMeterFilters(query);
  const result = await repo.getAllUtilityMeters(filters);
  return {
    data: result.rows.map(mapper.toResponse),
    size: result.rows.length,
    totalElements: result.total,
    totalPages: Math.ceil(result.total / filters.size),
    page: filters.page,
    pageSize: filters.size,
  };
};

const getUtilityMeterById = async (id) => {
  const row = await repo.getUtilityMeterById(parsePathId(id));
  if (!row) throw new AppError(404, "Utility meter not found", undefined, ERROR_CODES.UTILITY_METER_NOT_FOUND);
  return mapper.toResponse(row);
};

const getUtilityMetersByUserId = async (userId, query) => {
  const parsedUserId = parsePathId(userId);
  const parsedQuery = parseUtilityMeterUserQuery(query);
  const result = await repo.getUtilityMetersByUserId({ userId: parsedUserId, ...parsedQuery });
  return {
    data: result.rows.map(mapper.toResponse),
    size: result.rows.length,
    totalElements: result.total,
    totalPages: Math.ceil(result.total / parsedQuery.size),
    page: parsedQuery.page,
    pageSize: parsedQuery.size,
  };
};
const getUtilityMeterByUserAndId = async (userId, meterId) => {
  const parsedUserId = parsePathId(userId);
  const parsedMeterId = parsePathId(meterId);
  const row = await repo.getUtilityMeterByUserAndId({ userId: parsedUserId, meterId: parsedMeterId });
  if (!row) throw new AppError(404, "Utility meter not found", undefined, ERROR_CODES.UTILITY_METER_NOT_FOUND);
  return mapper.toResponse(row);
};

const updateUtilityMeter = async (id, body) => {
  const row = await repo.updateUtilityMeter(parsePathId(id), mapper.toEntity(parseUpdateUtilityMeter(body)));
  if (!row) throw new AppError(404, "Utility meter not found", undefined, ERROR_CODES.UTILITY_METER_NOT_FOUND);
  return mapper.toResponse(row);
};

const deleteUtilityMeter = async (id) => {
  const row = await repo.deleteUtilityMeter(parsePathId(id));
  if (!row) throw new AppError(404, "Utility meter not found", undefined, ERROR_CODES.UTILITY_METER_NOT_FOUND);
  return { id: row.id };
};

const restoreUtilityMeter = async (id) => {
  const row = await repo.restoreUtilityMeter(parsePathId(id));
  if (!row)
    throw new AppError(
      404,
      "Utility meter not found or not inactive",
      undefined,
      ERROR_CODES.UTILITY_METER_NOT_INACTIVE_FOR_RESTORE
    );
  return { id: row.id };
};

module.exports = {
  createUtilityMeter,
  getAllUtilityMeters,
  getUtilityMeterById,
  getUtilityMetersByUserId,
  getUtilityMeterByUserAndId,
  updateUtilityMeter,
  deleteUtilityMeter,
  restoreUtilityMeter,
};
