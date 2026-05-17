import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { vehiclesApi } from 'src/apis/vehicle_api/vehicles.api'
import type { Vehicle, VehicleStatus, VehicleType } from 'src/types/vehicle.type'

export default function VehiclesAdminPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | VehicleStatus>('ALL')
  const [selectedItem, setSelectedItem] = useState<Vehicle | null>(null)
  const [editingItem, setEditingItem] = useState<Vehicle | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const query = useQuery({
    queryKey: ['vehicles', page, search, statusFilter],
    queryFn: () =>
      vehiclesApi.getAll({
        page,
        size: 10,
        search: search || undefined,
        status: statusFilter === 'ALL' ? undefined : statusFilter
      })
  })

  const createMutation = useMutation({
    mutationFn: (payload: {
      plateNumber: string
      vehicleType: VehicleType
      color?: string
      ownerId?: number
      apartmentId?: number
    }) => vehiclesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      setIsCreateOpen(false)
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<Vehicle> }) => vehiclesApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      setEditingItem(null)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => vehiclesApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] })
  })

  const list = query.data?.data?.data || []
  const totalPages = Number(query.data?.data?.totalPages || 0)
  const currentPage = Number(query.data?.data?.page || 0)
  const totalElements = Number(query.data?.data?.totalElements || 0)

  return (
    <div className='min-h-screen bg-[#F8F9FA] p-8 font-sans'>
      <div className='mx-auto max-w-6xl'>
        <div className='mb-8 flex items-center justify-between'>
          <div>
            <span className='rounded bg-[#DDE7FF] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0052CC]'>
              Administration
            </span>
            <h1 className='mt-4 mb-2 text-3xl font-bold text-gray-900'>Quản lý phương tiện</h1>
            <p className='text-sm text-gray-500'>Danh sách vehicles với bộ lọc trạng thái và biển số.</p>
          </div>
          <button className='rounded-lg bg-[#0052CC] px-5 py-2.5 font-semibold text-white' onClick={() => setIsCreateOpen(true)}>
            + Thêm phương tiện
          </button>
        </div>

        <div className='mb-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm'>
          <form
            className='grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto_auto]'
            onSubmit={(e) => {
              e.preventDefault()
              setPage(0)
              setSearch(searchInput.trim())
            }}
          >
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder='Tìm theo biển số hoặc màu'
              className='rounded-lg border border-gray-200 px-4 py-2.5'
            />
            <select
              value={statusFilter}
              onChange={(e) => {
                setPage(0)
                setStatusFilter(e.target.value as 'ALL' | VehicleStatus)
              }}
              className='rounded-lg border border-gray-200 px-4 py-2.5'
            >
              <option value='ALL'>Tất cả trạng thái</option>
              <option value='ACTIVE'>ACTIVE</option>
              <option value='REMOVED'>REMOVED</option>
            </select>
            <button className='rounded-lg bg-[#0052CC] px-4 py-2.5 font-semibold text-white'>Tìm kiếm</button>
          </form>
        </div>

        <div className='mb-4 text-sm text-gray-500'>
          Hiển thị <span className='font-bold text-gray-700'>{list.length}</span> kết quả, tổng cộng{' '}
          <span className='font-bold text-gray-700'>{totalElements}</span> bản ghi.
        </div>

        <div className='overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm'>
          <table className='w-full border-collapse text-left text-sm text-gray-700'>
            <thead>
              <tr className='border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-400'>
                <th className='px-6 py-4'>ID</th>
                <th className='px-6 py-4'>Biển số</th>
                <th className='px-6 py-4'>Loại</th>
                <th className='px-6 py-4'>Màu</th>
                <th className='px-6 py-4'>Trạng thái</th>
                <th className='px-6 py-4 text-right'>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {list.map((item: Vehicle) => (
                <tr key={item.id} className='border-b border-gray-50'>
                  <td className='px-6 py-4'>#{item.id}</td>
                  <td className='px-6 py-4 font-semibold text-gray-900'>{item.plateNumber}</td>
                  <td className='px-6 py-4'>{item.vehicleType}</td>
                  <td className='px-6 py-4'>{item.color || '-'}</td>
                  <td className='px-6 py-4'>{item.status}</td>
                  <td className='px-6 py-4 text-right'>
                    <div className='inline-flex gap-2'>
                      <button className='rounded bg-slate-100 px-3 py-1.5 text-xs text-slate-700' onClick={() => setSelectedItem(item)}>
                        Chi tiết
                      </button>
                      <button className='rounded bg-indigo-100 px-3 py-1.5 text-xs text-indigo-700' onClick={() => setEditingItem(item)}>
                        Sửa
                      </button>
                      <button
                        className='rounded bg-rose-100 px-3 py-1.5 text-xs text-rose-700'
                        onClick={() => deleteMutation.mutate(item.id)}
                        disabled={deleteMutation.isPending || item.status === 'REMOVED'}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!query.isLoading && list.length === 0 && (
                <tr>
                  <td colSpan={6} className='px-6 py-8 text-center text-gray-500'>
                    Chưa có phương tiện.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className='mt-4 flex items-center justify-end gap-2 text-sm'>
          <button
            type='button'
            className='rounded bg-slate-200 px-3 py-1 disabled:opacity-50'
            disabled={currentPage <= 0}
            onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
          >
            Trang trước
          </button>
          <span>
            Trang {totalPages === 0 ? 0 : currentPage + 1}/{totalPages}
          </span>
          <button
            type='button'
            className='rounded bg-slate-200 px-3 py-1 disabled:opacity-50'
            disabled={totalPages === 0 || currentPage + 1 >= totalPages}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Trang sau
          </button>
        </div>

        {(isCreateOpen || editingItem || selectedItem) && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4'>
            <div className='w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-xl'>
              <div className='flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4'>
                <h2 className='text-xl font-bold text-gray-800'>{selectedItem ? 'Chi tiết phương tiện' : editingItem ? 'Cập nhật phương tiện' : 'Thêm phương tiện'}</h2>
                <button className='text-gray-400 hover:text-gray-600' onClick={() => { setSelectedItem(null); if (editingItem) setEditingItem(null); else setIsCreateOpen(false) }}>
                  Đóng
                </button>
              </div>
              {selectedItem ? (
                <div className='grid grid-cols-1 gap-3 p-6 text-sm text-gray-700'>
                  <div><span className='font-semibold text-gray-900'>ID:</span> #{selectedItem.id}</div>
                  <div><span className='font-semibold text-gray-900'>Biển số:</span> {selectedItem.plateNumber}</div>
                  <div><span className='font-semibold text-gray-900'>Loại:</span> {selectedItem.vehicleType}</div>
                  <div><span className='font-semibold text-gray-900'>Màu:</span> {selectedItem.color || '-'}</div>
                  <div><span className='font-semibold text-gray-900'>Trạng thái:</span> {selectedItem.status}</div>
                  <div><span className='font-semibold text-gray-900'>Owner ID:</span> {selectedItem.ownerId || '-'}</div>
                  <div><span className='font-semibold text-gray-900'>Apartment ID:</span> {selectedItem.apartmentId || '-'}</div>
                </div>
              ) : (
              <form
                className='space-y-4 p-6'
                onSubmit={(e) => {
                  e.preventDefault()
                  const fd = new FormData(e.currentTarget)
                  const payload = {
                    plateNumber: String(fd.get('plateNumber') || ''),
                    vehicleType: String(fd.get('vehicleType') || 'MOTORBIKE') as VehicleType,
                    color: String(fd.get('color') || '') || undefined,
                    ownerId: fd.get('ownerId') ? Number(fd.get('ownerId')) : undefined,
                    apartmentId: fd.get('apartmentId') ? Number(fd.get('apartmentId')) : undefined,
                    status: String(fd.get('status') || 'ACTIVE') as VehicleStatus
                  }
                  if (editingItem) {
                    updateMutation.mutate({ id: editingItem.id, payload })
                  } else {
                    createMutation.mutate(payload)
                  }
                }}
              >
                <input name='plateNumber' defaultValue={editingItem?.plateNumber || ''} required placeholder='Biển số' className='w-full rounded-lg border border-gray-200 px-4 py-2.5' />
                <select name='vehicleType' defaultValue={editingItem?.vehicleType || 'MOTORBIKE'} className='w-full rounded-lg border border-gray-200 px-4 py-2.5'>
                  <option value='MOTORBIKE'>MOTORBIKE</option>
                  <option value='CAR'>CAR</option>
                  <option value='BICYCLE'>BICYCLE</option>
                </select>
                <input name='color' defaultValue={editingItem?.color || ''} placeholder='Màu' className='w-full rounded-lg border border-gray-200 px-4 py-2.5' />
                <input name='ownerId' defaultValue={editingItem?.ownerId || ''} placeholder='Owner ID (optional)' className='w-full rounded-lg border border-gray-200 px-4 py-2.5' />
                <input name='apartmentId' defaultValue={editingItem?.apartmentId || ''} placeholder='Apartment ID (optional)' className='w-full rounded-lg border border-gray-200 px-4 py-2.5' />
                <select name='status' defaultValue={editingItem?.status || 'ACTIVE'} className='w-full rounded-lg border border-gray-200 px-4 py-2.5'>
                  <option value='ACTIVE'>ACTIVE</option>
                  <option value='REMOVED'>REMOVED</option>
                </select>
                <div className='flex justify-end gap-3 border-t border-gray-100 pt-4'>
                  <button
                    type='button'
                    className='rounded-lg bg-gray-100 px-5 py-2.5 font-bold text-gray-600'
                    onClick={() => (editingItem ? setEditingItem(null) : setIsCreateOpen(false))}
                  >
                    Hủy
                  </button>
                  <button type='submit' className='rounded-lg bg-[#0052CC] px-5 py-2.5 font-bold text-white'>
                    {editingItem ? 'Lưu thay đổi' : 'Tạo mới'}
                  </button>
                </div>
              </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
