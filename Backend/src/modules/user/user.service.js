const repo = require("./user.repository");
const mapper = require("./user.mapper");

const getUserById = async (id) => {
  const data = await repo.getUserById(id);

  if (!data) {
    throw new Error("User not found");
  }

  return mapper.toResponse(data);
};

const createUser = async (reqBody) => {
  const entity = mapper.toEntity(reqBody);
  const result = await repo.createUser(entity);

  return { id: result.id };
};

const getAllUsers = async (query) => {
  // const { page = 0, size = 10 } = query;
  const page = parseInt(query.page) || 0
  const size = parseInt(query.size) || 10

  const result = await repo.getAllUsers({ page, size });

  return {
    data: result.rows.map(mapper.toListResponse),
    pagination:{
      page: page,
      pageSize: size,
      totalElements: result.total,
      totalPages: Math.ceil(result.total / size),
    }  
  };
};

module.exports = { getUserById,createUser,getAllUsers };