const { ZodError } = require("zod");
const { AppError } = require("../../common/app-error");
const service = require("./floor.service");

// ================= ERROR HANDLER =================
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

// ================= CREATE =================
const createFloor = async (req, res) => {
  try {
    const data = await service.createFloor(req.body);

    res.status(201).json({
      operationType: "Success",
      message: "Create floor successfully",
      code: "CREATED",
      data,
      size: 1,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

// ================= GET ALL =================
const getAllFloors = async (req, res) => {
  try {
    const result = await service.getAllFloors(req.query);

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

// ================= GET BY ID =================
const getFloorById = async (req, res) => {
  try {
    const data = await service.getFloorById(req.params.id);

    res.json({
      operationType: "Success",
      message: "Get floor detail successfully",
      code: "OK",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

// ================= UPDATE =================
const updateFloor = async (req, res) => {
  try {
    const data = await service.updateFloor(req.params.id, req.body);

    res.json({
      operationType: "Success",
      message: "Update floor successfully",
      code: "OK",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

// ================= DELETE (SOFT) =================
const softDeleteFloor = async (req, res) => {
  try {
    const data = await service.softDeleteFloor(req.params.id);

    res.json({
      operationType: "Success",
      message: "Soft delete floor successfully",
      code: "OK",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

module.exports = {
  createFloor,
  getAllFloors,
  getFloorById,
  updateFloor,
  softDeleteFloor,
};
