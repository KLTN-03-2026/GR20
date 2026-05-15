import http from 'src/utils/http'

const apiClient = http

export const employeeApi = {
  getAll: async () => (await apiClient.get('api/employees')).data.data,

  //Lấy chi tiết 1 nhân viên (kèm danh sách buildingIds)
  getById: async (id: string | number) => (await apiClient.get(`api/employees/${id}`)).data.data,

  add: async (data: any) => (await apiClient.post('api/employees', data)).data.data,

  update: async ({ id, data }: { id: string | number; data: any }) =>
    (await apiClient.put(`api/employees/${id}`, data)).data.data,

  toggleStatus: async (id: string | number) => (await apiClient.patch(`api/employees/${id}/status`)).data.data
}
