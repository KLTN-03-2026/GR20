

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { maintenanceRequestApi } from 'src/apis/maintenanceRequest_api/maintenanceRequest.api';
import type { maintenanceRequest } from 'src/types/maintenanceRequest.type';

export default function GetMaintenanceRequestList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // State cho modal chỉnh sửa
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    id: '',
    title: '',
    description: '',
    priority: 'MEDIUM'
  });

  // useQuery - Lấy danh sách yêu cầu
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['maintenance-requests'],
    queryFn: async () => {
      const response = await maintenanceRequestApi.getAllMaintenanceRequest();
      return response.data.data as maintenanceRequest[];
    },
  });
 

  // useMutation - Xóa yêu cầu
  const { mutate: deleteRequest } = useMutation({
    mutationFn: (id: string) => maintenanceRequestApi.deleteMaintenanceRequest(id),
    onSuccess: () => {
      toast.success('Xóa yêu cầu thành công');
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể xóa yêu cầu');
    },
  });

  // useMutation - Cập nhật yêu cầu
  const { mutate: updateRequest, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, body }: { id: string; body: { title: string; description: string; priority: string } }) =>
      maintenanceRequestApi.updateStatusByStaff(id, body),
    onSuccess: () => {
      toast.success('Cập nhật yêu cầu thành công');
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
      setIsEditModalOpen(false);
      setEditData({ id: '', title: '', description: '', priority: 'MEDIUM' });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể cập nhật yêu cầu');
    },
  });

  // Tính toán stats
  const stats = {
    open: requests.filter((r) => r.status === 'OPEN').length,
    urgent: requests.filter((r) => r.priority === 'URGENT' || r.priority === 'HIGH').length,
    completed: requests.filter((r) => r.status === 'DONE').length
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('vi-VN');
    } catch {
      return 'N/A';
    }
  };

  // Lọc dữ liệu
  const filteredRequests = requests.filter((request) => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          request.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                          (filterStatus === 'open' && request.status === 'OPEN') ||
                          (filterStatus === 'pending' && request.status === 'IN_PROGRESS') ||
                          (filterStatus === 'done' && request.status === 'DONE');
    return matchesSearch && matchesStatus;
  });

  // Xử lý xóa
  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa yêu cầu này?')) {
      deleteRequest(id);
    }
  };

  // Mở modal chỉnh sửa
  const handleOpenEditModal = (request: maintenanceRequest) => {
    setEditData({
      id: request.id,
      title: request.title,
      description: request.description,
      priority: request.priority
    });
    setIsEditModalOpen(true);
  };

  // Xử lý submit chỉnh sửa
  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateRequest({
      id: editData.id,
      body: {
        title: editData.title,
        description: editData.description,
        priority: editData.priority
      }
    });
  };

  // Priority badge
  const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'URGENT':
      return <span className="px-3 py-1 bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-tighter rounded-full whitespace-nowrap">KHẨN CẤP</span>;
    case 'HIGH':
      return <span className="px-3 py-1 bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-tighter rounded-full whitespace-nowrap">CAO</span>;
    case 'MEDIUM':
      return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-[10px] font-black uppercase tracking-tighter rounded-full whitespace-nowrap">TRUNG BÌNH</span>;
    case 'LOW':
      return <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-tighter rounded-full whitespace-nowrap">THẤP</span>;
    default:
      return <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-tighter rounded-full whitespace-nowrap">{priority}</span>;
  }
};

  // Status badge
  const getStatusBadge = (status: string) => {
  switch (status) {
    case 'OPEN':
      return <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-tighter rounded-full border border-blue-100 whitespace-nowrap">ĐANG MỞ</span>;
    case 'IN_PROGRESS':
      return <span className="px-3 py-1 bg-yellow-50 text-yellow-600 text-[10px] font-black uppercase tracking-tighter rounded-full border border-yellow-100 whitespace-nowrap">ĐANG XỬ LÝ</span>;
    case 'DONE':
      return <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-tighter rounded-full border border-green-200 whitespace-nowrap">ĐÃ XỬ LÝ</span>;
    case 'CANCELLED':
      return <span className="px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-tighter rounded-full border border-gray-200 whitespace-nowrap">ĐÃ HỦY</span>;
    default:
      return <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-tighter rounded-full whitespace-nowrap">{status}</span>;
  }
};

  // Icon theo title
  const getIcon = (title: string) => {
    if (title.toLowerCase().includes('điều hòa') || title.toLowerCase().includes('máy lạnh'))
      return { icon: 'ac_unit', color: 'bg-blue-50 text-blue-500' };
    if (title.toLowerCase().includes('tivi') || title.toLowerCase().includes('tv'))
      return { icon: 'tv', color: 'bg-amber-50 text-amber-500' };
    if (title.toLowerCase().includes('toilet') || title.toLowerCase().includes('wc'))
      return { icon: 'plumbing', color: 'bg-red-50 text-red-500' };
    if (title.toLowerCase().includes('tủ lạnh'))
      return { icon: 'kitchen', color: 'bg-blue-50 text-blue-500' };
    return { icon: 'build', color: 'bg-slate-50 text-slate-500' };
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface antialiased font-body">
      {/* Side Navigation Bar */}
      

      {/* Main Content */}
      <main className=" min-h-screen">
        {/* Top App Bar */}
        

        {/* Content */}
        <div className="px-8 pb-12">
          {/* Analytics Cards */}
          <div className="grid grid-cols-12 gap-6 mb-8">
            <div className="col-span-12 lg:col-span-8 grid grid-cols-3 gap-4">
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border-none">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Đang mở</p>
                <h3 className="text-3xl font-extrabold text-primary">{stats.open}</h3>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border-none">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Khẩn cấp</p>
                <h3 className="text-3xl font-extrabold text-error">{stats.urgent}</h3>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border-none">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Đã xử lý</p>
                <h3 className="text-3xl font-extrabold text-secondary">{stats.completed}</h3>
              </div>
            </div>
            <div className="col-span-12 lg:col-span-4 bg-primary-container text-white p-6 rounded-xl relative overflow-hidden">
              <h4 className="font-bold text-lg">Hiệu suất Đội ngũ</h4>
              <p className="text-white/70 text-xs">Phản hồi trung bình: 15 phút</p>
            </div>
          </div>

          {/* List Controls */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-4">
              <div className="flex bg-surface-container-low p-1 rounded-xl">
                <button onClick={() => setFilterStatus('all')} className={`px-4 py-1.5 text-xs font-bold rounded-lg ${filterStatus === 'all' ? 'bg-white shadow-sm text-primary' : 'text-slate-500'}`}>Tất cả</button>
                <button onClick={() => setFilterStatus('open')} className={`px-4 py-1.5 text-xs font-bold rounded-lg ${filterStatus === 'open' ? 'bg-white shadow-sm text-primary' : 'text-slate-500'}`}>Đang chờ</button>
                <button onClick={() => setFilterStatus('done')} className={`px-4 py-1.5 text-xs font-bold rounded-lg ${filterStatus === 'done' ? 'bg-white shadow-sm text-primary' : 'text-slate-500'}`}>Đã xong</button>
              </div>
            </div>
            <button onClick={() => navigate('/resident/AddMaintenanceRequest')} className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-br from-primary to-primary-container text-white text-sm font-bold rounded-full shadow-lg">
              <span className="material-symbols-outlined text-sm">add</span>
              Tạo yêu cầu mới
            </button>
          </div>

          {/* Table */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low/50">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black uppercase">ID</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase">Tiêu đề</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-center">Ưu tiên</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-center">Trạng thái</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase">Ngày báo cáo</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 text-xs font-bold text-slate-400">#{request.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${getIcon(request.title).color} flex items-center justify-center`}>
                          <span className="material-symbols-outlined text-sm">{getIcon(request.title).icon}</span>
                        </div>
                        <p className="text-sm font-bold text-slate-900">{request.title}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">{getPriorityBadge(request.priority)}</td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">{getStatusBadge(request.status)}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{formatDate(request.reported_at)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => navigate(`/resident/MaintenanceRequestDetail/${request.id}`)} className="p-2 hover:bg-primary-fixed text-primary rounded-lg">
                          <span className="material-symbols-outlined text-sm">visibility</span>
                        </button>
                        {request.status === 'OPEN' && (
                          <>
                            <button onClick={() => handleOpenEditModal(request)} className="p-2 hover:bg-slate-100 text-slate-500 rounded-lg">
                              <span className="material-symbols-outlined text-sm">edit</span>
                            </button>
                            <button onClick={() => handleDelete(request.id)} className="p-2 hover:bg-error-container/20 text-error rounded-lg">
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal chỉnh sửa */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            {/* Header */}
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Chỉnh sửa yêu cầu</h2>
                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleUpdateSubmit} className="p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tiêu đề</label>
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mức độ ưu tiên</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: 'LOW', label: 'Thấp' },
                    { value: 'MEDIUM', label: 'Trung bình' },
                    { value: 'HIGH', label: 'Cao' },
                    { value: 'URGENT', label: 'Khẩn cấp' }
                  ].map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setEditData({ ...editData, priority: p.value })}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        editData.priority === p.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mô tả</label>
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  required
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isUpdating ? 'Đang cập nhật...' : 'Cập nhật'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg transition-colors"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}