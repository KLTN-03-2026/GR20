const repo = require("./utility-meter.repository");
const mapper = require("./utility-meter.mapper");
const { AppError } = require("../../common/app-error");
const ERROR_CODES = require("./utility-meter-errors");
const invoiceService = require("../invoices/invoice.service");
const {
  parseCreateUtilityMeter,
  parseUpdateUtilityMeter,
  parsePathId,
  parseUtilityMeterFilters,
  parseUtilityMeterUserQuery,
} = require("./utility-meter.request");

const createUtilityMeter = async (body) => {
  const entity = mapper.toEntity(parseCreateUtilityMeter(body));
  const status = entity.status ?? "ACTIVE";
  if (status === "ACTIVE") {
    const n = await repo.countActiveMetersByApartmentAndType({
      apartmentId: entity.apartment_id,
      meterType: entity.meter_type,
    });
    if (n > 0) {
      throw new AppError(
        409,
        "Căn hộ đã có đồng hồ loại này đang hoạt động. Xóa hoặc chuyển đồng hồ cũ sang trạng thái không hoạt động trước khi tạo mới.",
        { apartmentId: entity.apartment_id, meterType: entity.meter_type },
        ERROR_CODES.UTILITY_METER_DUPLICATE_ACTIVE_TYPE
      );
    }
  }
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
  const pid = parsePathId(id);
  const current = await repo.getUtilityMeterById(pid);
  if (!current) throw new AppError(404, "Utility meter not found", undefined, ERROR_CODES.UTILITY_METER_NOT_FOUND);

  const entity = mapper.toEntity(parseUpdateUtilityMeter(body));
  const nextApartment = entity.apartment_id !== undefined ? entity.apartment_id : current.apartment_id;
  const nextType = entity.meter_type !== undefined ? entity.meter_type : current.meter_type;
  const nextStatus = entity.status !== undefined ? entity.status : current.status;

  if (nextStatus === "ACTIVE") {
    const n = await repo.countActiveMetersByApartmentAndType({
      apartmentId: nextApartment,
      meterType: nextType,
      excludeMeterId: pid,
    });
    if (n > 0) {
      throw new AppError(
        409,
        "Căn hộ đã có đồng hồ loại này đang hoạt động. Xóa hoặc chuyển đồng hồ cũ sang trạng thái không hoạt động trước khi kích hoạt bản ghi này.",
        { apartmentId: nextApartment, meterType: nextType },
        ERROR_CODES.UTILITY_METER_DUPLICATE_ACTIVE_TYPE
      );
    }
  }

  const row = await repo.updateUtilityMeter(pid, entity);
  if (!row) throw new AppError(404, "Utility meter not found", undefined, ERROR_CODES.UTILITY_METER_NOT_FOUND);
  return mapper.toResponse(row);
};

const deleteUtilityMeter = async (id) => {
  const mid = parsePathId(id);
  const invoiceIds = await invoiceService.listUnpaidAutomatedInvoiceIdsByMeterId(mid);
  const row = await repo.deleteUtilityMeter(mid);
  if (!row) throw new AppError(404, "Utility meter not found", undefined, ERROR_CODES.UTILITY_METER_NOT_FOUND);
  await invoiceService.recalculateUnpaidAutomatedInvoiceByIds(invoiceIds);
  return { id: row.id };
};

const restoreUtilityMeter = async (id) => {
  const pid = parsePathId(id);
  const row = await repo.getUtilityMeterByIdAnyStatus(pid);
  if (!row || String(row.status) !== "INACTIVE") {
    throw new AppError(
      404,
      "Utility meter not found or not inactive",
      undefined,
      ERROR_CODES.UTILITY_METER_NOT_INACTIVE_FOR_RESTORE
    );
  }
  const n = await repo.countActiveMetersByApartmentAndType({
    apartmentId: row.apartment_id,
    meterType: row.meter_type,
    excludeMeterId: pid,
  });
  if (n > 0) {
    throw new AppError(
      409,
      "Căn hộ đã có đồng hồ điện/nước loại này đang hoạt động. Không thể khôi phục bản ghi này.",
      { apartmentId: row.apartment_id, meterType: row.meter_type },
      ERROR_CODES.UTILITY_METER_RESTORE_DUPLICATE_ACTIVE
    );
  }
  const restored = await repo.restoreUtilityMeter(pid);
  if (!restored) throw new AppError(404, "Utility meter not found or not inactive", undefined, ERROR_CODES.UTILITY_METER_NOT_INACTIVE_FOR_RESTORE);
  return { id: restored.id };
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
