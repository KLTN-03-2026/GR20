import type { Contract } from 'src/types/contract.type'
import type { SuccessResponseApi } from 'src/types/utils.type'
import http from 'src/utils/http'

const URL = '/api/contracts'

export const contractsApi = {
  getAll(params?: {
    page?: number
    size?: number
    search?: string
    status?: string
    contractType?: string
    residentId?: number
    apartmentId?: number
  }) {
    return http.get<SuccessResponseApi<Contract[]>>(URL, { params })
  },
  getById(id: string | number) {
    return http.get<SuccessResponseApi<Contract>>(`${URL}/${id}`)
  },
  create(payload: Omit<Contract, 'id'>) {
    return http.post<SuccessResponseApi<Contract>>(URL, payload)
  },
  update(id: string | number, payload: Partial<Contract>) {
    return http.put<SuccessResponseApi<Contract>>(`${URL}/${id}`, payload)
  },
  delete(id: string | number) {
    return http.delete<SuccessResponseApi<{ id: number }>>(`${URL}/${id}`)
  }
}
