const repo = require("./resident.repository");
const mapper = require("./resident.mapper");

const createResident = async (reqBody) => {
  // Check if resident already exists for this user and apartment
  const existing = await repo.getResidentByUserAndApartment(
    reqBody.userId,
    reqBody.apartmentId
  );
  
  if (existing) {
    throw new Error("User is already a resident of this apartment");
  }

  const entity = mapper.toEntity(reqBody);
  const result = await repo.createResident(entity);

  return {
    id: result.id,
  };
};

const getAllResidents = async (query) => {
  const { page = 0, size = 10, buildingId, status } = query;

  const result = await repo.getAllResidents({ page, size, buildingId, status });

  return {
    data: result.rows.map(mapper.toListResponse),
    size: result.rows.length,
    totalElements: result.total,
    totalPages: Math.ceil(result.total / size),
    page: Number(page),
    pageSize: Number(size),
  };
};

const getResidentById = async (id) => {
  const data = await repo.getResidentById(id);

  if (!data) {
    throw new Error("Resident not found");
  }

  return mapper.toResponse(data);
};

const getResidentsByApartmentId = async (apartmentId) => {
  const data = await repo.getResidentsByApartmentId(apartmentId);
  return data.map(mapper.toListResponse);
};

const getUserApartments = async (userId) => {
  const data = await repo.getUserApartments(userId);
  return data.map((row) => ({
    apartmentId: row.apartment_id,
    apartmentNumber: row.apartment_number,
    buildingName: row.building_name,
    relationship: row.relationship,
    status: row.status,
  }));
};

const updateResident = async (id, reqBody) => {
  const entity = mapper.toEntity(reqBody);
  const updated = await repo.updateResident(id, entity);

  if (!updated) {
    throw new Error("Update failed - Resident not found");
  }

  return { id: updated.id };
};

const deleteResident = async (id) => {
  const deleted = await repo.deleteResident(id);

  if (!deleted) {
    throw new Error("Delete failed - Resident not found");
  }

  return { id: deleted.id };
};

module.exports = {
  createResident,
  getAllResidents,
  getResidentById,
  getResidentsByApartmentId,
  getUserApartments,
  updateResident,
  deleteResident,
};