const Building = require("./building.model");

const toEntity = (req) => {
  return {
    name: req.name,
    code: req.code,
    address: req.address,
    total_floors: req.totalFloors,
    total_apartments: req.totalApartments,
    year_built: req.yearBuilt,
    status: req.status || "ACTIVE",
  };
};

const toResponse = (row) => {
  const base = {
    id: row.id,
    name: row.name,
    code: row.code,
    address: row.address,
    totalFloors: row.total_floors,
    totalApartments: row.total_apartments,
    yearBuilt: row.year_built,
    status: row.status,
    createdAt: row.created_at,
  };
  if (row.apartments != null) {
    base.apartments = row.apartments;
  }
  if (row.linked_floor_count != null) {
    base.linkedFloorCount = Number(row.linked_floor_count);
  }
  if (row.linked_apartment_count != null) {
    base.linkedApartmentCount = Number(row.linked_apartment_count);
  }
  return base;
};

module.exports = { toEntity, toResponse };
