class AmenityResponse {
  constructor(amenity) {
    this.id = amenity.id;
    this.buildingId = amenity.building_id;
    this.buildingName = amenity.building_name;
    this.name = amenity.name;
    this.description = amenity.description;
    this.location = amenity.location;
    this.operatingHours = amenity.operating_hours;
    this.imageUrl = amenity.image_url;
    this.status = amenity.status;
    this.closedReason = amenity.closed_reason;
    this.createdAt = amenity.created_at;
    this.updatedAt = amenity.updated_at;
  }
}

module.exports = { AmenityResponse };