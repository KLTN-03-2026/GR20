const toEntity = (req) => ({
  invoice_id: req.invoiceId ?? req.invoice_id,
  amount: req.amount,
  payment_method: req.paymentMethod ?? req.payment_method,
  payment_gateway: req.paymentGateway ?? req.payment_gateway,
  gateway_transaction_no: req.gatewayTransactionNo ?? req.gateway_transaction_no,
  response_code: req.responseCode ?? req.response_code,
  status: req.status,
  payment_date: req.paymentDate ?? req.payment_date,
});

const toResponse = (row) => ({
  id: row.id,
  invoiceId: row.invoice_id,
  amount: Number(row.amount),
  paymentMethod: row.payment_method,
  paymentGateway: row.payment_gateway,
  gatewayTransactionNo: row.gateway_transaction_no,
  responseCode: row.response_code,
  status: row.status,
  paymentDate: row.payment_date,
  createdAt: row.created_at,
  deletedAt: row.deleted_at || null,
});

module.exports = { toEntity, toResponse };
