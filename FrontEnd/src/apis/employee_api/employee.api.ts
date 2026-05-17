import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

export const employeeApi = {
  getAll: async () => (await apiClient.get('/employees')).data.data,
  add: async (data: any) => (await apiClient.post('/employees', data)).data.data,
  update: async ({ id, data }: { id: string | number; data: any }) =>
    (await apiClient.put(`/employees/${id}`, data)).data.data,
  toggleStatus: async (id: string | number) => (await apiClient.patch(`/employees/${id}/status`)).data.data
}
