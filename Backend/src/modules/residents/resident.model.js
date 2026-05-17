class Resident {
  constructor({
    id,
    user_id,
    apartment_id,
    relationship,
    move_in_date,
    move_out_date,
    status,
    created_at,
    // Extended fields for response
    full_name,
    email,
    phone,
    avatar_url,
    apartment_number,
    building_name,
  }) {
    this.id = id;
    this.userId = user_id;
    this.apartmentId = apartment_id;
    this.relationship = relationship;
    this.moveInDate = move_in_date;
    this.moveOutDate = move_out_date;
    this.status = status;
    this.createdAt = created_at;
    // Extended fields
    this.fullName = full_name;
    this.email = email;
    this.phone = phone;
    this.avatarUrl = avatar_url;
    this.apartmentNumber = apartment_number;
    this.buildingName = building_name;
  }
}

module.exports = Resident;