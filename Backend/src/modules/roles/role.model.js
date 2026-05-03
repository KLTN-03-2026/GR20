class Role {
  constructor({ id, name, description, created_at, deleted_at }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.createdAt = created_at;
    this.deletedAt = deleted_at;
  }
}

module.exports = Role;
