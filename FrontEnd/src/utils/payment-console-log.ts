import { isAxiosError } from 'axios'

/** Phản hồi lỗi từ API dùng sendControllerError (APP_ERROR / VALIDATION_ERROR / INTERNAL_ERROR) */
export type ResourceApiErrorBody = {
  code?: string
  errorCode?: string | null
  message?: string
  details?: unknown
}

/** @deprecated dùng ResourceApiErrorBody */
export type PaymentApiErrorBody = ResourceApiErrorBody

/**
 * Ghi vào Console (F12) khi API lỗi — dùng chung cho Buildings, Invoices, utility, Payments, ...
 */
export function logResourceConsoleError(resource: string, scope: string, err: unknown) {
  const label = `[${resource}][${scope}]`

  if (isAxiosError(err)) {
    const status = err.response?.status
    const body = (err.response?.data || {}) as ResourceApiErrorBody
    console.error(label, 'API_ERROR', {
      httpStatus: status,
      errorCode: body.errorCode ?? body.code,
      message: body.message || err.message,
      details: body.details,
      url: err.config?.url,
      method: err.config?.method?.toUpperCase(),
    })
    return
  }

  console.error(label, 'UNEXPECTED', err)
}

/**
 * Ghi vào Console (F12) khi API thanh toán lỗi — alias Payments.
 */
export function logPaymentConsoleError(scope: string, err: unknown) {
  logResourceConsoleError('Payments', scope, err)
}
