export type VehicleType = 'MOTORBIKE' | 'CAR' | 'BICYCLE'
export type VehicleStatus = 'ACTIVE' | 'REMOVED'

export interface Vehicle {
  id: number
  ownerId: number | null
  apartmentId: number | null
  plateNumber: string
  vehicleType: VehicleType
  color: string | null
  status: VehicleStatus
  createdAt: string | null
}
