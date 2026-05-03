export interface UtilityMeter {
  id: string
  apartmentId: number
  meterType: 'ELECTRIC' | 'WATER' | 'GAS'
  meterCode: string
  installedDate?: string
  status: 'ACTIVE' | 'INACTIVE' | 'BROKEN'
  /** Kèm từ BE khi lấy theo căn của cư dân */
  apartmentCode?: string
  buildingName?: string
}
