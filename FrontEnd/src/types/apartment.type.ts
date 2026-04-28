export type ApartmentStatus = 'AVAILABLE' | 'OCCUPIED' | 'INACTIVE'

export interface Apartment {
  id: number
  buildingId: number
  ownerUserId: number | null
  floorId: number
  apartmentCode: string
  area: number
  bedrooms: number
  bathrooms: number
  balconyDirection: string | null
  status: ApartmentStatus
  createdAt: string
  updatedAt: string
}

