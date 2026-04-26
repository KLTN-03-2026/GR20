const toEntity = (req) => ({
  invoice_code: req.invoiceCode ?? req.invoice_code,
  apartment_id: req.apartmentId ?? req.apartment_id,
  total_amount: req.totalAmount ?? req.total_amount,
  status: req.status,
  billing_month: req.billingMonth ?? req.billing_month,
  billing_year: req.billingYear ?? req.billing_year,
  due_date: req.dueDate ?? req.due_date,
});

const toResponse = (row) => ({
  id: row.id,
  invoiceCode: row.invoice_code,
  apartmentId: row.apartment_id,
  totalAmount: Number(row.total_amount),
  status: row.status,
  billingMonth: row.billing_month,
  billingYear: row.billing_year,
  dueDate: row.due_date,
  createdAt: row.created_at,
});

module.exports = { toEntity, toResponse };
