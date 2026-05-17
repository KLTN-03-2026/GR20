const User = require("./user.model");
const { UserResponse } = require("./user.response");

const toEntity = (req, roleId) => {
  const entity = {
    username: req.username,
    email: req.email,
    phone: req.phone,
    full_name: req.fullName,
    date_of_birth: req.dateOfBirth,
    gender: req.gender,
    id_card: req.idCard,
    avatar_url: req.avatarUrl,
  };
  if (roleId !== undefined) {
    entity.role_id = roleId;
  }
  if (req.password !== undefined) {
    entity.password = req.password;
  }
  return entity;
};

const toResponse = (row) => {
  const user = new User(row);
  return new UserResponse(user);
};

module.exports = { toEntity, toResponse };
