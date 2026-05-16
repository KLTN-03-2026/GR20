const { sendControllerError } = require("../../common/send-controller-error");
const { AppError } = require("../../common/app-error");
const service = require("./payment.service");
const PAY_ERR = require("./payment-errors");

const assertUserIdMatchesParam = (req) => {
  const uid = req.user?.id != null ? String(req.user.id) : req.user?.sub != null ? String(req.user.sub) : "";
  if (!uid || uid !== String(req.params.userId)) {
    throw new AppError(403, "Không được phép truy cập thanh toán của tài khoản khác.", undefined, PAY_ERR.PAYMENT_FORBIDDEN_SCOPE);
  }
};

const createPayment = async (req, res) => {
  try {
    const data = await service.createPayment(req.body);
    res.status(201).json({ operationType: "Success", message: "Create payment successfully", code: "CREATED", data, size: 1, timestamp: new Date() });
  } catch (err) { sendControllerError(res, err); }
};
const getAllPayments = async (req, res) => {
  try {
    const result = await service.getAllPayments(req.query);
    res.json({ operationType: "Success", message: "success", code: "OK", ...result, timestamp: new Date() });
  } catch (err) { sendControllerError(res, err); }
};
const getPaymentById = async (req, res) => {
  try {
    const data = await service.getPaymentById(req.params.id);
    res.json({ operationType: "Success", message: "Get payment detail successfully", code: "OK", data, timestamp: new Date() });
  } catch (err) { sendControllerError(res, err); }
};
const getPaymentDetailById = async (req, res) => {
  try {
    const data = await service.getPaymentDetailById(req.params.id);
    res.json({ operationType: "Success", message: "Get payment detail successfully", code: "OK", data, timestamp: new Date() });
  } catch (err) { sendControllerError(res, err); }
};

const getLatestPaymentByInvoiceId = async (req, res) => {
  try {
    const data = await service.getLatestPaymentByInvoiceId(req.params.invoiceId);
    res.json({ operationType: "Success", message: "Get payment detail successfully", code: "OK", data, timestamp: new Date() });
  } catch (err) { sendControllerError(res, err); }
};
const getPaymentsByUserId = async (req, res) => {
  try {
    assertUserIdMatchesParam(req);
    const result = await service.getPaymentsByUserId(req.params.userId, req.query);
    res.json({ operationType: "Success", message: "success", code: "OK", ...result, timestamp: new Date() });
  } catch (err) { sendControllerError(res, err); }
};
const getPaymentByUserAndId = async (req, res) => {
  try {
    assertUserIdMatchesParam(req);
    const data = await service.getPaymentByUserAndId(req.params.userId, req.params.id);
    res.json({ operationType: "Success", message: "Get payment detail successfully", code: "OK", data, timestamp: new Date() });
  } catch (err) { sendControllerError(res, err); }
};

const submitUserCashDeclaration = async (req, res) => {
  try {
    assertUserIdMatchesParam(req);
    const data = await service.submitUserCashDeclaration(req.params.userId, req.params.id);
    res.json({
      operationType: "Success",
      message: "Đã gửi thông tin nộp tiền mặt. Ban quản lý sẽ xác nhận khi nhận đủ tiền.",
      code: "OK",
      data,
      size: 1,
      timestamp: new Date(),
    });
  } catch (err) { sendControllerError(res, err); }
};

const generateMbVietQrByInvoiceId = async (req, res) => {
  try {
    const data = await service.generateMbVietQrByInvoiceId(req.params.invoiceId);
    res.json({ operationType: "Success", message: "Generate VietQR successfully", code: "OK", data, timestamp: new Date() });
  } catch (err) { sendControllerError(res, err); }
};
const updatePayment = async (req, res) => {
  try {
    const data = await service.updatePayment(req.params.id, req.body);
    res.json({ operationType: "Success", message: "Update payment successfully", code: "OK", data, timestamp: new Date() });
  } catch (err) { sendControllerError(res, err); }
};
const deletePayment = async (req, res) => {
  try {
    const data = await service.deletePayment(req.params.id);
    res.json({ operationType: "Success", message: "Delete payment successfully", code: "OK", data, timestamp: new Date() });
  } catch (err) { sendControllerError(res, err); }
};
const restorePayment = async (req, res) => {
  try {
    const data = await service.restorePayment(req.params.id);
    res.json({ operationType: "Success", message: "Restore payment successfully", code: "OK", data, timestamp: new Date() });
  } catch (err) { sendControllerError(res, err); }
};

const cassoWebhook = async (req, res) => {
  try {
    const secret =
      req.header("secure-token") ||
      req.header("Secure-Token") ||
      req.header("X-Secret-Key") ||
      req.header("x-secret-key") ||
      req.header("X-API-Key") ||
      req.header("x-api-key") ||
      req.header("Key") ||
      req.header("key") ||
      (req.header("Authorization") || req.header("authorization") || "").replace(/^Bearer\s+/i, "") ||
      req.query?.key ||
      req.query?.secretKey ||
      req.query?.secret ||
      req.body?.secretKey ||
      req.body?.secret_key ||
      req.body?.secret;

    // Debug 1 lần để biết Casso gửi key ở đâu (mask value)
    const headerNames = Object.keys(req.headers || {}).sort();
    const maskedSecret = secret ? `${String(secret).slice(0, 2)}***${String(secret).slice(-2)}` : null;
    console.log("[CASSO][Webhook] headers:", headerNames);
    console.log("[CASSO][Webhook] secret(masked):", maskedSecret, "queryKeys:", Object.keys(req.query || {}), "bodyKeys:", Object.keys(req.body || {}));

    const data = await service.processCassoWebhook(req.body, secret);
    console.log("[CASSO][Webhook] result:", data);
    res.json({ operationType: "Success", message: "Webhook received", code: "OK", data, timestamp: new Date() });
  } catch (err) { sendControllerError(res, err); }
};

module.exports = {
  createPayment,
  getAllPayments,
  getPaymentById,
  getPaymentDetailById,
  getLatestPaymentByInvoiceId,
  getPaymentsByUserId,
  getPaymentByUserAndId,
  submitUserCashDeclaration,
  generateMbVietQrByInvoiceId,
  updatePayment,
  deletePayment,
  restorePayment,
  cassoWebhook,
};
