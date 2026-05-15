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

/** Thông báo lỗi tiếng Việt cho API thanh toán / VietQR / nộp tiền mặt (React Query + axios). */
export function getPaymentApiErrorMessage(err: unknown, fallbackMessage: string): string {
  if (isAxiosError(err)) {
    if (!err.response) {
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        return 'Mất kết nối mạng. Kiểm tra Internet và thử lại.'
      }
      return err.message?.trim() || fallbackMessage
    }
    const status = err.response.status
    const apiErr = err.response.data as Record<string, unknown> | undefined
    const firstFieldError = apiErr?.errors
      ? (Object.values(apiErr.errors).flat()[0] as string | undefined)
      : null
    if (typeof firstFieldError === 'string' && firstFieldError.trim()) {
      const t = translatePaymentMessageContains(firstFieldError.trim())
      return t || firstFieldError.trim()
    }
    if (typeof apiErr?.message === 'string' && apiErr.message.trim()) {
      const msg = apiErr.message.trim()
      const translated = translatePaymentErrorMessage(msg)
      if (translated) return translated
      return msg
    }
    if (status === 401) return 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.'
    if (status === 403) return 'Bạn không có quyền thực hiện thao tác này.'
    if (status === 404) return 'Không tìm thấy dữ liệu thanh toán.'
    if (status >= 500) return 'Hệ thống đang bận hoặc gặp lỗi. Vui lòng thử lại sau.'
  }
  if (err instanceof Error && err.message.trim()) {
    const t = translatePaymentErrorMessage(err.message)
    if (t) return t
  }
  return fallbackMessage
}

function translatePaymentMessageContains(raw: string): string | null {
  const pairs: Array<[string, string]> = [
    ['Payment not found', 'Không tìm thấy thanh toán'],
    ['Invoice not found', 'Không tìm thấy hóa đơn'],
    ['Webhook chưa xác nhận giao dịch.', 'Webhook chưa xác nhận giao dịch. Vui lòng đợi thêm.'],
    ['Invalid payment amount', 'Số tiền thanh toán không hợp lệ'],
    ['Không được phép truy cập thanh toán', 'Không được phép truy cập thanh toán của tài khoản khác.'],
    ['Hóa đơn đã được thanh toán', 'Hóa đơn đã được thanh toán, không tạo thêm mã QR.'],
    ['Phiếu thanh toán không hợp lệ để tạo QR', 'Phiếu thanh toán không hợp lệ để tạo mã QR.'],
    ['Cấu hình tài khoản VietQR', 'Cấu hình VietQR trên máy chủ chưa đủ. Liên hệ Ban quản lý.'],
    ['Phiếu không còn ở trạng thái chờ thanh toán', 'Phiếu không còn ở trạng thái chờ thanh toán.'],
    ['Phiếu thanh toán hoặc không thuộc tài khoản', 'Không tìm thấy phiếu thanh toán hoặc phiếu không thuộc tài khoản của bạn.']
  ]
  for (const [en, vi] of pairs) {
    if (raw.includes(en)) return vi
  }
  return null
}

function translatePaymentErrorMessage(raw: string): string | null {
  return translatePaymentMessageContains(raw)
}
