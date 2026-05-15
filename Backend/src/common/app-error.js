class AppError extends Error {
  /**
   * @param {number} statusCode
   * @param {string} message
   * @param {unknown} [details]
   * @param {string} [errorCode] Mã cố định cho FE (Console / i18n)
   */
  constructor(statusCode, message, details, errorCode) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
    if (errorCode) this.errorCode = errorCode;
  }
}

module.exports = { AppError };
