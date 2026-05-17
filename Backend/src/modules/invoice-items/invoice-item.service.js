const { AppError } = require("../../common/app-error");
const repo = require("./invoice-item.repository");
const mapper = require("./invoice-item.mapper");
const { parsePathId, parseCreateInvoiceItem, parseUpdateInvoiceItem } = require("./invoice-item.request");

const refreshInvoiceTotal = async (invoiceId) => {
  const items = await repo.getInvoiceItemsByInvoiceId(invoiceId);
  const totalAmount = Number(items.reduce((sum, item) => sum + Number(item.amount), 0).toFixed(2));
  await repo.updateInvoiceTotalAmount(invoiceId, totalAmount);
};

const createInvoiceItem = async (body) => {
  const parsed = parseCreateInvoiceItem(body);
  const result = await repo.createInvoiceItem(mapper.toEntity(parsed));
  await refreshInvoiceTotal(parsed.invoiceId);
  return { id: result.id };
};
const getAllInvoiceItems = async () => {
  const rows = await repo.getAllInvoiceItems();
  return { data: rows.map(mapper.toResponse), size: rows.length };
};
const getInvoiceItemById = async (id) => {
  const row = await repo.getInvoiceItemById(parsePathId(id));
  if (!row) throw new AppError(404, "Invoice item not found");
  return mapper.toResponse(row);
};
const getInvoiceItemsByInvoiceId = async (invoiceId) => {
  const rows = await repo.getInvoiceItemsByInvoiceIdForUser(parsePathId(invoiceId));
  return { data: rows.map(mapper.toResponse), size: rows.length };
};
const updateInvoiceItem = async (id, body) => {
  const parsedId = parsePathId(id);
  const current = await repo.getInvoiceItemById(parsedId);
  if (!current) throw new AppError(404, "Invoice item not found");

  const patch = parseUpdateInvoiceItem(body);
  const row = await repo.updateInvoiceItem(parsedId, mapper.toEntity(patch));
  if (!row) throw new AppError(404, "Invoice item not found");
  await refreshInvoiceTotal(row.invoice_id);
  return mapper.toResponse(row);
};
const deleteInvoiceItem = async (id) => {
  const parsedId = parsePathId(id);
  const current = await repo.getInvoiceItemById(parsedId);
  if (!current) throw new AppError(404, "Invoice item not found");

  const row = await repo.deleteInvoiceItem(parsedId);
  if (!row) throw new AppError(404, "Invoice item not found");
  await refreshInvoiceTotal(current.invoice_id);
  return { id: row.id };
};

module.exports = { createInvoiceItem, getAllInvoiceItems, getInvoiceItemById, getInvoiceItemsByInvoiceId, updateInvoiceItem, deleteInvoiceItem };
