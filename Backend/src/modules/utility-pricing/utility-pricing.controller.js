const { ZodError } = require("zod");
const { AppError } = require("../../common/app-error");
const service = require("./utility-pricing.service");

const sendError = (res, err) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Validation failed",
      errors: err.flatten().fieldErrors,
      formErrors: err.flatten().formErrors,
    });
  }
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ code: "APP_ERROR", message: err.message, details: err.details });
  }
  return res.status(500).json({ code: "INTERNAL_ERROR", message: err.message });
};

const createUtilityPricing = async (req, res) => {
  try {
    const data = await service.createUtilityPricing(req.body);
    res.status(201).json({ operationType: "Success", message: "Create utility pricing successfully", code: "CREATED", data, size: 1, timestamp: new Date() });
  } catch (err) { sendError(res, err); }
};
const getAllUtilityPricing = async (req, res) => {
  try {
    const result = await service.getAllUtilityPricing(req.query);
    res.json({ operationType: "Success", message: "success", code: "OK", ...result, timestamp: new Date() });
  } catch (err) { sendError(res, err); }
};
const getActiveUtilityPricing = async (_req, res) => {
  try {
    const result = await service.getActiveUtilityPricing();
    res.json({ operationType: "Success", message: "success", code: "OK", ...result, timestamp: new Date() });
  } catch (err) { sendError(res, err); }
};
const getActiveUtilityPricingByMeterType = async (req, res) => {
  try {
    const data = await service.getActiveUtilityPricingByMeterType(req.params.meterType);
    res.json({ operationType: "Success", message: "Get utility pricing detail successfully", code: "OK", data, timestamp: new Date() });
  } catch (err) { sendError(res, err); }
};
const getUtilityPricingById = async (req, res) => {
  try {
    const data = await service.getUtilityPricingById(req.params.id);
    res.json({ operationType: "Success", message: "Get utility pricing detail successfully", code: "OK", data, timestamp: new Date() });
  } catch (err) { sendError(res, err); }
};
const updateUtilityPricing = async (req, res) => {
  try {
    const data = await service.updateUtilityPricing(req.params.id, req.body);
    res.json({ operationType: "Success", message: "Update utility pricing successfully", code: "OK", data, timestamp: new Date() });
  } catch (err) { sendError(res, err); }
};
const deleteUtilityPricing = async (req, res) => {
  try {
    const data = await service.deleteUtilityPricing(req.params.id);
    res.json({ operationType: "Success", message: "Delete utility pricing successfully", code: "OK", data, timestamp: new Date() });
  } catch (err) { sendError(res, err); }
};

const restoreUtilityPricing = async (req, res) => {
  try {
    const data = await service.restoreUtilityPricing(req.params.id);
    res.json({ operationType: "Success", message: "Restore utility pricing successfully", code: "OK", data, timestamp: new Date() });
  } catch (err) { sendError(res, err); }
};

module.exports = {
  createUtilityPricing,
  getAllUtilityPricing,
  getActiveUtilityPricing,
  getActiveUtilityPricingByMeterType,
  getUtilityPricingById,
  updateUtilityPricing,
  deleteUtilityPricing,
  restoreUtilityPricing,
};
