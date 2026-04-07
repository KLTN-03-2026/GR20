class CreateBuildingRequest {
  constructor({
    name,
    code,
    address,
    totalFloors,
    totalApartments,
    yearBuilt,
    status,
  }) {
    this.name = name;
    this.code = code;
    this.address = address;
    this.totalFloors = totalFloors;
    this.totalApartments = totalApartments;
    this.yearBuilt = yearBuilt;
    this.status = status;
  }
}

module.exports = { CreateBuildingRequest };
