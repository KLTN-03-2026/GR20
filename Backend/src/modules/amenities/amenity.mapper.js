const Amenity = require("./amenity.model");

const toEntity = (data) => ({
  building_id: data.buildingId,
  name: data.name,
  description: data.description || null,
  location: data.location || null,
  operating_hours: data.operatingHours || null,
  image_url: data.imageUrl || null,
  status: data.status || "OPEN",
  closed_reason: data.closedReason || null,
});

const toResponse = (row) => ({
  id: row.id,
  buildingId: row.building_id,
  buildingName: row.building_name || null,
  name: row.name,
  description: row.description,
  location: row.location,
  operatingHours: row.operating_hours,
  imageUrl: row.image_url,
  status: row.status,
  closedReason: row.closed_reason,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

module.exports = { toEntity, toResponse };