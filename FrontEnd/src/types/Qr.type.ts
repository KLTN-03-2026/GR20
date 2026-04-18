export interface GuestQrDetail {
  id: string
  hostUserId: string
  hostName: string
  apartmentId: string
  apartmentCode: string
  visitor: {
    name: string
    phone: string
    idCard: string
  }
  qrCode: string
  validFrom: string
  validTo: string
  maxEntries: number
  usedEntries: number
  remainingEntries: number
  status: string
  createdAt: string
  qrImage: string
}
