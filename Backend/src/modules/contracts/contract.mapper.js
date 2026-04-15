const Contract = require("./contract.model");

const toEntity = (data) => new Contract(data);

// LIST
const toResponse = (data) => ({
  id: data.id,
  residentName: data.resident_name,
  apartmentCode: data.apartment_code,
  contractType: data.contract_type,
  status: data.status,
  startDate: data.start_date,
  endDate: data.end_date,
});

// DETAIL
const toDetailResponse = (data) => ({
  id: data.id,
  contractType: data.contract_type,
  status: data.status,
  startDate: data.start_date,
  endDate: data.end_date,
  monthlyRent: data.monthly_rent,
  deposit: data.deposit,

  apartment: data.apartment,
  signer: data.signer,
  eSignature: data.e_signature || null,

  note: data.note,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
});

module.exports = {
  toEntity,
  toResponse,
  toDetailResponse,
};