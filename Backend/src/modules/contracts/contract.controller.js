const { ZodError } = require("zod");
const { AppError } = require("../../common/app-error");
const service = require("./contract.service");

const sendError = (res, err) => {
  if (err instanceof ZodError) {
    console.log('❌ Zod errors:', err.flatten());
    return res.status(400).json({
      message: "Validation failed",
      errors: err.flatten().fieldErrors,
      formErrors: err.flatten().formErrors,
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  return res.status(500).json({ message: err.message });
};

// CREATE
const createContract = async (req, res) => {
  try {
    const data = await service.createContract(req.body);
    res.status(201).json({
      operationType: "Success",
      message: "Create contract successfully",
      code: "CREATED",
      data: {
        id: data.id,
        apartmentCode: req.body.apartmentCode || null, // Thêm thông tin
        contractType: req.body.contractType,
      },
      size: 1,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

// GET LIST
// GET LIST
const getContracts = async (req, res) => {
  try {
    const result = await service.getContracts(req.query);
    res.json({
      operationType: "Success",
      message: "Get contract list successfully",
      code: "OK",
      data: result.data,
      page: result.page,
      size: result.size,
      total: result.total,
      totalPages: result.totalPages,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

// GET DETAIL
const getContractById = async (req, res) => {
  try {
    const data = await service.getContractById(req.params.id);
    res.json({
      operationType: "Success",
      message: "Get contract detail successfully",
      code: "OK",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

// UPDATE
const updateContract = async (req, res) => {
  try {
    const data = await service.updateContract(req.params.id, req.body);
    res.json({
      operationType: "Success",
      message: "Update contract successfully",
      code: "OK",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

// DELETE
const terminateContract = async (req, res) => {
  try {
    const data = await service.terminateContract(req.params.id);
    res.json({
      operationType: "Success",
      message: "Terminate contract successfully",
      code: "OK",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

// RENEW
const renewContract = async (req, res) => {
  try {
    const data = await service.renewContract(req.params.id, req.body);
    res.json({
      operationType: "Success",
      message: "Renew contract successfully",
      code: "OK",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

module.exports = {
  createContract,
  getContracts,
  getContractById,
  updateContract,
  terminateContract,
  renewContract,
};