const { pool } = require("../../configs/database.config");

const createInvoiceItem = async (entity) => {
  const result = await pool.query(
    `INSERT INTO invoice_items (invoice_id, item_name, amount, meter_id) VALUES ($1,$2,$3,$4) RETURNING id`,
    [entity.invoice_id, entity.item_name, entity.amount, entity.meter_id || null]
  );
  return result.rows[0];
};

const getInvoiceItemsByInvoiceId = async (invoiceId) => {
  const result = await pool.query(
    `SELECT id, invoice_id, item_name, amount, meter_id FROM invoice_items WHERE invoice_id = $1 AND deleted_at IS NULL ORDER BY id ASC`,
    [invoiceId]
  );
  return result.rows;
};

const getInvoiceItemsByInvoiceIdForUser = async (invoiceId) => {
  const result = await pool.query(
    `
      SELECT ii.*
      FROM invoice_items ii
      JOIN invoices i ON i.id = ii.invoice_id
      WHERE ii.invoice_id = $1
        AND ii.deleted_at IS NULL
      ORDER BY ii.id ASC
    `,
    [invoiceId]
  );
  return result.rows;
};

const updateInvoiceTotalAmount = async (invoiceId, totalAmount) => {
  await pool.query(`UPDATE invoices SET total_amount = $1 WHERE id = $2`, [totalAmount, invoiceId]);
};

const getAllInvoiceItems = async () => {
  const result = await pool.query(`SELECT * FROM invoice_items WHERE deleted_at IS NULL ORDER BY id DESC`);
  return result.rows;
};

const getInvoiceItemById = async (id) => {
  const result = await pool.query(`SELECT * FROM invoice_items WHERE id = $1 AND deleted_at IS NULL`, [id]);
  return result.rows[0];
};

const updateInvoiceItem = async (id, entity) => {
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
    `UPDATE invoice_items SET ${fields.join(", ")} WHERE id = $${index} AND deleted_at IS NULL RETURNING *`,
    values
  );
  return result.rows[0];
};

const deleteInvoiceItem = async (id) => {
  const result = await pool.query(`UPDATE invoice_items SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id`, [id]);
  return result.rows[0];
};

module.exports = {
  createInvoiceItem,
  getInvoiceItemsByInvoiceId,
  getInvoiceItemsByInvoiceIdForUser,
  updateInvoiceTotalAmount,
  getAllInvoiceItems,
  getInvoiceItemById,
  updateInvoiceItem,
  deleteInvoiceItem,
};
