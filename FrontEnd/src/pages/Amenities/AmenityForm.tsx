import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import http from 'src/utils/http';

interface AmenityFormProps {
  amenityId?: number | null;
  buildingId: number;
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  name: string;
  description: string;
  location: string;
  operatingHours: string;
  imageUrl: string;
  status: string;
  closedReason: string;
}

const initialFormData: FormData = {
  name: '',
  description: '',
  location: '',
  operatingHours: '',
  imageUrl: '',
  status: 'OPEN',
  closedReason: ''
}

export default function AmenityForm({ amenityId, buildingId, isOpen, onClose }: AmenityFormProps) {
  const queryClient = useQueryClient()
  const isEdit = !!amenityId
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [uploading, setUploading] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('image', file)

    try {
      setUploading(true)
      const res = await http.post('/api/amenities/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      handleChange('imageUrl', res.data?.data?.imageUrl || '')
    } catch (err) {
      console.error('Upload error:', err)
    } finally {
      setUploading(false)
    }
  }

  // Fetch detail if editing
  useEffect(() => {
    if (isEdit && amenityId && isOpen) {
      http.get(`/api/amenities/${amenityId}`).then((res) => {
        const d = res.data?.data
        if (d) {
          setFormData({
            name: d.name || '',
            description: d.description || '',
            location: d.location || '',
            operatingHours: d.operatingHours || '',
            imageUrl: d.imageUrl || '',
            status: d.status || 'OPEN',
            closedReason: d.closedReason || ''
          })
        }
      })
    } else {
      setFormData(initialFormData)
      setErrors({})
    }
  }, [isEdit, amenityId, isOpen])

  const createMutation = useMutation({
    mutationFn: (data: any) => http.post(`/api/buildings/${buildingId}/amenities`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['amenities'] })
      onClose()
    }
  })

  const updateMutation = useMutation({
    mutationFn: (data: any) => http.put(`/api/amenities/${amenityId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['amenities'] })
      onClose()
    }
  })

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'Vui lòng nhập tên tiện ích'
    if (formData.status === 'CLOSED' && !formData.closedReason.trim()) {
      newErrors.closedReason = 'Vui lòng nhập lý do tạm đóng'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const payload = {
      name: formData.name.trim(),
      description: formData.description || null,
      location: formData.location || null,
      operatingHours: formData.operatingHours || null,
      imageUrl: formData.imageUrl || null,
      status: formData.status,
      closedReason: formData.status === 'CLOSED' ? formData.closedReason : null
    }

    if (isEdit) {
      updateMutation.mutate(payload)
    } else {
      createMutation.mutate(payload)
    }
  }

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4'>
      <div className='w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col'>
        <div className='px-8 py-6 flex justify-between items-center border-b border-slate-100'>
          <div>
            <h3 className='text-xl font-bold text-slate-900'>{isEdit ? 'Chỉnh sửa tiện ích' : 'Thêm tiện ích mới'}</h3>
            <p className='text-sm text-slate-500 mt-1'>Cung cấp thông tin chi tiết về tiện ích</p>
          </div>
          <button onClick={onClose} className='p-2 hover:bg-slate-100 rounded-full'>
            <span className='material-symbols-outlined text-slate-400'>close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className='flex-1 overflow-y-auto px-8 py-6 space-y-5'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-[11px] font-bold uppercase text-slate-500 mb-1.5'>
                Tên tiện ích <span className='text-red-400'>*</span>
              </label>
              <input
                type='text'
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full bg-slate-50 border ${errors.name ? 'border-red-300' : 'border-slate-200'} rounded-xl px-4 py-3 text-sm`}
                placeholder='VD: Hồ Bơi Vô Cực'
              />
              {errors.name && <p className='text-red-500 text-xs mt-1'>{errors.name}</p>}
            </div>
            <div>
              <label className='block text-[11px] font-bold uppercase text-slate-500 mb-1.5'>Vị trí</label>
              <input
                type='text'
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className='w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm'
                placeholder='VD: Tầng 42'
              />
            </div>
          </div>

          <div>
            <label className='block text-[11px] font-bold uppercase text-slate-500 mb-1.5'>Mô tả</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className='w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm'
              rows={3}
              placeholder='Mô tả ngắn gọn...'
            />
          </div>

          <div className='grid grid-cols-3 gap-4'>
            <div>
              <label className='block text-[11px] font-bold uppercase text-slate-500 mb-1.5'>Giờ hoạt động</label>
              <input
                type='text'
                value={formData.operatingHours}
                onChange={(e) => handleChange('operatingHours', e.target.value)}
                className='w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm'
                placeholder='VD: 06:00 - 22:00'
              />
            </div>
            <div>
              <label className='block text-[11px] font-bold uppercase text-slate-500 mb-1.5'>Trạng thái</label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className='w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm'
              >
                <option value='OPEN'>Đang hoạt động</option>
                <option value='CLOSED'>Tạm đóng</option>
                <option value='MAINTENANCE'>Bảo trì</option>
              </select>
            </div>
            <div>
              <label className='block text-[11px] font-bold uppercase text-slate-500 mb-1.5'>Hình ảnh</label>
              <label className='border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors'>
                {uploading ? (
                  <span className='text-sm text-slate-400 flex items-center gap-2'>
                    <span className='material-symbols-outlined animate-spin'>sync</span>
                    Đang tải lên...
                  </span>
                ) : formData.imageUrl ? (
                  <div className='relative'>
                    <img
                      src={`http://localhost:8000${formData.imageUrl}`}
                      alt='Preview'
                      className='h-16 object-cover rounded-lg'
                    />
                    <p className='text-xs text-slate-400 mt-1 text-center'>Nhấp để đổi ảnh</p>
                  </div>
                ) : (
                  <>
                    <span className='material-symbols-outlined text-3xl text-slate-300'>cloud_upload</span>
                    <p className='text-sm text-slate-400 mt-2'>Nhấp để tải ảnh lên</p>
                    <p className='text-[10px] text-slate-300 mt-1'>JPG, PNG (Tối đa 5MB)</p>
                  </>
                )}
                <input
                  type='file'
                  accept='image/*'
                  className='hidden'
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          {formData.status !== 'OPEN' && (
            <div>
              <label className='block text-[11px] font-bold uppercase text-slate-500 mb-1.5'>
                Lý do đóng <span className='text-red-400'>*</span>
              </label>
              <input
                type='text'
                value={formData.closedReason}
                onChange={(e) => handleChange('closedReason', e.target.value)}
                className={`w-full bg-slate-50 border ${errors.closedReason ? 'border-red-300' : 'border-slate-200'} rounded-xl px-4 py-3 text-sm`}
                placeholder='Nhập lý do...'
              />
              {errors.closedReason && <p className='text-red-500 text-xs mt-1'>{errors.closedReason}</p>}
            </div>
          )}
        </form>

        <div className='px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3 rounded-b-2xl'>
          <button
            onClick={onClose}
            className='px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200/50 rounded-full'
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={createMutation.isPending || updateMutation.isPending}
            className='px-8 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-full shadow-sm disabled:opacity-50'
          >
            {isEdit ? 'Cập nhật' : 'Thêm tiện ích'}
          </button>
        </div>
      </div>
    </div>
  )
}