const db = require("../../config/db");

// CREATE
const createContract = async (entity) => {
  const [result] = await db.execute(
    `INSERT INTO contracts 
    (resident_id, apartment_id, contract_type, status, start_date, end_date, monthly_rent, deposit, note)
    VALUES (?, ?, ?, 'ACTIVE', ?, ?, ?, ?, ?)`,
    [
      entity.residentId,
      entity.apartmentId,
      entity.contractType,
      entity.startDate,
      entity.endDate,
      entity.monthlyRent,
      entity.deposit,
      entity.note,
    ]
  );

  return { id: result.insertId };
};

// GET LIST (FILTER + PAGINATION)
const getContracts = async ({ status, contractType, page, size }) => {
  const offset = (page - 1) * size;

  const [rows] = await db.execute(
    `SELECT c.*, r.full_name as resident_name, a.apartment_number as apartment_code
     FROM contracts c
     JOIN residents r ON c.resident_id = r.id
     JOIN apartments a ON c.apartment_id = a.id
     WHERE (? IS NULL OR c.status = ?)
     AND (? IS NULL OR c.contract_type = ?)
     LIMIT ? OFFSET ?`,
    [status, status, contractType, contractType, size, offset]
  );

  const [[{ total }]] = await db.execute(
    `SELECT COUNT(*) as total FROM contracts`
  );

  return { rows, total };
};

// GET DETAIL
const getById = async (id) => {
  const [[row]] = await db.execute(
    `SELECT * FROM contracts WHERE id=?`,
    [id]
  );
  return row;
};

// UPDATE
const updateContract = async (id, entity) => {
  await db.execute(
    `UPDATE contracts SET end_date=?, monthly_rent=?, note=? WHERE id=?`,
    [entity.endDate, entity.monthlyRent, entity.note, id]
  );
};

// DELETE (TERMINATE)
const terminateContract = async (id) => {
  await db.execute(
    `UPDATE contracts SET status='TERMINATED' WHERE id=?`,
    [id]
  );
};

// RENEW
const renewContract = async (id, data) => {
  await db.execute(
    `UPDATE contracts SET end_date=?, monthly_rent=? WHERE id=?`,
    [data.newEndDate, data.newMonthlyRent, id]
  );
};

module.exports = {
  createContract,
  getContracts,
  getById,
  updateContract,
  terminateContract,
  renewContract,
};