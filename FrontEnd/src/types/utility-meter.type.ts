export interface UtilityMeter {
  id: string
  apartmentId: number
  meterType: 'ELECTRIC' | 'WATER' | 'GAS'
  meterCode: string
  installedDate?: string
  status: 'ACTIVE' | 'INACTIVE' | 'BROKEN'
}
