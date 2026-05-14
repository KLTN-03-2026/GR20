const { pool } = require("../../configs/database.config");

const createInvoice = async (entity, client = pool) => {
  const result = await client.query(
    `
      INSERT INTO invoices (invoice_code, apartment_id, total_amount, status, billing_month, billing_year, due_date)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING id
    `,
    [
      entity.invoice_code || null,
      entity.apartment_id,
      entity.total_amount,
      entity.status || "PENDING",
      entity.billing_month || null,
      entity.billing_year || null,
      entity.due_date || null,
    ]
  );
  return result.rows[0];
};

const getApartmentById = async (apartmentId, client = pool) => {
  const result = await client.query(`SELECT id FROM apartments WHERE id = $1`, [apartmentId]);
  return result.rows[0];
};

/** Hợp đồng thuê (RENT) đang ACTIVE, có tiền thuê, giao với kỳ hóa đơn (tháng/năm). */
const getActiveRentContractForBillingMonth = async (apartmentId, billingMonth, billingYear, client = pool) => {
  const result = await client.query(
    `
      SELECT id, monthly_rent, contract_type, start_date, end_date
      FROM contracts
      WHERE apartment_id = $1
        AND status = 'ACTIVE'
        AND contract_type = 'RENT'
        AND COALESCE(monthly_rent, 0) > 0
        AND start_date <= (make_date($3::int, $2::int, 1) + INTERVAL '1 month' - INTERVAL '1 day')
        AND end_date >= make_date($3::int, $2::int, 1)
      ORDER BY id DESC
      LIMIT 1
    `,
    [apartmentId, billingMonth, billingYear]
  );
  return result.rows[0];
};

const getActiveMetersByApartment = async (apartmentId, client = pool) => {
  const result = await client.query(
    `
      SELECT id, meter_type, meter_code
      FROM utility_meters
      WHERE apartment_id = $1 AND status = 'ACTIVE'
      ORDER BY id ASC
    `,
    [apartmentId]
  );
  return result.rows;
};

const getLatestReadingByMonth = async (meterId, billingMonth, billingYear, client = pool) => {
  const byMonthResult = await client.query(
    `
      WITH period AS (
        SELECT make_date($3, $2, 1) AS month_start
      )
      SELECT id, reading_date, previous_reading, current_reading, consumption
      FROM meter_readings
      WHERE meter_id = $1
        AND deleted_at IS NULL
        AND reading_date >= (SELECT month_start FROM period)
        AND reading_date < ((SELECT month_start FROM period) + INTERVAL '1 month')
      ORDER BY reading_date DESC, id DESC
      LIMIT 1
    `,
    [meterId, billingMonth, billingYear]
  );
  if (byMonthResult.rows[0]) return byMonthResult.rows[0];

  const fallbackResult = await client.query(
    `
      WITH period AS (
        SELECT (make_date($3, $2, 1) + INTERVAL '1 month') AS next_month_start
      )
      SELECT id, reading_date, previous_reading, current_reading, consumption
      FROM meter_readings
      WHERE meter_id = $1
        AND deleted_at IS NULL
        AND reading_date < (SELECT next_month_start FROM period)
      ORDER BY reading_date DESC, id DESC
      LIMIT 1
    `,
    [meterId, billingMonth, billingYear]
  );
  return fallbackResult.rows[0];
};

const getActivePriceByMeterTypeAtDate = async (meterType, onDate, client = pool) => {
  const result = await client.query(
    `
      SELECT id, meter_type, price_per_unit, unit, effective_from
      FROM utility_pricing
      WHERE meter_type = $1
        AND is_active = true
        AND effective_from <= $2::date
      ORDER BY effective_from DESC, id DESC
      LIMIT 1
    `,
    [meterType, onDate]
  );
  return result.rows[0];
};

const createInvoiceItem = async ({ invoiceId, itemName, amount, meterId }, client = pool) => {
  await client.query(
    `
      INSERT INTO invoice_items (invoice_id, item_name, amount, meter_id)
      VALUES ($1, $2, $3, $4)
    `,
    [invoiceId, itemName, amount, meterId || null]
  );
};

const createPendingPaymentForInvoice = async ({ invoiceId, amount }, client = pool) => {
  const result = await client.query(
    `
      INSERT INTO payments (invoice_id, amount, payment_method, payment_gateway, gateway_transaction_no, response_code, status, payment_date)
      VALUES ($1, $2, NULL, 'OFFLINE', NULL, NULL, 'PENDING', NULL)
      RETURNING id
    `,
    [invoiceId, amount]
  );
  return result.rows[0];
};

const updateInvoiceTotalAmount = async (invoiceId, totalAmount, client = pool) => {
  await client.query(`UPDATE invoices SET total_amount = $1 WHERE id = $2`, [totalAmount, invoiceId]);
};

/** Hóa đơn tự động (có kỳ) chưa thanh toán có dòng tiền gắn meter_id — cần tính lại khi xóa đồng hồ. */
const getUnpaidAutomatedInvoiceIdsByMeterId = async (meterId, client = pool) => {
  const result = await client.query(
    `
      SELECT DISTINCT i.id
      FROM invoices i
      JOIN invoice_items ii ON ii.invoice_id = i.id
      WHERE ii.meter_id = $1
        AND i.status IN ('PENDING', 'OVERDUE')
        AND i.billing_month IS NOT NULL
        AND i.billing_year IS NOT NULL
    `,
    [meterId]
  );
  return result.rows.map((r) => r.id);
};

const deleteInvoiceItemsByInvoiceId = async (invoiceId, client = pool) => {
  await client.query(`DELETE FROM invoice_items WHERE invoice_id = $1`, [invoiceId]);
};

const updatePendingPaymentsAmountForInvoice = async (invoiceId, amount, client = pool) => {
  await client.query(
    `
      UPDATE payments
      SET amount = $1
      WHERE invoice_id = $2
        AND status = 'PENDING'
        AND deleted_at IS NULL
    `,
    [amount, invoiceId]
  );
};

const withTransaction = async (fn) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const getAllInvoices = async ({ page = 0, size = 10 } = {}) => {
  const countResult = await pool.query(`SELECT COUNT(*)::int AS total FROM invoices`);
  const offset = page * size;
  const result = await pool.query(`SELECT * FROM invoices ORDER BY id DESC LIMIT $1 OFFSET $2`, [size, offset]);
  return { rows: result.rows, total: countResult.rows[0]?.total || 0 };
};

const getInvoiceById = async (id) => {
  const result = await pool.query(`SELECT * FROM invoices WHERE id = $1`, [id]);
  return result.rows[0];
};

const getInvoicesByUserId = async ({ userId, page = 0, size = 10, status } = {}) => {
  const conditions = [`rp.user_id = $1`, `rp.move_out_date IS NULL`];
  const values = [userId];
  let index = 2;

  if (status) {
    conditions.push(`i.status = $${index++}`);
    values.push(status);
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`;
  const countResult = await pool.query(
    `
      SELECT COUNT(*)::int AS total
      FROM invoices i
      JOIN resident_profiles rp ON rp.apartment_id = i.apartment_id
      ${whereClause}
    `,
    values
  );

  const offset = page * size;
  const result = await pool.query(
    `
      SELECT i.*
      FROM invoices i
      JOIN resident_profiles rp ON rp.apartment_id = i.apartment_id
      ${whereClause}
      ORDER BY i.id DESC
      LIMIT $${index++} OFFSET $${index++}
    `,
    [...values, size, offset]
  );
  return { rows: result.rows, total: countResult.rows[0]?.total || 0 };
};

const getInvoiceByUserAndId = async ({ userId, invoiceId }) => {
  const result = await pool.query(
    `
      SELECT i.*
      FROM invoices i
      JOIN resident_profiles rp ON rp.apartment_id = i.apartment_id
      WHERE rp.user_id = $1
        AND rp.move_out_date IS NULL
        AND i.id = $2
      LIMIT 1
    `,
    [userId, invoiceId]
  );
  return result.rows[0];
};

const updateInvoice = async (id, entity) => {
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
    `UPDATE invoices SET ${fields.join(", ")} WHERE id = $${index} AND status <> 'CANCELLED' RETURNING *`,
    values
  );
  return result.rows[0];
};

const deleteInvoice = async (id) => {
  const result = await pool.query(
    `UPDATE invoices SET status = 'CANCELLED' WHERE id = $1 AND status <> 'CANCELLED' RETURNING id`,
    [id]
  );
  return result.rows[0];
};

const restoreInvoice = async (id) => {
  const result = await pool.query(
    `UPDATE invoices SET status = 'PENDING' WHERE id = $1 AND status = 'CANCELLED' RETURNING id`,
    [id]
  );
  return result.rows[0];
};

module.exports = {
  createInvoice,
  getApartmentById,
  getActiveRentContractForBillingMonth,
  getActiveMetersByApartment,
  getLatestReadingByMonth,
  getActivePriceByMeterTypeAtDate,
  createInvoiceItem,
  createPendingPaymentForInvoice,
  updateInvoiceTotalAmount,
  getUnpaidAutomatedInvoiceIdsByMeterId,
  deleteInvoiceItemsByInvoiceId,
  updatePendingPaymentsAmountForInvoice,
  withTransaction,
  getAllInvoices,
  getInvoiceById,
  getInvoicesByUserId,
  getInvoiceByUserAndId,
  updateInvoice,
  deleteInvoice,
  restoreInvoice,
};
