import http from 'src/utils/http'

export const billingApi = {
  generateCashInvoice(payload: { apartmentId: number; billingMonth: number; billingYear: number; dueDate?: string }) {
    return http.post('/api/billing/generate-cash', payload)
  }
}
