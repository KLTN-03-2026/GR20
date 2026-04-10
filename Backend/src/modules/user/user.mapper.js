const toResponse = (row) => {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    avatarUrl: row.avatar_url,
    dateOfBirth: row.date_of_birth,
    gender: row.gender,
    isActive: row.is_active,
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
    full_name: req.fullName,
    gender: req.gender,
    role_id: req.roleId,
  };
};

const toListResponse = (row) => {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    avatarUrl: row.avatar_url,
    isActive: row.is_active,
    roles: row.role ? [row.role] : [],
    createdAt: row.created_at,
  };
};

module.exports = { toEntity, toResponse,toListResponse };