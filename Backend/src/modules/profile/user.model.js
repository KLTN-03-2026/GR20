// user.model.js
function userModel(data) {
  return {
    id: data.id,
    username: data.username,
    password: data.password,
    email: data.email,
    phone: data.phone,
    fullName: data.full_name,
    dateOfBirth: data.date_of_birth,
    gender: data.gender,
    idCard: data.id_card,
    avatarUrl: data.avatar_url,
    roleId: data.role_id,
    isActive: data.is_active,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

module.exports = userModel;