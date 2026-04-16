class RoleResponse {
  constructor(role) {
    this.id = role.id;
    this.name = role.name;
    this.description = role.description;
    this.createdAt = role.createdAt;
  }
}

module.exports = { RoleResponse };
