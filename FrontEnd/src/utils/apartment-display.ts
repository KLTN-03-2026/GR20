import type { ApartmentData } from 'src/types/apartment.type'

export function apartmentDisplayName(a: Pick<ApartmentData, 'id' | 'apartmentCode' | 'buildingName'>) {
  const code = a.apartmentCode?.trim()
  const bld = a.buildingName?.trim()
  if (code && bld) return `${code} · ${bld}`
  if (code) return code
  return `Căn #${a.id}`
}
