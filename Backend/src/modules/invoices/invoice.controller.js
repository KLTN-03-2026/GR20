const { sendControllerError } = require("../../common/send-controller-error");
const service = require("./invoice.service");

const createInvoice = async (req, res) => {
  try {
    const data = await service.createInvoice(req.body);
    res.status(201).json({ operationType: "Success", message: "Create invoice successfully", code: "CREATED", data, size: 1, timestamp: new Date() });
  } catch (err) { sendControllerError(res, err); }
};
const getAllInvoices = async (req, res) => {
  try {
    const result = await service.getAllInvoices(req.query);
    res.json({ operationType: "Success", message: "success", code: "OK", ...result, timestamp: new Date() });
  } catch (err) { sendControllerError(res, err); }
};
const getInvoiceById = async (req, res) => {
  try {
    const data = await service.getInvoiceById(req.params.id);
    res.json({ operationType: "Success", message: "Get invoice detail successfully", code: "OK", data, timestamp: new Date() });
  } catch (err) { sendControllerError(res, err); }
};
const getInvoicesByUserId = async (req, res) => {
  try {
    const result = await service.getInvoicesByUserId(req.params.userId, req.query);
    res.json({ operationType: "Success", message: "success", code: "OK", ...result, timestamp: new Date() });
  } catch (err) { sendControllerError(res, err); }
};
const getInvoiceByUserAndId = async (req, res) => {
  try {
    const data = await service.getInvoiceByUserAndId(req.params.userId, req.params.id);
    res.json({ operationType: "Success", message: "Get invoice detail successfully", code: "OK", data, timestamp: new Date() });
  } catch (err) { sendControllerError(res, err); }
};
const updateInvoice = async (req, res) => {
  try {
    const data = await service.updateInvoice(req.params.id, req.body);
    res.json({ operationType: "Success", message: "Update invoice successfully", code: "OK", data, timestamp: new Date() });
  } catch (err) { sendControllerError(res, err); }
};
const deleteInvoice = async (req, res) => {
  try {
    const data = await service.deleteInvoice(req.params.id);
    res.json({ operationType: "Success", message: "Delete invoice successfully", code: "OK", data, timestamp: new Date() });
  } catch (err) { sendControllerError(res, err); }
};

const restoreInvoice = async (req, res) => {
  try {
    const data = await service.restoreInvoice(req.params.id);
    res.json({ operationType: "Success", message: "Restore invoice successfully", code: "OK", data, timestamp: new Date() });
  } catch (err) { sendControllerError(res, err); }
};

module.exports = {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  getInvoicesByUserId,
  getInvoiceByUserAndId,
  updateInvoice,
  deleteInvoice,
  restoreInvoice,
};
