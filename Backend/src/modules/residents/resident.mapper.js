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
  if (!row) return null;
  
  return {
    id: row.profile_id ? String(row.profile_id) : null,  // Có thể null nếu chưa có profile
    userId: String(row.user_id),
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    avatarUrl: row.avatar_url,
    apartmentId: row.apartment_id || null,
    apartmentNumber: row.apartment_number || null,
    buildingName: row.building_name || null,
    relationship: row.relationship || null,
    moveInDate: row.move_in_date || null,
    moveOutDate: row.move_out_date || null,
    status: row.status || 'UNASSIGNED',
    isUnassigned: !row.apartment_id || row.status === 'UNASSIGNED',
    hasProfile: !!row.profile_id,  // Thêm flag để biết đã có profile chưa
    createdAt: row.profile_created_at || null,
  };
};

const toListResponse = (row) => {
  const isUnassigned = row.is_unassigned === true;
  return {
    id: isUnassigned ? String(row.user_id) : String(row.profile_id ?? row.id),
    userId: String(row.user_id),
    fullName: row.full_name,
    phone: row.phone,
    email: row.email,
    apartmentNumber: row.apartment_number || null,
    buildingName: row.building_name || null,
    relationship: row.relationship,
    status: row.status,
    isUnassigned,
  };
};

module.exports = { toEntity, toResponse, toListResponse };