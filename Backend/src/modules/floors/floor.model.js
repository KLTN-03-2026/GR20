class Floor {
  constructor({ id, building_id, floor_number, name, created_at, is_deleted }) {
    this.id = id;
    this.buildingId = building_id;
    this.floorNumber = floor_number;
    this.name = name;
    this.createdAt = created_at;
    this.isDeleted = is_deleted;
  }
}

module.exports = Floor;
