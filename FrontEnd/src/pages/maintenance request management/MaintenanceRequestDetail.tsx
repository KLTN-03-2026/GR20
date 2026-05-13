
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { maintenanceRequestApi } from 'src/apis/maintenanceRequest_api/maintenanceRequest.api';



export default function MaintenanceRequestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // useQuery - Lấy chi tiết yêu cầu
  const { data: request, isLoading, error } = useQuery({
    queryKey: ['maintenance-request', id],
    queryFn: async () => {
      const response = await maintenanceRequestApi.getMaintenanceRequestById(id!);
      return response.data.data;
    },
    enabled: !!id,
  });

  // useMutation - Xóa yêu cầu
  const { mutate: deleteRequest, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => maintenanceRequestApi.deleteMaintenanceRequest(id),
    onSuccess: () => {
      toast.success('Xóa yêu cầu thành công');
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
      navigate('/resident/GetMaintenanceRequestList');
    },
    onError: () => {
      toast.error('Không thể xóa yêu cầu');
    },
  });

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-black uppercase tracking-tighter rounded-full">KHẨN CẤP</span>;
      case 'HIGH':
        return <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-black uppercase tracking-tighter rounded-full">CAO</span>;
      case 'MEDIUM':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-black uppercase tracking-tighter rounded-full">TRUNG BÌNH</span>;
      case 'LOW':
        return <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-tighter rounded-full">THẤP</span>;
      default:
        return <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-tighter rounded-full">{priority}</span>;
    }
  };

  // Status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-tighter rounded-full border border-blue-100">ĐANG MỞ</span>;
      case 'IN_PROGRESS':
        return <span className="px-3 py-1 bg-yellow-50 text-yellow-600 text-xs font-black uppercase tracking-tighter rounded-full border border-yellow-100">ĐANG XỬ LÝ</span>;
      case 'DONE':
        return <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-black uppercase tracking-tighter rounded-full border border-green-200">ĐÃ XỬ LÝ</span>;
      case 'CANCELLED':
        return <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-black uppercase tracking-tighter rounded-full border border-gray-200">ĐÃ HỦY</span>;
      default:
        return <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-tighter rounded-full">{status}</span>;
    }
  };

  const handleDelete = () => {
    if (window.confirm('Bạn có chắc muốn xóa yêu cầu này?')) {
      deleteRequest(id!);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="flex justify-center items-center h-screen bg-surface">
        <div className="text-center">
          <p className="text-error mb-4">Không tìm thấy yêu cầu bảo trì</p>
          <button
            onClick={() => navigate('/resident/GetMaintenanceRequestList')}
            className="px-4 py-2 bg-primary text-white rounded-lg"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface antialiased font-body">
     

      {/* Main Content */}
      <main className=" min-h-screen">
        {/* Top App Bar */}
        <header className="fixed top-0 right-0 left-64 z-30 bg-white/70 backdrop-blur-xl h-16 flex justify-between items-center px-8 shadow-sm shadow-blue-900/5">
          <h2 className="text-xl font-bold tracking-tighter text-slate-900">Chi tiết Yêu cầu Bảo trì</h2>
          <div className="flex items-center gap-6">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
            </button>
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="pt-24 px-8 pb-12 max-w-5xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/resident/GetMaintenanceRequestList')}
              className="group flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-medium"
            >
              <span className="material-symbols-outlined text-xl group-hover:-translate-x-1 transition-transform">arrow_back</span>
              <span>Quay lại danh sách</span>
            </button>
          </div>

          {/* Detail Card */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="border-b border-slate-200 px-8 py-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-slate-900">{request.title}</h1>
                    {getStatusBadge(request.status)}
                  </div>
                  <p className="text-sm text-slate-500">Mã yêu cầu: #{request.id}</p>
                </div>
                <div className="flex gap-2">
                  {request.status === 'OPEN' && (
                    <>
                      {/* <button
                        onClick={() => navigate(`/maintenance/${request.id}/edit`)}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                        Chỉnh sửa
                      </button> */}
                      <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                        Xóa
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-8 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">description</span>
                  Mô tả chi tiết
                </h3>
                <p className="text-slate-700 whitespace-pre-wrap bg-slate-50 p-4 rounded-xl">
                  {request.description}
                </p>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">info</span>
                    Thông tin cơ bản
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Mức độ ưu tiên:</span>
                      <span>{getPriorityBadge(request.priority)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Căn hộ:</span>
                      <span className="text-sm font-medium text-slate-900">{request.apartment_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Người báo cáo:</span>
                      <span className="text-sm font-medium text-slate-900">ID: {request.created_at}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    Thời gian
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Ngày báo cáo:</span>
                      <span className="text-sm font-medium text-slate-900">{formatDate(request.reported_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Ngày tạo:</span>
                      <span className="text-sm font-medium text-slate-900">{formatDate(request.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-slate-200 px-8 py-4 flex justify-end gap-3">
              <button
                onClick={() => navigate('/resident/GetMaintenanceRequestList')}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}