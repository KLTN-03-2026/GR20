import type { CapNhatTrangThaiAdmin, XemChiTietYeuCauAdmin, XemDanhSachYeuCauAdmin } from "src/types/maintenanceRequestAdmin.type";
import type { SuccessResponseApi } from "src/types/utils.type";
import http from "src/utils/http";



export const maintenanceRequestAdminApi = {
  getAllRequests(params?: {
    page?: number;
    size?: number;
    status?: string;
    priority?: string;
  }) {
    return http.get<SuccessResponseApi<XemDanhSachYeuCauAdmin[]>>('/api/maintenances/admin/all', { params });
  },
  getRequestDetail(id:string) {
    return http.get<SuccessResponseApi<XemChiTietYeuCauAdmin>>(`/api/maintenances/admin/${id}`);
  },
  updateStatus(id: string, body:{
    status: string}) {
    return http.patch<SuccessResponseApi<CapNhatTrangThaiAdmin>>(`/api/maintenances/${id}/status`, body);
  },
};

