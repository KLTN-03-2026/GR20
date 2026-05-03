const toEntity = (req) => ({
  apartment_id: req.apartmentId ?? req.apartment_id,
  meter_type: req.meterType ?? req.meter_type,
  meter_code: req.meterCode ?? req.meter_code,
  installed_date: req.installedDate ?? req.installed_date,
  status: req.status,
});

const toResponse = (row) => {
  if (!row) return null;
  const out = {
    id: row.id,
    apartmentId: row.apartment_id,
    meterType: row.meter_type,
    meterCode: row.meter_code,
    installedDate: row.installed_date,
    status: row.status,
  };
  const apt = row.apartment_code ?? row.apartmentCode;
  if (apt != null && String(apt).trim() !== "") {
    out.apartmentCode = String(apt);
  }
  const bName = row.building_name ?? row.buildingName;
  if (bName != null && String(bName).trim() !== "") {
    out.buildingName = String(bName);
  }
  return out;
};

module.exports = { toEntity, toResponse };
