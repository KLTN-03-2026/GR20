const { ZodError } = require("zod");
const { AppError } = require("../../common/app-error");
const service = require("./billing.service");

const sendError = (res, err) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Validation failed",
      errors: err.flatten().fieldErrors,
      formErrors: err.flatten().formErrors,
    });
  }
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      details: err.details,
    });
  }
  return res.status(500).json({ message: err.message });
};

const generateInvoiceAndCashPayment = async (req, res) => {
  try {
    const data = await service.generateInvoiceAndCashPayment(req.body);
    res.status(201).json({
      operationType: "Success",
      message: "Generate invoice and cash payment successfully",
      code: "CREATED",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    sendError(res, err);
  }
};

module.exports = {
  generateInvoiceAndCashPayment,
};
