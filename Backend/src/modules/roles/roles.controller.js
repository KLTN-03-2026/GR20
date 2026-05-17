const { ZodError } = require("zod");
const { AppError } = require("../../common/app-error");
const service = require("./roles.service");

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
    if (err.details !== undefined) {
      body.details = err.details;
    }
    return res.status(err.statusCode).json(body);
  }
  return res.status(500).json({ message: err.message });
};

const saveRole = async (req, res) => {
  try {
    const data = await service.saveRole(req.body);
    res.status(201).json({
      operationType: "Success",
      message: "Create role successfully",
      code: "CREATED",
      data,
      size: 1,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

const getAllRoles = async (req, res) => {
  try {
    const result = await service.getAllRoles(req.query);
    res.json({
      operationType: "Success",
      message: "success",
      code: "OK",
      ...result,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

const seedDefaultRoles = async (req, res) => {
  try {
    const data = await service.seedDefaultRoles();
    res.status(201).json({
      operationType: "Success",
      message: "Seed roles successfully",
      code: "CREATED",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

const findRoleById = async (req, res) => {
  try {
    const data = await service.findRoleById(req.params.id);
    res.json({
      operationType: "Success",
      message: "Get role detail successfully",
      code: "OK",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

const updateRole = async (req, res) => {
  try {
    const data = await service.updateRole(req.params.id, req.body);
    res.json({
      operationType: "Success",
      message: "Update role successfully",
      code: "OK",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

const deleteRole = async (req, res) => {
  try {
    const data = await service.deleteRole(req.params.id);
    res.json({
      operationType: "Success",
      message: "Delete role successfully",
      code: "OK",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

module.exports = {
  saveRole,
  getAllRoles,
  seedDefaultRoles,
  findRoleById,
  updateRole,
  deleteRole,
};
