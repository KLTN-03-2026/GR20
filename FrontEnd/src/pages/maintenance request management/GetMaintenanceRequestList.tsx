// // import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// // import React, { useState, useEffect } from 'react';
// // import { Link, useNavigate } from 'react-router-dom';
// // import { toast } from 'react-toastify';
// // import { maintenanceRequestApi } from 'src/apis/maintenanceRequest_api/maintenanceRequest.api';
// // import type { maintenanceRequest } from 'src/types/maintenanceRequest.type';


// // export default function GetMaintenanceRequestList() {
// //    const navigate = useNavigate();
// //   const queryClient = useQueryClient();
// //   const [searchTerm, setSearchTerm] = useState('');
// //   const [filterStatus, setFilterStatus] = useState('all');

// //   // useQuery - Lấy danh sách yêu cầu
// //   const { data: requests = [], isLoading, refetch } = useQuery({
// //     queryKey: ['maintenance-requests'],
// //     queryFn: async () => {
// //       const response = await maintenanceRequestApi.getAllMaintenanceRequest();
// //       return response.data.data;
// //     },
// //   });

// //   // useMutation - Xóa yêu cầu
// //   const { mutate: deleteRequest, isPending: isDeleting } = useMutation({
// //     mutationFn: (id: string) => maintenanceRequestApi.deleteMaintenanceRequest(id),
// //     onSuccess: () => {
// //       toast.success('Xóa yêu cầu thành công');
// //       queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
// //     },
// //     onError: (error: any) => {
// //       toast.error(error.response?.data?.message || 'Không thể xóa yêu cầu');
// //     },
// //   });

// //   // Tính toán stats
// //   const stats = {
// //     open: requests.filter((r: maintenanceRequest) => r.status === 'OPEN').length,
// //     urgent: requests.filter((r: maintenanceRequest) => r.priority === 'URGENT' || r.priority === 'HIGH').length,
// //     completed: requests.filter((r: maintenanceRequest) => r.status === 'DONE').length
// //   };

// //   // Format date - Sửa lại để xử lý lỗi
// // const formatDate = (dateString: string) => {
// //   if (!dateString) return 'N/A';
// //   try {
// //     const date = new Date(dateString);
// //     // Kiểm tra nếu date hợp lệ
// //     if (isNaN(date.getTime())) {
// //       return 'N/A';
// //     }
// //     return date.toLocaleDateString('vi-VN');
// //   } catch (error) {
// //     return 'N/A';
// //   }
// // };

// //   // Lọc dữ liệu
// //   const filteredRequests = requests.filter((request: maintenanceRequest) => {
// //     const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
// //                           request.description.toLowerCase().includes(searchTerm.toLowerCase());
// //     const matchesStatus = filterStatus === 'all' || 
// //                           (filterStatus === 'open' && request.status === 'OPEN') ||
// //                           (filterStatus === 'pending' && request.status === 'IN_PROGRESS') ||
// //                           (filterStatus === 'done' && request.status === 'DONE');
// //     return matchesSearch && matchesStatus;
// //   });

// //   // Xử lý xóa
// //   const handleDelete = (id: string) => {
// //     if (window.confirm('Bạn có chắc muốn xóa yêu cầu này?')) {
// //       deleteRequest(id);
// //     }
// //   };

// //   // Priority badge
// //   const getPriorityBadge = (priority: string) => {
// //     switch (priority) {
// //       case 'URGENT':
// //         return <span className="px-3 py-1 bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-tighter rounded-full">KHẨN CẤP</span>;
// //       case 'HIGH':
// //         return <span className="px-3 py-1 bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-tighter rounded-full">CAO</span>;
// //       case 'MEDIUM':
// //         return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-[10px] font-black uppercase tracking-tighter rounded-full">TRUNG BÌNH</span>;
// //       case 'LOW':
// //         return <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-tighter rounded-full">THẤP</span>;
// //       default:
// //         return <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-tighter rounded-full">{priority}</span>;
// //     }
// //   };

// //   // Status badge
// //   const getStatusBadge = (status: string) => {
// //     switch (status) {
// //       case 'OPEN':
// //         return <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-tighter rounded-full border border-blue-100">ĐANG MỞ</span>;
// //       case 'IN_PROGRESS':
// //         return <span className="px-3 py-1 bg-yellow-50 text-yellow-600 text-[10px] font-black uppercase tracking-tighter rounded-full border border-yellow-100">ĐANG XỬ LÝ</span>;
// //       case 'DONE':
// //         return <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-tighter rounded-full border border-green-200">ĐÃ XỬ LÝ</span>;
// //       case 'CANCELLED':
// //         return <span className="px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-tighter rounded-full border border-gray-200">ĐÃ HỦY</span>;
// //       default:
// //         return <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-tighter rounded-full">{status}</span>;
// //     }
// //   };

// //   // Icon theo title
// //   const getIcon = (title: string) => {
// //     if (title.toLowerCase().includes('điều hòa') || title.toLowerCase().includes('máy lạnh'))
// //       return { icon: 'ac_unit', color: 'bg-blue-50 text-blue-500' };
// //     if (title.toLowerCase().includes('tivi') || title.toLowerCase().includes('tv'))
// //       return { icon: 'tv', color: 'bg-amber-50 text-amber-500' };
// //     if (title.toLowerCase().includes('toilet') || title.toLowerCase().includes('wc'))
// //       return { icon: 'plumbing', color: 'bg-red-50 text-red-500' };
// //     if (title.toLowerCase().includes('tủ lạnh'))
// //       return { icon: 'kitchen', color: 'bg-blue-50 text-blue-500' };
// //     return { icon: 'build', color: 'bg-slate-50 text-slate-500' };
// //   };

// //   if (isLoading) {
// //     return (
// //       <div className="flex justify-center items-center h-screen bg-surface">
// //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="bg-surface text-on-surface antialiased font-body">
// //       {/* Side Navigation Bar */}
// //       <aside className="h-screen w-64 fixed left-0 top-0 z-40 bg-[#f7f9fb] flex flex-col p-4 gap-2 border-r border-transparent">
// //         <div className="flex items-center gap-3 px-2 mb-8">
// //           <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg overflow-hidden">
// //             <span className="material-symbols-outlined text-white">home_work</span>
// //           </div>
// //           <div>
// //             <h1 className="font-black text-slate-900 leading-tight">Quản Lý Chung Cư</h1>
// //             <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Phân khu Cao Cấp</p>
// //           </div>
// //         </div>
        
// //         <nav className="flex-1 space-y-1">
// //           <a className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-100 hover:translate-x-1 transition-transform cursor-pointer font-medium text-sm">
// //             <span className="material-symbols-outlined">dashboard</span>
// //             <span>Tổ chức</span>
// //           </a>
// //           <a className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-100 hover:translate-x-1 transition-transform cursor-pointer font-medium text-sm">
// //             <span className="material-symbols-outlined">group</span>
// //             <span>Cư dân</span>
// //           </a>
// //           <a className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-100 hover:translate-x-1 transition-transform cursor-pointer font-medium text-sm">
// //             <span className="material-symbols-outlined">apartment</span>
// //             <span>Căn hộ</span>
// //           </a>
// //           <a className="flex items-center gap-3 px-4 py-3 bg-white text-blue-600 shadow-sm rounded-lg hover:translate-x-1 transition-transform cursor-pointer font-medium text-sm">
// //             <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>build</span>
// //             <span>Bảo trì</span>
// //           </a>
// //           <a className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-100 hover:translate-x-1 transition-transform cursor-pointer font-medium text-sm">
// //             <span className="material-symbols-outlined">receipt_long</span>
// //             <span>Hóa đơn</span>
// //           </a>
// //         </nav>

// //         <div className="mt-auto space-y-1 pt-4 border-t border-slate-200/50">
// //           <a className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-100 transition-all font-medium text-sm">
// //             <span className="material-symbols-outlined">help</span>
// //             <span>Trợ giúp</span>
// //           </a>
// //           <a className="flex items-center gap-3 px-4 py-3 text-error hover:bg-error-container/20 transition-all font-medium text-sm">
// //             <span className="material-symbols-outlined">logout</span>
// //             <span>Đăng xuất</span>
// //           </a>
// //         </div>
// //       </aside>

// //       {/* Main Content Canvas */}
// //       <main className="ml-64 min-h-screen">
// //         {/* Top App Bar */}
// //         <header className="fixed top-0 right-0 left-64 z-30 bg-white/70 backdrop-blur-xl h-16 flex justify-between items-center px-8 shadow-sm shadow-blue-900/5">
// //           <h2 className="text-xl font-bold tracking-tighter text-slate-900">Yêu cầu Bảo trì</h2>
// //           <div className="flex items-center gap-6">
// //             <div className="relative flex items-center">
// //               <span className="material-symbols-outlined absolute left-3 text-slate-400 text-sm">search</span>
// //               <input
// //                 type="text"
// //                 value={searchTerm}
// //                 onChange={(e) => setSearchTerm(e.target.value)}
// //                 className="pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-primary/20 transition-all"
// //                 placeholder="Tìm kiếm yêu cầu..."
// //               />
// //             </div>
// //             <div className="flex items-center gap-3">
// //               <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative">
// //                 <span className="material-symbols-outlined">notifications</span>
// //                 <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
// //               </button>
// //               <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
// //                 <span className="material-symbols-outlined">settings</span>
// //               </button>
// //             </div>
// //           </div>
// //         </header>

// //         {/* Content Canvas */}
// //         <div className="pt-24 px-8 pb-12">
// //           {/* Analytics Cards */}
// //           <div className="grid grid-cols-12 gap-6 mb-8">
// //             <div className="col-span-12 lg:col-span-8 grid grid-cols-3 gap-4">
// //               <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border-none">
// //                 <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Đang mở</p>
// //                 <div className="flex items-end justify-between">
// //                   <h3 className="text-3xl font-extrabold text-primary">{stats.open}</h3>
// //                 </div>
// //               </div>
// //               <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border-none">
// //                 <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Khẩn cấp</p>
// //                 <div className="flex items-end justify-between">
// //                   <h3 className="text-3xl font-extrabold text-error">{stats.urgent}</h3>
// //                 </div>
// //               </div>
// //               <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border-none">
// //                 <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Đã xử lý</p>
// //                 <div className="flex items-end justify-between">
// //                   <h3 className="text-3xl font-extrabold text-secondary">{stats.completed}</h3>
// //                 </div>
// //               </div>
// //             </div>
// //             <div className="col-span-12 lg:col-span-4 bg-primary-container text-white p-6 rounded-xl relative overflow-hidden flex flex-col justify-between">
// //               <div className="z-10">
// //                 <h4 className="font-bold text-lg leading-tight mb-1">Hiệu suất Đội ngũ</h4>
// //                 <p className="text-white/70 text-xs">Phản hồi trung bình: 15 phút</p>
// //               </div>
// //             </div>
// //           </div>

// //           {/* List Controls */}
// //           <div className="flex justify-between items-center mb-6">
// //             <div className="flex items-center gap-4">
// //               <div className="flex bg-surface-container-low p-1 rounded-xl">
// //                 <button
// //                   onClick={() => setFilterStatus('all')}
// //                   className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${filterStatus === 'all' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-900'}`}
// //                 >
// //                   Tất cả
// //                 </button>
// //                 <button
// //                   onClick={() => setFilterStatus('open')}
// //                   className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${filterStatus === 'open' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-900'}`}
// //                 >
// //                   Đang chờ
// //                 </button>
// //                 <button
// //                   onClick={() => setFilterStatus('done')}
// //                   className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${filterStatus === 'done' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-900'}`}
// //                 >
// //                   Đã xong
// //                 </button>
// //               </div>
// //             </div>
// //             <button
// //               onClick={() => navigate('/addMaintenanceDetail')}
// //               className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-br from-primary to-primary-container text-white text-sm font-bold rounded-full shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
// //             >
// //               <span className="material-symbols-outlined text-sm">add</span>
// //               Tạo yêu cầu mới
// //             </button>
// //           </div>

// //           {/* Maintenance Request Table */}
// //           <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden border-none">
// //             <table className="w-full text-left border-collapse">
// //               <thead>
// //                 <tr className="bg-surface-container-low/50">
// //                   <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">ID</th>
// //                   <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Tiêu đề</th>
// //                   <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Ưu tiên</th>
// //                   <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Trạng thái</th>
// //                   <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Ngày báo cáo</th>
// //                   <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Hành động</th>
// //                 </tr>
// //               </thead>
// //               <tbody className="divide-y divide-slate-50">
// //                 {filteredRequests.length === 0 ? (
// //                   <tr>
// //                     <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
// //                       Không có yêu cầu bảo trì nào
// //                     </td>
// //                   </tr>
// //                 ) : (
// //                   filteredRequests.map((request) => {
// //                     const { icon, color } = getIcon(request.title);
// //                     return (
// //                       <tr key={request.id} className="hover:bg-slate-50/50 transition-colors group">
// //                         <td className="px-6 py-4 text-xs font-bold text-slate-400">#{request.id}</td>
// //                         <td className="px-6 py-4">
// //                           <div className="flex items-center gap-3">
// //                             <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center`}>
// //                               <span className="material-symbols-outlined text-sm">{icon}</span>
// //                             </div>
// //                             <div>
// //                               <p className="text-sm font-bold text-slate-900">{request.title}</p>
// //                               <p className="text-[10px] text-slate-500">Căn hộ: {request.apartmentId}</p>
// //                             </div>
// //                           </div>
// //                         </td>
// //                         <td className="px-6 py-4 text-center">{getPriorityBadge(request.priority)}</td>
// //                         <td className="px-6 py-4 text-center">{getStatusBadge(request.status)}</td>
// //                         <td className="px-6 py-4 text-xs text-slate-500">{formatDate(request.createdAt)}</td>
// //                         <td className="px-6 py-4 text-right">
// //                           <div className="flex justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
// //                             <Link
// //                             to={`/maintenanceDetail/${request.id}`} 
// //                               // onClick={() => navigate(`/maintenanceDetail/${request.id}`)}
// //                               className="p-2 hover:bg-primary-fixed text-primary rounded-lg transition-colors"
// //                             >
// //                               <span className="material-symbols-outlined text-sm">visibility</span>
// //                             </Link >
// //                             {request.status === 'OPEN' && (
// //                               <>
// //                                 <button
// //                                   onClick={() => navigate(`/maintenance/${request.id}/edit`)}
// //                                   className="p-2 hover:bg-slate-100 text-slate-500 rounded-lg transition-colors"
// //                                 >
// //                                   <span className="material-symbols-outlined text-sm">edit</span>
// //                                 </button>
// //                                 <button
// //                                   onClick={() => handleDelete(request.id)}
// //                                   className="p-2 hover:bg-error-container/20 text-error rounded-lg transition-colors"
// //                                 >
// //                                   <span className="material-symbols-outlined text-sm">delete</span>
// //                                 </button>
// //                               </>
// //                             )}
// //                           </div>
// //                         </td>
// //                       </tr>
// //                     );
// //                   })
// //                 )}
// //               </tbody>
// //             </table>

// //             {/* Pagination */}
// //             {/* {pagination.totalPages > 0 && (
// //               <div className="px-6 py-4 flex items-center justify-between border-t border-slate-50">
// //                 <p className="text-xs text-slate-500 font-medium">
// //                   Hiển thị <span className="text-slate-900">{filteredRequests.length}</span> trên{' '}
// //                   <span className="text-slate-900">{pagination.totalElements}</span> yêu cầu
// //                 </p>
// //                 <div className="flex gap-1">
// //                   <button
// //                     onClick={() => setPagination({ ...pagination, page: Math.max(0, pagination.page - 1) })}
// //                     disabled={pagination.page === 0}
// //                     className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-50"
// //                   >
// //                     <span className="material-symbols-outlined text-sm">chevron_left</span>
// //                   </button>
// //                   {[...Array(Math.min(3, pagination.totalPages))].map((_, i) => (
// //                     <button
// //                       key={i}
// //                       onClick={() => setPagination({ ...pagination, page: i })}
// //                       className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
// //                         pagination.page === i
// //                           ? 'bg-primary text-white'
// //                           : 'text-slate-600 hover:bg-slate-100'
// //                       }`}
// //                     >
// //                       {i + 1}
// //                     </button>
// //                   ))}
// //                   <button
// //                     onClick={() => setPagination({ ...pagination, page: Math.min(pagination.totalPages - 1, pagination.page + 1) })}
// //                     disabled={pagination.page >= pagination.totalPages - 1}
// //                     className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-50"
// //                   >
// //                     <span className="material-symbols-outlined text-sm">chevron_right</span>
// //                   </button>
// //                 </div>
// //               </div>
// //             )} */}
// //           </div>

// //           {/* AI Insight Section */}
// //           <div className="mt-8 bg-surface-bright/60 backdrop-blur-lg p-6 rounded-2xl shadow-xl shadow-blue-900/5 border border-white/50 flex items-center gap-6">
// //             <div className="w-12 h-12 bg-secondary-fixed rounded-full flex items-center justify-center text-on-secondary-fixed-variant">
// //               <span className="material-symbols-outlined">auto_awesome</span>
// //             </div>
// //             <div>
// //               <h4 className="text-sm font-black text-slate-900 uppercase tracking-tighter">Phân tích Hệ thống (AI)</h4>
// //               <p className="text-xs text-on-surface-variant leading-relaxed mt-1">
// //                 Gần 60% yêu cầu bảo trì liên quan đến <span className="font-bold text-primary">Hệ thống Điều hòa</span>. 
// //                 Gợi ý: Thực hiện kiểm tra định kỳ để giảm thiểu sự cố khẩn cấp.
// //               </p>
// //             </div>
// //           </div>
// //         </div>
// //       </main>
// //     </div>
// //   );
// // }


// import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import { maintenanceRequestApi } from 'src/apis/maintenanceRequest_api/maintenanceRequest.api';
// import type { maintenanceRequest, maintenanceRequestDetail } from 'src/types/maintenanceRequest.type';

// export default function GetMaintenanceRequestList() {
//   const navigate = useNavigate();
//   const queryClient = useQueryClient();
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterStatus, setFilterStatus] = useState('all');
  
//   // State cho modal chỉnh sửa
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [editingRequest, setEditingRequest] = useState<maintenanceRequestDetail | null>(null);
//   const [editFormData, setEditFormData] = useState({
//     title: '',
//     description: '',
//     priority: 'MEDIUM'
//   });

//   // useQuery - Lấy danh sách yêu cầu
//   const { data: requests = [], isLoading, refetch } = useQuery({
//     queryKey: ['maintenance-requests'],
//     queryFn: async () => {
//       const response = await maintenanceRequestApi.getAllMaintenanceRequest();
//       return response.data.data as maintenanceRequest[];
//     },
//   });

//   // useMutation - Xóa yêu cầu
//   const { mutate: deleteRequest, isPending: isDeleting } = useMutation({
//     mutationFn: (id: string) => maintenanceRequestApi.deleteMaintenanceRequest(id),
//     onSuccess: () => {
//       toast.success('Xóa yêu cầu thành công');
//       queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
//     },
//     onError: (error: any) => {
//       toast.error(error.response?.data?.message || 'Không thể xóa yêu cầu');
//     },
//   });

//   // useMutation - Cập nhật yêu cầu (dùng updateStatusByStaff)
//   const { mutate: updateRequest, isPending: isUpdating } = useMutation({
//     mutationFn: ({ id, body }: { id: string; body: { title: string; description: string; priority: string } }) =>
//       maintenanceRequestApi.updateStatusByStaff(id, body),
//     onSuccess: () => {
//       toast.success('Cập nhật yêu cầu thành công');
//       queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
//       setIsEditModalOpen(false);
//       setEditingRequest(null);
//     },
//     onError: (error: any) => {
//       toast.error(error.response?.data?.message || 'Không thể cập nhật yêu cầu');
//     },
//   });

//   // Tính toán stats
//   // const stats = {
//   //   open: requests.filter((r: maintenance) => r.status === 'OPEN').length,
//   //   urgent: requests.filter((r: maintenanceRequestDetail) => r.priority === 'URGENT' || r.priority === 'HIGH').length,
//   //   completed: requests.filter((r: maintenanceRequestDetail) => r.status === 'DONE').length
//   // };

//   // Format date
//   const formatDate = (dateString: string) => {
//     if (!dateString) return 'N/A';
//     try {
//       const date = new Date(dateString);
//       if (isNaN(date.getTime())) return 'N/A';
//       return date.toLocaleDateString('vi-VN');
//     } catch {
//       return 'N/A';
//     }
//   };

//   // Lọc dữ liệu
//   // const filteredRequests = requests.filter((request: maintenanceRequestDetail) => {
//   //   const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//   //                         request.description.toLowerCase().includes(searchTerm.toLowerCase());
//   //   const matchesStatus = filterStatus === 'all' || 
//   //                         (filterStatus === 'open' && request.status === 'OPEN') ||
//   //                         (filterStatus === 'pending' && request.status === 'IN_PROGRESS') ||
//   //                         (filterStatus === 'done' && request.status === 'DONE');
//   //   return matchesSearch && matchesStatus;
//   // });

//   // Xử lý xóa
//   const handleDelete = (id: string) => {
//     if (window.confirm('Bạn có chắc muốn xóa yêu cầu này?')) {
//       deleteRequest(id);
//     }
//   };

//   // Mở modal chỉnh sửa
//   const handleOpenEditModal = (request: maintenanceRequestDetail) => {
//     setEditingRequest(request);
//     setEditFormData({
//       title: request.title,
//       description: request.description,
//       priority: request.priority
//     });
//     setIsEditModalOpen(true);
//   };

//   // Xử lý submit chỉnh sửa
//   const handleUpdateSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (editingRequest) {
//       updateRequest({
//         id: editingRequest.id,
//         body: editFormData
//       });
//     }
//   };

//   // Priority badge
//   const getPriorityBadge = (priority: string) => {
//     switch (priority) {
//       case 'URGENT':
//         return <span className="px-3 py-1 bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-tighter rounded-full">KHẨN CẤP</span>;
//       case 'HIGH':
//         return <span className="px-3 py-1 bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-tighter rounded-full">CAO</span>;
//       case 'MEDIUM':
//         return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-[10px] font-black uppercase tracking-tighter rounded-full">TRUNG BÌNH</span>;
//       case 'LOW':
//         return <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-tighter rounded-full">THẤP</span>;
//       default:
//         return <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-tighter rounded-full">{priority}</span>;
//     }
//   };

//   // Status badge
//   const getStatusBadge = (status: string) => {
//     switch (status) {
//       case 'OPEN':
//         return <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-tighter rounded-full border border-blue-100">ĐANG MỞ</span>;
//       case 'IN_PROGRESS':
//         return <span className="px-3 py-1 bg-yellow-50 text-yellow-600 text-[10px] font-black uppercase tracking-tighter rounded-full border border-yellow-100">ĐANG XỬ LÝ</span>;
//       case 'DONE':
//         return <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-tighter rounded-full border border-green-200">ĐÃ XỬ LÝ</span>;
//       case 'CANCELLED':
//         return <span className="px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-tighter rounded-full border border-gray-200">ĐÃ HỦY</span>;
//       default:
//         return <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-tighter rounded-full">{status}</span>;
//     }
//   };

//   // Icon theo title
//   const getIcon = (title: string) => {
//     if (title.toLowerCase().includes('điều hòa') || title.toLowerCase().includes('máy lạnh'))
//       return { icon: 'ac_unit', color: 'bg-blue-50 text-blue-500' };
//     if (title.toLowerCase().includes('tivi') || title.toLowerCase().includes('tv'))
//       return { icon: 'tv', color: 'bg-amber-50 text-amber-500' };
//     if (title.toLowerCase().includes('toilet') || title.toLowerCase().includes('wc'))
//       return { icon: 'plumbing', color: 'bg-red-50 text-red-500' };
//     if (title.toLowerCase().includes('tủ lạnh'))
//       return { icon: 'kitchen', color: 'bg-blue-50 text-blue-500' };
//     return { icon: 'build', color: 'bg-slate-50 text-slate-500' };
//   };

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center h-screen bg-surface">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-surface text-on-surface antialiased font-body">
//       {/* Side Navigation Bar */}
//       <aside className="h-screen w-64 fixed left-0 top-0 z-40 bg-[#f7f9fb] flex flex-col p-4 gap-2 border-r border-transparent">
//         <div className="flex items-center gap-3 px-2 mb-8">
//           <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg overflow-hidden">
//             <span className="material-symbols-outlined text-white">home_work</span>
//           </div>
//           <div>
//             <h1 className="font-black text-slate-900 leading-tight">Quản Lý Chung Cư</h1>
//             <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Phân khu Cao Cấp</p>
//           </div>
//         </div>
        
//         <nav className="flex-1 space-y-1">
//           <a className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-100 hover:translate-x-1 transition-transform cursor-pointer font-medium text-sm">
//             <span className="material-symbols-outlined">dashboard</span>
//             <span>Tổ chức</span>
//           </a>
//           <a className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-100 hover:translate-x-1 transition-transform cursor-pointer font-medium text-sm">
//             <span className="material-symbols-outlined">group</span>
//             <span>Cư dân</span>
//           </a>
//           <a className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-100 hover:translate-x-1 transition-transform cursor-pointer font-medium text-sm">
//             <span className="material-symbols-outlined">apartment</span>
//             <span>Căn hộ</span>
//           </a>
//           <a className="flex items-center gap-3 px-4 py-3 bg-white text-blue-600 shadow-sm rounded-lg hover:translate-x-1 transition-transform cursor-pointer font-medium text-sm">
//             <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>build</span>
//             <span>Bảo trì</span>
//           </a>
//           <a className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-100 hover:translate-x-1 transition-transform cursor-pointer font-medium text-sm">
//             <span className="material-symbols-outlined">receipt_long</span>
//             <span>Hóa đơn</span>
//           </a>
//         </nav>

//         <div className="mt-auto space-y-1 pt-4 border-t border-slate-200/50">
//           <a className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-100 transition-all font-medium text-sm">
//             <span className="material-symbols-outlined">help</span>
//             <span>Trợ giúp</span>
//           </a>
//           <a className="flex items-center gap-3 px-4 py-3 text-error hover:bg-error-container/20 transition-all font-medium text-sm">
//             <span className="material-symbols-outlined">logout</span>
//             <span>Đăng xuất</span>
//           </a>
//         </div>
//       </aside>

//       {/* Main Content Canvas */}
//       <main className="ml-64 min-h-screen">
//         {/* Top App Bar */}
//         <header className="fixed top-0 right-0 left-64 z-30 bg-white/70 backdrop-blur-xl h-16 flex justify-between items-center px-8 shadow-sm shadow-blue-900/5">
//           <h2 className="text-xl font-bold tracking-tighter text-slate-900">Yêu cầu Bảo trì</h2>
//           <div className="flex items-center gap-6">
//             <div className="relative flex items-center">
//               <span className="material-symbols-outlined absolute left-3 text-slate-400 text-sm">search</span>
//               <input
//                 type="text"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-primary/20 transition-all"
//                 placeholder="Tìm kiếm yêu cầu..."
//               />
//             </div>
//             <div className="flex items-center gap-3">
//               <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative">
//                 <span className="material-symbols-outlined">notifications</span>
//                 <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
//               </button>
//               <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
//                 <span className="material-symbols-outlined">settings</span>
//               </button>
//             </div>
//           </div>
//         </header>

//         {/* Content Canvas */}
//         <div className="pt-24 px-8 pb-12">
//           {/* Analytics Cards */}
//           <div className="grid grid-cols-12 gap-6 mb-8">
//             <div className="col-span-12 lg:col-span-8 grid grid-cols-3 gap-4">
//               <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border-none">
//                 <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Đang mở</p>
//                 <div className="flex items-end justify-between">
//                   {/* <h3 className="text-3xl font-extrabold text-primary">{stats.open}</h3> */}
//                 </div>
//               </div>
//               <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border-none">
//                 <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Khẩn cấp</p>
//                 <div className="flex items-end justify-between">
//                   {/* <h3 className="text-3xl font-extrabold text-error">{stats.urgent}</h3> */}
//                 </div>
//               </div>
//               <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border-none">
//                 <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Đã xử lý</p>
//                 <div className="flex items-end justify-between">
//                   {/* <h3 className="text-3xl font-extrabold text-secondary">{stats.completed}</h3> */}
//                 </div>
//               </div>
//             </div>
//             <div className="col-span-12 lg:col-span-4 bg-primary-container text-white p-6 rounded-xl relative overflow-hidden flex flex-col justify-between">
//               <div className="z-10">
//                 <h4 className="font-bold text-lg leading-tight mb-1">Hiệu suất Đội ngũ</h4>
//                 <p className="text-white/70 text-xs">Phản hồi trung bình: 15 phút</p>
//               </div>
//             </div>
//           </div>

//           {/* List Controls */}
//           <div className="flex justify-between items-center mb-6">
//             <div className="flex items-center gap-4">
//               <div className="flex bg-surface-container-low p-1 rounded-xl">
//                 <button
//                   onClick={() => setFilterStatus('all')}
//                   className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${filterStatus === 'all' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-900'}`}
//                 >
//                   Tất cả
//                 </button>
//                 <button
//                   onClick={() => setFilterStatus('open')}
//                   className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${filterStatus === 'open' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-900'}`}
//                 >
//                   Đang chờ
//                 </button>
//                 <button
//                   onClick={() => setFilterStatus('done')}
//                   className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${filterStatus === 'done' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-900'}`}
//                 >
//                   Đã xong
//                 </button>
//               </div>
//             </div>
//             <button
//               onClick={() => navigate('/addMaintenanceDetail')}
//               className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-br from-primary to-primary-container text-white text-sm font-bold rounded-full shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
//             >
//               <span className="material-symbols-outlined text-sm">add</span>
//               Tạo yêu cầu mới
//             </button>
//           </div>

//           {/* Maintenance Request Table */}
//           <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden border-none">
//             <table className="w-full text-left border-collapse">
//               <thead>
//                 <tr className="bg-surface-container-low/50">
//                   <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">ID</th>
//                   <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Tiêu đề</th>
//                   <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Ưu tiên</th>
//                   <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Trạng thái</th>
//                   <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Ngày báo cáo</th>
//                   <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Hành động</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-50">
//                 {filteredRequests.length === 0 ? (
//                   <tr>
//                     <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
//                       Không có yêu cầu bảo trì nào
//                     </td>
//                   </tr>
//                 ) : (
//                   filteredRequests.map((request) => {
//                     const { icon, color } = getIcon(request.title);
//                     return (
//                       <tr key={request.id} className="hover:bg-slate-50/50 transition-colors group">
//                         <td className="px-6 py-4 text-xs font-bold text-slate-400">#{request.id}</td>
//                         <td className="px-6 py-4">
//                           <div className="flex items-center gap-3">
//                             <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center`}>
//                               <span className="material-symbols-outlined text-sm">{icon}</span>
//                             </div>
//                             <div>
//                               <p className="text-sm font-bold text-slate-900">{request.title}</p>
//                               <p className="text-[10px] text-slate-500">Căn hộ: {request.apartmentId}</p>
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 text-center">{getPriorityBadge(request.priority)}</td>
//                         <td className="px-6 py-4 text-center">{getStatusBadge(request.status)}</td>
//                         <td className="px-6 py-4 text-xs text-slate-500">{formatDate(request.reportedAt)}</td>
//                         <td className="px-6 py-4 text-right">
//                           <div className="flex justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
//                             <button
//                               onClick={() => navigate(`/maintenanceDetail/${request.id}`)}
//                               className="p-2 hover:bg-primary-fixed text-primary rounded-lg transition-colors"
//                             >
//                               <span className="material-symbols-outlined text-sm">visibility</span>
//                             </button>
//                             {request.status === 'OPEN' && (
//                               <>
//                                 <button
//                                   onClick={() => handleOpenEditModal(request)}
//                                   className="p-2 hover:bg-slate-100 text-slate-500 rounded-lg transition-colors"
//                                 >
//                                   <span className="material-symbols-outlined text-sm">edit</span>
//                                 </button>
//                                 <button
//                                   onClick={() => handleDelete(request.id)}
//                                   className="p-2 hover:bg-error-container/20 text-error rounded-lg transition-colors"
//                                 >
//                                   <span className="material-symbols-outlined text-sm">delete</span>
//                                 </button>
//                               </>
//                             )}
//                           </div>
//                         </td>
//                       </tr>
//                     );
//                   })
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* AI Insight Section */}
//           <div className="mt-8 bg-surface-bright/60 backdrop-blur-lg p-6 rounded-2xl shadow-xl shadow-blue-900/5 border border-white/50 flex items-center gap-6">
//             <div className="w-12 h-12 bg-secondary-fixed rounded-full flex items-center justify-center text-on-secondary-fixed-variant">
//               <span className="material-symbols-outlined">auto_awesome</span>
//             </div>
//             <div>
//               <h4 className="text-sm font-black text-slate-900 uppercase tracking-tighter">Phân tích Hệ thống (AI)</h4>
//               <p className="text-xs text-on-surface-variant leading-relaxed mt-1">
//                 Gần 60% yêu cầu bảo trì liên quan đến <span className="font-bold text-primary">Hệ thống Điều hòa</span>. 
//                 Gợi ý: Thực hiện kiểm tra định kỳ để giảm thiểu sự cố khẩn cấp.
//               </p>
//             </div>
//           </div>
//         </div>
//       </main>

//       {/* Modal chỉnh sửa */}
//       {isEditModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
//           <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//             {/* Header */}
//             <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
//               <div className="flex justify-between items-center">
//                 <div>
//                   <h2 className="text-2xl font-bold text-gray-800">Chỉnh sửa yêu cầu bảo trì</h2>
//                   <p className="text-sm text-gray-500 mt-1">Cập nhật thông tin yêu cầu #{editingRequest?.id}</p>
//                 </div>
//                 <button
//                   onClick={() => setIsEditModalOpen(false)}
//                   className="text-gray-400 hover:text-gray-600 transition-colors"
//                 >
//                   <span className="material-symbols-outlined">close</span>
//                 </button>
//               </div>
//             </div>

//             {/* Form */}
//             <form onSubmit={handleUpdateSubmit} className="p-6 space-y-6">
//               {/* Tiêu đề */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Tiêu đề <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="title"
//                   value={editFormData.title}
//                   onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   required
//                 />
//               </div>

//               {/* Mức độ ưu tiên */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-3">
//                   Mức độ ưu tiên
//                 </label>
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//                   {[
//                     { value: 'LOW', label: 'Thấp', color: 'bg-green-100 text-green-800 border-green-400' },
//                     { value: 'MEDIUM', label: 'Trung bình', color: 'bg-yellow-100 text-yellow-800 border-yellow-400' },
//                     { value: 'HIGH', label: 'Cao', color: 'bg-orange-100 text-orange-800 border-orange-400' },
//                     { value: 'URGENT', label: 'Khẩn cấp', color: 'bg-red-100 text-red-800 border-red-400' }
//                   ].map((priority) => (
//                     <button
//                       key={priority.value}
//                       type="button"
//                       onClick={() => setEditFormData({ ...editFormData, priority: priority.value })}
//                       className={`px-4 py-3 rounded-lg font-medium transition-all border-2 ${
//                         editFormData.priority === priority.value
//                           ? `${priority.color} ring-2 ring-offset-2 ring-blue-500`
//                           : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
//                       }`}
//                     >
//                       {priority.label}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {/* Mô tả chi tiết */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Mô tả chi tiết <span className="text-red-500">*</span>
//                 </label>
//                 <textarea
//                   name="description"
//                   value={editFormData.description}
//                   onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
//                   rows={6}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
//                   required
//                 />
//                 <p className="mt-1 text-xs text-gray-500">
//                   {editFormData.description.length} / 1000 ký tự
//                 </p>
//               </div>

//               {/* Buttons */}
//               <div className="flex gap-3 pt-4">
//                 <button
//                   type="submit"
//                   disabled={isUpdating}
//                   className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
//                 >
//                   {isUpdating ? 'Đang cập nhật...' : 'Cập nhật'}
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => setIsEditModalOpen(false)}
//                   className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors"
//                 >
//                   Hủy bỏ
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

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
        return <span className="px-3 py-1 bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-tighter rounded-full">KHẨN CẤP</span>;
      case 'HIGH':
        return <span className="px-3 py-1 bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-tighter rounded-full">CAO</span>;
      case 'MEDIUM':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-[10px] font-black uppercase tracking-tighter rounded-full">TRUNG BÌNH</span>;
      case 'LOW':
        return <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-tighter rounded-full">THẤP</span>;
      default:
        return <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-tighter rounded-full">{priority}</span>;
    }
  };

  // Status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-tighter rounded-full border border-blue-100">ĐANG MỞ</span>;
      case 'IN_PROGRESS':
        return <span className="px-3 py-1 bg-yellow-50 text-yellow-600 text-[10px] font-black uppercase tracking-tighter rounded-full border border-yellow-100">ĐANG XỬ LÝ</span>;
      case 'DONE':
        return <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-tighter rounded-full border border-green-200">ĐÃ XỬ LÝ</span>;
      case 'CANCELLED':
        return <span className="px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-tighter rounded-full border border-gray-200">ĐÃ HỦY</span>;
      default:
        return <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-tighter rounded-full">{status}</span>;
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
      <aside className="h-screen w-64 fixed left-0 top-0 z-40 bg-[#f7f9fb] flex flex-col p-4 gap-2 border-r border-transparent">
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg overflow-hidden">
            <span className="material-symbols-outlined text-white">home_work</span>
          </div>
          <div>
            <h1 className="font-black text-slate-900 leading-tight">Quản Lý Chung Cư</h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Phân khu Cao Cấp</p>
          </div>
        </div>
        
        <nav className="flex-1 space-y-1">
          <a className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-100 hover:translate-x-1 transition-transform cursor-pointer font-medium text-sm">
            <span className="material-symbols-outlined">dashboard</span>
            <span>Tổ chức</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-100 hover:translate-x-1 transition-transform cursor-pointer font-medium text-sm">
            <span className="material-symbols-outlined">group</span>
            <span>Cư dân</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-100 hover:translate-x-1 transition-transform cursor-pointer font-medium text-sm">
            <span className="material-symbols-outlined">apartment</span>
            <span>Căn hộ</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 bg-white text-blue-600 shadow-sm rounded-lg hover:translate-x-1 transition-transform cursor-pointer font-medium text-sm">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>build</span>
            <span>Bảo trì</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-100 hover:translate-x-1 transition-transform cursor-pointer font-medium text-sm">
            <span className="material-symbols-outlined">receipt_long</span>
            <span>Hóa đơn</span>
          </a>
        </nav>

        <div className="mt-auto space-y-1 pt-4 border-t border-slate-200/50">
          <a className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-100 transition-all font-medium text-sm">
            <span className="material-symbols-outlined">help</span>
            <span>Trợ giúp</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-error hover:bg-error-container/20 transition-all font-medium text-sm">
            <span className="material-symbols-outlined">logout</span>
            <span>Đăng xuất</span>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        {/* Top App Bar */}
        <header className="fixed top-0 right-0 left-64 z-30 bg-white/70 backdrop-blur-xl h-16 flex justify-between items-center px-8 shadow-sm shadow-blue-900/5">
          <h2 className="text-xl font-bold tracking-tighter text-slate-900">Yêu cầu Bảo trì</h2>
          <div className="flex items-center gap-6">
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-slate-400 text-sm">search</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="Tìm kiếm yêu cầu..."
              />
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
              </button>
              <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
                <span className="material-symbols-outlined">settings</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="pt-24 px-8 pb-12">
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
            <button onClick={() => navigate('/addMaintenanceDetail')} className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-br from-primary to-primary-container text-white text-sm font-bold rounded-full shadow-lg">
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
                    <td className="px-6 py-4 text-center">{getPriorityBadge(request.priority)}</td>
                    <td className="px-6 py-4 text-center">{getStatusBadge(request.status)}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{formatDate(request.reportedAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => navigate(`/maintenanceDetail/${request.id}`)} className="p-2 hover:bg-primary-fixed text-primary rounded-lg">
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