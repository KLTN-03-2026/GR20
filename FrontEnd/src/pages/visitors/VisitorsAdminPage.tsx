import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { visitorsApi } from 'src/apis/visitor_api/visitors.api'
import type { Visitor } from 'src/types/visitor.type'

export default function VisitorsAdminPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [selectedItem, setSelectedItem] = useState<Visitor | null>(null)
  const [editingItem, setEditingItem] = useState<Visitor | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const query = useQuery({
    queryKey: ['visitors', page, search],
    queryFn: () => visitorsApi.getAll({ page, size: 10, search: search || undefined })
  })

  const createMutation = useMutation({
    mutationFn: (payload: { name: string; phone?: string; idCard?: string; hostUserId?: number }) => visitorsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitors'] })
      setIsCreateOpen(false)
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<Visitor> }) => visitorsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitors'] })
      setEditingItem(null)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => visitorsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['visitors'] })
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
            <h1 className='mt-4 mb-2 text-3xl font-bold text-gray-900'>Quản lý khách ghé thăm</h1>
            <p className='text-sm text-gray-500'>Danh sách visitors, quản lý theo tên, số điện thoại, CCCD.</p>
          </div>
          <button className='rounded-lg bg-[#0052CC] px-5 py-2.5 font-semibold text-white' onClick={() => setIsCreateOpen(true)}>
            + Thêm visitor
          </button>
        </div>

        <div className='mb-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm'>
          <form
            className='grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto]'
            onSubmit={(e) => {
              e.preventDefault()
              setPage(0)
              setSearch(searchInput.trim())
            }}
          >
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder='Tìm theo tên, SĐT, CCCD'
              className='rounded-lg border border-gray-200 px-4 py-2.5'
            />
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
                <th className='px-6 py-4'>Tên</th>
                <th className='px-6 py-4'>SĐT</th>
                <th className='px-6 py-4'>CCCD</th>
                <th className='px-6 py-4'>Host ID</th>
                <th className='px-6 py-4 text-right'>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {list.map((item: Visitor) => (
                <tr key={item.id} className='border-b border-gray-50'>
                  <td className='px-6 py-4'>#{item.id}</td>
                  <td className='px-6 py-4 font-semibold text-gray-900'>{item.name}</td>
                  <td className='px-6 py-4'>{item.phone || '-'}</td>
                  <td className='px-6 py-4'>{item.idCard || '-'}</td>
                  <td className='px-6 py-4'>{item.hostUserId || '-'}</td>
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
                        disabled={deleteMutation.isPending}
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
                    Chưa có visitor.
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
                <h2 className='text-xl font-bold text-gray-800'>{selectedItem ? 'Chi tiết visitor' : editingItem ? 'Cập nhật visitor' : 'Thêm visitor'}</h2>
                <button className='text-gray-400 hover:text-gray-600' onClick={() => { setSelectedItem(null); if (editingItem) setEditingItem(null); else setIsCreateOpen(false) }}>
                  Đóng
                </button>
              </div>
              {selectedItem ? (
                <div className='grid grid-cols-1 gap-3 p-6 text-sm text-gray-700'>
                  <div><span className='font-semibold text-gray-900'>ID:</span> #{selectedItem.id}</div>
                  <div><span className='font-semibold text-gray-900'>Tên:</span> {selectedItem.name}</div>
                  <div><span className='font-semibold text-gray-900'>SĐT:</span> {selectedItem.phone || '-'}</div>
                  <div><span className='font-semibold text-gray-900'>CCCD:</span> {selectedItem.idCard || '-'}</div>
                  <div><span className='font-semibold text-gray-900'>Host ID:</span> {selectedItem.hostUserId || '-'}</div>
                </div>
              ) : (
              <form
                className='space-y-4 p-6'
                onSubmit={(e) => {
                  e.preventDefault()
                  const fd = new FormData(e.currentTarget)
                  const payload = {
                    name: String(fd.get('name') || ''),
                    phone: String(fd.get('phone') || '') || undefined,
                    idCard: String(fd.get('idCard') || '') || undefined,
                    hostUserId: fd.get('hostUserId') ? Number(fd.get('hostUserId')) : undefined
                  }
                  if (editingItem) {
                    updateMutation.mutate({ id: editingItem.id, payload })
                  } else {
                    createMutation.mutate(payload)
                  }
                }}
              >
                <input name='name' defaultValue={editingItem?.name || ''} required placeholder='Tên khách' className='w-full rounded-lg border border-gray-200 px-4 py-2.5' />
                <input name='phone' defaultValue={editingItem?.phone || ''} placeholder='Số điện thoại' className='w-full rounded-lg border border-gray-200 px-4 py-2.5' />
                <input name='idCard' defaultValue={editingItem?.idCard || ''} placeholder='CCCD' className='w-full rounded-lg border border-gray-200 px-4 py-2.5' />
                <input name='hostUserId' defaultValue={editingItem?.hostUserId || ''} placeholder='Host User ID (optional)' className='w-full rounded-lg border border-gray-200 px-4 py-2.5' />
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
