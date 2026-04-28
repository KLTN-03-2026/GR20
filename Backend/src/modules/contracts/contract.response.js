
class ContractResponse {
  constructor(contract) {
    this.id = contract.id;
    this.residentName = contract.resident_name || contract.residentName || null;
    this.apartmentCode = contract.apartment_code || contract.apartmentCode || null;
    this.contractType = contract.contract_type || contract.contractType;
    this.status = contract.status;
    this.startDate = contract.start_date || contract.startDate;
    this.endDate = contract.end_date || contract.endDate;
  }
}

class ContractDetailResponse {
  constructor(contract) {
    this.id = contract.id;
    this.contractType = contract.contract_type || contract.contractType;
    this.status = contract.status;
    this.startDate = contract.start_date || contract.startDate;
    this.endDate = contract.end_date || contract.endDate;
    this.monthlyRent = contract.monthly_rent || contract.monthlyRent;
    this.deposit = contract.deposit;
    
    // Apartment info
    this.apartment = contract.apartment ? {
      id: contract.apartment.id,
      apartmentNumber: contract.apartment.apartmentNumber || contract.apartment.apartment_code,
      buildingName: contract.apartment.buildingName || contract.apartment.building_name,
    } : null;
    
    // Signer info
    this.signer = contract.signer ? {
      id: contract.signer.id,
      fullName: contract.signer.fullName || contract.signer.full_name,
      phone: contract.signer.phone,
      email: contract.signer.email,
    } : null;
    
    // E-signature
    this.eSignature = contract.e_signature || contract.eSignature || null;
    
    this.note = contract.note;
    this.createdAt = contract.created_at || contract.createdAt;
    this.updatedAt = contract.updated_at || contract.updatedAt;
  }
}

class ContractListResponse {
  constructor(data, page, size, total) {
    this.data = data.map(item => new ContractResponse(item));
    this.page = page;
    this.size = size;
    this.total = total;
    this.totalPages = Math.ceil(total / size);
  }
}

module.exports = {
  ContractResponse,
  ContractDetailResponse,
  ContractListResponse,
};