const success = (data = null, message = "Success") => {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };
};

const error = (message = "Error", details = null) => {
  return {
    success: false,
    message,
    details,
    timestamp: new Date().toISOString()
  };
};

const validationError = (joiError) => {
  return {
    success: false,
    message: "Validation error",
    details: joiError.details.map((err) => ({
      field: err.path.join("."),
      message: err.message
    })),
    timestamp: new Date().toISOString()
  };
};

module.exports = {
  success,
  error,
  validationError
};