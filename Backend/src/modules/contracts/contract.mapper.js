// contract.mapper.js
const Contract = require("./contract.model");
const { ContractResponse, ContractDetailResponse } = require("./contract.response");

const toEntity = (data) => {
  console.log("=== MAPPER ===");
  console.log("data to map:", data);
  
  const entity = {
    resident_id: data.residentId,
    apartment_id: data.apartmentId,
    contract_type: data.contractType,
     status: data.status,
    start_date: data.startDate,
    end_date: data.endDate,
    monthly_rent: data.monthlyRent,
    deposit: data.deposit,
    note: data.note || null,
  };
  
  console.log("mapped entity:", entity);
  return entity;
};

const toResponse = (data) => new ContractResponse(data);
const toDetailResponse = (data) => new ContractDetailResponse(data);

module.exports = {
  toEntity,
  toResponse,
  toDetailResponse,
};