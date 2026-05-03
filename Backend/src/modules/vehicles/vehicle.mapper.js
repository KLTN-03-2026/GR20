const toEntity = (req) => ({
  owner_id: req.ownerId,
  apartment_id: req.apartmentId,
  plate_number: req.plateNumber,
  vehicle_type: req.vehicleType,
  color: req.color,
  status: req.status,
});

const toResponse = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    ownerId: row.owner_id,
    apartmentId: row.apartment_id,
    plateNumber: row.plate_number,
    vehicleType: row.vehicle_type,
    color: row.color,
    status: row.status,
    createdAt: row.created_at,
  };
};

module.exports = { toEntity, toResponse };
