export interface Contract {
  id: number
  residentId: number
  apartmentId: number
  residentName?: string | null
  apartmentCode?: string | null
  contractType: string
  status: string
  startDate: string
  endDate: string
  monthlyRent?: number | null
  deposit?: number | null
  note?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}
