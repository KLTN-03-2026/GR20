// src/pages/residents/ResidentDetail.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { residentApi} from 'src/apis/resident_api/residents.api'


export default function ResidentDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    relationship: '',
    status: '',
    moveInDate: ''
  })

  // Lấy chi tiết cư dân
  const { data: residentData, isLoading, refetch } = useQuery({
    queryKey: ['resident', id],
    queryFn: () => residentApi.getResidentById(id!),
    enabled: !!id
  })

  const resident = residentData?.data.data

  // Cập nhật cư dân
  const updateMutation = useMutation({
    mutationFn: (data: any) => residentApi.updateResident(id!, data),
    onSuccess: () => {
      toast.success('Cập nhật thông tin thành công')
      setIsEditing(false)
      queryClient.invalidateQueries({ queryKey: ['resident', id] })
      refetch()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Cập nhật thất bại')
    }
  })

  const handleEdit = () => {
    if (resident) {
      setEditForm({
        relationship: resident.relationship,
        status: resident.status,
        moveInDate: resident.moveInDate?.split('T')[0] || ''
      })
      setIsEditing(true)
    }
  }

  const handleSave = () => {
    updateMutation.mutate(editForm)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditForm({
      relationship: '',
      status: '',
      moveInDate: ''
    })
  }

  const handleBack = () => {
    navigate('..')
  }

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-600 bg-green-50'
      case 'INACTIVE':
        return 'text-gray-600 bg-gray-50'
      case 'MOVED_OUT':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

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

  const getRelationshipText = (relationship: string) => {
    switch (relationship) {
      case 'OWNER':
        return 'Chủ hộ'
      case 'TENANT':
        return 'Người thuê'
      case 'FAMILY':
        return 'Người thân'
      default:
        return relationship
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Chưa cập nhật'
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN')
  }

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto bg-surface px-8 py-8">
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-on-surface-variant">Đang tải thông tin...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!resident) {
    return (
      <div className="flex-1 overflow-y-auto bg-surface px-8 py-8">
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-6xl text-outline mb-4">person_off</span>
          <h3 className="text-xl font-bold text-on-surface mb-2">Không tìm thấy cư dân</h3>
          <p className="text-on-surface-variant mb-6">Cư dân với ID #{id} không tồn tại</p>
          <button
            onClick={handleBack}
            className="bg-primary text-on-primary px-6 py-2 rounded-full"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto bg-surface px-8 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 mb-8">
        <button onClick={handleBack} className="text-on-surface-variant text-sm font-medium hover:text-primary transition-colors">
          Quản lý Cư dân
        </button>
        
       
      </nav>

      {/* Header Action Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">THÔNG TIN HỒ SƠ</h1>
          <p className="text-on-surface-variant max-w-lg leading-relaxed">
            Cập nhật và quản lý thông tin chi tiết về cư dân, hợp đồng thuê và các dịch vụ liên quan.
          </p>
        </div>
        <div className="flex gap-3">
          {!isEditing ? (
            <>
              <button
                onClick={handleEdit}
                className="bg-surface-container-lowest text-on-surface-variant py-3 px-8 rounded-full text-sm font-semibold transition-all hover:bg-surface-container shadow-sm"
              >
                Chỉnh sửa
              </button>
              
            </>
          ) : (
            <>
              <button
                onClick={handleCancel}
                className="bg-surface-container-lowest text-on-surface-variant py-3 px-8 rounded-full text-sm font-semibold transition-all hover:bg-surface-container shadow-sm"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="bg-gradient-to-br from-primary to-primary-container text-on-primary py-3 px-8 rounded-full text-sm font-semibold shadow-xl shadow-primary/10 hover:brightness-110 transition-all disabled:opacity-50"
              >
                {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Profile Summary Card */}
        <div className="md:col-span-4 space-y-8">
          <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm shadow-blue-900/5 transition-all">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-full border-4 border-surface-container-low overflow-hidden bg-surface-container-highest">
                  <img
                    src={resident.avatarUrl || 'https://via.placeholder.com/96'}
                    alt={resident.fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
                {resident.status === 'MOVED_OUT' && (
                  <div className="absolute bottom-0 right-0 w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center border-4 border-surface-container-lowest">
                    <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
                      logout
                    </span>
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-bold text-on-surface mb-1">{resident.fullName}</h2>
              <span className="text-on-surface-variant font-medium text-sm">ID: #{resident.id}</span>
              
              {!isEditing ? (
                <div className={`mt-6 inline-flex items-center px-4 py-1.5 rounded-full ${getStatusColor(resident.status)} font-bold text-[10px] uppercase tracking-wider`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    resident.status === 'ACTIVE' ? 'bg-green-600' : 
                    resident.status === 'MOVED_OUT' ? 'bg-red-600' : 'bg-gray-600'
                  } mr-2`}></span>
                  {getStatusText(resident.status)}
                </div>
              ) : (
                <div className="mt-6 w-full">
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="ACTIVE">Đang cư trú</option>
                    <option value="MOVED_OUT">Đã chuyển đi</option>
                    <option value="INACTIVE">Không hoạt động</option>
                  </select>
                </div>
              )}
            </div>

            <div className="mt-10 space-y-4 pt-8 border-t border-surface-container-low">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
                  
                </div>
                <div className="overflow-hidden">
                  <p className="text-[10px] uppercase font-bold text-outline-variant tracking-wider">Email</p>
                  <p className="text-sm font-semibold truncate">{resident.email || 'Chưa cập nhật'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
                  
                </div>
                <div className="overflow-hidden">
                  <p className="text-[10px] uppercase font-bold text-outline-variant tracking-wider">Điện thoại</p>
                  <p className="text-sm font-medium text-on-surface-variant">
                    {resident.phone || 'Chưa cập nhật'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Insight Module */}
          <div className="glass-panel rounded-xl p-8 shadow-sm border border-white/40 bg-white/70 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-700" style={{ fontVariationSettings: "'FILL' 1" }}>
                  bolt
                </span>
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-blue-700">AI Insights</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-700 italic">
              {resident.status === 'MOVED_OUT' 
                ? "Cư dân này đã hoàn tất thủ tục bàn giao căn hộ. Không có công nợ tồn đọng hoặc lịch sử hư hỏng cơ sở vật chất nghiêm trọng."
                : "Cư dân đang cư trú ổn định. Lịch sử thanh toán đầy đủ và đúng hạn. Đánh giá mức độ hài lòng: Tốt"}
            </p>
          </div>
        </div>

        {/* Detailed Information Bento */}
        <div className="md:col-span-8 space-y-8">
          {/* Basic Info Card */}
          <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm shadow-blue-900/5">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
              
              Thông tin cư trú
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-outline-variant tracking-widest block mb-2">Căn hộ</label>
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-bold text-lg">
                    {resident.apartmentNumber}
                  </div>
                  <div className="text-sm font-medium text-on-surface-variant">
                    {resident.buildingName}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-outline-variant tracking-widest block mb-2">Mối quan hệ</label>
                {!isEditing ? (
                  <div className="flex items-center gap-3">
                    
                    <span className={`font-bold ${getRelationshipColor(resident.relationship)} px-3 py-1 rounded-full text-sm`}>
                      {getRelationshipText(resident.relationship)}
                    </span>
                  </div>
                ) : (
                  <select
                    value={editForm.relationship}
                    onChange={(e) => setEditForm({ ...editForm, relationship: e.target.value })}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="OWNER">Chủ hộ</option>
                    <option value="FAMILY">Người thân</option>
                    <option value="TENANT">Người thuê</option>
                  </select>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-outline-variant tracking-widest block mb-2">Ngày dời đến</label>
                {!isEditing ? (
                  <div className="flex items-center gap-3">
                   
                    <span className="font-semibold text-on-surface">{formatDate(resident.moveInDate)}</span>
                  </div>
                ) : (
                  <input
                    type="date"
                    value={editForm.moveInDate}
                    onChange={(e) => setEditForm({ ...editForm, moveInDate: e.target.value })}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-outline-variant tracking-widest block mb-2">Ngày tạo hồ sơ</label>
                <div className="flex items-center gap-3">
                  
                  <span className="font-semibold text-on-surface">{formatDate(resident.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Context - Glassmorphism Card */}
          <div className="relative overflow-hidden rounded-xl h-64 shadow-xl group">
            <img
              alt="Modern Apartment Interior"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=400&fit=crop"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-8 w-full flex justify-between items-end">
              <div>
                <h4 className="text-white text-xl font-bold mb-1">Căn hộ {resident.apartmentNumber}</h4>
                <p className="text-white/80 text-sm">Góc nhìn từ trên cao xuống công viên trung tâm</p>
              </div>
              <div className="glass-panel px-4 py-2 rounded-full border border-white/20 bg-white/20 backdrop-blur-md">
                <span className="text-white text-xs font-bold uppercase tracking-widest">
                  {resident.buildingName}
                </span>
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-surface-container-low rounded-xl p-8 border border-surface-container">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-on-surface">Nhật ký hoạt động</h3>
              
            </div>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-2 h-2 rounded-full bg-outline-variant mt-2 shrink-0"></div>
                <div>
                  <p className="text-sm font-bold text-on-surface">
                    Hồ sơ được cập nhật trạng thái {getStatusText(resident.status)}
                  </p>
                  <p className="text-xs text-on-surface-variant mt-1">
                    {formatDate(resident.createdAt)} • Bởi Quản lý hệ thống
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-2 h-2 rounded-full bg-outline-variant mt-2 shrink-0"></div>
                <div>
                  <p className="text-sm font-bold text-on-surface">Đăng ký cư trú tại căn hộ {resident.apartmentNumber}</p>
                  <p className="text-xs text-on-surface-variant mt-1">
                    {formatDate(resident.moveInDate)} • Tự động
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}