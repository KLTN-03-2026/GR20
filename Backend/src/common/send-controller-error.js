const { ZodError } = require("zod");
const { AppError } = require("./app-error");

const sendControllerError = (res, err) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      code: "VALIDATION_ERROR",
      errorCode: "VALIDATION_ERROR",
      message: "Validation failed",
      errors: err.flatten().fieldErrors,
      formErrors: err.flatten().formErrors,
    });
  }
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      code: "APP_ERROR",
      errorCode: err.errorCode ?? null,
      message: err.message,
      details: err.details ?? null,
    });
  }
  return res.status(500).json({
    code: "INTERNAL_ERROR",
    errorCode: "INTERNAL_SERVER_ERROR",
    message: err.message,
  });
};

module.exports = { sendControllerError };
