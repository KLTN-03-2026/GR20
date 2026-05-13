import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { maintenanceRequestApi } from 'src/apis/maintenanceRequest_api/maintenanceRequest.api';
import { maintenanceRequestAdminApi } from 'src/apis/maintenanceRequest_api/maintenanceRequestAdmin.api';
import type { XemDanhSachYeuCauAdmin } from 'src/types/maintenanceRequestAdmin.type';

export default function GetResidentRequestList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const pageSize = 10;

  // Lấy danh sách yêu cầu
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-requests', page, filterStatus, filterPriority],
    queryFn: async () => {
      const params: any = { page, size: pageSize };
      if (filterStatus !== 'all') params.status = filterStatus;
      if (filterPriority !== 'all') params.priority = filterPriority;
      const response = await maintenanceRequestAdminApi.getAllRequests(params);
      return response.data;
    },
  });

  const requests: XemDanhSachYeuCauAdmin[] = data?.data || [];
  const totalElements = data?.totalElements || 0;
  const totalPages = data?.totalPages || 0;

  // Xóa yêu cầu
  const deleteMutation = useMutation({
    mutationFn: (id: string) => maintenanceRequestApi.deleteMaintenanceRequest(id),
    onSuccess: () => {
      toast.success('Xóa yêu cầu thành công');
      queryClient.invalidateQueries({ queryKey: ['admin-requests'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Xóa thất bại');
    },
  });

  // Cập nhật trạng thái
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      maintenanceRequestAdminApi.updateStatus(id, { status }),
    onSuccess: () => {
      toast.success('Cập nhật trạng thái thành công');
      queryClient.invalidateQueries({ queryKey: ['admin-requests'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Cập nhật thất bại');
    },
  });

  const handleUpdateStatus = (id: string, newStatus: string) => {
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa yêu cầu này không?')) {
      deleteMutation.mutate(id);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  // Màu cho ưu tiên
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-700';
      case 'HIGH':
        return 'bg-orange-100 text-orange-700';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-700';
      case 'LOW':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // Màu cho trạng thái
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-blue-100 text-blue-700';
      case 'IN_PROGRESS':
        return 'bg-purple-100 text-purple-700';
      case 'DONE':
        return 'bg-green-100 text-green-700';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-500';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'KHẨN CẤP';
      case 'HIGH': return 'CAO';
      case 'MEDIUM': return 'TRUNG BÌNH';
      case 'LOW': return 'THẤP';
      default: return priority;
    }
  };

  const getIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('điều hòa') || t.includes('máy lạnh'))
      return { icon: 'ac_unit', color: 'bg-blue-50 text-blue-500' };
    if (t.includes('tivi') || t.includes('tv'))
      return { icon: 'tv', color: 'bg-amber-50 text-amber-500' };
    if (t.includes('toilet') || t.includes('wc'))
      return { icon: 'plumbing', color: 'bg-red-50 text-red-500' };
    if (t.includes('tủ lạnh'))
      return { icon: 'kitchen', color: 'bg-blue-50 text-blue-500' };
    return { icon: 'build', color: 'bg-slate-50 text-slate-500' };
  };

  const stats = {
    total: totalElements,
    urgent: requests.filter(r => r.priority === 'URGENT' || r.priority === 'HIGH').length,
    pending: requests.filter(r => r.status === 'OPEN').length,
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-red-500">
        Lỗi khi tải dữ liệu: {(error as any)?.message || 'Vui lòng thử lại sau'}
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface antialiased font-body">
      <main className="px-8 pb-12">
        {/* Thống kê nhanh */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-surface-container-lowest p-6 rounded-xl">
            <p className="text-xs font-bold uppercase text-on-surface-variant opacity-70">Tổng số yêu cầu</p>
            <h2 className="text-3xl font-extrabold mt-2">{stats.total}</h2>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-xl">
            <p className="text-xs font-bold uppercase text-on-surface-variant opacity-70">Yêu cầu khẩn cấp</p>
            <h2 className="text-3xl font-extrabold mt-2 text-error">{stats.urgent}</h2>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-xl border-l-4 border-primary">
            <p className="text-xs font-bold uppercase text-on-surface-variant opacity-70">Đang chờ xử lý</p>
            <h2 className="text-3xl font-extrabold mt-2 text-primary">{stats.pending}</h2>
          </div>
        </div>

        {/* Bộ lọc */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex bg-surface-container p-1 rounded-full">
              {[
                { key: 'all', label: 'Tất cả' },
                { key: 'OPEN', label: 'Mới' },
                { key: 'IN_PROGRESS', label: 'Đang xử lý' },
                { key: 'DONE', label: 'Hoàn thành' },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setFilterStatus(item.key)}
                  className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
                    filterStatus === item.key
                      ? 'bg-surface-container-lowest text-primary shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-2 bg-surface-container-lowest rounded-full text-xs font-medium shadow-sm cursor-pointer"
            >
              <option value="all">Mức độ ưu tiên</option>
              <option value="URGENT">Khẩn cấp</option>
              <option value="HIGH">Cao</option>
              <option value="MEDIUM">Trung bình</option>
              <option value="LOW">Thấp</option>
            </select>
          </div>
        </div>

        {/* Bảng danh sách */}
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low">
                  <th className="px-6 py-4 text-[10px] font-black uppercase">ID</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase">Yêu cầu</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-center">Ưu tiên</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-center">Trạng thái</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase">Ngày báo</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant">
                      Không có yêu cầu bảo trì nào.
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => {
                    const { icon, color } = getIcon(req.title);
                    return (
                      <tr key={req.id} className="hover:bg-surface-bright transition-colors">
                        <td className="px-6 py-5">
                          <span className="font-mono text-xs font-bold text-primary">#{req.id}</span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center`}>
                              <span className="material-symbols-outlined text-sm">{icon}</span>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-on-surface">{req.title}</p>
                              <p className="text-xs text-on-surface-variant">{req.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center whitespace-nowrap">
  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase whitespace-nowrap ${getPriorityStyle(req.priority)}`}>
    {getPriorityLabel(req.priority)}
  </span>
</td>
                        <td className="px-6 py-5 text-center">
                          <select
                            value={req.status}
                            onChange={(e) => handleUpdateStatus(req.id.toString(), e.target.value)}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border cursor-pointer appearance-none text-center ${getStatusStyle(req.status)}`}
                            style={{ minWidth: '110px' }}
                          >
                            <option value="OPEN" className="bg-blue-100 text-blue-700">ĐANG MỞ</option>
                            <option value="IN_PROGRESS" className="bg-purple-100 text-purple-700">ĐANG XỬ LÝ</option>
                            <option value="DONE" className="bg-green-100 text-green-700">ĐÃ XỬ LÝ</option>
                            <option value="CANCELLED" className="bg-gray-100 text-gray-500">ĐÃ HỦY</option>
                          </select>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-xs text-on-surface-variant">{formatDate(req.reported_at)}</span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => navigate(`/GetResidentRequestDetail/${req.id}`)}
                              className="p-2 hover:bg-surface-container rounded-lg transition-colors"
                              title="Xem chi tiết"
                            >
                              <span className="material-symbols-outlined text-lg">visibility</span>
                            </button>
                            
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-surface-container-low flex items-center justify-between">
              <span className="text-xs text-on-surface-variant">
                Hiển thị {page * pageSize + 1} - {Math.min((page + 1) * pageSize, totalElements)} trên {totalElements} yêu cầu
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="p-2 rounded-lg hover:bg-surface-container-high disabled:opacity-30"
                >
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <span className="px-3 py-1 text-xs font-bold bg-primary text-white rounded-lg">
                  {page + 1}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="p-2 rounded-lg hover:bg-surface-container-high disabled:opacity-30"
                >
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}