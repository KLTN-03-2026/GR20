const { sendControllerError } = require("../../common/send-controller-error");
const service = require("./meter-reading.service");

const createMeterReading = async (req, res) => {
  try {
    const data = await service.createMeterReading(req.body);
    res.status(201).json({ operationType: "Success", message: "Create meter reading successfully", code: "CREATED", data, size: 1, timestamp: new Date() });
  } catch (err) { sendControllerError(res, err); }
};
const getAllMeterReadings = async (req, res) => {
  try {
    const result = await service.getAllMeterReadings(req.query);
    res.json({ operationType: "Success", message: "success", code: "OK", ...result, timestamp: new Date() });
  } catch (err) { sendControllerError(res, err); }
};
const getMeterReadingById = async (req, res) => {
  try {
    const data = await service.getMeterReadingById(req.params.id);
    res.json({ operationType: "Success", message: "Get meter reading detail successfully", code: "OK", data, timestamp: new Date() });
  } catch (err) { sendControllerError(res, err); }
};
const getMeterReadingsByUserId = async (req, res) => {
  try {
    const result = await service.getMeterReadingsByUserId(req.params.userId, req.query);
    res.json({ operationType: "Success", message: "success", code: "OK", ...result, timestamp: new Date() });
  } catch (err) { sendControllerError(res, err); }
};
const getMeterReadingsByUserAndMeterId = async (req, res) => {
  try {
    const result = await service.getMeterReadingsByUserAndMeterId(req.params.userId, req.params.meterId, req.query);
    res.json({ operationType: "Success", message: "success", code: "OK", ...result, timestamp: new Date() });
  } catch (err) { sendControllerError(res, err); }
};
const updateMeterReading = async (req, res) => {
  try {
    const data = await service.updateMeterReading(req.params.id, req.body);
    res.json({ operationType: "Success", message: "Update meter reading successfully", code: "OK", data, timestamp: new Date() });
  } catch (err) { sendControllerError(res, err); }
};
const deleteMeterReading = async (req, res) => {
  try {
    const data = await service.deleteMeterReading(req.params.id);
    res.json({ operationType: "Success", message: "Delete meter reading successfully", code: "OK", data, timestamp: new Date() });
  } catch (err) { sendControllerError(res, err); }
};
const restoreMeterReading = async (req, res) => {
  try {
    const data = await service.restoreMeterReading(req.params.id);
    res.json({ operationType: "Success", message: "Restore meter reading successfully", code: "OK", data, timestamp: new Date() });
  } catch (err) { sendControllerError(res, err); }
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
