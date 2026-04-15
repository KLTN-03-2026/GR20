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
    status: req.status || "ACTIVE",
  };
};

const toResponse = (row) => {
  return {
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
};

module.exports = { toEntity, toResponse };