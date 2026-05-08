const { ZodError } = require("zod");
const { AppError } = require("../../common/app-error");
const service = require("./visitor.service");

const sendError = (res, err) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Validation failed",
      errors: err.flatten().fieldErrors,
      formErrors: err.flatten().formErrors,
    });
  }
  if (err instanceof AppError) {
    const body = { message: err.message };
    if (err.details !== undefined) body.details = err.details;
    return res.status(err.statusCode).json(body);
  }
  return res.status(500).json({ message: err.message });
};

const create = async (req, res) => {
  try {
    const data = await service.create(req.body);
    return res.status(201).json({
      operationType: "Success",
      message: "Create visitor successfully",
      code: "CREATED",
      data,
      size: 1,
      timestamp: new Date(),
    });
  } catch (err) {
    return sendError(res, err);
  }
};

const getAll = async (req, res) => {
  try {
    const result = await service.getAll(req.query);
    return res.json({
      operationType: "Success",
      message: "success",
      code: "OK",
      ...result,
      timestamp: new Date(),
    });
  } catch (err) {
    return sendError(res, err);
  }
};

const getById = async (req, res) => {
  try {
    const data = await service.getById(req.params.id);
    return res.json({
      operationType: "Success",
      message: "Get visitor detail successfully",
      code: "OK",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    return sendError(res, err);
  }
};

const update = async (req, res) => {
  try {
    const data = await service.update(req.params.id, req.body);
    return res.json({
      operationType: "Success",
      message: "Update visitor successfully",
      code: "OK",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    return sendError(res, err);
  }
};

const deleteById = async (req, res) => {
  try {
    const data = await service.deleteById(req.params.id);
    return res.json({
      operationType: "Success",
      message: "Delete visitor successfully",
      code: "OK",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    return sendError(res, err);
  }
};

module.exports = { create, getAll, getById, update, deleteById };
