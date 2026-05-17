const { AppError } = require("../../common/app-error");
const repo = require("./billing.repository");
const { parseGenerateInvoice } = require("./billing.request");
const { buildCalculatedInvoiceLines } = require("../invoices/invoice.service");

const formatMoney = (value) => Number(value).toFixed(2);

const generateInvoiceAndCashPayment = async (body) => {
  const { apartmentId, billingMonth, billingYear, dueDate } = parseGenerateInvoice(body);

  const apartment = await repo.getApartmentById(apartmentId);
  if (!apartment) throw new AppError(404, "Apartment not found");

  const calculatedLines = await buildCalculatedInvoiceLines({
    apartmentId,
    billingMonth,
    billingYear,
  });

  if (calculatedLines.length === 0) {
    throw new AppError(
      400,
      "No billable lines: need meter readings and utility pricing for this period, and/or an active RENT contract with monthly rent"
    );
  }

  const totalAmount = Number(calculatedLines.reduce((sum, item) => sum + item.amount, 0).toFixed(2));
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

    for (const item of calculatedLines) {
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
      items: calculatedLines.map((item) => ({
        meterId: item.meterId,
        itemName: item.itemName,
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
