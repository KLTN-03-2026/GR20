import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { apartmentApi } from 'src/apis/apartment_api/apartment_api'
import { useState } from 'react'
import ApartmentForm from './ApartmentForm'
import AddResidentModal from './AddResidentModal'
import http from 'src/utils/http'
import { useQueryClient } from '@tanstack/react-query'
// Types
interface Owner {
  id: number
  fullName: string
  phone: string
  email: string
  avatarUrl: string
}

interface Resident {
  id: number
  fullName: string
  phone: string
  relationship?: string
  moveInDate?: string
}

interface CurrentContract {
  id: number
  contractType: string
  status: string
  startDate: string
  endDate: string
  monthlyRent: number
}

interface ApartmentDetail {
  id: number
  apartmentCode: string
  buildingName: string
  floorNumber: number
  area: number
  bedrooms: number
  bathrooms: number
  status: string
  imageUrl: string
  owner: Owner | null
  ownerName?: string
  residents: Resident[]
  currentContract: CurrentContract | null
}

// Status config
const statusConfig: Record<string, { label: string; className: string }> = {
  OCCUPIED: { label: 'Đã cho thuê', className: 'bg-blue-100 text-blue-700' },
  AVAILABLE: { label: 'Còn trống', className: 'bg-emerald-100 text-emerald-700' },
  MAINTENANCE: { label: 'Bảo trì', className: 'bg-orange-100 text-orange-700' }
}

const getInitials = (name: string): string => {
  if (!name) return ''
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('vi-VN')
}

export default function ApartmentDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [editingResident, setEditingResident] = useState<any>(null)
  const [showAddResident, setShowAddResident] = useState(false)
  const queryClient = useQueryClient()
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)

  // const apartmentId = Number(id)

  const { data, isLoading } = useQuery({
    queryKey: ['apartment', id],
    queryFn: () => apartmentApi.getApartmentById(Number(id)),
    enabled: !!id
  })

  const handleDeleteResident = async (residentId: number) => {
    if (window.confirm('Bạn có chắc muốn xóa cư dân này?')) {
      try {
        await http.patch(`/api/apartments/residents/${residentId}/move-out`)
        // Refresh data
        queryClient.invalidateQueries({ queryKey: ['apartment', id] })
        queryClient.invalidateQueries({ queryKey: ['apartments'] })
      } catch (err) {
        console.error('Delete error:', err)
      }
    }
  }
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('image', file)

    try {
      setUploading(true)
      const res = await http.post(`/api/apartments/${id}/upload-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['apartment', id] })
    } catch (err) {
      console.error('Upload error:', err)
    } finally {
      setUploading(false)
    }
  }

  const apartment = data?.data?.data || data?.data || null
  const status = apartment ? statusConfig[apartment.status] || statusConfig.AVAILABLE : null

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen ml-64'>
        <div className='flex items-center gap-3 text-slate-400'>
          <span className='material-symbols-outlined animate-spin'>sync</span>
          <span className='text-sm'>Đang tải dữ liệu...</span>
        </div>
      </div>
    )
  }

  if (!apartment) {
    return (
      <div className='flex items-center justify-center min-h-screen ml-64'>
        <div className='text-center'>
          <span className='material-symbols-outlined text-4xl text-slate-300 mb-2'>error_outline</span>
          <p className='text-slate-500 font-semibold'>Không tìm thấy căn hộ</p>
          <button onClick={() => navigate(-1)} className='mt-4 text-blue-600 text-sm font-bold hover:underline'>
            Quay lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='w-full pb-10'>
      {/* Top Header */}
      <header className='sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-100 mb-6 -mt-2 px-4 h-14 flex items-center justify-between'>
        <div className='flex items-center gap-6'>
          <button
            onClick={() => navigate(-1)}
            className='p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all'
          >
            <span className='material-symbols-outlined'>arrow_back</span>
          </button>
          <div className='flex items-center gap-2 text-xs text-slate-400'>
            <span>Trang chủ</span>
            <span className='material-symbols-outlined text-[14px]'>chevron_right</span>
            <button onClick={() => navigate('/apartments')} className='hover:text-blue-500 transition-colors'>
              Quản lý căn hộ
            </button>
            <span className='material-symbols-outlined text-[14px]'>chevron_right</span>
            <span className='text-slate-600 font-medium'>{apartment.apartmentCode}</span>
          </div>
        </div>
      </header>

      <main className='px-8 py-8 pb-20'>
        <div className='max-w-5xl mx-auto'>
          {/* Title */}
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-slate-900'>{apartment.apartmentCode}</h1>
            <p className='text-slate-500 mt-1 text-sm'>
              {apartment.buildingName} • Tầng {apartment.floorNumber} • {apartment.area} m²
            </p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {/* Left Column */}
            <div className='lg:col-span-2 space-y-6'>
              {/* Image */}
              {/* Image Section */}
              <div className='relative rounded-2xl overflow-hidden aspect-video bg-slate-200 group'>
                <img
                  alt={apartment.apartmentCode}
                  className='w-full h-full object-cover'
                  crossOrigin='anonymous'
                  src={
                    apartment.imageUrl
                      ? `http://localhost:8000${apartment.imageUrl}`
                      : 'https://via.placeholder.com/800x450?text=No+Image'
                  }
                />

                {/* Upload overlay */}
                <label className='absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer'>
                  <div className='text-center text-white'>
                    <span className='material-symbols-outlined text-3xl mb-2'>add_photo_alternate</span>
                    <p className='text-sm font-medium'>{uploading ? 'Đang tải lên...' : 'Thay đổi ảnh'}</p>
                  </div>
                  <input
                    type='file'
                    accept='image/*'
                    className='hidden'
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>

                {/* Status badge */}
                <div className='absolute top-4 right-4'>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${status?.className}`}>
                    {status?.label}
                  </span>
                </div>
              </div>

              {/* Residents */}
              <div className='bg-white rounded-2xl p-6 border border-slate-100 shadow-sm'>
                <div className='flex justify-between items-center mb-4'>
                  <h3 className='text-base font-semibold text-slate-800'>Danh sách cư dân</h3>
                  <button
                    onClick={() => {
                      setEditingResident(null)
                      setShowAddResident(true)
                    }}
                    className='px-4 py-2 text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 rounded-full transition-all shadow-sm'
                  >
                    <span className='material-symbols-outlined text-lg mr-1 align-middle'>person_add</span>
                    Thêm cư dân
                  </button>
                </div>

                {apartment.residents?.length > 0 ? (
                  <div className='space-y-3'>
                    {apartment.residents.map((resident: Resident) => (
                      <div
                        key={resident.id}
                        className='flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors'
                      >
                        <div className='flex items-center gap-3'>
                          <div className='w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white'>
                            {getInitials(resident.fullName)}
                          </div>
                          <div>
                            <p className='text-sm font-semibold text-slate-800'>{resident.fullName}</p>
                            <p className='text-xs text-slate-400'>
                              {resident.relationship || 'Cư dân'}
                              {resident.moveInDate && ` • Từ ${formatDate(resident.moveInDate)}`}
                            </p>
                          </div>
                        </div>
                        <div className='flex gap-1'>
                          <a
                            href={`tel:${resident.phone}`}
                            className='p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all'
                          >
                            <span className='material-symbols-outlined text-lg'>call</span>
                          </a>

                          {/* Dropdown Menu */}
                          <div className='relative'>
                            <button
                              onClick={() => setOpenMenuId(openMenuId === resident.id ? null : resident.id)}
                              className='p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-all'
                            >
                              <span className='material-symbols-outlined text-lg'>more_vert</span>
                            </button>

                            {openMenuId === resident.id && (
                              <>
                                <div className='fixed inset-0 z-10' onClick={() => setOpenMenuId(null)}></div>
                                <div className='absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-20'>
                                  <button
                                    onClick={() => {
                                      setEditingResident(resident)
                                      setShowAddResident(true)
                                      setOpenMenuId(null)
                                    }}
                                    className='w-full px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-colors'
                                  >
                                    <span className='material-symbols-outlined text-lg'>edit</span>
                                    Chỉnh sửa
                                  </button>
                                  <button
                                    onClick={() => {
                                      setOpenMenuId(null)
                                      handleDeleteResident(resident.id)
                                    }}
                                    className='w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2 transition-colors'
                                  >
                                    <span className='material-symbols-outlined text-lg'>delete</span>
                                    Xóa
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='text-sm text-slate-400 text-center py-8'>Chưa có cư dân nào</p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className='space-y-6'>
              {/* Info Card */}
              <div className='bg-white rounded-2xl p-6 border border-slate-100 shadow-sm'>
                <h3 className='text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4'>
                  Thông tin chi tiết
                </h3>
                <div className='space-y-4'>
                  <div className='flex justify-between'>
                    <span className='text-sm text-slate-500'>Số phòng</span>
                    <span className='text-sm font-semibold text-slate-800'>{apartment.apartmentCode}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm text-slate-500'>Tòa nhà</span>
                    <span className='text-sm font-semibold text-slate-800'>{apartment.buildingName}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm text-slate-500'>Tầng</span>
                    <span className='text-sm font-semibold text-slate-800'>{apartment.floorNumber}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm text-slate-500'>Diện tích</span>
                    <span className='text-sm font-semibold text-slate-800'>{apartment.area} m²</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm text-slate-500'>Phòng ngủ</span>
                    <span className='text-sm font-semibold text-slate-800'>{apartment.bedrooms}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm text-slate-500'>Phòng tắm</span>
                    <span className='text-sm font-semibold text-slate-800'>{apartment.bathrooms}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm text-slate-500'>Hướng ban công</span>
                    <span className='text-sm font-semibold text-slate-800'>{apartment.balconyDirection || '---'}</span>
                  </div>
                </div>
              </div>

              {/* Owner Card */}
              {apartment.status === 'AVAILABLE' || apartment.status === 'MAINTENANCE' ? (
                <div className='bg-white rounded-2xl p-6 border border-slate-100 shadow-sm'>
                  <h3 className='text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4'>Chủ sở hữu</h3>
                  <div className='text-center py-4'>
                    <span className='material-symbols-outlined text-3xl text-slate-200 mb-2'>person_off</span>
                    <p className='text-sm text-slate-400 italic'>Chưa có thông tin</p>
                    <p className='text-xs text-slate-300 mt-1'>
                      Căn hộ đang {apartment.status === 'AVAILABLE' ? 'còn trống' : 'bảo trì'}
                    </p>
                  </div>
                </div>
              ) : apartment.owner ? (
                <div className='bg-white rounded-2xl p-6 border border-slate-100 shadow-sm'>
                  <h3 className='text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4'>Chủ sở hữu</h3>
                  <div className='flex items-center gap-3 mb-4'>
                    <div className='w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-sm font-bold text-white'>
                      {getInitials(apartment.owner.fullName)}
                    </div>
                    <div>
                      <p className='text-sm font-semibold text-slate-800'>{apartment.owner.fullName}</p>
                      <p className='text-xs text-slate-400'>Chủ hộ</p>
                    </div>
                  </div>
                  <div className='space-y-2 text-sm text-slate-500'>
                    <div className='flex items-center gap-2'>
                      <span className='material-symbols-outlined text-base'>mail</span>
                      {apartment.owner.email}
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className='material-symbols-outlined text-base'>call</span>
                      {apartment.owner.phone}
                    </div>
                  </div>
                  <button
                    onClick={() => (window.location.href = `tel:${apartment.owner.phone}`)}
                    className='w-full mt-4 py-2.5 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-xl transition-all flex items-center justify-center gap-2'
                  >
                    <span className='material-symbols-outlined text-lg'>call</span>
                    Gọi {apartment.owner.phone}
                  </button>
                </div>
              ) : (
                <div className='bg-white rounded-2xl p-6 border border-slate-100 shadow-sm'>
                  <h3 className='text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4'>Chủ sở hữu</h3>
                  <div className='text-center py-4'>
                    <span className='material-symbols-outlined text-3xl text-slate-200 mb-2'>person_off</span>
                    <p className='text-sm text-slate-400 italic'>Chưa có chủ sở hữu</p>
                  </div>
                </div>
              )}

              {/* Current Contract */}
              {apartment.currentContract && (
                <div className='bg-white rounded-2xl p-6 border border-slate-100 shadow-sm'>
                  <h3 className='text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4'>
                    Hợp đồng hiện tại
                  </h3>
                  <div className='space-y-3'>
                    <div className='flex justify-between'>
                      <span className='text-sm text-slate-500'>Loại</span>
                      <span className='text-sm font-semibold text-slate-800'>
                        {apartment.currentContract.contractType}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-sm text-slate-500'>Trạng thái</span>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${apartment.currentContract.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}
                      >
                        {apartment.currentContract.status}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-sm text-slate-500'>Tiền thuê</span>
                      <span className='text-sm font-semibold text-slate-800'>
                        {formatCurrency(apartment.currentContract.monthlyRent)}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-sm text-slate-500'>Từ ngày</span>
                      <span className='text-sm text-slate-800'>{formatDate(apartment.currentContract.startDate)}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-sm text-slate-500'>Đến ngày</span>
                      <span className='text-sm text-slate-800'>{formatDate(apartment.currentContract.endDate)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      {/* Apartment Form Modal */}
      <ApartmentForm apartmentId={Number(id)} isOpen={showForm} onClose={() => setShowForm(false)} />

      <AddResidentModal
        apartmentId={Number(id)}
        apartmentCode={apartment.apartmentCode}
        isOpen={showAddResident}
        onClose={() => {
          setShowAddResident(false)
          setEditingResident(null)
        }}
        resident={editingResident}
        hasOwner={apartment.residents?.some((r: any) => r.relationship === 'OWNER')}
      />
    </div>
  )
}
