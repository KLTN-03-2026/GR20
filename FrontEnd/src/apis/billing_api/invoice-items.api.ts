import type { InvoiceItem } from 'src/types/invoice-item.type'
import type { SuccessResponseApi } from 'src/types/utils.type'
import http from 'src/utils/http'

const URL = '/api/invoice-items'

export const invoiceItemsApi = {
  getAll() {
    return http.get<SuccessResponseApi<InvoiceItem[]>>(URL)
  },
  getByInvoiceId(invoiceId: string) {
    return http.get<SuccessResponseApi<InvoiceItem[]>>(`${URL}/by-invoice/${invoiceId}`)
  },
  getById(id: string) {
    return http.get<SuccessResponseApi<InvoiceItem>>(`${URL}/${id}`)
  },
  create(payload: Omit<InvoiceItem, 'id' | 'deletedAt'>) {
    return http.post(URL, payload)
  },
  update(id: string, payload: Partial<Omit<InvoiceItem, 'id' | 'deletedAt'>>) {
    return http.put(`${URL}/${id}`, payload)
  },
  delete(id: string) {
    return http.delete(`${URL}/${id}`)
  }
}
