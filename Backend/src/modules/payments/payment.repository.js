const { pool } = require("../../configs/database.config");

const createPayment = async (entity) => {
  const result = await pool.query(
    `
      INSERT INTO payments (invoice_id, amount, payment_method, payment_gateway, gateway_transaction_no, response_code, status, payment_date)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING id
    `,
    [
      entity.invoice_id,
      entity.amount,
      entity.payment_method || null,
      entity.payment_gateway || null,
      entity.gateway_transaction_no || null,
      entity.response_code || null,
      entity.status || "PENDING",
      entity.payment_date || null,
    ]
  );
  return result.rows[0];
};

const getAllPayments = async ({ page = 0, size = 10, invoiceId, status, paymentMethod, includeDeleted = false } = {}) => {
  const conditions = [];
  const values = [];
  let index = 1;

  if (!includeDeleted) {
    conditions.push(`deleted_at IS NULL`);
  }
  if (invoiceId) {
    conditions.push(`invoice_id = $${index++}`);
    values.push(invoiceId);
  }
  if (status) {
    conditions.push(`status = $${index++}`);
    values.push(status);
  }
  if (paymentMethod) {
    conditions.push(`payment_method = $${index++}`);
    values.push(paymentMethod);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const countResult = await pool.query(`SELECT COUNT(*)::int AS total FROM payments ${whereClause}`, values);
  const offset = page * size;
  const result = await pool.query(
    `SELECT * FROM payments ${whereClause} ORDER BY id DESC LIMIT $${index++} OFFSET $${index++}`,
    [...values, size, offset]
  );
  return { rows: result.rows, total: countResult.rows[0]?.total || 0 };
};

const getPaymentById = async (id) => {
  const result = await pool.query(`SELECT * FROM payments WHERE id = $1 AND deleted_at IS NULL`, [id]);
  return result.rows[0];
};

const getPaymentDetailById = async (id) => {
  const result = await pool.query(
    `
      SELECT
        p.*,
        i.invoice_code,
        i.apartment_id,
        i.billing_month,
        i.billing_year,
        i.status AS invoice_status
      FROM payments p
      LEFT JOIN invoices i ON i.id = p.invoice_id
      WHERE p.id = $1
    `,
    [id]
  );
  return result.rows[0];
};

const getLatestPaymentByInvoiceId = async (invoiceId) => {
  const result = await pool.query(
    `SELECT * FROM payments WHERE invoice_id = $1 AND deleted_at IS NULL ORDER BY id DESC LIMIT 1`,
    [invoiceId]
  );
  return result.rows[0];
};

const getPaymentsByUserId = async ({ userId, page = 0, size = 10, status } = {}) => {
  const conditions = [`rp.user_id = $1`, `rp.move_out_date IS NULL`, `p.deleted_at IS NULL`];
  const values = [userId];
  let index = 2;

  if (status) {
    conditions.push(`p.status = $${index++}`);
    values.push(status);
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`;
  const countResult = await pool.query(
    `
      SELECT COUNT(*)::int AS total
      FROM payments p
      JOIN invoices i ON i.id = p.invoice_id
      JOIN resident_profiles rp ON rp.apartment_id = i.apartment_id
      ${whereClause}
    `,
    values
  );

  const offset = page * size;
  const result = await pool.query(
    `
      SELECT
        p.*,
        i.invoice_code,
        i.apartment_id,
        i.billing_month,
        i.billing_year,
        i.status AS invoice_status
      FROM payments p
      JOIN invoices i ON i.id = p.invoice_id
      JOIN resident_profiles rp ON rp.apartment_id = i.apartment_id
      ${whereClause}
      ORDER BY p.id DESC
      LIMIT $${index++} OFFSET $${index++}
    `,
    [...values, size, offset]
  );
  return { rows: result.rows, total: countResult.rows[0]?.total || 0 };
};

const getPaymentByUserAndId = async ({ userId, paymentId }) => {
  const result = await pool.query(
    `
      SELECT
        p.*,
        i.invoice_code,
        i.apartment_id,
        i.billing_month,
        i.billing_year,
        i.status AS invoice_status
      FROM payments p
      JOIN invoices i ON i.id = p.invoice_id
      JOIN resident_profiles rp ON rp.apartment_id = i.apartment_id
      WHERE rp.user_id = $1
        AND rp.move_out_date IS NULL
        AND p.deleted_at IS NULL
        AND p.id = $2
      ORDER BY p.id DESC
      LIMIT 1
    `,
    [userId, paymentId]
  );
  return result.rows[0];
};

const findPendingPaymentByTransferContent = async (content) => {
  const result = await pool.query(
    `
      SELECT *
      FROM payments
      WHERE deleted_at IS NULL
        AND status = 'PENDING'
        AND gateway_transaction_no = $1
      ORDER BY id DESC
      LIMIT 1
    `,
    [content]
  );
  return result.rows[0];
};

const findPendingPaymentByTransferContentLike = async (contentToken) => {
  const result = await pool.query(
    `
      SELECT *
      FROM payments
      WHERE deleted_at IS NULL
        AND status = 'PENDING'
        AND gateway_transaction_no ILIKE '%' || $1 || '%'
      ORDER BY id DESC
      LIMIT 1
    `,
    [contentToken]
  );
  return result.rows[0];
};

const findLatestPendingPaymentByInvoiceId = async (invoiceId) => {
  const result = await pool.query(
    `
      SELECT *
      FROM payments
      WHERE deleted_at IS NULL
        AND status = 'PENDING'
        AND invoice_id = $1
      ORDER BY id DESC
      LIMIT 1
    `,
    [invoiceId]
  );
  return result.rows[0];
};

const markPaymentSuccess = async ({ paymentId, responseCode, gatewayTransactionNo, paidAt }) => {
  const result = await pool.query(
    `
      UPDATE payments
      SET status = 'SUCCESS',
          response_code = $2,
          gateway_transaction_no = COALESCE($3, gateway_transaction_no),
          payment_date = $4
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `,
    [paymentId, responseCode || "00", gatewayTransactionNo || null, paidAt || new Date().toISOString()]
  );
  return result.rows[0];
};

const markInvoicePaid = async (invoiceId) => {
  await pool.query(`UPDATE invoices SET status = 'PAID' WHERE id = $1 AND status <> 'CANCELLED'`, [invoiceId]);
};

const updatePayment = async (id, entity) => {
  const fields = [];
  const values = [];
  let index = 1;
  Object.entries(entity).forEach(([k, v]) => {
    if (v !== undefined) {
      fields.push(`${k} = $${index++}`);
      values.push(v);
    }
  });
  values.push(id);
  const result = await pool.query(
    `UPDATE payments SET ${fields.join(", ")} WHERE id = $${index} AND deleted_at IS NULL RETURNING *`,
    values
  );
  return result.rows[0];
};

const deletePayment = async (id) => {
  const result = await pool.query(`UPDATE payments SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id`, [id]);
  return result.rows[0];
};

const restorePayment = async (id) => {
  const result = await pool.query(`UPDATE payments SET deleted_at = NULL WHERE id = $1 AND deleted_at IS NOT NULL RETURNING id`, [id]);
  return result.rows[0];
};

module.exports = {
  createPayment,
  getAllPayments,
  getPaymentById,
  getPaymentDetailById,
  getLatestPaymentByInvoiceId,
  getPaymentsByUserId,
  getPaymentByUserAndId,
  findPendingPaymentByTransferContent,
  findPendingPaymentByTransferContentLike,
  findLatestPendingPaymentByInvoiceId,
  markPaymentSuccess,
  markInvoicePaid,
  updatePayment,
  deletePayment,
  restorePayment,
};
