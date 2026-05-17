import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { maintenanceRequestAdminApi } from 'src/apis/maintenanceRequest_api/maintenanceRequestAdmin.api';


export default function GetResidentRequestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Lấy chi tiết yêu cầu
  const { data, isLoading, isError } = useQuery({
    queryKey: ['request-detail', id],
    queryFn: async () => {
      const response = await maintenanceRequestAdminApi.getRequestDetail(id!);
      return response.data.data;
    },
    enabled: !!id,
  });

  const request = data;

  // Format ngày tháng
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN');
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  // Badge ưu tiên
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return { text: 'KHẨN CẤP', color: 'bg-error-container text-on-error-container', icon: 'priority_high' };
      case 'HIGH':
        return { text: 'CAO', color: 'bg-error-container/70 text-on-error-container', icon: 'priority_high' };
      case 'MEDIUM':
        return { text: 'TRUNG BÌNH', color: 'bg-yellow-100 text-yellow-800', icon: 'warning' };
      case 'LOW':
        return { text: 'THẤP', color: 'bg-slate-100 text-slate-600', icon: 'info' };
      default:
        return { text: priority, color: 'bg-surface-container-high text-on-surface-variant', icon: 'help' };
    }
  };

  // Badge trạng thái
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return { text: 'ĐANG MỞ', color: 'bg-primary/10 text-primary', icon: 'pending' };
      case 'IN_PROGRESS':
        return { text: 'ĐANG XỬ LÝ', color: 'bg-yellow-100 text-yellow-700', icon: 'progress_activity' };
      case 'DONE':
        return { text: 'ĐÃ XỬ LÝ', color: 'bg-green-100 text-green-700', icon: 'check_circle' };
      case 'CANCELLED':
        return { text: 'ĐÃ HỦY', color: 'bg-gray-100 text-gray-600', icon: 'cancel' };
      default:
        return { text: status, color: 'bg-surface-container-high text-on-surface-variant', icon: 'help' };
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError || !request) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <div className="text-center">
          <p className="text-error mb-4">Không tìm thấy yêu cầu bảo trì</p>
          <button
            onClick={() => navigate('/resident/maintenance')}
            className="px-4 py-2 bg-primary text-white rounded-full"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const priorityInfo = getPriorityBadge(request.priority);
  const statusInfo = getStatusBadge(request.status);

  return (
    <div className="bg-background text-on-surface min-h-screen selection:bg-secondary-container">
      
    
      {/* Main Content */}
      <main className="pb-24 px-8 max-w-7xl mx-auto">
        {/* Page Header Section */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              {/* Back Button */}
          
            <button
              onClick={() => navigate(-1)}
              className="group flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-medium"
            >
              <span className="material-symbols-outlined text-xl group-hover:-translate-x-1 transition-transform">arrow_back</span>
              <span>Quay lại danh sách</span>
            </button>
          
              <span className="bg-secondary-fixed text-on-secondary-fixed-variant px-3 py-1 rounded-full text-xs font-bold tracking-wider font-label uppercase">
                #{request.id}
              </span>
              <span className="text-on-surface-variant font-medium">Yêu cầu bảo trì</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-extrabold tracking-tight text-on-surface leading-tight">
              {request.title}
            </h2>
          </div>                
        </div>
        {/* Content Canvas: Bento Grid */}
        <div className="grid grid-cols-12 gap-8">
          {/* Maintenance Details Card */}
          <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-[2rem] p-8 shadow-[0_32px_64px_-12px_rgba(68,93,128,0.04)] border border-outline-variant/10">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${priorityInfo.color.includes('error') ? 'bg-error/10' : 'bg-surface-container-high'}`}>
                  <span className={`material-symbols-outlined ${priorityInfo.color.includes('error') ? 'text-error' : 'text-on-surface-variant'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                    {priorityInfo.icon}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant/60 mb-1">Mức độ ưu tiên</p>
                  <p className={`font-extrabold text-lg ${priorityInfo.color.includes('error') ? 'text-error' : 'text-on-surface'}`}>
                    {priorityInfo.text}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant/60 mb-1">Trạng thái</p>
                <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-full font-bold text-sm ${statusInfo.color}`}>
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  {statusInfo.text}
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant/60">Mô tả chi tiết</p>
              <p className="text-2xl font-body text-on-surface leading-relaxed max-w-2xl italic">
                "{request.description}"
              </p>
              <div className="pt-8 flex items-center gap-6 text-on-surface-variant">
                <div className="flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-xl">
                  <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                  <span className="text-sm font-medium">{formatDate(request.reportedAt)}</span>
                </div>         
              </div>
            </div>
          </div>

          {/* Property Info Card */}
          <div className="col-span-12 lg:col-span-4 bg-primary text-on-primary rounded-[2rem] p-8 shadow-[0_32px_64px_-12px_rgba(0,90,183,0.15)] relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-xs font-label uppercase tracking-[0.2em] mb-8 opacity-70">Thông tin căn hộ</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-4xl font-display font-extrabold tracking-tighter">{request.apartment?.code || 'N/A'}</p>
                  <p className="text-primary-fixed-dim/80 font-medium">Diện tích: {request.apartment?.area || 0} m2</p>
                </div>
                <div className="h-px bg-on-primary/10"></div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined opacity-70">apartment</span>
                    <p className="font-medium text-lg leading-tight">{request.building?.name || 'N/A'}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined opacity-70">location_on</span>
                    <p className="text-sm opacity-80 leading-relaxed">{request.building?.address || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Abstract visual element */}
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-primary-container rounded-full opacity-20 blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
          </div>

          {/* Resident Details Card */}
          <div className="col-span-12 lg:col-span-12 bg-surface-container-low rounded-[2rem] p-8 border border-white/40">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xs font-label uppercase tracking-widest text-on-surface-variant/60">Thông tin cư dân</h3>
              <span className="material-symbols-outlined text-on-surface-variant/40">person_search</span>
            </div>
            <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-sm">
                <span className="text-3xl font-display font-bold text-primary">
                  {request.resident?.name?.charAt(0) || '?'}
                </span>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-on-surface">{request.resident?.name || 'N/A'}</h4>
                <p className="text-on-surface-variant">Cư dân chính thức</p>
              </div>
            </div>
            <div className="space-y-4">
              <a className="flex items-center gap-4 p-4 bg-white rounded-2xl hover:bg-white/50 transition-colors" href={`tel:${request.resident?.phone}`}>
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>call</span>
                <span className="font-bold text-on-surface">{request.resident?.phone || 'N/A'}</span>
              </a>
              <a className="flex items-center gap-4 p-4 bg-white rounded-2xl hover:bg-white/50 transition-colors" href={`mailto:${request.resident?.email}`}>
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>mail</span>
                <span className="text-on-surface font-medium">{request.resident?.email || 'N/A'}</span>
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}