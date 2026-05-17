class Contract {
  constructor({
    id,
    resident_id,
    apartment_id,
    contract_type,
    status,
    start_date,
    end_date,
    monthly_rent,
    deposit,
    note,
    created_at,
    updated_at,
  }) {
    this.id = id;
    this.residentId = resident_id;
    this.apartmentId = apartment_id;
    this.contractType = contract_type;
    this.status = status;
    this.startDate = start_date;
    this.endDate = end_date;
    this.monthlyRent = monthly_rent;
    this.deposit = deposit;
    this.note = note;
    this.createdAt = created_at;
    this.updatedAt = updated_at;
  }
}

module.exports = Contract;