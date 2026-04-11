const Resident = require('./residents.model');

class ResidentRepository {
  async findAll() {
    // Mock data or implement with pg pool
    return []; // Empty for now, implement later
  }

  async findById(id) {
    return null; // Mock
  }

  async create(entity) {
    return new Resident(entity); // Mock create
  }

  async update(entity) {
    return entity; // Mock
  }

  async softDelete(id) {
    return { id, isActive: false }; // Mock
  }
}

module.exports = new ResidentRepository();

