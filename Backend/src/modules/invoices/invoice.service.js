const { pool } = require("../../configs/database.config");
const { AppError } = require("../../common/app-error");
const ERROR_CODES = require("./invoice-errors");
const repo = require("./invoice.repository");
const mapper = require("./invoice.mapper");
const { parsePathId, parseCreateInvoice, parseUpdateInvoice, parseInvoiceListQuery, parseInvoiceUserQuery } = require("./invoice.request");

/**
 * @param {{ apartmentId: number, billingMonth: number, billingYear: number }} params
 * @param {import("pg").PoolClient} [client]
 * @returns {Promise<Array<{ meterId: number | null, itemName: string, amount: number }>>}
 */
const buildCalculatedInvoiceLines = async ({ apartmentId, billingMonth, billingYear }, client = pool) => {
  const rentContract = await repo.getActiveRentContractForBillingMonth(apartmentId, billingMonth, billingYear, client);
  const rentAmount = rentContract ? Number(rentContract.monthly_rent) : 0;

  const meters = await repo.getActiveMetersByApartment(apartmentId, client);

  const calculatedItems = [];
  for (const meter of meters) {
    const reading = await repo.getLatestReadingByMonth(meter.id, billingMonth, billingYear, client);
    if (!reading) continue;

    const pricing = await repo.getActivePriceByMeterTypeAtDate(meter.meter_type, reading.reading_date, client);
    if (!pricing) {
      throw new AppError(
        400,
        `No active pricing found for meter type ${meter.meter_type}`,
        { meterType: meter.meter_type },
        ERROR_CODES.NO_ACTIVE_PRICING_FOR_METER_TYPE
      );
    }

    const consumption =
      reading.consumption !== null && reading.consumption !== undefined
        ? Number(reading.consumption)
        : Number(reading.current_reading) - Number(reading.previous_reading);

    if (consumption < 0) {
      throw new AppError(
        400,
        `Invalid reading for meter ${meter.meter_code || meter.id}: negative consumption`,
        { meterId: meter.id },
        ERROR_CODES.INVALID_METER_READING_CONSUMPTION
      );
    }

    const amount = Number((consumption * Number(pricing.price_per_unit)).toFixed(2));
    calculatedItems.push({
      meterId: meter.id,
      itemName: `${meter.meter_type} ${billingMonth}/${billingYear}`,
      amount,
    });
  }

  if (rentAmount > 0) {
    calculatedItems.push({
      meterId: null,
      itemName: `Tiền thuê tháng ${billingMonth}/${billingYear}`,
      amount: Number(rentAmount.toFixed(2)),
    });
  }

  return calculatedItems;
};

/** Sau khi xóa đồng hồ: tính lại dòng tiền / tổng / thanh toán PENDING cho hóa đơn tự động chưa trả. */
const recalculateUnpaidAutomatedInvoiceById = async (invoiceId) => {
  const inv = await repo.getInvoiceById(invoiceId);
  if (!inv || !["PENDING", "OVERDUE"].includes(inv.status)) return;
  if (inv.billing_month == null || inv.billing_year == null) return;

  await repo.withTransaction(async (client) => {
    const calculatedItems = await buildCalculatedInvoiceLines(
      {
        apartmentId: inv.apartment_id,
        billingMonth: inv.billing_month,
        billingYear: inv.billing_year,
      },
      client
    );

    await repo.deleteInvoiceItemsByInvoiceId(inv.id, client);

    if (calculatedItems.length === 0) {
      await repo.updateInvoiceTotalAmount(inv.id, 0, client);
      await repo.updatePendingPaymentsAmountForInvoice(inv.id, 0, client);
      return;
    }

    for (const item of calculatedItems) {
      await repo.createInvoiceItem(
        {
          invoiceId: inv.id,
          itemName: item.itemName,
          amount: item.amount,
          meterId: item.meterId,
        },
        client
      );
    }
    const totalAmount = Number(calculatedItems.reduce((sum, item) => sum + item.amount, 0).toFixed(2));
    await repo.updateInvoiceTotalAmount(inv.id, totalAmount, client);
    await repo.updatePendingPaymentsAmountForInvoice(inv.id, totalAmount, client);
  });
};

const listUnpaidAutomatedInvoiceIdsByMeterId = (meterId) => repo.getUnpaidAutomatedInvoiceIdsByMeterId(meterId);

const recalculateUnpaidAutomatedInvoiceByIds = async (invoiceIds) => {
  for (const id of invoiceIds) {
    try {
      await recalculateUnpaidAutomatedInvoiceById(id);
    } catch (err) {
      console.error("[invoice] Recalculate after meter change failed", { invoiceId: id, err });
    }
  }
};

/** Sau khi ghi chỉ số: tạo mới hoặc cập nhật lại hóa đơn kỳ tương ứng (nếu có thể tính). */
const syncInvoiceAfterMeterReadingCreated = async (meterId, readingDateStr) => {
  const mRes = await pool.query(`SELECT apartment_id FROM utility_meters WHERE id = $1`, [Number(meterId)]);
  const apartmentId = mRes.rows[0]?.apartment_id;
  if (apartmentId == null) return;

  const pRes = await pool.query(
    `SELECT EXTRACT(MONTH FROM $1::date)::int AS m, EXTRACT(YEAR FROM $1::date)::int AS y`,
    [readingDateStr]
  );
  const billingMonth = Number(pRes.rows[0]?.m);
  const billingYear = Number(pRes.rows[0]?.y);
  if (!Number.isFinite(billingMonth) || !Number.isFinite(billingYear)) return;

  const existing = await repo.getEditableInvoiceForApartmentPeriod(apartmentId, billingMonth, billingYear);
  try {
    if (existing) {
      await recalculateUnpaidAutomatedInvoiceById(existing.id);
      return;
    }
    await createInvoice({
      apartmentId,
      billingMonth,
      billingYear,
    });
  } catch (err) {
    console.error("[invoice] syncInvoiceAfterMeterReadingCreated", {
      meterId,
      readingDateStr,
      apartmentId,
      billingMonth,
      billingYear,
      err: err?.message,
    });
  }
};

const createInvoice = async (body) => {
  const payload = parseCreateInvoice(body);
  const entity = mapper.toEntity(payload);

  if (payload.totalAmount !== undefined) {
    return repo.withTransaction(async (client) => {
      const result = await repo.createInvoice(entity, client);
      const amount = Number(payload.totalAmount);
      const payment = await repo.createPendingPaymentForInvoice({ invoiceId: result.id, amount }, client);
      return { id: result.id, paymentId: payment.id };
    });
  }

  const apartment = await repo.getApartmentById(payload.apartmentId);
  if (!apartment)
    throw new AppError(404, "Apartment not found", undefined, ERROR_CODES.APARTMENT_NOT_FOUND_FOR_INVOICE);

  const calculatedItems = await buildCalculatedInvoiceLines({
    apartmentId: payload.apartmentId,
    billingMonth: payload.billingMonth,
    billingYear: payload.billingYear,
  });

  if (calculatedItems.length === 0) {
    throw new AppError(
      400,
      "No billable lines: need meter readings and utility pricing for this period, and/or an active RENT contract with monthly rent",
      undefined,
      ERROR_CODES.NO_BILLABLE_ITEMS_FOR_INVOICE
    );
  }

  const totalAmount = Number(calculatedItems.reduce((sum, item) => sum + item.amount, 0).toFixed(2));

  return repo.withTransaction(async (client) => {
    const invoiceResult = await repo.createInvoice(
      {
        ...entity,
        invoice_code:
          entity.invoice_code ||
          `INV-${payload.billingYear}${String(payload.billingMonth).padStart(2, "0")}-${payload.apartmentId}-${Date.now()}`,
        total_amount: 0,
      },
      client
    );

    for (const item of calculatedItems) {
      await repo.createInvoiceItem(
        {
          invoiceId: invoiceResult.id,
          itemName: item.itemName,
          amount: item.amount,
          meterId: item.meterId,
        },
        client
      );
    }

    await repo.updateInvoiceTotalAmount(invoiceResult.id, totalAmount, client);
    const payment = await repo.createPendingPaymentForInvoice({ invoiceId: invoiceResult.id, amount: totalAmount }, client);
    return { id: invoiceResult.id, paymentId: payment.id };
  });
};
const getAllInvoices = async (query) => {
  const parsedQuery = parseInvoiceListQuery(query);
  const result = await repo.getAllInvoices(parsedQuery);
  return {
    data: result.rows.map(mapper.toResponse),
    size: result.rows.length,
    totalElements: result.total,
    totalPages: Math.ceil(result.total / parsedQuery.size),
    page: parsedQuery.page,
    pageSize: parsedQuery.size,
  };
};
const getInvoiceById = async (id) => {
  const row = await repo.getInvoiceById(parsePathId(id));
  if (!row) throw new AppError(404, "Invoice not found", undefined, ERROR_CODES.INVOICE_NOT_FOUND);
  return mapper.toResponse(row);
};
const getInvoicesByUserId = async (userId, query) => {
  const parsedUserId = parsePathId(userId);
  const parsedQuery = parseInvoiceUserQuery(query);
  const result = await repo.getInvoicesByUserId({ userId: parsedUserId, ...parsedQuery });
  return {
    data: result.rows.map(mapper.toResponse),
    size: result.rows.length,
    totalElements: result.total,
    totalPages: Math.ceil(result.total / parsedQuery.size),
    page: parsedQuery.page,
    pageSize: parsedQuery.size,
  };
};
const getInvoiceByUserAndId = async (userId, invoiceId) => {
  const parsedUserId = parsePathId(userId);
  const parsedInvoiceId = parsePathId(invoiceId);
  const row = await repo.getInvoiceByUserAndId({ userId: parsedUserId, invoiceId: parsedInvoiceId });
  if (!row) throw new AppError(404, "Invoice not found", undefined, ERROR_CODES.INVOICE_NOT_FOUND);
  return mapper.toResponse(row);
};
const updateInvoice = async (id, body) => {
  const row = await repo.updateInvoice(parsePathId(id), mapper.toEntity(parseUpdateInvoice(body)));
  if (!row) throw new AppError(404, "Invoice not found", undefined, ERROR_CODES.INVOICE_NOT_FOUND);
  return mapper.toResponse(row);
};
const deleteInvoice = async (id) => {
  const row = await repo.deleteInvoice(parsePathId(id));
  if (!row) throw new AppError(404, "Invoice not found", undefined, ERROR_CODES.INVOICE_NOT_FOUND);
  return { id: row.id };
};

const restoreInvoice = async (id) => {
  const row = await repo.restoreInvoice(parsePathId(id));
  if (!row)
    throw new AppError(404, "Invoice not found or not cancelled", undefined, ERROR_CODES.INVOICE_NOT_CANCELLED_FOR_RESTORE);
  return { id: row.id };
};

module.exports = {
  createInvoice,
  buildCalculatedInvoiceLines,
  listUnpaidAutomatedInvoiceIdsByMeterId,
  recalculateUnpaidAutomatedInvoiceByIds,
  syncInvoiceAfterMeterReadingCreated,
  getAllInvoices,
  getInvoiceById,
  getInvoicesByUserId,
  getInvoiceByUserAndId,
  updateInvoice,
  deleteInvoice,
  restoreInvoice,
};
