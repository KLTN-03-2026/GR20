const Floor = require("./floor.model");

// ================= ENTITY (REQUEST → DB) =================
const toEntity = (req) => {
  return {
    building_id: req.buildingId,
    floor_number: req.floorNumber,
    name: req.name || null,
  };
};


// ================= RESPONSE (DB → API RESPONSE) =================
const toResponse = (row) => {
  if (!row) return null;

  return {
    id: row.id,
    buildingId: row.building_id,
    floorNumber: row.floor_number,
    name: row.name,
    createdAt: row.created_at,
    deletedAt: row.deleted_at || null,
  };
};


// ================= LIST RESPONSE =================
const toListResponse = (rows) => {
  return rows.map(toResponse);
};


module.exports = {
  toEntity,
  toResponse,
  toListResponse,
};