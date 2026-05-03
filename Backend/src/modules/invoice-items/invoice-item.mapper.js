const toEntity = (req) => ({
  invoice_id: req.invoiceId ?? req.invoice_id,
  item_name: req.itemName ?? req.item_name,
  amount: req.amount,
  meter_id: req.meterId ?? req.meter_id,
});

const toResponse = (row) => ({
  id: row.id,
  invoiceId: row.invoice_id,
  itemName: row.item_name,
  amount: Number(row.amount),
  meterId: row.meter_id,
  deletedAt: row.deleted_at || null,
});

module.exports = { toEntity, toResponse };
