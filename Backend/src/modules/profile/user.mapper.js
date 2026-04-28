const toResponse = (row) => {
  return {
    id: row.id,
    username: row.username,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    idCard: row.id_card,
    avatarUrl: row.avatar_url,
    dateOfBirth: row.date_of_birth,
    gender: row.gender,
    isActive: row.is_active,
    roleId: row.role_id,
    roleName: row.role || row.role_name || null,
    roles: row.role ? [row.role] : [],  // lấy từ join
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const toEntity = (req) => {
  return {
    username: req.username,
    password: req.password,
    email: req.email,
    phone: req.phone,
    full_name: req.fullName,
    date_of_birth: req.dateOfBirth,
    gender: req.gender,
    id_card: req.idCard,
    avatar_url: req.avatarUrl,
    role_id: req.roleId,
  };
};

const toListResponse = (row) => {
  return {
    id: row.id,
    username: row.username,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    avatarUrl: row.avatar_url,
    isActive: row.is_active,
    roleId: row.role_id,
    roleName: row.role || row.role_name || null,
    roles: row.role ? [row.role] : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const toUpdateEntity = (req) => {
  return {
    username: req.username,
    password: req.password,
    email: req.email,
    full_name: req.fullName,
    phone: req.phone,
    gender: req.gender,
    date_of_birth: req.dateOfBirth,
    id_card: req.idCard,
    avatar_url: req.avatarUrl,
    role_id: req.roleId,
    is_active: req.isActive,
  };
};

module.exports = { toEntity, toResponse,toListResponse, toUpdateEntity };