const { AppError } = require("../../common/app-error");
const repo = require("./billing.repository");
const { parseGenerateInvoice } = require("./billing.request");

const formatMoney = (value) => Number(value).toFixed(2);

const generateInvoiceAndCashPayment = async (body) => {
  const { apartmentId, billingMonth, billingYear, dueDate } = parseGenerateInvoice(body);

  const apartment = await repo.getApartmentById(apartmentId);
  if (!apartment) throw new AppError(404, "Apartment not found");

  const meters = await repo.getActiveMetersByApartment(apartmentId);
  if (meters.length === 0) {
    throw new AppError(400, "No active utility meters found for this apartment");
  }

  const calculatedItems = [];
  for (const meter of meters) {
    const reading = await repo.getLatestReadingByMonth(meter.id, billingMonth, billingYear);
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
      meterType: meter.meter_type,
      meterCode: meter.meter_code,
      itemName: `${meter.meter_type} ${billingMonth}/${billingYear}`,
      unit: pricing.unit,
      pricePerUnit: Number(pricing.price_per_unit),
      consumption,
      amount,
    });
  }

  if (calculatedItems.length === 0) {
    throw new AppError(400, "No meter readings found for this billing period");
  }

  const totalAmount = Number(calculatedItems.reduce((sum, item) => sum + item.amount, 0).toFixed(2));
  const invoiceCode = `INV-${billingYear}${String(billingMonth).padStart(2, "0")}-${apartmentId}-${Date.now()}`;

  return repo.withTransaction(async (client) => {
    const invoice = await repo.createInvoice(
      {
        invoiceCode,
        apartmentId,
        totalAmount,
        billingMonth,
        billingYear,
        dueDate,
      },
      client
    );

    for (const item of calculatedItems) {
      await repo.createInvoiceItem(
        {
          invoiceId: invoice.id,
          itemName: item.itemName,
          amount: item.amount,
          meterId: item.meterId,
        },
        client
      );
    }

    const payment = await repo.createCashPayment(
      {
        invoiceId: invoice.id,
        amount: totalAmount,
      },
      client
    );

    await repo.markInvoicePaid(invoice.id, client);

    return {
      invoice: {
        id: invoice.id,
        invoiceCode: invoice.invoice_code,
        apartmentId,
        billingMonth,
        billingYear,
        totalAmount: formatMoney(totalAmount),
        status: "PAID",
      },
      items: calculatedItems.map((item) => ({
        meterId: item.meterId,
        meterType: item.meterType,
        meterCode: item.meterCode,
        itemName: item.itemName,
        unit: item.unit,
        pricePerUnit: formatMoney(item.pricePerUnit),
        consumption: item.consumption,
        amount: formatMoney(item.amount),
      })),
      payment: {
        id: payment.id,
        invoiceId: invoice.id,
        method: "CASH",
        status: "SUCCESS",
        amount: formatMoney(totalAmount),
      },
    };
  });
};

module.exports = {
  generateInvoiceAndCashPayment,
};
