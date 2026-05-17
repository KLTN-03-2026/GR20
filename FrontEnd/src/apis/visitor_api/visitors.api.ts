import type { Visitor } from 'src/types/visitor.type'
import type { SuccessResponseApi } from 'src/types/utils.type'
import http from 'src/utils/http'

const URL = '/api/visitors'

export const visitorsApi = {
  getAll(params?: { page?: number; size?: number; search?: string; hostUserId?: number }) {
    return http.get<SuccessResponseApi<Visitor[]>>(URL, { params })
  },
  getById(id: string | number) {
    return http.get<SuccessResponseApi<Visitor>>(`${URL}/${id}`)
  },
  create(payload: Partial<Visitor> & { name: string }) {
    return http.post<SuccessResponseApi<Visitor>>(URL, payload)
  },
  update(id: string | number, payload: Partial<Visitor>) {
    return http.put<SuccessResponseApi<Visitor>>(`${URL}/${id}`, payload)
  },
  delete(id: string | number) {
    return http.delete<SuccessResponseApi<{ id: number }>>(`${URL}/${id}`)
  }
}
