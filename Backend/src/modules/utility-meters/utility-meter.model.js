class UtilityMeter {
  constructor({ id, apartment_id, meter_type, meter_code, installed_date, status }) {
    this.id = id;
    this.apartmentId = apartment_id;
    this.meterType = meter_type;
    this.meterCode = meter_code;
    this.installedDate = installed_date;
    this.status = status;
  }
}

module.exports = UtilityMeter;
