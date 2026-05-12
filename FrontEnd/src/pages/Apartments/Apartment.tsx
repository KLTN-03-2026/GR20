import { useQuery } from '@tanstack/react-query'
import { apartmentApi } from 'src/apis/apartment_api/apartment_api'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import http from 'src/utils/http'
import ApartmentForm from './ApartmentForm'
import DeleteConfirmModal from './DeleteConfirmModal'

export default function Apartment() {
  const navigate = useNavigate()
  const [showForm, setShowForm] = useState(false)
  const [editingApartmentId, setEditingApartmentId] = useState<number | null>(null)
  const [selectedBuilding, setSelectedBuilding] = useState('')
  const [selectedFloor, setSelectedFloor] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [buildings, setBuildings] = useState<any[]>([])
  const [floors, setFloors] = useState<any[]>([])
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleteCode, setDeleteCode] = useState('')
  const [stats, setStats] = useState({ occupancyRate: 0, expiringContracts: 0 })
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    http.get('/api/apartments/stats').then((res) => {
      setStats(res.data?.data || { occupancyRate: 0, expiringContracts: 0 })
    })
  }, [])

  useEffect(() => {
    http.get('/api/buildings').then((res) => {
      setBuildings(res.data?.data || [])
    })
  }, [])

  // Fetch floors khi chọn building
  useEffect(() => {
    if (selectedBuilding) {
      http.get(`/api/floors/building/${selectedBuilding}`).then((res) => {
        setFloors(res.data?.data || [])
      })
    } else {
      setFloors([])
      setSelectedFloor('')
    }
  }, [selectedBuilding])

  const { data } = useQuery({
    queryKey: ['apartments', selectedBuilding, selectedFloor, currentPage, searchTerm],
    queryFn: () => {
      const params: any = { page: currentPage, size: 5 }
      if (selectedBuilding) params.buildingId = selectedBuilding
      if (selectedFloor) params.floorId = selectedFloor
      if (searchTerm.trim()) params.search = searchTerm.trim()
      return apartmentApi.getAllApartment(params)
    }
  })

  const dataApartment = data?.data?.data || []
  const totalPages = data?.data?.totalPages || 1
  const totalItems = data?.data?.totalElements || 0

  // Hàm lấy initials từ tên
  const getInitials = (name: string) => {
    if (!name) return ''
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Hàm lấy cấu hình status
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'OCCUPIED':
        return {
          label: 'ĐÃ CHO THUÊ',
          className: 'bg-secondary-fixed text-on-secondary-fixed-variant'
        }
      case 'AVAILABLE':
        return {
          label: 'CÒN TRỐNG',
          className: 'bg-green-100 text-green-700'
        }
      case 'MAINTENANCE':
        return {
          label: 'ĐANG BẢO TRÌ',
          className: 'bg-error-container text-on-error-container'
        }
      default:
        return {
          label: 'KHÔNG XÁC ĐỊNH',
          className: 'bg-gray-100 text-gray-700'
        }
    }
  }

  return (
    <div className='w-full pb-10'>
      <div className='max-w-6xl w-full mx-auto'>
        {/* Dashboard Header & Filters */}
        <div className='flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10'>
          <div>
            <h2 className='text-2xl font-bold text-slate-900 tracking-tight'>Danh sách căn hộ</h2>
            <p className='text-sm text-slate-500 mt-1 font-normal'>
              Cập nhật và quản lý trạng thái lưu trú từ HOMELINK AI
            </p>
          </div>

          <div className='flex items-center gap-3'>
            <div className='flex bg-slate-100 rounded-full p-0.5 border border-slate-200'>
              {/* Select Tòa nhà - Dynamic */}
              <select
                value={selectedBuilding}
                onChange={(e) => {
                  setSelectedBuilding(e.target.value)
                  setSelectedFloor('')
                  setCurrentPage(0)
                }}
                className='bg-transparent border-none text-sm font-medium text-slate-700 focus:ring-0 cursor-pointer px-4 py-2.5'
              >
                <option value=''>Tất cả Tòa nhà</option>
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>

              <div className='w-[1px] bg-slate-300 my-1.5'></div>

              {/* Select Tầng - Dynamic */}
              <select
                value={selectedFloor}
                onChange={(e) => {
                  setSelectedFloor(e.target.value)
                  setCurrentPage(0)
                }}
                disabled={!selectedBuilding}
                className='bg-transparent border-none text-sm font-medium text-slate-700 focus:ring-0 cursor-pointer px-4 py-2.5 disabled:opacity-40'
              >
                <option value=''>Tất cả Tầng</option>
                {floors.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name || `Tầng ${f.floorNumber || f.floor_number}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className='relative'>
              <span className='absolute inset-y-0 left-3.5 flex items-center text-slate-400'>
                <span className='material-symbols-outlined text-lg'>search</span>
              </span>
              <input
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(0) // Reset về trang 1 khi tìm kiếm
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setCurrentPage(0) // Enter để tìm
                  }
                }}
                className='bg-slate-100 border border-slate-200 rounded-full py-2.5 pl-10 pr-4 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 w-56 transition-all placeholder:text-slate-400'
                placeholder='Tìm kiếm căn hộ...'
                type='text'
              />
              {/* Nút xóa khi có text */}
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setCurrentPage(0)
                  }}
                  className='absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600'
                >
                  <span className='material-symbols-outlined text-base'>close</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Inventory List */}
        <div className='space-y-4'>
          {/* Table Header */}
          <div className='grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100'>
            <div className='col-span-2'>Số phòng</div>
            <div className='col-span-2'>Tòa nhà</div>
            <div className='col-span-1'>Tầng</div>
            <div className='col-span-2 text-center'>Trạng thái</div>
            <div className='col-span-2'>Chủ sở hữu</div>
            <div className='col-span-2 text-right'>Thao tác</div>
          </div>

          {/* Apartment Rows */}
          <div className='space-y-3 max-h-[550px] overflow-y-auto pr-1'>
            {dataApartment?.map((item) => {
              return (
                <div
                  key={item.id}
                  className='grid grid-cols-12 gap-4 px-6 py-4 bg-white hover:bg-slate-50 transition-all duration-200 rounded-xl items-center border border-transparent hover:border-slate-200 hover:shadow-md'
                >
                  {/* <div className="col-span-1">
                    <div className="w-16 h-12 rounded-lg overflow-hidden shadow-inner bg-slate-100">
                      <img 
                        className="w-full h-full object-cover" 
                        src={item.imageUrl || "https://via.placeholder.com/64x48?text=No+Image"}
                        alt={`Căn hộ ${item.apartmentCode}`}
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/64x48?text=No+Image";
                        }}
                      />
                    </div>
                  </div> */}

                  <div className='col-span-2'>
                    <p className='text-sm font-semibold text-slate-800'>{item.apartmentCode} </p>
                  </div>

                  <div className='col-span-2'>
                    <p className='text-sm text-slate-500 font-medium'>{item.buildingName}</p>
                  </div>

                  <div className='col-span-1'>
                    <p className='text-sm text-slate-600 font-medium'>Tầng {item.floorNumber}</p>
                  </div>

                  <div className='col-span-2 flex justify-center'>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.status === 'OCCUPIED'
                          ? 'bg-blue-100 text-blue-700'
                          : item.status === 'AVAILABLE'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {item.status === 'OCCUPIED'
                        ? 'Đã cho thuê'
                        : item.status === 'AVAILABLE'
                          ? 'Còn trống'
                          : 'Bảo trì'}
                    </span>
                  </div>

                  <div className='col-span-2 flex items-center gap-2.5'>
                    {item.ownerName ? (
                      <>
                        <div className='w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-[10px] font-semibold text-white shadow-sm'>
                          {getInitials(item.ownerName)}
                        </div>
                        <span className='text-sm text-slate-700 font-medium truncate'>{item.ownerName}</span>
                      </>
                    ) : (
                      <span className='text-sm text-slate-350 italic font-light'>Chưa có chủ</span>
                    )}
                  </div>
                  <div className='col-span-2 flex justify-end gap-1'>
                    <button
                      onClick={() => navigate(`/apartments/${item.id}`)}
                      className='p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all'
                      title='Xem chi tiết'
                    >
                      <span className='material-symbols-outlined text-lg'>visibility</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditingApartmentId(Number(item.id))
                        setShowForm(true)
                      }}
                      className='p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all'
                      title='Chỉnh sửa'
                    >
                      <span className='material-symbols-outlined text-lg'>edit</span>
                    </button>
                    <button
                      onClick={() => {
                        setDeleteId(Number(item.id))
                        setDeleteCode(item.apartmentCode)
                      }}
                      className='p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all'
                      title='Xóa'
                    >
                      <span className='material-symbols-outlined text-lg'>delete</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer Controls */}
        <div className='mt-12 flex flex-col md:flex-row items-center justify-between gap-6 pb-20'>
          <button
            onClick={() => {
              setEditingApartmentId(null)
              setShowForm(true)
            }}
            className='bg-slate-500 hover:bg-slate-600 text-white px-5 py-3 rounded-full text-sm font-semibold transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-slate-200'
          >
            <span className='material-symbols-outlined text-lg'>add</span>
            Thêm căn hộ mới
          </button>

          <div className='flex items-center gap-6'>
            <p className='text-sm text-slate-400'>
              Hiển thị {dataApartment?.length || 0} trên {totalItems} căn hộ
            </p>

            <div className='flex items-center gap-1.5'>
              {/* Nút Previous */}
              <button
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className='w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed'
              >
                <span className='material-symbols-outlined text-lg'>chevron_left</span>
              </button>

              {/* Số trang */}
              <div className='flex items-center gap-1'>
                {Array.from({ length: totalPages }, (_, i) => {
                  // Chỉ hiển thị tối đa 5 trang
                  if (totalPages <= 5) {
                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                          currentPage === i ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        {i + 1}
                      </button>
                    )
                  }

                  // Logic hiển thị ... cho nhiều trang
                  if (i === 0 || i === totalPages - 1 || Math.abs(i - currentPage) <= 1) {
                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                          currentPage === i ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        {i + 1}
                      </button>
                    )
                  }

                  if (Math.abs(i - currentPage) === 2) {
                    return (
                      <span key={i} className='px-1 text-slate-300'>
                        ...
                      </span>
                    )
                  }

                  return null
                })}
              </div>

              {/* Nút Next */}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1}
                className='w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed'
              >
                <span className='material-symbols-outlined text-lg'>chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <ApartmentForm
        apartmentId={editingApartmentId}
        isOpen={showForm}
        onClose={() => {
          setShowForm(false)
          setEditingApartmentId(null)
        }}
      />

      <DeleteConfirmModal
        apartmentId={deleteId!}
        apartmentCode={deleteCode}
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
      />
    </div>
  )
}
