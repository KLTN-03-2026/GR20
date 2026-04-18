// import React from "react";

// export default function Getresidentlist() {
//   return (
//     <div className="bg-surface text-on-surface min-h-screen">
      
//       {/* TopNav */}
//       <nav className="fixed top-0 w-full z-50 flex items-center justify-between px-6 py-3 bg-slate-50/70 backdrop-blur-xl shadow-sm">
//         <div className="flex items-center gap-8">
//           <span className="text-xl font-bold">Homelink Admin</span>
//           <div className="hidden md:flex items-center bg-surface-container-low px-4 py-1.5 rounded-full border">
//             <span className="material-symbols-outlined text-sm">search</span>
//             <input
//               className="bg-transparent border-none focus:ring-0 text-sm w-64"
//               placeholder="Tìm kiếm cư dân..."
//             />
//           </div>
//         </div>
//       </nav>

//       {/* Sidebar */}
//       <aside className="fixed left-0 top-0 h-full w-64 bg-slate-50 border-r pt-20 hidden md:flex flex-col p-4">
//         <h2 className="text-lg font-bold mb-6">Admin Portal</h2>

//         <a className="flex items-center gap-3 px-4 py-3 hover:bg-slate-100 rounded-lg">
//           <span className="material-symbols-outlined">dashboard</span>
//           Dashboard
//         </a>

//         <a className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg">
//           <span className="material-symbols-outlined">group</span>
//           Tenants
//         </a>
//       </aside>

//       {/* Main */}
//       <main className="md:ml-64 pt-24 px-6 pb-12">

//         {/* Header */}
//         <div className="flex justify-between mb-10">
//           <div>
//             <h1 className="text-3xl font-bold">Quản lý Cư dân</h1>
//             <p className="text-sm text-gray-500">
//               Quản lý thông tin cư dân trong hệ thống
//             </p>
//           </div>

//           <button className="bg-blue-600 text-white px-6 py-2 rounded-full flex items-center gap-2">
//             <span className="material-symbols-outlined">person_add</span>
//             Thêm Cư dân
//           </button>
//         </div>

//         {/* Filter */}
//         <div className="bg-white p-6 rounded-xl mb-6 flex gap-4">
//           <select className="p-2 border rounded">
//             <option>Tất cả tòa nhà</option>
//             <option>Building A</option>
//             <option>Building B</option>
//           </select>

//           <select className="p-2 border rounded">
//             <option>Trạng thái</option>
//             <option>Active</option>
//             <option>Inactive</option>
//           </select>
//         </div>

//         {/* Table */}
//         <div className="bg-white rounded-xl shadow overflow-hidden">
//           <table className="w-full text-left">
//             <thead className="bg-gray-100 text-xs uppercase">
//               <tr>
//                 <th className="p-4">ID</th>
//                 <th className="p-4">Họ tên</th>
//                 <th className="p-4">Căn hộ</th>
//                 <th className="p-4">Tòa</th>
//                 <th className="p-4">Vai trò</th>
//                 <th className="p-4">Trạng thái</th>
//               </tr>
//             </thead>

//             <tbody>
//               <tr className="border-t hover:bg-gray-50">
//                 <td className="p-4">#001</td>
//                 <td className="p-4 font-semibold">Nguyễn Văn A</td>
//                 <td className="p-4">A101</td>
//                 <td className="p-4">Building A</td>
//                 <td className="p-4 text-blue-600 font-bold">OWNER</td>
//                 <td className="p-4 text-green-600 font-bold">ACTIVE</td>
//               </tr>

//               <tr className="border-t hover:bg-gray-50">
//                 <td className="p-4">#002</td>
//                 <td className="p-4 font-semibold">Trần Thị B</td>
//                 <td className="p-4">B1201</td>
//                 <td className="p-4">Building B</td>
//                 <td className="p-4">MEMBER</td>
//                 <td className="p-4 text-green-600 font-bold">ACTIVE</td>
//               </tr>
//             </tbody>
//           </table>
//         </div>
//       </main>
//     </div>
//   );
// }
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { residentApi } from 'src/apis/resident_api/residents.api'
import { buildingApi } from 'src/apis/building_api/buildings.api'
import { toast } from 'react-toastify'
import type { Resident } from 'src/types/resident.type'
import { useNavigate } from 'react-router-dom'


export default function Getresidentlist() {
  const queryClient = useQueryClient()
  const [selectedBuilding, setSelectedBuilding] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [page, setPage] = useState<number>(0)
  const pageSize = 10
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null)
  const navigate = useNavigate()

  // Lấy danh sách tòa nhà để lọc
  const { data: buildingsData } = useQuery({
    queryKey: ['buildings'],
    queryFn: () => buildingApi.getAllBuildings()
  })

  const buildings = buildingsData?.data.data || []

  // Lấy danh sách cư dân
  const { data: residentsData, isLoading } = useQuery({
    queryKey: ['residents', selectedBuilding, selectedStatus, page, pageSize],
    queryFn: () => {
      const params: any = { page, size: pageSize }
      if (selectedBuilding) params.buildingId = selectedBuilding
      if (selectedStatus) params.status = selectedStatus
      return residentApi.getAllResidents(params)
    }
  })

  const residents = residentsData?.data.data || []
  const totalElements = residentsData?.data.totalElements || 0
  const totalPages = residentsData?.data.totalPages || 0

  // Xóa cư dân
  const deleteMutation = useMutation({
    mutationFn: (id: string) => residentApi.deleteResident(id),
    onSuccess: () => {
      toast.success('Xóa cư dân thành công')
      queryClient.invalidateQueries({ queryKey: ['residents'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Xóa cư dân thất bại')
    }
  })

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa cư dân này?')) {
      deleteMutation.mutate(id)
    }
  }

  // Helper để hiển thị màu sắc cho status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-600 bg-green-50'
      case 'INACTIVE':
      case 'MOVED_OUT':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  // Helper để hiển thị tên status
  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Đang cư trú'
      case 'INACTIVE':
        return 'Không hoạt động'
      case 'MOVED_OUT':
        return 'Đã chuyển đi'
      default:
        return status
    }
  }

  // Helper để hiển thị màu cho relationship
  const getRelationshipColor = (relationship: string) => {
    switch (relationship) {
      case 'OWNER':
        return 'text-blue-600 bg-blue-50'
      case 'TENANT':
        return 'text-orange-600 bg-orange-50'
      case 'FAMILY':
        return 'text-purple-600 bg-purple-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  // Helper để hiển thị tên relationship
  const getRelationshipText = (relationship: string) => {
    switch (relationship) {
      case 'OWNER':
        return 'Chủ hộ'
      case 'TENANT':
        return 'Người thuê'
      case 'FAMILY':
        return 'Gia đình'
      default:
        return relationship
    }
  }

  if (isLoading) {
    return (
      <div className="md:ml-64 pt-24 px-6 pb-12 flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      {/* Main */}
      <main className="px-6 pb-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold">Quản lý Cư dân</h1>
            <p className="text-sm text-gray-500 mt-1">
              Quản lý thông tin cư dân trong hệ thống
            </p>
          </div>

          <button
  onClick={() => navigate('/residents/add')}
  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full flex items-center gap-2 transition-all"
>
  {/* <span className="material-symbols-outlined text-sm">person_add</span> */}
  Thêm Cư dân
</button>
        </div>

        {/* Filter */}
        <div className="bg-white p-6 rounded-xl mb-6 shadow-sm">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-gray-500 mb-1">Tòa nhà</label>
              <select 
                value={selectedBuilding}
                onChange={(e) => setSelectedBuilding(e.target.value)}
                className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả tòa nhà</option>
                {buildings.map((building: any) => (
                  <option key={building.id} value={building.id}>
                    {building.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-gray-500 mb-1">Trạng thái</label>
              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="ACTIVE">Đang cư trú</option>
                <option value="INACTIVE">Không hoạt động</option>
                <option value="MOVED_OUT">Đã chuyển đi</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedBuilding('')
                  setSelectedStatus('')
                  setPage(0)
                }}
                className="px-4 py-2.5 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Xóa lọc
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase">ID</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Họ tên</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Căn hộ</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Tòa nhà</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Vai trò</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Trạng thái</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase text-right">Thao tác</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {residents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-gray-400">
                      <span className="material-symbols-outlined text-5xl mb-2">person_off</span>
                      <p>Không có dữ liệu cư dân</p>
                    </td>
                  </tr>
                ) : (
                  residents.map((resident: Resident) => (
                    <tr key={resident.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-sm font-mono text-gray-500">#{resident.id}</td>
                      <td className="p-4">
                        <span className="font-semibold text-gray-800">{resident.fullName}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-gray-600">{resident.apartmentNumber}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-gray-600">{resident.buildingName}</span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getRelationshipColor(resident.relationship)}`}>
                          {getRelationshipText(resident.relationship)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(resident.status)}`}>
                          {getStatusText(resident.status)}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          {/* <button
                            onClick={() => setSelectedResident(resident)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <span className="material-symbols-outlined text-sm">visibility</span>
                          </button> */}
                          <button
                            onClick={() => handleDelete(resident.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                          <button
                            onClick={() => navigate(`/residents/${resident.id}`)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <span className="material-symbols-outlined text-sm">visibility</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalElements > 0 && (
            <div className="px-6 py-4 flex items-center justify-between bg-gray-50/50 border-t">
              <span className="text-xs text-gray-500">
                Hiển thị {residents.length} / {totalElements} cư dân
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                  disabled={page <= 0}
                  className="px-4 py-2 text-xs font-medium text-gray-600 bg-white border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                <button className="px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg">
                  {page + 1}
                </button>
                <button
                  onClick={() => setPage((prev) => (prev + 1 < totalPages ? prev + 1 : prev))}
                  disabled={totalPages === 0 || page + 1 >= totalPages}
                  className="px-4 py-2 text-xs font-medium text-gray-600 bg-white border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stats Summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Tổng cư dân</p>
                <p className="text-2xl font-bold">{totalElements}</p>
              </div>
              {/* <span className="material-symbols-outlined text-3xl text-blue-500">people</span> */}
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Chủ hộ</p>
                <p className="text-2xl font-bold">
                  {residents.filter((r: Resident) => r.relationship === 'OWNER').length}
                </p>
              </div>
              {/* <span className="material-symbols-outlined text-3xl text-blue-500">home</span> */}
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Đang cư trú</p>
                <p className="text-2xl font-bold text-green-600">
                  {residents.filter((r: Resident) => r.status === 'ACTIVE').length}
                </p>
              </div>
              {/* <span className="material-symbols-outlined text-3xl text-green-500">check_circle</span> */}
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Đã chuyển đi</p>
                <p className="text-2xl font-bold text-red-600">
                  {residents.filter((r: Resident) => r.status === 'MOVED_OUT').length}
                </p>
              </div>
              {/* <span className="material-symbols-outlined text-3xl text-red-500">logout</span> */}
            </div>
          </div>
        </div>
      </main>

      {/* Modal chi tiết cư dân - Có thể thêm sau */}
      {selectedResident && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Chi tiết cư dân</h3>
            <div className="space-y-3">
              <p><strong>Họ tên:</strong> {selectedResident.fullName}</p>
              <p><strong>Căn hộ:</strong> {selectedResident.apartmentNumber}</p>
              <p><strong>Tòa nhà:</strong> {selectedResident.buildingName}</p>
              <p><strong>Vai trò:</strong> {getRelationshipText(selectedResident.relationship)}</p>
              <p><strong>Trạng thái:</strong> {getStatusText(selectedResident.status)}</p>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setSelectedResident(null)}
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}