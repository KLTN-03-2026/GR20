export interface Invoice {
  id: string
  invoiceCode: string
  apartmentId: number
  totalAmount: number
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  billingMonth?: number
  billingYear?: number
  dueDate?: string
  createdAt?: string
}
