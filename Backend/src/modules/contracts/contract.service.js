const repo = require("./contract.repository");
const mapper = require("./contract.mapper");
const { AppError } = require("../../common/app-error");
const {
  parseCreate,
  parseUpdate,
  parseRenew,
  parseList,
  parsePathId,
} = require("./contract.request");

// CREATE
const createContract = async (body) => {
  const parsed = parseCreate(body);
  const entity = mapper.toEntity(parsed);
  return mapper.toResponse(await repo.createContract(entity));
};

// GET LIST
const getContracts = async (query) => {
  const parsed = parseList(query);

  const result = await repo.getContracts({
    ...parsed,
  });

  return {
    data: result.rows.map(mapper.toResponse),
    page: parsed.page,
    size: result.rows.length,
    totalElements: result.total,
    totalPages: Math.ceil(result.total / parsed.size),
    pageSize: parsed.size,
  };
};

// GET DETAIL
const getContractById = async (id) => {
  const parsedId = parsePathId(id);
  const data = await repo.getById(parsedId);
  if (!data) throw new AppError(404, "Contract not found");

  return mapper.toDetailResponse(data);
};

// UPDATE
const updateContract = async (id, body) => {
  const parsedId = parsePathId(id);
  const parsed = parseUpdate(body);
  const updated = await repo.updateContract(parsedId, parsed);
  if (!updated) throw new AppError(404, "Contract not found");
  return mapper.toDetailResponse(updated);
};

// DELETE
const terminateContract = async (id) => {
  const parsedId = parsePathId(id);
  const deleted = await repo.terminateContract(parsedId);
  if (!deleted) throw new AppError(404, "Contract not found");
  return { id: deleted.id };
};

// RENEW
const renewContract = async (id, body) => {
  const parsedId = parsePathId(id);
  const parsed = parseRenew(body);
  const renewed = await repo.renewContract(parsedId, parsed);
  if (!renewed) throw new AppError(404, "Contract not found");
  return mapper.toDetailResponse(renewed);
};

module.exports = {
  createContract,
  getContracts,
  getContractById,
  updateContract,
  terminateContract,
  renewContract,
};