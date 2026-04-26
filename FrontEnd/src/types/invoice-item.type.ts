export interface InvoiceItem {
  id: string
  invoiceId: number
  itemName: string
  amount: number
  meterId?: number
  deletedAt?: string | null
}
