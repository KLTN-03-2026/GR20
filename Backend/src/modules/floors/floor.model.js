class Floor {
  constructor({
    id,
    building_id,
    floor_number,
    name,
    created_at,
    deleted_at,
  }) {
    this.id = id;
    this.buildingId = building_id;
    this.floorNumber = floor_number;
    this.name = name;
    this.createdAt = created_at;
    this.deletedAt = deleted_at;
  }
}

module.exports = Floor;