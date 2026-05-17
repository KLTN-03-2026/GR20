export interface MeterReading {
  id: string
  meterId: number
  readingDate: string
  previousReading: number
  currentReading: number
  consumption: number
  createdAt?: string
  deletedAt?: string | null
}
