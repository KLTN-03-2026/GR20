export interface UtilityPricing {
  id: string
  meterType: 'ELECTRIC' | 'WATER' | 'GAS'
  pricePerUnit: number
  unit: string
  effectiveFrom: string
  isActive: boolean
  createdAt?: string
}
