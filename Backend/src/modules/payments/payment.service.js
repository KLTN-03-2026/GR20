const { AppError } = require("../../common/app-error");
const PAY_ERR = require("./payment-errors");
const repo = require("./payment.repository");
const mapper = require("./payment.mapper");
const { parsePathId, parseCreatePayment, parseUpdatePayment, parsePaymentListQuery, parseUserPaymentsQuery } = require("./payment.request");

const VIETQR_BASE_URL = "https://img.vietqr.io/image";
const VIETQR_MB_BANK_ID = process.env.VIETQR_MB_BANK_ID || "970422";
const VIETQR_MB_ACCOUNT = process.env.VIETQR_MB_ACCOUNT || "0363159912";
const VIETQR_TEMPLATE = process.env.VIETQR_TEMPLATE || "compact2";
const VIETQR_ACCOUNT_NAME = process.env.VIETQR_ACCOUNT_NAME || "MB Bank";

const urlEncode = (value) => encodeURIComponent(value || "");
const extractTransferToken = (raw) => {
  const text = String(raw || "").trim();
  if (!text) return "";
  // Ưu tiên token đúng format hệ thống tạo khi generate QR
  const exact = text.match(/INV\d+-PAY\d+/i);
  if (exact?.[0]) return exact[0].toUpperCase();
  return text;
};

const extractInvoiceIdToken = (raw) => {
  const text = String(raw || "");
  const match = text.match(/INV(\d+)/i);
  if (!match?.[1]) return null;
  return Number(match[1]);
};

const extractWebhookAmount = (record) => {
  const candidates = [
    record?.amount,
    record?.amountMoney,
    record?.value,
    record?.transferAmount,
    record?.transactionAmount,
    record?.creditAmount,
  ];
  for (const c of candidates) {
    if (c === undefined || c === null || c === "") continue;
    const n = Number(String(c).replace(/,/g, ""));
    if (!Number.isNaN(n) && n > 0) return n;
  }
  return null;
};

const createPayment = async (body) => {
  const result = await repo.createPayment(mapper.toEntity(parseCreatePayment(body)));
  return { id: result.id };
};
const getAllPayments = async (query) => {
  const parsedQuery = parsePaymentListQuery(query);
  const result = await repo.getAllPayments(parsedQuery);
  return {
    data: result.rows.map(mapper.toResponse),
    size: result.rows.length,
    totalElements: result.total,
    totalPages: Math.ceil(result.total / parsedQuery.size),
    page: parsedQuery.page,
    pageSize: parsedQuery.size,
  };
};
const getPaymentById = async (id) => {
  const row = await repo.getPaymentById(parsePathId(id));
  if (!row) throw new AppError(404, "Không tìm thấy phiếu thanh toán", null, PAY_ERR.PAYMENT_NOT_FOUND);
  return mapper.toResponse(row);
};

const getPaymentDetailById = async (id) => {
  const row = await repo.getPaymentDetailById(parsePathId(id));
  if (!row) throw new AppError(404, "Không tìm thấy phiếu thanh toán", null, PAY_ERR.PAYMENT_NOT_FOUND);
  return {
    ...mapper.toResponse(row),
    invoiceCode: row.invoice_code || null,
    apartmentId: row.apartment_id || null,
    billingMonth: row.billing_month || null,
    billingYear: row.billing_year || null,
    invoiceStatus: row.invoice_status || null,
  };
};

const getLatestPaymentByInvoiceId = async (invoiceId) => {
  const row = await repo.getLatestPaymentByInvoiceId(parsePathId(invoiceId));
  if (!row) throw new AppError(404, "Không tìm thấy phiếu thanh toán cho hóa đơn này", null, PAY_ERR.PAYMENT_NOT_FOUND);
  return mapper.toResponse(row);
};

const getPaymentsByUserId = async (userId, query) => {
  const parsedUserId = parsePathId(userId);
  const parsedQuery = parseUserPaymentsQuery(query);
  const result = await repo.getPaymentsByUserId({ userId: parsedUserId, ...parsedQuery });
  return {
    data: result.rows.map((row) => ({
      ...mapper.toResponse(row),
      invoiceCode: row.invoice_code || null,
      apartmentId: row.apartment_id || null,
      billingMonth: row.billing_month || null,
      billingYear: row.billing_year || null,
      invoiceStatus: row.invoice_status || null,
    })),
    size: result.rows.length,
    totalElements: result.total,
    totalPages: Math.ceil(result.total / parsedQuery.size),
    page: parsedQuery.page,
    pageSize: parsedQuery.size,
  };
};
const getPaymentByUserAndId = async (userId, paymentId) => {
  const parsedUserId = parsePathId(userId);
  const parsedPaymentId = parsePathId(paymentId);
  const row = await repo.getPaymentByUserAndId({ userId: parsedUserId, paymentId: parsedPaymentId });
  if (!row) throw new AppError(404, "Không tìm thấy phiếu thanh toán hoặc không thuộc tài khoản của bạn", null, PAY_ERR.PAYMENT_NOT_FOUND);
  return {
    ...mapper.toResponse(row),
    invoiceCode: row.invoice_code || null,
    apartmentId: row.apartment_id || null,
    billingMonth: row.billing_month || null,
    billingYear: row.billing_year || null,
    invoiceStatus: row.invoice_status || null,
  };
};

const generateMbVietQrByInvoiceId = async (invoiceId) => {
  const invId = parsePathId(invoiceId);
  const payment = await repo.getLatestPaymentByInvoiceId(invId);
  if (!payment) throw new AppError(404, "Không tìm thấy phiếu thanh toán cho hóa đơn này", null, PAY_ERR.PAYMENT_NOT_FOUND);

  if (String(payment.status) === "SUCCESS") {
    throw new AppError(400, "Hóa đơn đã được thanh toán, không tạo thêm mã QR.", null, PAY_ERR.PAYMENT_ALREADY_FINALIZED);
  }
  if (String(payment.status) === "FAILED") {
    throw new AppError(400, "Phiếu thanh toán không hợp lệ để tạo QR.", null, PAY_ERR.PAYMENT_NOT_PENDING_FOR_QR);
  }

  const account = String(VIETQR_MB_ACCOUNT || "").trim();
  if (!account) {
    throw new AppError(500, "Cấu hình tài khoản VietQR chưa đủ (VIETQR_MB_ACCOUNT).", null, PAY_ERR.VIETQR_CONFIG_INVALID);
  }

  const amount = Math.round(Number(payment.amount || 0));
  if (amount <= 0) {
    throw new AppError(400, "Số tiền thanh toán không hợp lệ", null, PAY_ERR.INVALID_PAYMENT_AMOUNT);
  }

  const content = `INV${payment.invoice_id}-PAY${payment.id}`;

  await repo.updatePayment(payment.id, {
    payment_method: "BANK_TRANSFER",
    payment_gateway: "MB_VIETQR",
    gateway_transaction_no: content,
    status: payment.status || "PENDING",
  });

  const qrCodeUrl = `${VIETQR_BASE_URL}/${VIETQR_MB_BANK_ID}-${VIETQR_MB_ACCOUNT}-${VIETQR_TEMPLATE}.jpg?amount=${amount}&addInfo=${urlEncode(
    content
  )}&accountName=${urlEncode(VIETQR_ACCOUNT_NAME)}`;

  return {
    qrCodeUrl,
    amount,
    paymentMethod: "BANK_TRANSFER",
    bankName: VIETQR_ACCOUNT_NAME,
    accountNumber: VIETQR_MB_ACCOUNT,
    content,
    template: VIETQR_TEMPLATE,
  };
};

// Webhook giống DatLichPhongKham: nhận data từ Casso, verify key, đối soát theo "content"
const processCassoWebhook = async (cassoData, secretKeyHeader) => {
  // Nếu chạy nhầm entrypoint không load .env, vẫn fallback trong môi trường dev để bạn test nhanh.
  const expected =
    process.env.CASSO_SECRET_KEY ||
    (process.env.NODE_ENV === "production" ? "" : "truonggg201");
  if (!expected) throw new AppError(500, "CASSO_SECRET_KEY chưa được cấu hình", null, PAY_ERR.CASSO_NOT_CONFIGURED);

  const provided = String(secretKeyHeader || "").trim();
  const normalizedExpected = String(expected || "").trim();

  if (!provided || provided !== normalizedExpected) {
    throw new AppError(401, "Secret key webhook không hợp lệ", {
      providedLength: provided.length,
      expectedLength: normalizedExpected.length,
    }, PAY_ERR.CASSO_INVALID_SECRET);
  }

  // Casso payload có thể khác nhau; ta cố lấy list giao dịch theo các key phổ biến.
  const records = cassoData?.data?.records || cassoData?.data || cassoData?.records || [];
  if (!Array.isArray(records)) {
    throw new AppError(400, "Payload webhook không hợp lệ (records phải là mảng)", null, PAY_ERR.CASSO_INVALID_PAYLOAD);
  }

  const updated = [];

  for (const r of records) {
    const description = r?.description || r?.content || r?.memo || "";
    const ref = extractTransferToken(description);
    if (!ref) continue;

    // Match theo token: ưu tiên exact, fallback like (nội dung Casso có thể có tiền tố/hậu tố)
    let pendingPayment = await repo.findPendingPaymentByTransferContent(ref);
    if (!pendingPayment) {
      pendingPayment = await repo.findPendingPaymentByTransferContentLike(ref);
    }
    if (!pendingPayment) {
      const invoiceIdFromRef = extractInvoiceIdToken(description);
      if (invoiceIdFromRef) {
        pendingPayment = await repo.findLatestPendingPaymentByInvoiceId(invoiceIdFromRef);
      }
    }
    if (!pendingPayment) continue;

    const paidAt = r?.when || r?.transactionDate || r?.createdAt || new Date().toISOString();
    const gatewayTxn = r?.tid || r?.transactionID || r?.reference || null;
    const responseCode = "00";
    const webhookAmount = extractWebhookAmount(r);
    const expectedAmount = Number(pendingPayment.amount || 0);

    // Chỉ xác nhận thành công khi số tiền giao dịch khớp với payment đang chờ.
    // Nếu payload test của Casso gửi amount mẫu (vd 2000) sẽ không làm đổi trạng thái thật.
    if (webhookAmount !== null && Math.round(webhookAmount) !== Math.round(expectedAmount)) {
      continue;
    }

    const paymentRow = await repo.markPaymentSuccess({
      paymentId: pendingPayment.id,
      responseCode,
      gatewayTransactionNo: gatewayTxn || pendingPayment.gateway_transaction_no,
      paidAt,
    });

    await repo.markInvoicePaid(paymentRow.invoice_id);
    updated.push({ paymentId: paymentRow.id, invoiceId: paymentRow.invoice_id });
  }

  return { updatedCount: updated.length, updated };
};
const updatePayment = async (id, body) => {
  const pid = parsePathId(id);
  const existing = await repo.getPaymentById(pid);
  if (!existing) throw new AppError(404, "Không tìm thấy phiếu thanh toán", null, PAY_ERR.PAYMENT_NOT_FOUND);

  const payload = parseUpdatePayment(body);
  const nextStatus = payload.status;

  if (nextStatus === "SUCCESS" && String(existing.status) !== "PENDING") {
    throw new AppError(
      400,
      "Chỉ có thể xác nhận thanh toán khi phiếu đang ở trạng thái chờ (PENDING).",
      { currentStatus: existing.status },
      PAY_ERR.PAYMENT_ALREADY_FINALIZED
    );
  }

  const row = await repo.updatePayment(pid, mapper.toEntity(payload));
  if (!row) throw new AppError(404, "Không tìm thấy phiếu thanh toán", null, PAY_ERR.PAYMENT_NOT_FOUND);
  if (String(nextStatus) === "SUCCESS" && String(existing.status) !== "SUCCESS") {
    const invId = row.invoice_id;
    if (invId) await repo.markInvoicePaid(invId);
  }
  return mapper.toResponse(row);
};

/** Cư dân báo đã nộp tiền mặt — chờ BQL xác nhận (không đặt SUCCESS). */
const submitUserCashDeclaration = async (userId, paymentId) => {
  const uid = parsePathId(userId);
  const pid = parsePathId(paymentId);
  const row = await repo.getPaymentByUserAndId({ userId: uid, paymentId: pid });
  if (!row) throw new AppError(404, "Không tìm thấy phiếu thanh toán", null, PAY_ERR.PAYMENT_NOT_FOUND);
  if (String(row.status) !== "PENDING") {
    throw new AppError(
      400,
      "Phiếu không còn ở trạng thái chờ thanh toán.",
      { status: row.status },
      PAY_ERR.PAYMENT_SUBMIT_CASH_INVALID_STATE
    );
  }
  if (String(row.response_code) === "WAIT_ADMIN_CASH") {
    return mapper.toResponse(row);
  }
  await repo.updatePayment(pid, {
    payment_method: "CASH",
    payment_gateway: "OFFLINE",
    response_code: "WAIT_ADMIN_CASH",
  });
  const updated = await repo.getPaymentById(pid);
  return mapper.toResponse(updated);
};
const deletePayment = async (id) => {
  const row = await repo.deletePayment(parsePathId(id));
  if (!row) throw new AppError(404, "Không tìm thấy phiếu thanh toán", null, PAY_ERR.PAYMENT_NOT_FOUND);
  return { id: row.id };
};
const restorePayment = async (id) => {
  const row = await repo.restorePayment(parsePathId(id));
  if (!row) throw new AppError(404, "Không tìm thấy phiếu thanh toán hoặc chưa bị xóa mềm", null, PAY_ERR.PAYMENT_NOT_FOUND);
  return { id: row.id };
};

module.exports = {
  createPayment,
  getAllPayments,
  getPaymentById,
  getPaymentDetailById,
  getLatestPaymentByInvoiceId,
  getPaymentsByUserId,
  getPaymentByUserAndId,
  generateMbVietQrByInvoiceId,
  processCassoWebhook,
  updatePayment,
  submitUserCashDeclaration,
  deletePayment,
  restorePayment,
};
