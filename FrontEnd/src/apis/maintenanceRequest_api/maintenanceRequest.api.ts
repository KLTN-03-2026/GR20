import type { CreateMaintenanceRequest, maintenanceRequest, maintenanceRequestDetail, UpdateStatusRequest} from "src/types/maintenanceRequest.type"
import type { SuccessResponseApi } from "src/types/utils.type"
import http from "src/utils/http"


export const maintenanceRequestApi = {
  // Lấy danh sách yêu cầu
  getAllMaintenanceRequest() {
    return http.get<SuccessResponseApi<maintenanceRequest[]>>('/api/maintenances/my-requests')
  },
  // lấy chi tiết yêu cầu
  getMaintenanceRequestById(id: string) {
    return http.get<SuccessResponseApi<maintenanceRequestDetail>>(`api/maintenances/${id}`)
  },

  // Cư dân - Tạo yêu cầu mới
  createMaintenanceRequest(body: CreateMaintenanceRequest) {
    return http.post<SuccessResponseApi<maintenanceRequestDetail>>('/api/maintenance', body)
  },


  deleteMaintenanceRequest(id: string) {
    return http.delete(`/api/maintenances/${id}`)
  },

  // Nhân viên - Cập nhật trạng thái
  updateStatusByStaff(id: string, body: UpdateStatusRequest) {
    return http.put<SuccessResponseApi<maintenanceRequestDetail>>(`/api/maintenances/${id}`, body)
  },

  // Nhân viên - Phân công kỹ thuật viên
  // assignTechnician(id: string, body: AssignTechnicianRequest) {
  //   return http.patch<SuccessResponseApi<maintenanceRequestDetail>>(`/api/maintenance/${id}/assign`, body)
  // },
  
}

