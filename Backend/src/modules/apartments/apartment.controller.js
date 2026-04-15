const { ZodError } = require("zod");
const { AppError } = require("../../common/app-error");
const service = require("./apartment.service");

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

// CREATE
const createApartment = async (req, res) => {
  try {
    const data = await service.createApartment(req.body);

    res.status(201).json({
      operationType: "Success",
      message: "Create apartment successfully",
      code: "CREATED",
      data,
      size: 1,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

// GET ALL
const getAllApartments = async (req, res) => {
  try {
    const result = await service.getAllApartments(req.query);

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
const getApartmentById = async (req, res) => {
  try {
    const data = await service.getApartmentById(req.params.id);

    res.json({
      operationType: "Success",
      message: "Get apartment detail successfully",
      code: "OK",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

// UPDATE
const updateApartment = async (req, res) => {
  try {
    const data = await service.updateApartment(req.params.id, req.body);

    res.json({
      operationType: "Success",
      message: "Update apartment successfully",
      code: "OK",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

// DELETE (soft)
const deleteApartment = async (req, res) => {
  try {
    const data = await service.deleteApartment(req.params.id);

    res.json({
      operationType: "Success",
      message: "Delete apartment successfully",
      code: "OK",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

module.exports = {
  createApartment,
  getAllApartments,
  getApartmentById,
  updateApartment,
  deleteApartment,
};