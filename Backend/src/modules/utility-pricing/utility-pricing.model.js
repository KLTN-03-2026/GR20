class UtilityPricing {
  constructor({ id, meter_type, price_per_unit, unit, effective_from, is_active, created_at }) {
    this.id = id;
    this.meterType = meter_type;
    this.pricePerUnit = price_per_unit;
    this.unit = unit;
    this.effectiveFrom = effective_from;
    this.isActive = is_active;
    this.createdAt = created_at;
  }
}

module.exports = UtilityPricing;
