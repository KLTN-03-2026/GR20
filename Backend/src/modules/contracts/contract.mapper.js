const Contract = require("./contract.model");

/** Chuẩn hóa từ body API (camelCase) hoặc row DB (snake_case) sang field Contract */
const toEntity = (data) =>
  new Contract({
    id: data.id,
    resident_id: data.resident_id ?? data.residentId,
    apartment_id: data.apartment_id ?? data.apartmentId,
    contract_type: data.contract_type ?? data.contractType,
    status: data.status,
    start_date: data.start_date ?? data.startDate,
    end_date: data.end_date ?? data.endDate,
    monthly_rent: data.monthly_rent ?? data.monthlyRent,
    deposit: data.deposit,
    note: data.note,
    created_at: data.created_at ?? data.createdAt,
    updated_at: data.updated_at ?? data.updatedAt,
  });

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