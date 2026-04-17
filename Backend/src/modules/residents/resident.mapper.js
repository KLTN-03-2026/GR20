const Resident = require("./resident.model");

const toEntity = (req) => {
  return {
    user_id: req.userId,
    apartment_id: req.apartmentId,
    relationship: req.relationship,
    move_in_date: req.moveInDate,
    move_out_date: req.moveOutDate,
    status: req.status || "ACTIVE",
  };
};

const toResponse = (row) => {
  return {
    id: row.id,
    userId: row.user_id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    avatarUrl: row.avatar_url,
    apartmentId: row.apartment_id,
    apartmentNumber: row.apartment_number,
    buildingName: row.building_name,
    relationship: row.relationship,
    moveInDate: row.move_in_date,
    status: row.status,
    createdAt: row.created_at,
  };
};

const toListResponse = (row) => {
  return {
    id: row.id,
    userId: row.user_id,
    fullName: row.full_name,
    apartmentNumber: row.apartment_number,
    buildingName: row.building_name,
    relationship: row.relationship,
    status: row.status,
  };
};

module.exports = { toEntity, toResponse, toListResponse };