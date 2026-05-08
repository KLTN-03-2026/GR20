const { ZodError } = require("zod");
const { AppError } = require("../../common/app-error");
const service = require("./building-image.service");

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

const createBuildingImage = async (req, res) => {
  try {
    const data = await service.createBuildingImage(req.body);

    res.status(201).json({
      operationType: "Success",
      message: "Create building image successfully",
      code: "CREATED",
      data,
      size: 1,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

const uploadBuildingImage = async (req, res) => {
  try {
    const file = req.file;
    const { buildingId } = req.body;

    if (!file) {
      return res.status(400).json({
        message: "Please select an image file",
      });
    }

    const data = await service.createBuildingImageByFile({ buildingId, file });

    res.status(201).json({
      operationType: "Success",
      message: "Upload building image successfully",
      code: "CREATED",
      data,
      size: 1,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

const getAllByBuildingId = async (req, res) => {
  try {
    const result = await service.getAllByBuildingId(req.params.buildingId);

    res.json({
      operationType: "Success",
      message: "Get building images successfully",
      code: "OK",
      ...result,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

const softDeleteBuildingImage = async (req, res) => {
  try {
    const data = await service.softDeleteBuildingImage(req.params.id);

    res.json({
      operationType: "Success",
      message: "Delete building image successfully",
      code: "OK",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

module.exports = {
  createBuildingImage,
  uploadBuildingImage,
  getAllByBuildingId,
  softDeleteBuildingImage,
};
