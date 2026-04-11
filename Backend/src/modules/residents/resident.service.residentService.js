const ResidentRepository = require("./resident.repo.repository");
const ResidentMapper = require("./resident.mapper.mapper");

class ResidentService {
  async getAll() {
    const data = await ResidentRepository.findAll();
    return ResidentMapper.toResponseList(data);
  }

  async create(dto) {
    const entity = ResidentMapper.toEntityFromCreate(dto);
    const saved = await ResidentRepository.create(entity);
    return ResidentMapper.toCreateResponse(saved);
  }

  async update(id, dto) {
    const entity = await ResidentRepository.findById(id);
    if (!entity) throw new Error("Resident not found");

    ResidentMapper.toEntityFromUpdate(entity, dto);
    const updated = await ResidentRepository.update(entity);

    return ResidentMapper.toUpdateResponse(updated);
  }

  async delete(id) {
    const entity = await ResidentRepository.findById(id);
    if (!entity) throw new Error("Resident not found");

    const deleted = await ResidentRepository.softDelete(id);
    return ResidentMapper.toDeleteResponse(deleted);
  }
}

module.exports = new ResidentService();