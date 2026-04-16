class User {
  constructor({
    id,
    username,
    email,
    phone,
    full_name,
    date_of_birth,
    gender,
    id_card,
    avatar_url,
    role_id,
    role_name,
    is_active,
    created_at,
    updated_at,
  }) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.phone = phone;
    this.fullName = full_name;
    this.dateOfBirth = date_of_birth;
    this.gender = gender;
    this.idCard = id_card;
    this.avatarUrl = avatar_url;
    this.roleId = role_id;
    this.roleName = role_name;
    this.isActive = is_active;
    this.createdAt = created_at;
    this.updatedAt = updated_at;
  }
}

module.exports = User;
