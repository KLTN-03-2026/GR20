import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useLocation } from 'react-router-dom'
import http from 'src/utils/http'
import ContractForm from './ContractForm'
import DeleteContractModal from './DeleteContractModal'

export default function ContractList() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const detailBase = pathname.startsWith('/admin') ? '/admin/contracts' : '/contracts'
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

  // Fetch contracts
  const { data } = useQuery({
    queryKey: ['contracts', statusFilter, typeFilter, currentPage, searchTerm],
    queryFn: () => {
      const params: any = { page: currentPage, size: pageSize }
      if (statusFilter) params.status = statusFilter
      if (typeFilter) params.contractType = typeFilter
      if (searchTerm.trim()) params.search = searchTerm.trim()
      return http.get('/api/contracts', { params })
    }
  })

  const contracts = data?.data?.data || []
  const totalItems = data?.data?.total || 0
  const totalPages = data?.data?.totalPages || Math.ceil(totalItems / pageSize) || 1

  // Stats
  const activeCount = contracts.filter((c: any) => c.status === 'ACTIVE').length
  const expiringCount = contracts.filter((c: any) => {
    if (c.status !== 'ACTIVE') return false
    const daysLeft = Math.ceil((new Date(c.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return daysLeft <= 30 && daysLeft > 0
  }).length

  // Helpers
  const getInitials = (name: string) => {
    if (!name) return ''
    return name
      .split(' ')
      .map((n) => n[0])
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
    <div className=' min-h-screen'>
      {/* Content */}
      <div className='max-w-7xl mx-auto'>
        {/* Page Header */}
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10'>
          <div>
            <h2 className='text-3xl font-bold text-slate-900 tracking-tight mb-1'>Quản lý Hợp đồng</h2>
            <p className='text-slate-500 text-sm'>Theo dõi và quản lý {totalItems} hợp đồng cư dân hiện tại.</p>
          </div>

          {/* Search + Filter + Button - Cùng hàng */}
          <div className='flex items-center gap-3'>
            {/* Search */}
            <div className='relative'>
              <span className='absolute inset-y-0 left-3 flex items-center text-slate-400'>
                <span className='material-symbols-outlined text-lg'>search</span>
              </span>
              <input
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className='pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-full text-sm text-slate-700 focus:ring-2 focus:ring-blue-500/20 w-48 transition-all placeholder:text-slate-400'
                placeholder='Tìm kiếm...'
                type='text'
              />
            </div>

            {/* Filter Status */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              className='bg-slate-100 border border-slate-200 rounded-full text-sm font-medium text-slate-600 focus:ring-2 focus:ring-blue-500/20 px-4 py-2.5'
            >
              <option value=''>Tất cả trạng thái</option>
              <option value='PENDING'>PENDING</option>
              <option value='ACTIVE'>ACTIVE</option>
              <option value='EXPIRED'>EXPIRED</option>
              <option value='TERMINATED'>TERMINATED</option>
            </select>

            {/* Filter Type */}
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value)
                setCurrentPage(1)
              }}
              className='bg-slate-100 border border-slate-200 rounded-full text-sm font-medium text-slate-600 focus:ring-2 focus:ring-blue-500/20 px-4 py-2.5'
            >
              <option value=''>Tất cả loại</option>
              <option value='RENT'>RENT</option>
              <option value='OWNERSHIP'>OWNERSHIP</option>
              <option value='TRANSFER'>TRANSFER</option>
            </select>

            {/* Thêm mới */}
            <button
              onClick={() => {
                setEditingId(null)
                setShowForm(true)
              }}
              className='bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all active:scale-95 flex items-center gap-2 shadow-sm whitespace-nowrap'
            >
              <span className='material-symbols-outlined text-lg'>add</span>
              Thêm hợp đồng
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className='grid grid-cols-4 gap-6 mb-10'>
          {/* Tổng hợp đồng */}
          <div className='bg-white rounded-2xl p-6 border border-slate-100 shadow-sm'>
            <span className='text-xs font-bold uppercase tracking-widest text-blue-600 mb-3 block'>Tổng hợp đồng</span>
            <p className='text-4xl font-bold text-slate-900'>{totalItems}</p>
            <p className='text-sm text-slate-400 mt-1'>Đang quản lý</p>
          </div>

          {/* PENDING */}
          <div className='bg-white rounded-2xl p-6 border border-slate-100 shadow-sm'>
            <span className='text-xs font-bold uppercase tracking-widest text-amber-600 mb-3 block'>Chờ duyệt</span>
            <p className='text-4xl font-bold text-slate-900'>
              {contracts.filter((c: any) => c.status === 'PENDING').length}
            </p>
            <p className='text-sm text-slate-400 mt-1'>Hợp đồng PENDING</p>
          </div>

          {/* ACTIVE */}
          <div className='bg-white rounded-2xl p-6 border border-slate-100 shadow-sm'>
            <span className='text-xs font-bold uppercase tracking-widest text-emerald-600 mb-3 block'>
              Đang hoạt động
            </span>
            <p className='text-4xl font-bold text-slate-900'>{activeCount}</p>
            <p className='text-sm text-slate-400 mt-1'>Hợp đồng ACTIVE</p>
          </div>

          {/* Sắp hết hạn */}
          <div className='bg-white rounded-2xl p-6 border border-slate-100 shadow-sm bg-amber-50/30'>
            <span className='text-xs font-bold uppercase tracking-widest text-amber-600 mb-3 block'>Sắp hết hạn</span>
            <p className='text-4xl font-bold text-slate-900'>{expiringCount}</p>
            <p className='text-sm text-slate-400 mt-1'>Trong 30 ngày tới</p>
          </div>
        </div>

        {/* Table */}
        <div className='max-h-[500px] overflow-y-auto'>
          <table className='w-full text-left'>
            <thead>
              <tr className='bg-slate-50/50'>
                <th className='px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400'>Mã HĐ</th>
                <th className='px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400'>Cư dân</th>
                <th className='px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400'>Căn hộ</th>
                <th className='px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400'>Loại</th>
                <th className='px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400'>Trạng thái</th>
                <th className='px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400'>Thời hạn</th>
                <th className='px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 text-right'>
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-50'>
              {contracts.map((contract: any) => {
                const statusBadge = getStatusBadge(contract.status)
                return (
                  <tr key={contract.id} className='hover:bg-slate-50/50 transition-colors group'>
                    <td className='px-6 py-5 font-semibold text-slate-800 text-sm'>#{contract.id}</td>
                    <td className='px-6 py-5'>
                      <div className='flex items-center gap-3'>
                        <div className='w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs'>
                          {getInitials(contract.residentName)}
                        </div>
                        <span className='text-sm font-medium text-slate-700'>{contract.residentName}</span>
                      </div>
                    </td>
                    <td className='px-6 py-5 text-sm text-slate-500 font-medium'>{contract.apartmentCode}</td>
                    <td className='px-6 py-5'>
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getTypeBadge(contract.contractType)}`}
                      >
                        {contract.contractType}
                      </span>
                    </td>
                    <td className='px-6 py-5'>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${statusBadge.className}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot} mr-2`}></span>
                        {statusBadge.label}
                      </span>
                    </td>
                    <td className='px-6 py-5'>
                      <div className='text-xs text-slate-500 leading-tight'>
                        <span className='block'>BĐ: {formatDate(contract.startDate)}</span>
                        <span className='block text-slate-400'>KT: {formatDate(contract.endDate)}</span>
                      </div>
                    </td>
                    <td className='px-6 py-5 text-right'>
                      <div className='flex items-center justify-end gap-1'>
                        <button
                          onClick={() => navigate(`/admin/contractList/${contract.id}`)}
                          // onClick={() => navigate(`ttt/${contract.id}`)}
                          className='p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all'
                        >
                          <span className='material-symbols-outlined text-lg'>visibility</span>
                        </button>
                        {contract.status === 'PENDING' || contract.status === 'ACTIVE' ? (
                          <button
                            onClick={() => {
                              setEditingId(contract.id)
                              setShowForm(true)
                            }}
                            className='p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all'
                          >
                            <span className='material-symbols-outlined text-lg'>edit</span>
                          </button>
                        ) : (
                          <span className='p-2 text-slate-200 cursor-not-allowed'>
                            <span className='material-symbols-outlined text-lg'>edit</span>
                          </span>
                        )}
                        <button
                          onClick={() => {
                            setDeleteId(contract.id)
                            setDeleteCode(contract.id.toString())
                            setDeleteStatus(contract.status)
                          }}
                          className='p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all'
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

          {/* Empty State */}
          {contracts.length === 0 && (
            <div className='text-center py-16'>
              <span className='material-symbols-outlined text-4xl text-slate-200 mb-3'>description</span>
              <p className='text-slate-400 text-sm'>Không có hợp đồng nào</p>
            </div>
          )}

          {/* Pagination */}
          <div className='px-6 py-4 flex items-center justify-between bg-slate-50/30 border-t border-slate-50'>
            <p className='text-xs text-slate-400'>
              Hiển thị {contracts.length} trên {totalItems} kết quả
            </p>
            <div className='flex items-center gap-4'>
              <p className='text-xs text-slate-400'>
                Trang {currentPage} của {totalPages}
              </p>
              <div className='flex gap-1.5'>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className='w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-blue-600 disabled:opacity-30 transition-colors'
                >
                  <span className='material-symbols-outlined text-sm'>chevron_left</span>
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className='w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-blue-600 disabled:opacity-30 transition-colors'
                >
                  <span className='material-symbols-outlined text-sm'>chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insight */}
        <div className='mt-10 p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-slate-50 border border-blue-100/50'>
          <div className='flex items-start gap-4'>
            <div className='p-2.5 bg-blue-500 rounded-xl'>
              <span
                className='material-symbols-outlined text-white text-lg'
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                auto_awesome
              </span>
            </div>
            <div>
              <h4 className='font-bold text-slate-800 mb-1'>Gợi ý từ Homelink AI</h4>
              <p className='text-sm text-slate-500 leading-relaxed max-w-2xl'>
                Dựa trên lịch sử hợp đồng, các căn hộ có hợp đồng sắp hết hạn nên được gửi thông báo gia hạn sớm để đảm
                bảo tỷ lệ lấp đầy.
              </p>
              <div className='mt-3 flex gap-3'>
                <button className='px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-full hover:bg-blue-700 transition-colors'>
                  Gửi thông báo
                </button>
                <button className='px-4 py-1.5 text-slate-500 text-xs font-semibold rounded-full hover:bg-slate-100 transition-colors'>
                  Bỏ qua
                </button>
              </div>
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
        currentStatus={contracts.find((c: any) => c.id === editingId)?.status}
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
