import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import http from 'src/utils/http'
import ContractForm from './ContractForm'
import DeleteContractModal from './DeleteContractModal'

export default function ContractList() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleteCode, setDeleteCode] = useState('')
  const [deleteStatus, setDeleteStatus] = useState('')

  const { data } = useQuery({
    queryKey: ['contracts', statusFilter, typeFilter, currentPage, searchTerm],
    queryFn: () => {
      const params: Record<string, string | number> = { page: Math.max(0, currentPage - 1), size: pageSize }
      if (statusFilter) params.status = statusFilter
      if (typeFilter) params.contractType = typeFilter
      if (searchTerm.trim()) params.search = searchTerm.trim()
      return http.get('/api/contracts', { params })
    }
  })

  const contracts = data?.data?.data || []
  const totalItems = Number(data?.data?.totalElements ?? data?.data?.total ?? 0)
  const totalPages = Number(data?.data?.totalPages) || Math.max(1, Math.ceil(totalItems / pageSize))

  const activeCount = contracts.filter((c: { status: string }) => c.status === 'ACTIVE').length
  const expiringCount = contracts.filter((c: { status: string; endDate: string }) => {
    if (c.status !== 'ACTIVE') return false
    const daysLeft = Math.ceil((new Date(c.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return daysLeft <= 30 && daysLeft > 0
  }).length

  const getInitials = (name: string) => {
    if (!name || name === '—') return '?'
    const userIdMatch = /User #(\d+)/i.exec(name)
    if (userIdMatch) return `U${userIdMatch[1].slice(-1)}`
    return name
      .split(' ')
      .filter(Boolean)
      .map((n) => n.replace(/[^\p{L}\p{N}]/gu, '').slice(0, 1))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '---'
    return new Date(dateStr).toLocaleDateString('vi-VN')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { label: 'PENDING', className: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' }
      case 'ACTIVE':
        return { label: 'ACTIVE', className: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' }
      case 'EXPIRED':
        return { label: 'EXPIRED', className: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' }
      case 'TERMINATED':
        return { label: 'TERMINATED', className: 'bg-red-100 text-red-700', dot: 'bg-red-500' }
      default:
        return { label: status, className: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' }
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'RENT':
        return 'bg-blue-50 text-blue-700'
      case 'OWNERSHIP':
        return 'bg-purple-50 text-purple-700'
      case 'TRANSFER':
        return 'bg-amber-50 text-amber-700'
      default:
        return 'bg-slate-50 text-slate-600'
    }
  }

  return (
    <div className='min-h-screen'>
      <header className='sticky top-20 z-30 -mx-6 flex h-16 items-center justify-between border-b border-slate-100 bg-white/80 px-6 backdrop-blur-xl sm:px-8'>
        <div className='flex min-w-0 flex-1 items-center gap-4 sm:gap-6'>
          <button
            type='button'
            onClick={() => navigate(-1)}
            className='shrink-0 rounded-lg p-2 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600'
          >
            <span className='material-symbols-outlined'>arrow_back</span>
          </button>
          <div className='flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400'>
            <span className='shrink-0'>Trang chủ</span>
            <span className='material-symbols-outlined shrink-0 text-[14px]'>chevron_right</span>
            <button type='button' onClick={() => navigate('/admin')} className='shrink-0 hover:text-blue-500'>
              Bảng điều khiển
            </button>
            <span className='material-symbols-outlined shrink-0 text-[14px]'>chevron_right</span>
            <span className='font-medium text-slate-600'>Quản lý hợp đồng</span>
          </div>
        </div>
        <button
          type='button'
          onClick={() => {
            setEditingId(null)
            setShowForm(true)
          }}
          className='ml-2 flex shrink-0 items-center gap-1 rounded-full bg-slate-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-slate-700'
        >
          <span className='material-symbols-outlined text-lg'>add</span>
          <span className='hidden sm:inline'>Thêm hợp đồng</span>
        </button>
      </header>

      <div className='mx-auto max-w-5xl py-8 pb-20'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-slate-900'>Hợp đồng</h1>
          <p className='mt-1 text-sm text-slate-500'>Theo dõi và quản lý {totalItems} hợp đồng cư dân.</p>
        </div>

        <div className='mb-8 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between'>
          <div className='relative max-w-md flex-1'>
            <span className='absolute inset-y-0 left-3 flex items-center text-slate-400'>
              <span className='material-symbols-outlined text-lg'>search</span>
            </span>
            <input
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className='w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20'
              placeholder='Tìm kiếm...'
              type='text'
            />
          </div>
          <div className='flex flex-wrap items-center gap-3'>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              className='rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-600 focus:ring-2 focus:ring-blue-500/20'
            >
              <option value=''>Tất cả trạng thái</option>
              <option value='PENDING'>PENDING</option>
              <option value='ACTIVE'>ACTIVE</option>
              <option value='EXPIRED'>EXPIRED</option>
              <option value='TERMINATED'>TERMINATED</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value)
                setCurrentPage(1)
              }}
              className='rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-600 focus:ring-2 focus:ring-blue-500/20'
            >
              <option value=''>Tất cả loại</option>
              <option value='RENT'>RENT</option>
              <option value='OWNERSHIP'>OWNERSHIP</option>
              <option value='TRANSFER'>TRANSFER</option>
            </select>
          </div>
        </div>

        <div className='mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
          <div className='rounded-2xl border border-slate-100 bg-white p-6 shadow-sm'>
            <span className='mb-3 block text-xs font-semibold uppercase tracking-wider text-blue-600'>Tổng hợp đồng</span>
            <p className='text-4xl font-bold text-slate-900'>{totalItems}</p>
            <p className='mt-1 text-sm text-slate-400'>Đang quản lý</p>
          </div>
          <div className='rounded-2xl border border-slate-100 bg-white p-6 shadow-sm'>
            <span className='mb-3 block text-xs font-semibold uppercase tracking-wider text-amber-600'>Chờ duyệt</span>
            <p className='text-4xl font-bold text-slate-900'>
              {contracts.filter((c: { status: string }) => c.status === 'PENDING').length}
            </p>
            <p className='mt-1 text-sm text-slate-400'>PENDING</p>
          </div>
          <div className='rounded-2xl border border-slate-100 bg-white p-6 shadow-sm'>
            <span className='mb-3 block text-xs font-semibold uppercase tracking-wider text-emerald-600'>Đang hoạt động</span>
            <p className='text-4xl font-bold text-slate-900'>{activeCount}</p>
            <p className='mt-1 text-sm text-slate-400'>ACTIVE (trang này)</p>
          </div>
          <div className='rounded-2xl border border-slate-100 bg-amber-50/50 p-6 shadow-sm'>
            <span className='mb-3 block text-xs font-semibold uppercase tracking-wider text-amber-600'>Sắp hết hạn</span>
            <p className='text-4xl font-bold text-slate-900'>{expiringCount}</p>
            <p className='mt-1 text-sm text-slate-400'>Trong 30 ngày</p>
          </div>
        </div>

        <div className='overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm'>
          <div className='max-h-[520px] overflow-y-auto'>
            <table className='w-full text-left'>
              <thead>
                <tr className='bg-slate-50/80'>
                  <th className='px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400'>Mã HĐ</th>
                  <th className='px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400'>Cư dân</th>
                  <th className='px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400'>Căn hộ</th>
                  <th className='px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400'>Loại</th>
                  <th className='px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400'>Trạng thái</th>
                  <th className='px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400'>Thời hạn</th>
                  <th className='px-6 py-4 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400'>
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-50'>
                {contracts.map((contract: Record<string, unknown> & { id: number; status: string }) => {
                  const statusBadge = getStatusBadge(contract.status)
                  return (
                    <tr key={contract.id} className='group transition-colors hover:bg-slate-50/50'>
                      <td className='px-6 py-5 text-sm font-semibold text-slate-800'>#{contract.id}</td>
                      <td className='px-6 py-5'>
                        <div className='flex items-center gap-3'>
                          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-xs font-bold text-white'>
                            {getInitials(String(contract.residentName || ''))}
                          </div>
                          <span className='text-sm font-medium text-slate-700'>{String(contract.residentName || '—')}</span>
                        </div>
                      </td>
                      <td className='px-6 py-5 text-sm font-medium text-slate-500'>{String(contract.apartmentCode || '—')}</td>
                      <td className='px-6 py-5'>
                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${getTypeBadge(String(contract.contractType))}`}
                        >
                          {String(contract.contractType)}
                        </span>
                      </td>
                      <td className='px-6 py-5'>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold ${statusBadge.className}`}
                        >
                          <span className={`mr-2 h-1.5 w-1.5 rounded-full ${statusBadge.dot}`} />
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className='px-6 py-5'>
                        <div className='text-xs leading-tight text-slate-500'>
                          <span className='block'>BĐ: {formatDate(String(contract.startDate || ''))}</span>
                          <span className='block text-slate-400'>KT: {formatDate(String(contract.endDate || ''))}</span>
                        </div>
                      </td>
                      <td className='px-6 py-5 text-right'>
                        <div className='flex items-center justify-end gap-1'>
                          <button
                            type='button'
                            onClick={() => navigate(`/admin/contracts/${contract.id}`)}
                            className='rounded-lg p-2 text-slate-400 transition-all hover:bg-blue-50 hover:text-blue-600'
                          >
                            <span className='material-symbols-outlined text-lg'>visibility</span>
                          </button>
                          {contract.status === 'PENDING' || contract.status === 'ACTIVE' ? (
                            <button
                              type='button'
                              onClick={() => {
                                setEditingId(contract.id)
                                setShowForm(true)
                              }}
                              className='rounded-lg p-2 text-slate-400 transition-all hover:bg-amber-50 hover:text-amber-600'
                            >
                              <span className='material-symbols-outlined text-lg'>edit</span>
                            </button>
                          ) : (
                            <span className='cursor-not-allowed p-2 text-slate-200'>
                              <span className='material-symbols-outlined text-lg'>edit</span>
                            </span>
                          )}
                          <button
                            type='button'
                            onClick={() => {
                              setDeleteId(contract.id)
                              setDeleteCode(String(contract.id))
                              setDeleteStatus(String(contract.status))
                            }}
                            className='rounded-lg p-2 text-slate-400 transition-all hover:bg-red-50 hover:text-red-600'
                            title='Xóa'
                          >
                            <span className='material-symbols-outlined text-lg'>delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {contracts.length === 0 && (
              <div className='py-16 text-center'>
                <span className='material-symbols-outlined mb-3 text-4xl text-slate-200'>description</span>
                <p className='text-sm text-slate-400'>Không có hợp đồng nào</p>
              </div>
            )}
          </div>

          <div className='flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4'>
            <p className='text-xs text-slate-400'>
              Hiển thị {contracts.length} trên {totalItems} kết quả
            </p>
            <div className='flex items-center gap-4'>
              <p className='text-xs text-slate-400'>
                Trang {currentPage} / {totalPages}
              </p>
              <div className='flex gap-1.5'>
                <button
                  type='button'
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className='flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition-colors hover:text-blue-600 disabled:opacity-30'
                >
                  <span className='material-symbols-outlined text-sm'>chevron_left</span>
                </button>
                <button
                  type='button'
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className='flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition-colors hover:text-blue-600 disabled:opacity-30'
                >
                  <span className='material-symbols-outlined text-sm'>chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className='mt-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm'>
          <div className='flex items-start gap-4'>
            <div className='rounded-xl bg-blue-500 p-2.5'>
              <span className='material-symbols-outlined text-lg text-white' style={{ fontVariationSettings: "'FILL' 1" }}>
                auto_awesome
              </span>
            </div>
            <div>
              <h4 className='mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400'>Gợi ý</h4>
              <p className='max-w-2xl text-sm leading-relaxed text-slate-500'>
                Các hợp đồng sắp hết hạn trong 30 ngày nên được nhắc gia hạn sớm để ổn định tỷ lệ lấp đầy căn hộ.
              </p>
            </div>
          </div>
        </div>
      </div>

      <ContractForm
        contractId={editingId}
        isOpen={showForm}
        onClose={() => {
          setShowForm(false)
          setEditingId(null)
        }}
        currentStatus={contracts.find((c: { id: number }) => c.id === editingId)?.status}
      />
      <DeleteContractModal
        contractId={deleteId!}
        contractCode={deleteCode}
        currentStatus={deleteStatus}
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
      />
    </div>
  )
}
