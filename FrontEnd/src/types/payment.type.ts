export interface Payment {
  id: string
  invoiceId: number
  amount: number
  paymentMethod?: string
  paymentGateway?: string
  gatewayTransactionNo?: string
  responseCode?: string
  status: 'PENDING' | 'SUCCESS' | 'FAILED'
  paymentDate?: string
  createdAt?: string
  deletedAt?: string | null
}
