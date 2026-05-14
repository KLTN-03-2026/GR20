const { sendControllerError } = require("../../common/send-controller-error");
const service = require("./utility-meter.service");

const createUtilityMeter = async (req, res) => {
  try {
    const data = await service.createUtilityMeter(req.body);
    res.status(201).json({ operationType: "Success", message: "Create utility meter successfully", code: "CREATED", data, size: 1, timestamp: new Date() });
  } catch (err) { sendControllerError(res, err); }
};
const getAllUtilityMeters = async (req, res) => {
  try {
    const result = await service.getAllUtilityMeters(req.query);
    res.json({ operationType: "Success", message: "success", code: "OK", ...result, timestamp: new Date() });
  } catch (err) { sendControllerError(res, err); }
};
const getUtilityMeterById = async (req, res) => {
  try {
    const data = await service.getUtilityMeterById(req.params.id);
    res.json({ operationType: "Success", message: "Get utility meter detail successfully", code: "OK", data, timestamp: new Date() });
  } catch (err) { sendControllerError(res, err); }
};
const getUtilityMetersByUserId = async (req, res) => {
  try {
    const result = await service.getUtilityMetersByUserId(req.params.userId, req.query);
    res.json({ operationType: "Success", message: "success", code: "OK", ...result, timestamp: new Date() });
  } catch (err) { sendControllerError(res, err); }
};
const getUtilityMeterByUserAndId = async (req, res) => {
  try {
    const data = await service.getUtilityMeterByUserAndId(req.params.userId, req.params.id);
    res.json({ operationType: "Success", message: "Get utility meter detail successfully", code: "OK", data, timestamp: new Date() });
  } catch (err) { sendControllerError(res, err); }
};
const updateUtilityMeter = async (req, res) => {
  try {
    const data = await service.updateUtilityMeter(req.params.id, req.body);
    res.json({ operationType: "Success", message: "Update utility meter successfully", code: "OK", data, timestamp: new Date() });
  } catch (err) { sendControllerError(res, err); }
};
const deleteUtilityMeter = async (req, res) => {
  try {
    const data = await service.deleteUtilityMeter(req.params.id);
    res.json({ operationType: "Success", message: "Đã xóa đồng hồ tiện ích", code: "OK", data, timestamp: new Date() });
  } catch (err) { sendControllerError(res, err); }
};
const restoreUtilityMeter = async (req, res) => {
  try {
    const data = await service.restoreUtilityMeter(req.params.id);
    res.json({ operationType: "Success", message: "Restore utility meter successfully", code: "OK", data, timestamp: new Date() });
  } catch (err) { sendControllerError(res, err); }
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
