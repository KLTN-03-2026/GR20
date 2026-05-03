const Apartment = require("./apartment.model");

const toEntity = (req) => {
  return {
    building_id: req.buildingId,
    owner_user_id: req.ownerUserId,
    floor_id: req.floorId,
    apartment_code: req.apartmentCode,
    area: req.area,
    bedrooms: req.bedrooms,
    bathrooms: req.bathrooms,
    balcony_direction: req.balconyDirection,
    status: req.status || "AVAILABLE",
  };
};

const toResponse = (row) => {
  if (!row) return null;
  const out = {
    id: row.id,
    buildingId: row.building_id,
    ownerUserId: row.owner_user_id,
    floorId: row.floor_id,
    apartmentCode: row.apartment_code,
    area: row.area,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    balconyDirection: row.balcony_direction,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  const bName =
    row.building_name ??
    row.buildingName ??
    null;
  if (bName != null && bName !== "") {
    out.buildingName = bName;
  }

  const floorNum =
    row.floor_number !== undefined ? row.floor_number : row.floorNumber;
  if (floorNum !== undefined && floorNum !== null) {
    out.floorNumber = floorNum;
  }

  let ownerLbl = row.owner_name ?? row.ownerName;
  if (ownerLbl !== undefined && ownerLbl !== null && String(ownerLbl).trim() !== "") {
    out.ownerName = String(ownerLbl).trim();
  }

  return out;
};

/** Chi tiết căn: có owner object, residents[], currentContract (đồng bộ FE ApartmentDetail). */
const toDetailResponse = (row) => {
  const base = toResponse(row);
  if (!base) return null;

  if (row.owner && row.owner.id != null) {
    base.owner = row.owner;
  }

  if (Array.isArray(row.residents)) {
    base.residents = row.residents;
  } else {
    base.residents = [];
  }

  const cc = row.currentContract ?? row.currentcontract;
  if (cc != null && cc.id != null) {
    base.currentContract = cc;
  }

  return base;
};

module.exports = { toEntity, toResponse, toDetailResponse };