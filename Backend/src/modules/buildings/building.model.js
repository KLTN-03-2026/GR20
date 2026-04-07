//123
class Building {
  constructor({
    id,
    name,
    code,
    address,
    total_floors,
    total_apartments,
    year_built,
    status,
    created_at,
  }) {
    this.id = id;
    this.name = name;
    this.code = code;
    this.address = address;
    this.totalFloors = total_floors;
    this.totalApartments = total_apartments;
    this.yearBuilt = year_built;
    this.status = status;
    this.createdAt = created_at;
  }
}

module.exports = Building;
