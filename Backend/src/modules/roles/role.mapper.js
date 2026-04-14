const Role = require("./role.model");
const { RoleResponse } = require("./role.response");

const toEntity = (req) => {
  return {
    name: req.name,
    description: req.description ?? null,
  };
};

const toResponse = (row) => {
  const role = new Role(row);
  return new RoleResponse(role);
};

module.exports = { toEntity, toResponse };
