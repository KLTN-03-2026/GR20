const toEntity = (req) => ({
  meter_type: req.meterType ?? req.meter_type,
  price_per_unit: req.pricePerUnit ?? req.price_per_unit,
  unit: req.unit,
  effective_from: req.effectiveFrom ?? req.effective_from,
  is_active: req.isActive,
});

const toResponse = (row) => ({
  id: row.id,
  meterType: row.meter_type,
  pricePerUnit: Number(row.price_per_unit),
  unit: row.unit,
  effectiveFrom: row.effective_from,
  isActive: row.is_active,
  createdAt: row.created_at,
});

module.exports = { toEntity, toResponse };
