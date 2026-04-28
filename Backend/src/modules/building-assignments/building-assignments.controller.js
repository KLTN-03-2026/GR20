const { ZodError } = require("zod");
const { AppError } = require("../../common/app-error");
const service = require("./building-assignment.service");

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

const saveBuildingAssignment = async (req, res) => {
  try {
    const data = await service.saveBuildingAssignment(req.body);
    res.status(201).json({
      operationType: "Success",
      message: "Create building assignment successfully",
      code: "CREATED",
      data,
      size: 1,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

const getAllBuildingAssignments = async (req, res) => {
  try {
    const result = await service.getAllBuildingAssignments(req.query);
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

const findBuildingAssignmentById = async (req, res) => {
  try {
    const data = await service.findBuildingAssignmentById(req.params.id);
    res.json({
      operationType: "Success",
      message: "Get building assignment detail successfully",
      code: "OK",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

const updateBuildingAssignment = async (req, res) => {
  try {
    const data = await service.updateBuildingAssignment(req.params.id, req.body);
    res.json({
      operationType: "Success",
      message: "Update building assignment successfully",
      code: "OK",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

const softDeleteBuildingAssignment = async (req, res) => {
  try {
    const data = await service.softDeleteBuildingAssignment(req.params.id);
    res.json({
      operationType: "Success",
      message: "Delete building assignment successfully",
      code: "OK",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

module.exports = {
  saveBuildingAssignment,
  getAllBuildingAssignments,
  findBuildingAssignmentById,
  updateBuildingAssignment,
  softDeleteBuildingAssignment,
};
