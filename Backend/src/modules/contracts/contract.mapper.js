const Contract = require("./contract.model");

const toEntity = (data) => new Contract(data);

// LIST
const toResponse = (data) => ({
  id: data.id,
  residentId: data.resident_id,
  apartmentId: data.apartment_id,
  residentName: data.resident_name,
  apartmentCode: data.apartment_code,
  contractType: data.contract_type,
  status: data.status,
  startDate: data.start_date,
  endDate: data.end_date,
  monthlyRent: data.monthly_rent,
  deposit: data.deposit,
  note: data.note,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
});

// DETAIL
const toDetailResponse = (data) => ({
  id: data.id,
  residentId: data.resident_id,
  apartmentId: data.apartment_id,
  contractType: data.contract_type,
  status: data.status,
  startDate: data.start_date,
  endDate: data.end_date,
  monthlyRent: data.monthly_rent,
  deposit: data.deposit,
  residentName: data.resident_name,
  apartmentCode: data.apartment_code,

  note: data.note,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
});

module.exports = {
  toEntity,
  toResponse,
  toDetailResponse,
};