// dtos/user/GetAllUsersResponse.js
class GetAllUsersResponse {
  constructor(user) {
    this.id = user.id;
    this.username = user.username;
    this.email = user.email;
    this.phone = user.phone;
    this.fullName = user.fullName;
    this.gender = user.gender;
    this.avatarUrl = user.avatarUrl;
    this.isActive = user.isActive;
    this.createdAt = user.createdAt;
  }
}

module.exports = GetAllUsersResponse;

// dtos/user/CreateUserResponse.js
class CreateUserResponse {
  constructor(user) {
    this.id = user.id;
    this.username = user.username;
    this.email = user.email;
    this.createdAt = user.createdAt;
  }
}

module.exports = CreateUserResponse;

// dtos/user/UpdateUserResponse.js
class UpdateUserResponse {
  constructor(user) {
    this.id = user.id;
    this.email = user.email;
    this.phone = user.phone;
    this.fullName = user.fullName;
    this.updatedAt = user.updatedAt;
  }
}

module.exports = UpdateUserResponse;

// dtos/user/DeleteUserResponse.js
class DeleteUserResponse {
  constructor(user) {
    this.id = user.id;
    this.isActive = user.isActive; // false
    this.updatedAt = user.updatedAt;
  }
}

module.exports = DeleteUserResponse;