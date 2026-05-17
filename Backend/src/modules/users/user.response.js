class UserResponse {
  constructor(user) {
    this.id = user.id;
    this.username = user.username;
    this.email = user.email;
    this.phone = user.phone;
    this.fullName = user.fullName;
    this.dateOfBirth = user.dateOfBirth;
    this.gender = user.gender;
    this.idCard = user.idCard;
    this.avatarUrl = user.avatarUrl;
    this.roleId = user.roleId;
    this.roleName = user.roleName;
    this.isActive = user.isActive;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}

module.exports = { UserResponse };
