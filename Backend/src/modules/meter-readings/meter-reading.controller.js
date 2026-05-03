const { ZodError } = require("zod");
const { AppError } = require("../../common/app-error");
const service = require("./meter-reading.service");

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

const createMeterReading = async (req, res) => {
  try {
    const data = await service.createMeterReading(req.body);
    res.status(201).json({ operationType: "Success", message: "Create meter reading successfully", code: "CREATED", data, size: 1, timestamp: new Date() });
  } catch (err) { sendError(res, err); }
};
const getAllMeterReadings = async (req, res) => {
  try {
    const result = await service.getAllMeterReadings(req.query);
    res.json({ operationType: "Success", message: "success", code: "OK", ...result, timestamp: new Date() });
  } catch (err) { sendError(res, err); }
};
const getMeterReadingById = async (req, res) => {
  try {
    const data = await service.getMeterReadingById(req.params.id);
    res.json({ operationType: "Success", message: "Get meter reading detail successfully", code: "OK", data, timestamp: new Date() });
  } catch (err) { sendError(res, err); }
};
const getMeterReadingsByUserId = async (req, res) => {
  try {
    const result = await service.getMeterReadingsByUserId(req.params.userId, req.query);
    res.json({ operationType: "Success", message: "success", code: "OK", ...result, timestamp: new Date() });
  } catch (err) { sendError(res, err); }
};
const getMeterReadingsByUserAndMeterId = async (req, res) => {
  try {
    const result = await service.getMeterReadingsByUserAndMeterId(req.params.userId, req.params.meterId, req.query);
    res.json({ operationType: "Success", message: "success", code: "OK", ...result, timestamp: new Date() });
  } catch (err) { sendError(res, err); }
};
const updateMeterReading = async (req, res) => {
  try {
    const data = await service.updateMeterReading(req.params.id, req.body);
    res.json({ operationType: "Success", message: "Update meter reading successfully", code: "OK", data, timestamp: new Date() });
  } catch (err) { sendError(res, err); }
};
const deleteMeterReading = async (req, res) => {
  try {
    const data = await service.deleteMeterReading(req.params.id);
    res.json({ operationType: "Success", message: "Delete meter reading successfully", code: "OK", data, timestamp: new Date() });
  } catch (err) { sendError(res, err); }
};
const restoreMeterReading = async (req, res) => {
  try {
    const data = await service.restoreMeterReading(req.params.id);
    res.json({ operationType: "Success", message: "Restore meter reading successfully", code: "OK", data, timestamp: new Date() });
  } catch (err) { sendError(res, err); }
};

module.exports = {
  createMeterReading,
  getAllMeterReadings,
  getMeterReadingById,
  getMeterReadingsByUserId,
  getMeterReadingsByUserAndMeterId,
  updateMeterReading,
  deleteMeterReading,
  restoreMeterReading,
};
