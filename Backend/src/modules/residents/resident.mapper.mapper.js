const Resident = require("./residents.model");

class ResidentMapper {
  static toEntityFromCreate(dto) {
    return new Resident({
      full_name: dto.fullName,
      email: dto.email,
      phone: dto.phone,
      is_active: true,
      created_at: new Date(),
    });
  }

  static toResponse(entity) {
    return {
      id: entity.id,
      fullName: entity.fullName,
      email: entity.email,
      phone: entity.phone,
      isActive: entity.isActive,
    };
  }

  static toResponseList(list) {
    return list.map((e) => this.toResponse(e));
  }

  static toCreateResponse(entity) {
    return this.toResponse(entity);
  }

  static toUpdateResponse(entity) {
    return this.toResponse(entity);
  }

  static toDeleteResponse(entity) {
    return {
      id: entity.id,
      isActive: entity.isActive,
    };
  }

  static toEntityFromUpdate(entity, dto) {
    if (dto.fullName) entity.fullName = dto.fullName;
    if (dto.email) entity.email = dto.email;
    if (dto.phone) entity.phone = dto.phone;

    entity.updatedAt = new Date();
    return entity;
  }
}

module.exports = ResidentMapper;