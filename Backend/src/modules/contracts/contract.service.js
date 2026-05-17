// contract.service.js
const repo = require("./contract.repository");
const mapper = require("./contract.mapper");
const { ContractListResponse } = require("./contract.response");
const { AppError } = require("../../common/app-error");
const {
  parseCreate,
  parseUpdate,
  parseRenew,
} = require("./contract.request");

// CREATE
const createContract = async (body) => {
  const parsed = parseCreate(body);
  const entity = mapper.toEntity(parsed);
  return await repo.createContract(entity);
};

// GET LIST
const getContracts = async (query) => {
  const {
    status = null,
    contractType = null,
    page = 1,
    size = 10,
  } = query;

  const pageNum = Number(page)
  const normalizedPage = !Number.isFinite(pageNum) || pageNum < 1 ? 1 : Math.floor(pageNum)
  const sizeNum = Number(size)

  const result = await repo.getContracts({
    status,
    contractType,
    page: normalizedPage,
    size: sizeNum,
  })

  const safeSize =
    Number.isFinite(sizeNum) && sizeNum >= 1 ? Math.min(Math.floor(sizeNum), 100) : 10

  return new ContractListResponse(result.rows, normalizedPage, safeSize, result.total)
};

// GET DETAIL
const getContractById = async (id) => {
  const data = await repo.getById(id);
  if (!data) throw new AppError(404, "Contract not found");

  return mapper.toDetailResponse(data);
};

// UPDATE
const updateContract = async (id, body) => {
  console.log('🔧 UPDATE BODY:', JSON.stringify(body)); 
  const parsed = parseUpdate(body);
  console.log('🔧 PARSED:', JSON.stringify(parsed)); 
  await repo.updateContract(id, parsed);
  return null;
};

// DELETE
const terminateContract = async (id) => {
  await repo.terminateContract(id);
  return null;
};

// RENEW
const renewContract = async (id, body) => {
  const parsed = parseRenew(body);
  await repo.renewContract(id, parsed);
  return null;
};

module.exports = {
  createContract,
  getContracts,
  getContractById,
  updateContract,
  terminateContract,
  renewContract,
};