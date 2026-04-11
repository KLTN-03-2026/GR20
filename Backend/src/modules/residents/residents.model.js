class Resident {
  constructor({
    id,
    full_name,
    email,
    phone,
    is_active,
    created_at,
    updated_at
  }) {
    this.id = id;
    this.fullName = full_name;
    this.email = email;
    this.phone = phone;
    this.isActive = is_active;
    this.createdAt = created_at;
    this.updatedAt = updated_at;
  }
}

module.exports = Resident;

