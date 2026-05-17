class BuildingResponse {
  constructor(building) {
    this.id = building.id;
    this.name = building.name;
    this.code = building.code;
    this.address = building.address;
    this.totalFloors = building.totalFloors;
    this.totalApartments = building.totalApartments;
    this.yearBuilt = building.yearBuilt;
    this.status = building.status;
    this.createdAt = building.createdAt;
  }
}

module.exports = { BuildingResponse };
