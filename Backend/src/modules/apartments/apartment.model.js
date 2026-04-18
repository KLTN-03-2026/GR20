// apartments.model.js
class Apartment {
  constructor({
    id,
    building_id,
    owner_user_id,
    floor_id,
    apartment_code,
    area,
    bedrooms,
    bathrooms,
    balcony_direction,
    status,
    created_at,
    updated_at,
  }) {
    this.id = id;
    this.buildingId = building_id;
    this.ownerUserId = owner_user_id;
    this.floorId = floor_id;
    this.apartmentCode = apartment_code;
    this.area = area;
    this.bedrooms = bedrooms;
    this.bathrooms = bathrooms;
    this.balconyDirection = balcony_direction;
    this.status = status;
    this.createdAt = created_at;
    this.updatedAt = updated_at;
  }
}

module.exports = Apartment;