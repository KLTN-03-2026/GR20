const { AppError } = require("../../common/app-error");
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
  if (!apartment) throw new AppError(404, "Apartment not found");

  const meters = await repo.getActiveMetersByApartment(payload.apartmentId);
  if (meters.length === 0) {
    throw new AppError(400, "No active utility meters found for this apartment");
  }

  const calculatedItems = [];
  for (const meter of meters) {
    const reading = await repo.getLatestReadingByMonth(meter.id, payload.billingMonth, payload.billingYear);
    if (!reading) continue;

    const pricing = await repo.getActivePriceByMeterTypeAtDate(meter.meter_type, reading.reading_date);
    if (!pricing) {
      throw new AppError(400, `No active pricing found for meter type ${meter.meter_type}`);
    }

    const consumption =
      reading.consumption !== null && reading.consumption !== undefined
        ? Number(reading.consumption)
        : Number(reading.current_reading) - Number(reading.previous_reading);

    if (consumption < 0) {
      throw new AppError(400, `Invalid reading for meter ${meter.meter_code || meter.id}: negative consumption`);
    }

    const amount = Number((consumption * Number(pricing.price_per_unit)).toFixed(2));
    calculatedItems.push({
      meterId: meter.id,
      itemName: `${meter.meter_type} ${payload.billingMonth}/${payload.billingYear}`,
      amount,
    });
  }

  if (calculatedItems.length === 0) {
    throw new AppError(400, "No meter readings found for this billing period");
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
  if (!row) throw new AppError(404, "Invoice not found");
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
  if (!row) throw new AppError(404, "Invoice not found");
  return mapper.toResponse(row);
};
const updateInvoice = async (id, body) => {
  const row = await repo.updateInvoice(parsePathId(id), mapper.toEntity(parseUpdateInvoice(body)));
  if (!row) throw new AppError(404, "Invoice not found");
  return mapper.toResponse(row);
};
const deleteInvoice = async (id) => {
  const row = await repo.deleteInvoice(parsePathId(id));
  if (!row) throw new AppError(404, "Invoice not found");
  return { id: row.id };
};

const restoreInvoice = async (id) => {
  const row = await repo.restoreInvoice(parsePathId(id));
  if (!row) throw new AppError(404, "Invoice not found or not cancelled");
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
