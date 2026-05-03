const { AppError } = require("../../common/app-error");
const mapper = require("./utility-pricing.mapper");
const repo = require("./utility-pricing.repository");
const {
  parsePathId,
  parseCreateUtilityPricing,
  parseUpdateUtilityPricing,
  parseUtilityPricingListQuery,
  parseMeterTypePath,
  validateUnitByMeterType,
} = require("./utility-pricing.request");

const createUtilityPricing = async (body) => {
  const parsed = parseCreateUtilityPricing(body);
  const entity = mapper.toEntity(parsed);

  // "Fixed pricing": mỗi meter_type chỉ có 1 record ACTIVE. Tạo giá mới sẽ tự tắt giá cũ.
  await repo.deactivateActivePricingByMeterType(entity.meter_type);
  const result = await repo.createUtilityPricing({ ...entity, is_active: true });
  return { id: result.id, meterType: parsed.meterType };
};

const getAllUtilityPricing = async (query) => {
  const parsedQuery = parseUtilityPricingListQuery(query);
  const result = await repo.getAllUtilityPricing(parsedQuery);
  return {
    data: result.rows.map(mapper.toResponse),
    size: result.rows.length,
    totalElements: result.total,
    totalPages: Math.ceil(result.total / parsedQuery.size),
    page: parsedQuery.page,
    pageSize: parsedQuery.size,
  };
};
const getActiveUtilityPricing = async () => {
  const rows = await repo.getAllActiveUtilityPricing();
  return { data: rows.map(mapper.toResponse), size: rows.length };
};
const getActiveUtilityPricingByMeterType = async (meterType) => {
  const row = await repo.getActivePricingByMeterType(parseMeterTypePath(meterType));
  if (!row) throw new AppError(404, "Utility pricing not found");
  return mapper.toResponse(row);
};

const getUtilityPricingById = async (id) => {
  const row = await repo.getUtilityPricingById(parsePathId(id));
  if (!row) throw new AppError(404, "Utility pricing not found");
  return mapper.toResponse(row);
};

const updateUtilityPricing = async (id, body) => {
  const parsedId = parsePathId(id);
  const patch = parseUpdateUtilityPricing(body);
  const existing = await repo.getUtilityPricingById(parsedId);
  if (!existing) throw new AppError(404, "Utility pricing not found");

  // Không cho đổi meterType để giữ "giá cố định theo loại" đơn giản.
  if (patch.meterType !== undefined) {
    throw new AppError(400, "meterType cannot be changed. Create a new pricing for that meterType instead.");
  }

  if (patch.unit !== undefined) {
    validateUnitByMeterType({
      meterType: existing.meter_type,
      unit: patch.unit,
    });
  }

  const row = await repo.updateUtilityPricing(parsedId, mapper.toEntity(patch));
  return mapper.toResponse(row);
};

const deleteUtilityPricing = async (id) => {
  const row = await repo.deleteUtilityPricing(parsePathId(id));
  if (!row) throw new AppError(404, "Utility pricing not found");
  return { id: row.id };
};

const restoreUtilityPricing = async (id) => {
  const row = await repo.restoreUtilityPricing(parsePathId(id));
  if (!row) throw new AppError(404, "Utility pricing not found");
  return { id: row.id };
};

module.exports = {
  createUtilityPricing,
  getAllUtilityPricing,
  getActiveUtilityPricing,
  getActiveUtilityPricingByMeterType,
  getUtilityPricingById,
  updateUtilityPricing,
  deleteUtilityPricing,
  restoreUtilityPricing,
};
