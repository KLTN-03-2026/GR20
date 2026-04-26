import type { Payment } from 'src/types/payment.type'
import type { SuccessResponseApi } from 'src/types/utils.type'
import http from 'src/utils/http'

const URL = '/api/payments'

export const paymentsApi = {
  getAll(params?: {
    page?: number
    size?: number
    invoiceId?: number
    status?: 'PENDING' | 'SUCCESS' | 'FAILED'
    paymentMethod?: string
    includeDeleted?: boolean
  }) {
    return http.get<SuccessResponseApi<Payment[]>>(URL, { params })
  },
  getByInvoiceId(invoiceId: string) {
    return http.get<SuccessResponseApi<Payment>>(`${URL}/by-invoice/${invoiceId}`)
  },
  getByUserId(
    userId: string,
    params?: {
      page?: number
      size?: number
      status?: 'PENDING' | 'SUCCESS' | 'FAILED'
    }
  ) {
    return http.get<SuccessResponseApi<any[]>>(`${URL}/user/${userId}`, { params })
  },
  getByUserIdAndPaymentId(userId: string, paymentId: string) {
    return http.get<SuccessResponseApi<any>>(`${URL}/user/${userId}/${paymentId}`)
  },
  getMbVietQrByInvoiceId(invoiceId: string) {
    return http.get<SuccessResponseApi<any>>(`${URL}/by-invoice/${invoiceId}/vietqr-mb`)
  },
  getById(id: string) {
    return http.get<SuccessResponseApi<Payment>>(`${URL}/${id}`)
  },
  getDetailById(id: string) {
    return http.get<SuccessResponseApi<any>>(`${URL}/${id}/detail`)
  },
  create(payload: Omit<Payment, 'id' | 'createdAt' | 'deletedAt'>) {
    return http.post(URL, payload)
  },
  update(id: string, payload: Partial<Omit<Payment, 'id' | 'createdAt' | 'deletedAt'>>) {
    return http.put(`${URL}/${id}`, payload)
  },
  delete(id: string) {
    return http.delete(`${URL}/${id}`)
  },
  restore(id: string) {
    return http.patch(`${URL}/${id}/restore`)
  }
}
