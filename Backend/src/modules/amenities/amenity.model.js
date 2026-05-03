class Amenity {
  constructor({
    id, building_id, name, description, location,
    operating_hours, image_url, status, closed_reason,
    created_at, updated_at
  }) {
    this.id = id;
    this.buildingId = building_id;
    this.name = name;
    this.description = description;
    this.location = location;
    this.operatingHours = operating_hours;
    this.imageUrl = image_url;
    this.status = status;
    this.closedReason = closed_reason;
    this.createdAt = created_at;
    this.updatedAt = updated_at;
  }
}

module.exports = Amenity;