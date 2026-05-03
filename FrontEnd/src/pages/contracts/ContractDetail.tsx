import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import http from 'src/utils/http'
import TerminateContractModal from './TerminateContractModal'
import ContractForm from './ContractForm'

export default function ContractDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [showTerminate, setShowTerminate] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['contract', id],
    queryFn: () => http.get(`/api/contracts/${id}`),
    enabled: !!id
  })

  const contract = data?.data?.data || null

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '---'
    return new Date(dateStr).toLocaleDateString('vi-VN')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-100 text-amber-700'
      case 'ACTIVE':
        return 'bg-emerald-100 text-emerald-700'
      case 'EXPIRED':
        return 'bg-slate-100 text-slate-600'
      case 'TERMINATED':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const getMonthsDiff = (start: string, end: string) => {
    if (!start || !end) return 0
    const s = new Date(start)
    const e = new Date(end)
    return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24 * 30))
  }

  const signerInitials = (name: string | undefined) => {
    if (!name) return ''
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (isLoading) {
    return (
      <div className='flex min-h-[50vh] items-center justify-center text-slate-400'>
        <span className='material-symbols-outlined animate-spin'>sync</span>
        <span className='ml-2 text-sm'>Đang tải dữ liệu...</span>
      </div>
    )
  }

  if (!contract) {
    return (
      <div className='flex min-h-[50vh] flex-col items-center justify-center'>
        <span className='material-symbols-outlined mb-2 text-4xl text-slate-300'>error_outline</span>
        <p className='font-semibold text-slate-500'>Không tìm thấy hợp đồng</p>
        <button type='button' onClick={() => navigate(-1)} className='mt-4 text-sm font-bold text-blue-600 hover:underline'>
          Quay lại
        </button>
      </div>
    )
  }

  const months = getMonthsDiff(contract.startDate, contract.endDate)
  const progressPercent = Math.min(100, Math.round((months / 12) * 100))

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
            <button type='button' onClick={() => navigate('/admin/contracts')} className='shrink-0 hover:text-blue-500'>
              Quản lý hợp đồng
            </button>
            <span className='material-symbols-outlined shrink-0 text-[14px]'>chevron_right</span>
            <span className='font-medium text-slate-600'>{contract.apartment?.apartmentNumber || 'Chi tiết'}</span>
          </div>
        </div>
        <div className='flex shrink-0 flex-wrap items-center justify-end gap-2'>
          {(contract.status === 'PENDING' || contract.status === 'ACTIVE') && (
            <button
              type='button'
              onClick={() => setShowForm(true)}
              className='rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100'
            >
              <span className='material-symbols-outlined mr-1 align-middle text-lg'>edit</span>
              Chỉnh sửa
            </button>
          )}
          <button
            type='button'
            onClick={() => setShowTerminate(true)}
            className='rounded-full bg-slate-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-slate-700'
          >
            <span className='material-symbols-outlined mr-1 align-middle text-lg'>cancel</span>
            Chấm dứt
          </button>
        </div>
      </header>

      <main className='mx-auto max-w-5xl px-0 py-8 pb-20'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-slate-900'>{contract.apartment?.apartmentNumber || `Hợp đồng #${contract.id}`}</h1>
          <p className='mt-1 text-sm text-slate-500'>
            {contract.apartment?.buildingName || '—'} • Hợp đồng #{contract.id}
          </p>
        </div>

        <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
          <div className='space-y-6 lg:col-span-2'>
            <div className='relative aspect-video overflow-hidden rounded-2xl bg-slate-200'>
              <div className='absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700' />
              <div className='absolute bottom-6 left-6 text-white'>
                <p className='mb-1 text-xs font-semibold uppercase tracking-wider text-blue-100'>Căn hộ</p>
                <h2 className='text-2xl font-bold'>{contract.apartment?.apartmentNumber || '—'}</h2>
                <p className='text-sm text-blue-100'>{contract.apartment?.buildingName || '—'}</p>
              </div>
              <div className='absolute right-4 top-4'>
                <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusBadge(contract.status)}`}>
                  {contract.status}
                </span>
              </div>
            </div>

            <div className='rounded-2xl border border-slate-100 bg-white p-6 shadow-sm'>
              <h3 className='mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400'>Tiến độ thời hạn</h3>
              <div className='mb-2 flex justify-between text-xs font-medium text-slate-500'>
                <span>Thời hạn ước tính</span>
                <span>{months} tháng</span>
              </div>
              <div className='h-2 w-full overflow-hidden rounded-full bg-slate-100'>
                <div className='h-full rounded-full bg-blue-500 transition-all' style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            {contract.note && (
              <div className='rounded-2xl border border-amber-100 bg-amber-50/80 p-6'>
                <p className='mb-2 text-xs font-semibold uppercase tracking-wider text-amber-700'>Ghi chú</p>
                <p className='text-sm text-slate-700'>{contract.note}</p>
              </div>
            )}
          </div>

          <div className='space-y-6'>
            {/* Thẻ &quot;Hợp đồng hiện tại&quot; giống GR20_1 ApartmentDetail */}
            <div className='rounded-2xl border border-slate-100 bg-white p-6 shadow-sm'>
              <h3 className='mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400'>Hợp đồng hiện tại</h3>
              <div className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-sm text-slate-500'>Loại</span>
                  <span className='text-sm font-semibold text-slate-800'>{contract.contractType}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm text-slate-500'>Trạng thái</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusBadge(contract.status)}`}>
                    {contract.status}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm text-slate-500'>Tiền thuê / tháng</span>
                  <span className='text-sm font-semibold text-slate-800'>{formatCurrency(contract.monthlyRent)}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm text-slate-500'>Đặt cọc</span>
                  <span className='text-sm font-semibold text-slate-800'>{formatCurrency(contract.deposit)}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm text-slate-500'>Từ ngày</span>
                  <span className='text-sm text-slate-800'>{formatDate(contract.startDate)}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm text-slate-500'>Đến ngày</span>
                  <span className='text-sm text-slate-800'>{formatDate(contract.endDate)}</span>
                </div>
              </div>
            </div>

            {contract.signer && (
              <div className='rounded-2xl border border-slate-100 bg-white p-6 shadow-sm'>
                <h3 className='mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400'>Người ký</h3>
                <div className='mb-4 flex items-center gap-3'>
                  <div className='flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-sm font-bold text-white'>
                    {signerInitials(contract.signer.fullName)}
                  </div>
                  <div>
                    <p className='text-sm font-semibold text-slate-800'>{contract.signer.fullName}</p>
                    <p className='text-xs text-slate-400'>Cư dân ký hợp đồng</p>
                  </div>
                </div>
                <div className='space-y-2 text-sm text-slate-500'>
                  <div className='flex items-center gap-2'>
                    <span className='material-symbols-outlined text-base'>mail</span>
                    {contract.signer.email}
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='material-symbols-outlined text-base'>call</span>
                    {contract.signer.phone}
                  </div>
                </div>
                {contract.signer.phone && (
                  <button
                    type='button'
                    onClick={() => (window.location.href = `tel:${contract.signer.phone}`)}
                    className='mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-600'
                  >
                    <span className='material-symbols-outlined text-lg'>call</span>
                    Gọi {contract.signer.phone}
                  </button>
                )}
              </div>
            )}

            {contract.eSignature && (
              <div className='rounded-2xl border border-slate-100 bg-white p-6 shadow-sm'>
                <h3 className='mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400'>Chữ ký điện tử</h3>
                <code className='block break-all rounded-lg bg-slate-50 p-3 text-xs text-slate-600'>
                  {contract.eSignature.signatureHash}
                </code>
                <p className='mt-2 text-xs text-slate-400'>Ký lúc: {formatDate(contract.eSignature.signedAt)}</p>
                <div className='mt-1 flex items-center gap-1.5 text-emerald-600'>
                  <span className='material-symbols-outlined text-sm'>verified</span>
                  <span className='text-xs font-bold uppercase'>Hợp lệ</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className='mt-10 flex justify-between border-t border-slate-100 pt-6 text-xs text-slate-400'>
          <span>
            Hợp đồng ID: {contract.id} • Cập nhật: {formatDate(contract.updatedAt)}
          </span>
        </div>
      </main>

      <TerminateContractModal
        contractId={Number(id)}
        contractCode={contract.id.toString()}
        isOpen={showTerminate}
        onClose={() => setShowTerminate(false)}
      />

      <ContractForm contractId={Number(id)} isOpen={showForm} onClose={() => setShowForm(false)} currentStatus={contract?.status} />
    </div>
  )
}
