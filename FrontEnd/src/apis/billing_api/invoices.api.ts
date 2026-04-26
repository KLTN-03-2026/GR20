import type { Invoice } from 'src/types/invoice.type'
import type { SuccessResponseApi } from 'src/types/utils.type'
import http from 'src/utils/http'

const URL = '/api/invoices'

export const invoicesApi = {
  getAll(params?: { page?: number; size?: number }) {
    return http.get<SuccessResponseApi<Invoice[]>>(URL, { params })
  },
  getById(id: string) {
    return http.get<SuccessResponseApi<Invoice>>(`${URL}/${id}`)
  },
  getByUserId(
    userId: string,
    params?: {
      page?: number
      size?: number
      status?: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED'
    }
  ) {
    return http.get<SuccessResponseApi<Invoice[]>>(`${URL}/user/${userId}`, { params })
  },
  getByUserIdAndInvoiceId(userId: string, invoiceId: string) {
    return http.get<SuccessResponseApi<Invoice>>(`${URL}/user/${userId}/${invoiceId}`)
  },
  create(payload: Omit<Invoice, 'id' | 'createdAt'>) {
    return http.post(URL, payload)
  },
  update(id: string, payload: Partial<Omit<Invoice, 'id' | 'createdAt'>>) {
    return http.put(`${URL}/${id}`, payload)
  },
  delete(id: string) {
    return http.delete(`${URL}/${id}`)
  },
  restore(id: string) {
    return http.patch(`${URL}/${id}/restore`)
  }
}
