const { ZodError } = require("zod");
const { AppError } = require("../../common/app-error");
const service = require("./users.service");

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

const saveUser = async (req, res) => {
  try {
    const data = await service.saveUser(req.body);
    res.status(201).json({
      operationType: "Success",
      message: "Create user successfully",
      code: "CREATED",
      data,
      size: 1,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

const getAllUsers = async (req, res) => {
  try {
    const result = await service.getAllUsers(req.query);
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

const findUserById = async (req, res) => {
  try {
    const data = await service.findUserById(req.params.id);
    res.json({
      operationType: "Success",
      message: "Get user detail successfully",
      code: "OK",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

const updateUser = async (req, res) => {
  try {
    const data = await service.updateUser(req.params.id, req.body);
    res.json({
      operationType: "Success",
      message: "Update user successfully",
      code: "OK",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

const deleteUser = async (req, res) => {
  try {
    const restore = req.query.restore === "true" || req.query.restore === "1";
    const data = await service.deleteOrRestoreUser(req.params.id, restore);
    res.json({
      operationType: "Success",
      message: restore ? "Restore user successfully" : "Delete user successfully",
      code: "OK",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

module.exports = {
  saveUser,
  getAllUsers,
  findUserById,
  updateUser,
  deleteUser,
};
