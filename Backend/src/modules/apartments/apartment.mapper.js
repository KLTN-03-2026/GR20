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
  
  return {
    id: row.id,
    buildingId: row.building_id,
    ownerUserId: row.owner_user_id,
    floorId: row.floor_id,
    apartmentCode: row.apartment_code,
    area: parseFloat(row.area) || 0,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    balconyDirection: row.balcony_direction,
    status: row.status,
    //Thêm các field từ JOIN
    buildingName: row.building_name || row.buildingName || null,
    floorNumber: row.floor_number || row.floorNumber || null,
    ownerName: row.owner_name || null,
    imageUrl: row.image_url || null,
    owner: row.owner || null,
    residents: row.residents || [],
    currentContract: row.current_contract || row.currentContract || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

module.exports = { toEntity, toResponse };