const { ZodError } = require("zod");
const { AppError } = require("../../common/app-error");
const service = require("./buildings.service");

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

const createBuilding = async (req, res) => {
  try {
    const data = await service.createBuilding(req.body);

    res.status(201).json({
      operationType: "Success",
      message: "Create building successfully",
      code: "CREATED",
      data,
      size: 1,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

const getAllBuildings = async (req, res) => {
  try {
    const result = await service.getAllBuildings(req.query);

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

// GET DETAIL
const getBuildingById = async (req, res) => {
  try {
    const data = await service.getBuildingById(req.params.id);

    res.json({
      operationType: "Success",
      message: "Get building detail successfully",
      code: "OK",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    res.status(404).json({
      message: err.message,
    });
  }
};

// UPDATE
const updateBuilding = async (req, res) => {
  try {
    const data = await service.updateBuilding(req.params.id, req.body);

    res.json({
      operationType: "Success",
      message: "Update building successfully",
      code: "OK",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

// DELETE
const deleteBuilding = async (req, res) => {
  try {
    const data = await service.deleteBuilding(req.params.id);

    res.json({
      operationType: "Success",
      message: "Delete building successfully",
      code: "OK",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

module.exports = {
  createBuilding,
  getAllBuildings,
  getBuildingById,
  updateBuilding,
  deleteBuilding,
};
