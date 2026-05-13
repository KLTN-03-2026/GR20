const { AppError } = require("../../common/app-error");
const ERROR_CODES = require("./invoice-errors");
const repo = require("./invoice.repository");
const mapper = require("./invoice.mapper");
const { parsePathId, parseCreateInvoice, parseUpdateInvoice, parseInvoiceListQuery, parseInvoiceUserQuery } = require("./invoice.request");

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

  const rentContract = await repo.getActiveRentContractForBillingMonth(
    payload.apartmentId,
    payload.billingMonth,
    payload.billingYear
  );
  const rentAmount = rentContract ? Number(rentContract.monthly_rent) : 0;

  const meters = await repo.getActiveMetersByApartment(payload.apartmentId);

  const calculatedItems = [];
  for (const meter of meters) {
    const reading = await repo.getLatestReadingByMonth(meter.id, payload.billingMonth, payload.billingYear);
    if (!reading) continue;

    const pricing = await repo.getActivePriceByMeterTypeAtDate(meter.meter_type, reading.reading_date);
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
      itemName: `${meter.meter_type} ${payload.billingMonth}/${payload.billingYear}`,
      amount,
    });
  }

  if (rentAmount > 0) {
    calculatedItems.push({
      meterId: null,
      itemName: `Tiền thuê tháng ${payload.billingMonth}/${payload.billingYear}`,
      amount: Number(rentAmount.toFixed(2)),
    });
  }

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
  getAllInvoices,
  getInvoiceById,
  getInvoicesByUserId,
  getInvoiceByUserAndId,
  updateInvoice,
  deleteInvoice,
  restoreInvoice,
};
