const { pool } = require("../../configs/database.config");
const { AppError } = require("../../common/app-error");

const getApartmentById = async (apartmentId, client = pool) => {
  const result = await client.query(`SELECT id, apartment_code FROM apartments WHERE id = $1`, [apartmentId]);
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

const createInvoice = async ({ invoiceCode, apartmentId, totalAmount, billingMonth, billingYear, dueDate }, client = pool) => {
  const result = await client.query(
    `
      INSERT INTO invoices (invoice_code, apartment_id, total_amount, status, billing_month, billing_year, due_date)
      VALUES ($1, $2, $3, 'PENDING', $4, $5, $6)
      RETURNING id, invoice_code
    `,
    [invoiceCode, apartmentId, totalAmount, billingMonth, billingYear, dueDate || null]
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

const createCashPayment = async ({ invoiceId, amount }, client = pool) => {
  const result = await client.query(
    `
      INSERT INTO payments (
        invoice_id, amount, payment_method, payment_gateway, gateway_transaction_no, response_code, status, payment_date
      )
      VALUES ($1, $2, 'CASH', 'OFFLINE', NULL, '00', 'SUCCESS', NOW())
      RETURNING id
    `,
    [invoiceId, amount]
  );
  return result.rows[0];
};

const markInvoicePaid = async (invoiceId, client = pool) => {
  await client.query(`UPDATE invoices SET status = 'PAID' WHERE id = $1`, [invoiceId]);
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

module.exports = {
  getApartmentById,
  getActiveMetersByApartment,
  getLatestReadingByMonth,
  getActivePriceByMeterTypeAtDate,
  createInvoice,
  createInvoiceItem,
  createCashPayment,
  markInvoicePaid,
  withTransaction,
};
