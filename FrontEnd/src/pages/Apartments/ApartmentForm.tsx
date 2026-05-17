import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apartmentApi } from 'src/apis/apartment_api/apartment_api'
import http from 'src/utils/http'

interface ApartmentFormProps {
  apartmentId: number | null // null = thêm mới, có id = sửa
  isOpen: boolean
  onClose: () => void
}

interface FormData {
  apartmentCode: string
  buildingId: string
  floorId: string
  area: string
  bedrooms: number
  bathrooms: number
  balconyDirection: string
  status: string
}

const initialFormData: FormData = {
  apartmentCode: '',
  buildingId: '',
  floorId: '',
  area: '',
  bedrooms: 1,
  bathrooms: 1,
  balconyDirection: '',
  status: 'AVAILABLE'
}

const balconyDirections = ['NORTH', 'SOUTH', 'EAST', 'WEST', 'NORTHEAST', 'NORTHWEST', 'SOUTHEAST', 'SOUTHWEST']
const statusOptions = [
  { value: 'AVAILABLE', label: 'Còn trống' },
  { value: 'OCCUPIED', label: 'Đã cho thuê' },
  { value: 'MAINTENANCE', label: 'Bảo trì' }
]

export default function ApartmentForm({ apartmentId, isOpen, onClose }: ApartmentFormProps) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [buildings, setBuildings] = useState<any[]>([])
  const [floors, setFloors] = useState<any[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEdit = apartmentId !== null

  // Fetch buildings
  useEffect(() => {
    http.get('/api/buildings').then((res) => setBuildings(res.data?.data || []))
  }, [])

  // Fetch floors khi chọn building
  useEffect(() => {
    if (formData.buildingId) {
      http.get(`/api/floors/building/${formData.buildingId}`).then((res) => setFloors(res.data?.data || []))
    } else {
      setFloors([])
    }
  }, [formData.buildingId])

  // Fetch apartment detail nếu là edit
  const { data: apartmentDetail } = useQuery({
    queryKey: ['apartment', apartmentId],
    queryFn: () => apartmentApi.getApartmentById(apartmentId!),
    enabled: isEdit && !!apartmentId
  })

  useEffect(() => {
    if (apartmentDetail && isEdit) {
      const detail = apartmentDetail?.data?.data || apartmentDetail?.data
      setFormData({
        apartmentCode: detail.apartmentCode || '',
        buildingId: detail.buildingId?.toString() || '',
        floorId: detail.floorId?.toString() || '',
        area: detail.area?.toString() || '',
        bedrooms: detail.bedrooms || 1,
        bathrooms: detail.bathrooms || 1,
        balconyDirection: detail.balconyDirection || '',
        status: detail.status || 'AVAILABLE'
      })
    }
  }, [apartmentDetail, isEdit])

  // Reset form khi đóng
  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormData)
      setErrors({})
    }
  }, [isOpen])

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => apartmentApi.createApartment(data),
    onError: (err: any) => {
      const message = err.response?.data?.message
      if (message?.includes('already exists')) {
        setErrors({ apartmentCode: 'Mã căn hộ này đã tồn tại' })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apartments'] })
      onClose()
    }
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apartmentApi.updateApartment(id, data),
    onError: (err: any) => {
      const message = err.response?.data?.message
      if (message?.includes('đã tồn tại')) {
        setErrors({ apartmentCode: message })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apartments'] })
      queryClient.invalidateQueries({ queryKey: ['apartment', apartmentId?.toString()] })
      onClose()
    }
  })

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!formData.apartmentCode.trim()) newErrors.apartmentCode = 'Vui lòng nhập số căn hộ'
    if (!formData.buildingId) newErrors.buildingId = 'Vui lòng chọn tòa nhà'
    if (!formData.floorId) newErrors.floorId = 'Vui lòng chọn tầng'
    if (!formData.area || Number(formData.area) <= 0) newErrors.area = 'Diện tích không hợp lệ'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    // Kiểm tra logic trạng thái
    if (isEdit) {
      const currentStatus = apartmentDetail?.data?.data?.status
      const currentOwner = apartmentDetail?.data?.data?.owner
      const newStatus = formData.status

      // 1. Chuyển sang AVAILABLE
      if (newStatus === 'AVAILABLE') {
        if (currentStatus === 'OCCUPIED' && currentOwner) {
          setErrors({
            status: 'Không thể chuyển thành "Còn trống" vì căn hộ đang có chủ sở hữu. Vui lòng xóa chủ hộ trước.'
          })
          return
        }
      }

      // 2. Chuyển sang OCCUPIED
      if (newStatus === 'OCCUPIED') {
        // Nếu đang AVAILABLE hoặc MAINTENANCE và KHÔNG có owner → chặn
        if ((currentStatus === 'AVAILABLE' || currentStatus === 'MAINTENANCE') && !currentOwner) {
          setErrors({
            status: 'Không thể chuyển thành "Đã cho thuê" vì căn hộ chưa có chủ sở hữu. Vui lòng thêm chủ hộ trước.'
          })
          return
        }
      }
    }

    const payload = {
      buildingId: Number(formData.buildingId),
      floorId: Number(formData.floorId),
      apartmentCode: formData.apartmentCode.trim(),
      area: Number(formData.area),
      bedrooms: formData.bedrooms,
      bathrooms: formData.bathrooms,
      balconyDirection: formData.balconyDirection || null,
      status: formData.status
    }

    if (isEdit && apartmentId) {
      updateMutation.mutate({ id: apartmentId, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const handleChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 md:p-8'>
      <div className='bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl'>
        {/* Header */}
        <div className='sticky top-0 z-20 bg-white/95 backdrop-blur px-8 py-6 border-b border-slate-100 flex justify-between items-start'>
          <div>
            <nav className='flex items-center gap-2 text-slate-400 text-[10px] font-semibold tracking-widest uppercase mb-2'>
              <span>Quản lý căn hộ</span>
              <span className='material-symbols-outlined text-xs'>chevron_right</span>
              <span className='text-blue-600'>{isEdit ? 'Cập nhật căn hộ' : 'Thêm căn hộ mới'}</span>
            </nav>
            <h1 className='text-2xl font-semibold text-slate-800 tracking-tight'>
              {isEdit ? 'Cập Nhật Căn Hộ' : 'Thêm Căn Hộ Mới'}
            </h1>
            <p className='text-slate-500 text-sm mt-1'>
              {isEdit
                ? `Chỉnh sửa thông tin căn hộ ${formData.apartmentCode}`
                : 'Azure Serenity Complex - Thêm căn hộ mới'}
            </p>
          </div>
          <button onClick={onClose} className='p-2 hover:bg-slate-100 rounded-full transition-colors'>
            <span className='material-symbols-outlined text-slate-500'>close</span>
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className='p-8'>
          {/* Định danh cơ bản */}
          <section className='mb-8'>
            <h2 className='font-bold text-base mb-5 flex items-center gap-2 text-slate-800'>
              <span className='w-1 h-5 bg-blue-500 rounded-full'></span>
              Định danh cơ bản
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5'>
              <div>
                <label className='block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5'>
                  Số căn hộ <span className='text-red-400'>*</span>
                </label>
                <input
                  type='text'
                  value={formData.apartmentCode}
                  onChange={(e) => handleChange('apartmentCode', e.target.value)}
                  className={`w-full bg-slate-50 border ${errors.apartmentCode ? 'border-red-300' : 'border-slate-200'} rounded-lg p-3 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all`}
                  placeholder='Ví dụ: A101'
                />
                {errors.apartmentCode && <p className='text-red-500 text-xs mt-1'>{errors.apartmentCode}</p>}
              </div>
              <div>
                <label className='block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5'>
                  Tòa nhà <span className='text-red-400'>*</span>
                </label>
                <select
                  value={formData.buildingId}
                  onChange={(e) => {
                    handleChange('buildingId', e.target.value)
                    handleChange('floorId', '')
                  }}
                  className={`w-full bg-slate-50 border ${errors.buildingId ? 'border-red-300' : 'border-slate-200'} rounded-lg p-3 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all`}
                >
                  <option value=''>Chọn tòa nhà</option>
                  {buildings.map((b: any) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                {errors.buildingId && <p className='text-red-500 text-xs mt-1'>{errors.buildingId}</p>}
              </div>
            </div>
          </section>

          {/* Thông số kỹ thuật */}
          <section className='mb-8'>
            <h2 className='font-bold text-base mb-5 flex items-center gap-2 text-slate-800'>
              <span className='w-1 h-5 bg-blue-500 rounded-full'></span>
              Thông số kỹ thuật
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5'>
              <div>
                <label className='block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5'>
                  Tầng <span className='text-red-400'>*</span>
                </label>
                <select
                  value={formData.floorId}
                  onChange={(e) => handleChange('floorId', e.target.value)}
                  disabled={!formData.buildingId}
                  className={`w-full bg-slate-50 border ${errors.floorId ? 'border-red-300' : 'border-slate-200'} rounded-lg p-3 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all disabled:opacity-40`}
                >
                  <option value=''>Chọn tầng</option>
                  {floors.map((f: any) => (
                    <option key={f.id} value={f.id}>
                      {f.name || `Tầng ${f.floorNumber || f.floor_number}`}
                    </option>
                  ))}
                </select>
                {errors.floorId && <p className='text-red-500 text-xs mt-1'>{errors.floorId}</p>}
              </div>
              <div>
                <label className='block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5'>
                  Diện tích (m²) <span className='text-red-400'>*</span>
                </label>
                <input
                  type='number'
                  value={formData.area}
                  onChange={(e) => handleChange('area', e.target.value)}
                  className={`w-full bg-slate-50 border ${errors.area ? 'border-red-300' : 'border-slate-200'} rounded-lg p-3 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all`}
                  placeholder='Tổng diện tích mét vuông'
                  step='0.01'
                  min='0'
                />
                {errors.area && <p className='text-red-500 text-xs mt-1'>{errors.area}</p>}
              </div>
              <div>
                <label className='block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5'>
                  Phòng ngủ
                </label>
                <select
                  value={formData.bedrooms}
                  onChange={(e) => handleChange('bedrooms', Number(e.target.value))}
                  className='w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all'
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className='block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5'>
                  Phòng tắm
                </label>
                <select
                  value={formData.bathrooms}
                  onChange={(e) => handleChange('bathrooms', Number(e.target.value))}
                  className='w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all'
                >
                  {[1, 2, 3].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className='block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5'>
                  Hướng ban công
                </label>
                <select
                  value={formData.balconyDirection}
                  onChange={(e) => handleChange('balconyDirection', e.target.value)}
                  className='w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all'
                >
                  <option value=''>---</option>
                  {balconyDirections.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Trạng thái */}
          <div>
            <label className='block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5'>
              Trạng thái <span className='text-red-400'>*</span>
            </label>
            <select
              value={formData.status}
              onChange={(e) => {
                handleChange('status', e.target.value)
                if (errors.status) setErrors((prev) => ({ ...prev, status: '' }))
              }}
              disabled={!isEdit}
              className={`w-full bg-slate-50 border ${errors.status ? 'border-red-300' : 'border-slate-200'} rounded-lg p-3 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all`}
            >
              {statusOptions.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            {!isEdit && <p className='text-[11px] text-slate-400 mt-1'>Mặc định "Còn trống" khi thêm mới</p>}
            {errors.status && (
              <p className='text-red-500 text-xs mt-1 flex items-center gap-1'>
                <span className='material-symbols-outlined text-sm'>warning</span>
                {errors.status}
              </p>
            )}
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className='sticky bottom-0 bg-white/95 backdrop-blur px-8 py-5 border-t border-slate-100 flex items-center justify-end gap-4 rounded-b-2xl'>
        <button
          type='button'
          onClick={onClose}
          className='px-6 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors'
        >
          Hủy bỏ
        </button>
        <button
          type='submit'
          onClick={handleSubmit}
          disabled={createMutation.isPending || updateMutation.isPending}
          className='px-8 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-full shadow-lg shadow-slate-200 transition-all active:scale-95 disabled:opacity-50'
        >
          {createMutation.isPending || updateMutation.isPending ? (
            <span className='flex items-center gap-2'>
              <span className='material-symbols-outlined animate-spin text-sm'>sync</span>
              Đang lưu...
            </span>
          ) : isEdit ? (
            'Lưu thay đổi'
          ) : (
            'Thêm căn hộ'
          )}
        </button>
      </div>
    </div>
  )
}
