const { AppError } = require("../../common/app-error");
const ERROR_CODES = require("./meter-reading-errors");
const mapper = require("./meter-reading.mapper");
const repo = require("./meter-reading.repository");
const invoiceService = require("../invoices/invoice.service");
const {
  parsePathId,
  parseCreateMeterReading,
  parseUpdateMeterReading,
  parseMeterReadingListQuery,
  parseMeterReadingUserQuery,
  parseSuggestPreviousQuery,
} = require("./meter-reading.request");

const withConsumption = (payload) => ({
  ...payload,
  consumption: Number(payload.currentReading) - Number(payload.previousReading),
});

const createMeterReading = async (body) => {
  const parsed = withConsumption(parseCreateMeterReading(body));
  if (parsed.consumption <= 0)
    throw new AppError(400, "currentReading must be greater than previousReading", undefined, ERROR_CODES.METER_READING_BELOW_PREVIOUS);
  const duplicate = await repo.hasMeterReadingInBillingMonth(parsed.meterId, parsed.readingDate);
  if (duplicate) {
    throw new AppError(
      400,
      "Đồng hồ này đã có chỉ số trong tháng kỳ tương ứng. Không thể ghi thêm cho cùng tháng.",
      undefined,
      ERROR_CODES.METER_READING_DUPLICATE_PERIOD
    );
  }
  const result = await repo.createMeterReading(mapper.toEntity(parsed));
  try {
    await invoiceService.syncInvoiceAfterMeterReadingCreated(parsed.meterId, parsed.readingDate);
  } catch (err) {
    console.error("[meter-reading] invoice sync after create", { err: err?.message });
  }
  return { id: result.id };
};

const getAllMeterReadings = async (query) => {
  const parsedQuery = parseMeterReadingListQuery(query);
  const result = await repo.getAllMeterReadings(parsedQuery);
  return {
    data: result.rows.map(mapper.toResponse),
    size: result.rows.length,
    totalElements: result.total,
    totalPages: Math.ceil(result.total / parsedQuery.size),
    page: parsedQuery.page,
    pageSize: parsedQuery.size,
  };
};

const getMeterReadingById = async (id) => {
  const row = await repo.getMeterReadingById(parsePathId(id));
  if (!row) throw new AppError(404, "Meter reading not found", undefined, ERROR_CODES.METER_READING_NOT_FOUND);
  return mapper.toResponse(row);
};

const getMeterReadingsByUserId = async (userId, query) => {
  const parsedUserId = parsePathId(userId);
  const parsedQuery = parseMeterReadingUserQuery(query);
  const result = await repo.getMeterReadingsByUserId({ userId: parsedUserId, ...parsedQuery });
  return {
    data: result.rows.map(mapper.toResponse),
    size: result.rows.length,
    totalElements: result.total,
    totalPages: Math.ceil(result.total / parsedQuery.size),
    page: parsedQuery.page,
    pageSize: parsedQuery.size,
  };
};
const getMeterReadingsByUserAndMeterId = async (userId, meterId, query) => {
  const parsedUserId = parsePathId(userId);
  const parsedMeterId = parsePathId(meterId);
  const parsedQuery = parseMeterReadingUserQuery(query);
  const result = await repo.getMeterReadingsByUserAndMeterId({
    userId: parsedUserId,
    meterId: parsedMeterId,
    ...parsedQuery,
  });
  return {
    data: result.rows.map(mapper.toResponse),
    size: result.rows.length,
    totalElements: result.total,
    totalPages: Math.ceil(result.total / parsedQuery.size),
    page: parsedQuery.page,
    pageSize: parsedQuery.size,
  };
};

const updateMeterReading = async (id, body) => {
  const parsedId = parsePathId(id);
  const current = await repo.getMeterReadingById(parsedId);
  if (!current) throw new AppError(404, "Meter reading not found", undefined, ERROR_CODES.METER_READING_NOT_FOUND);

  const parsed = parseUpdateMeterReading(body);
  const patch = { ...parsed };

  const previous = patch.previousReading !== undefined ? Number(patch.previousReading) : Number(current.previous_reading);
  const nextCurrent = patch.currentReading !== undefined ? Number(patch.currentReading) : Number(current.current_reading);

  if (nextCurrent < previous) {
    throw new AppError(400, "currentReading must be greater than or equal to previousReading", undefined, ERROR_CODES.METER_READING_BELOW_PREVIOUS);
  }

  patch.consumption = nextCurrent - previous;

  const row = await repo.updateMeterReading(parsedId, mapper.toEntity(patch));
  if (!row) throw new AppError(404, "Meter reading not found", undefined, ERROR_CODES.METER_READING_NOT_FOUND);
  try {
    const rd = row.reading_date != null ? String(row.reading_date).slice(0, 10) : String(current.reading_date).slice(0, 10);
    await invoiceService.syncInvoiceAfterMeterReadingCreated(row.meter_id ?? current.meter_id, rd);
  } catch (err) {
    console.error("[meter-reading] invoice sync after update", { err: err?.message });
  }
  return mapper.toResponse(row);
};

const deleteMeterReading = async (id) => {
  const row = await repo.deleteMeterReading(parsePathId(id));
  if (!row) throw new AppError(404, "Meter reading not found", undefined, ERROR_CODES.METER_READING_NOT_FOUND);
  return { id: row.id };
};

const restoreMeterReading = async (id) => {
  const row = await repo.restoreMeterReading(parsePathId(id));
  if (!row)
    throw new AppError(
      404,
      "Meter reading not found or not deleted",
      undefined,
      ERROR_CODES.METER_READING_NOT_DELETED_FOR_RESTORE
    );
  return { id: row.id };
};

const getSuggestedPreviousReading = async (query) => {
  const { meterId, readingDate } = parseSuggestPreviousQuery(query);
  const v = await repo.getSuggestedPreviousReading(meterId, readingDate);
  return { previousReading: v };
};

module.exports = {
  createMeterReading,
  getAllMeterReadings,
  getMeterReadingById,
  getMeterReadingsByUserId,
  getMeterReadingsByUserAndMeterId,
  getSuggestedPreviousReading,
  updateMeterReading,
  deleteMeterReading,
  restoreMeterReading,
};
