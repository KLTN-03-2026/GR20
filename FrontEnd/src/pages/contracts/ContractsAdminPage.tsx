import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { contractsApi } from 'src/apis/contract_api/contracts.api'
import type { Contract } from 'src/types/contract.type'

export default function ContractsAdminPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [selectedItem, setSelectedItem] = useState<Contract | null>(null)
  const [editingItem, setEditingItem] = useState<Contract | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const query = useQuery({
    queryKey: ['contracts', page, search],
    queryFn: () => contractsApi.getAll({ page, size: 10, search: search || undefined })
  })

  const createMutation = useMutation({
    mutationFn: (payload: Omit<Contract, 'id'>) => contractsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
      setIsCreateOpen(false)
    }
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<Contract> }) => contractsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
      setEditingItem(null)
    }
  })
  const deleteMutation = useMutation({
    mutationFn: (id: number) => contractsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contracts'] })
  })

  const list = query.data?.data?.data || []
  const totalPages = Number(query.data?.data?.totalPages || 0)
  const currentPage = Number(query.data?.data?.page || 0)

  return (
    <div className='min-h-screen bg-[#F8F9FA] p-8 font-sans'>
      <div className='mx-auto max-w-6xl'>
        <div className='mb-8 flex items-center justify-between'>
          <div>
            <span className='rounded bg-[#DDE7FF] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0052CC]'>Administration</span>
            <h1 className='mt-4 mb-2 text-3xl font-bold text-gray-900'>Quản lý hợp đồng</h1>
          </div>
          <button className='rounded-lg bg-[#0052CC] px-5 py-2.5 font-semibold text-white' onClick={() => setIsCreateOpen(true)}>
            + Tạo hợp đồng
          </button>
        </div>

        <form
          className='mb-6 grid grid-cols-1 gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm lg:grid-cols-[1fr_auto]'
          onSubmit={(e) => {
            e.preventDefault()
            setPage(0)
            setSearch(searchInput.trim())
          }}
        >
          <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder='Tìm theo cư dân hoặc căn hộ' className='rounded-lg border border-gray-200 px-4 py-2.5' />
          <button className='rounded-lg bg-[#0052CC] px-4 py-2.5 font-semibold text-white'>Tìm kiếm</button>
        </form>

        <div className='overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm'>
          <table className='w-full border-collapse text-left text-sm text-gray-700'>
            <thead>
              <tr className='border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-400'>
                <th className='px-6 py-4'>ID</th>
                <th className='px-6 py-4'>Cư dân</th>
                <th className='px-6 py-4'>Căn hộ</th>
                <th className='px-6 py-4'>Loại</th>
                <th className='px-6 py-4'>Trạng thái</th>
                <th className='px-6 py-4 text-right'>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {list.map((item: Contract) => (
                <tr key={item.id} className='border-b border-gray-50'>
                  <td className='px-6 py-4'>#{item.id}</td>
                  <td className='px-6 py-4'>{item.residentName || item.residentId}</td>
                  <td className='px-6 py-4'>{item.apartmentCode || item.apartmentId}</td>
                  <td className='px-6 py-4'>{item.contractType}</td>
                  <td className='px-6 py-4'>{item.status}</td>
                  <td className='px-6 py-4 text-right'>
                    <div className='inline-flex gap-2'>
                      <button className='rounded bg-slate-100 px-3 py-1.5 text-xs text-slate-700' onClick={() => setSelectedItem(item)}>
                        Chi tiết
                      </button>
                      <button className='rounded bg-indigo-100 px-3 py-1.5 text-xs text-indigo-700' onClick={() => setEditingItem(item)}>
                        Sửa
                      </button>
                      <button className='rounded bg-rose-100 px-3 py-1.5 text-xs text-rose-700' onClick={() => deleteMutation.mutate(item.id)}>
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className='mt-4 flex items-center justify-end gap-2 text-sm'>
          <button type='button' className='rounded bg-slate-200 px-3 py-1 disabled:opacity-50' disabled={currentPage <= 0} onClick={() => setPage((p) => Math.max(p - 1, 0))}>
            Trang trước
          </button>
          <span>
            Trang {totalPages === 0 ? 0 : currentPage + 1}/{totalPages}
          </span>
          <button type='button' className='rounded bg-slate-200 px-3 py-1 disabled:opacity-50' disabled={totalPages === 0 || currentPage + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Trang sau
          </button>
        </div>

        {(selectedItem || editingItem || isCreateOpen) && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4'>
            <div className='w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-xl'>
              <div className='flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4'>
                <h2 className='text-xl font-bold text-gray-800'>{selectedItem ? 'Chi tiết hợp đồng' : editingItem ? 'Cập nhật hợp đồng' : 'Tạo hợp đồng'}</h2>
                <button className='text-gray-400 hover:text-gray-600' onClick={() => { setSelectedItem(null); setEditingItem(null); setIsCreateOpen(false) }}>
                  Đóng
                </button>
              </div>

              {selectedItem ? (
                <div className='grid grid-cols-1 gap-3 p-6 text-sm text-gray-700'>
                  <div><span className='font-semibold text-gray-900'>ID:</span> #{selectedItem.id}</div>
                  <div><span className='font-semibold text-gray-900'>Cư dân:</span> {selectedItem.residentName || selectedItem.residentId}</div>
                  <div><span className='font-semibold text-gray-900'>Căn hộ:</span> {selectedItem.apartmentCode || selectedItem.apartmentId}</div>
                  <div><span className='font-semibold text-gray-900'>Loại:</span> {selectedItem.contractType}</div>
                  <div><span className='font-semibold text-gray-900'>Trạng thái:</span> {selectedItem.status}</div>
                  <div><span className='font-semibold text-gray-900'>Bắt đầu:</span> {selectedItem.startDate}</div>
                  <div><span className='font-semibold text-gray-900'>Kết thúc:</span> {selectedItem.endDate}</div>
                  <div><span className='font-semibold text-gray-900'>Ghi chú:</span> {selectedItem.note || '-'}</div>
                </div>
              ) : (
                <form
                  className='space-y-4 p-6'
                  onSubmit={(e) => {
                    e.preventDefault()
                    const fd = new FormData(e.currentTarget)
                    const payload: Omit<Contract, 'id'> = {
                      residentId: Number(fd.get('residentId')),
                      apartmentId: Number(fd.get('apartmentId')),
                      contractType: String(fd.get('contractType') || ''),
                      status: String(fd.get('status') || 'PENDING'),
                      startDate: String(fd.get('startDate') || ''),
                      endDate: String(fd.get('endDate') || ''),
                      monthlyRent: fd.get('monthlyRent') ? Number(fd.get('monthlyRent')) : null,
                      deposit: fd.get('deposit') ? Number(fd.get('deposit')) : null,
                      note: String(fd.get('note') || '')
                    }
                    if (editingItem) updateMutation.mutate({ id: editingItem.id, payload })
                    else createMutation.mutate(payload)
                  }}
                >
                  <input name='residentId' defaultValue={editingItem?.residentId || ''} required placeholder='Resident ID' className='w-full rounded-lg border border-gray-200 px-4 py-2.5' />
                  <input name='apartmentId' defaultValue={editingItem?.apartmentId || ''} required placeholder='Apartment ID' className='w-full rounded-lg border border-gray-200 px-4 py-2.5' />
                  <input name='contractType' defaultValue={editingItem?.contractType || ''} required placeholder='Contract type' className='w-full rounded-lg border border-gray-200 px-4 py-2.5' />
                  <input name='status' defaultValue={editingItem?.status || 'PENDING'} required placeholder='Status' className='w-full rounded-lg border border-gray-200 px-4 py-2.5' />
                  <input name='startDate' defaultValue={editingItem?.startDate || ''} required type='date' className='w-full rounded-lg border border-gray-200 px-4 py-2.5' />
                  <input name='endDate' defaultValue={editingItem?.endDate || ''} required type='date' className='w-full rounded-lg border border-gray-200 px-4 py-2.5' />
                  <input name='monthlyRent' defaultValue={editingItem?.monthlyRent ?? ''} type='number' step='0.01' placeholder='Monthly rent' className='w-full rounded-lg border border-gray-200 px-4 py-2.5' />
                  <input name='deposit' defaultValue={editingItem?.deposit ?? ''} type='number' step='0.01' placeholder='Deposit' className='w-full rounded-lg border border-gray-200 px-4 py-2.5' />
                  <textarea name='note' defaultValue={editingItem?.note || ''} rows={3} placeholder='Ghi chú' className='w-full rounded-lg border border-gray-200 px-4 py-2.5' />
                  <div className='flex justify-end gap-3 border-t border-gray-100 pt-4'>
                    <button type='button' className='rounded-lg bg-gray-100 px-5 py-2.5 font-bold text-gray-600' onClick={() => { setEditingItem(null); setIsCreateOpen(false) }}>
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
