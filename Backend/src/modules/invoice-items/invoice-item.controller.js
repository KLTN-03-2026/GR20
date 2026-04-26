const { ZodError } = require("zod");
const { AppError } = require("../../common/app-error");
const service = require("./invoice-item.service");

const sendError = (res, err) => {
  if (err instanceof ZodError) return res.status(400).json({ message: "Validation failed", errors: err.flatten().fieldErrors, formErrors: err.flatten().formErrors });
  if (err instanceof AppError) return res.status(err.statusCode).json({ message: err.message, details: err.details });
  return res.status(500).json({ message: err.message });
};

const createInvoiceItem = async (req, res) => {
  try {
    const data = await service.createInvoiceItem(req.body);
    res.status(201).json({ operationType: "Success", message: "Create invoice item successfully", code: "CREATED", data, size: 1, timestamp: new Date() });
  } catch (err) { sendError(res, err); }
};
const getAllInvoiceItems = async (req, res) => {
  try {
    const result = await service.getAllInvoiceItems();
    res.json({ operationType: "Success", message: "success", code: "OK", ...result, timestamp: new Date() });
  } catch (err) { sendError(res, err); }
};
const getInvoiceItemById = async (req, res) => {
  try {
    const data = await service.getInvoiceItemById(req.params.id);
    res.json({ operationType: "Success", message: "Get invoice item detail successfully", code: "OK", data, timestamp: new Date() });
  } catch (err) { sendError(res, err); }
};
const getInvoiceItemsByInvoiceId = async (req, res) => {
  try {
    const result = await service.getInvoiceItemsByInvoiceId(req.params.invoiceId);
    res.json({ operationType: "Success", message: "success", code: "OK", ...result, timestamp: new Date() });
  } catch (err) { sendError(res, err); }
};
const updateInvoiceItem = async (req, res) => {
  try {
    const data = await service.updateInvoiceItem(req.params.id, req.body);
    res.json({ operationType: "Success", message: "Update invoice item successfully", code: "OK", data, timestamp: new Date() });
  } catch (err) { sendError(res, err); }
};
const deleteInvoiceItem = async (req, res) => {
  try {
    const data = await service.deleteInvoiceItem(req.params.id);
    res.json({ operationType: "Success", message: "Delete invoice item successfully", code: "OK", data, timestamp: new Date() });
  } catch (err) { sendError(res, err); }
};

module.exports = { createInvoiceItem, getAllInvoiceItems, getInvoiceItemById, getInvoiceItemsByInvoiceId, updateInvoiceItem, deleteInvoiceItem };
