import http from '../../utils/http'

export const employeeApi = {
  getAll: async () => (await http.get('/api/employees')).data.data,
  add: async (data: any) => (await http.post('/api/employees', data)).data.data,
  update: async ({ id, data }: { id: string | number; data: any }) =>
    (await http.put(`/api/employees/${id}`, data)).data.data,
  toggleStatus: async (id: string | number) => (await http.patch(`/api/employees/${id}/status`)).data.data
}
