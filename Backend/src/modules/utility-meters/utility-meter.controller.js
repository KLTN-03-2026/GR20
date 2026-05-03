const { ZodError } = require("zod");
const { AppError } = require("../../common/app-error");
const service = require("./utility-meter.service");

const sendError = (res, err) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Validation failed",
      errors: err.flatten().fieldErrors,
      formErrors: err.flatten().formErrors,
    });
  }
  if (err instanceof AppError) return res.status(err.statusCode).json({ code: "APP_ERROR", message: err.message, details: err.details });
  return res.status(500).json({ code: "INTERNAL_ERROR", message: err.message });
};

const createUtilityMeter = async (req, res) => {
  try {
    const data = await service.createUtilityMeter(req.body);
    res.status(201).json({ operationType: "Success", message: "Create utility meter successfully", code: "CREATED", data, size: 1, timestamp: new Date() });
  } catch (err) { sendError(res, err); }
};
const getAllUtilityMeters = async (req, res) => {
  try {
    const result = await service.getAllUtilityMeters(req.query);
    res.json({ operationType: "Success", message: "success", code: "OK", ...result, timestamp: new Date() });
  } catch (err) { sendError(res, err); }
};
const getUtilityMeterById = async (req, res) => {
  try {
    const data = await service.getUtilityMeterById(req.params.id);
    res.json({ operationType: "Success", message: "Get utility meter detail successfully", code: "OK", data, timestamp: new Date() });
  } catch (err) { sendError(res, err); }
};
const getUtilityMetersByUserId = async (req, res) => {
  try {
    const result = await service.getUtilityMetersByUserId(req.params.userId, req.query);
    res.json({ operationType: "Success", message: "success", code: "OK", ...result, timestamp: new Date() });
  } catch (err) { sendError(res, err); }
};
const getUtilityMeterByUserAndId = async (req, res) => {
  try {
    const data = await service.getUtilityMeterByUserAndId(req.params.userId, req.params.id);
    res.json({ operationType: "Success", message: "Get utility meter detail successfully", code: "OK", data, timestamp: new Date() });
  } catch (err) { sendError(res, err); }
};
const updateUtilityMeter = async (req, res) => {
  try {
    const data = await service.updateUtilityMeter(req.params.id, req.body);
    res.json({ operationType: "Success", message: "Update utility meter successfully", code: "OK", data, timestamp: new Date() });
  } catch (err) { sendError(res, err); }
};
const deleteUtilityMeter = async (req, res) => {
  try {
    const data = await service.deleteUtilityMeter(req.params.id);
    res.json({ operationType: "Success", message: "Delete utility meter successfully", code: "OK", data, timestamp: new Date() });
  } catch (err) { sendError(res, err); }
};
const restoreUtilityMeter = async (req, res) => {
  try {
    const data = await service.restoreUtilityMeter(req.params.id);
    res.json({ operationType: "Success", message: "Restore utility meter successfully", code: "OK", data, timestamp: new Date() });
  } catch (err) { sendError(res, err); }
};

module.exports = {
  createUtilityMeter,
  getAllUtilityMeters,
  getUtilityMeterById,
  getUtilityMetersByUserId,
  getUtilityMeterByUserAndId,
  updateUtilityMeter,
  deleteUtilityMeter,
  restoreUtilityMeter,
};
