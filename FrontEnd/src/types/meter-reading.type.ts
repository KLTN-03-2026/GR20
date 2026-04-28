export interface MeterReading {
  id: number
  meterId: number
  readingDate: string
  previousReading: number
  currentReading: number
  consumption: number
  createdAt?: string
  deletedAt?: string | null
}
