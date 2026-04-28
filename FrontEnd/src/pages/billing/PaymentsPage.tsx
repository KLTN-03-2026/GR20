import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { paymentsApi } from 'src/apis/billing_api/payments.api'

const getApiErrorMessage = (err: any, fallbackMessage: string) => {
  const apiErr = err?.response?.data
  const firstFieldError = apiErr?.errors ? Object.values(apiErr.errors).flat()?.[0] : null
  const rawMessage = firstFieldError || apiErr?.formErrors?.[0] || apiErr?.details || apiErr?.message || fallbackMessage
  if (typeof rawMessage !== 'string') return fallbackMessage

  const translatedMessages: Array<[string, string]> = [
    ['Validation failed', 'Dữ liệu không hợp lệ'],
    ['At least one field is required for update', 'Cần ít nhất 1 trường để cập nhật'],
    ['Payment not found or not deleted', 'Không tìm thấy thanh toán đã xóa để khôi phục'],
    ['Payment not found', 'Không tìm thấy thanh toán']
  ]
  const mapped = translatedMessages.find(([en]) => rawMessage.includes(en))
  return mapped?.[1] || rawMessage
}

const logApiSuccess = (action: string, response: any) => {
  console.log(`[Payments][${action}] success`, {
    status: response?.status,
    endpoint: response?.config?.url,
    method: response?.config?.method,
    data: response?.data
  })
}

const logApiError = (action: string, err: any) => {
  console.error(`[Payments][${action}] error`, {
    status: err?.response?.status,
    endpoint: err?.config?.url || err?.response?.config?.url,
    method: err?.config?.method || err?.response?.config?.method,
    data: err?.response?.data,
    message: err?.message
  })
}

export default function PaymentsPage() {
  const queryClient = useQueryClient()
  const pageSize = 10
  const [page, setPage] = useState(0)
  const [screenError, setScreenError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'SUCCESS' | 'FAILED'>('ALL')
  const [filterMethod, setFilterMethod] = useState<'ALL' | 'CASH' | 'BANK_TRANSFER'>('ALL')
  const [filterDeleted, setFilterDeleted] = useState<'HIDE_DELETED' | 'SHOW_ALL'>('HIDE_DELETED')
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const { data, error, isError } = useQuery({
    queryKey: ['payments', page, filterStatus, filterMethod, filterDeleted],
    queryFn: async () => {
      const response = await paymentsApi.getAll({
        page,
        size: pageSize,
        status: filterStatus === 'ALL' ? undefined : filterStatus,
        paymentMethod: filterMethod === 'ALL' ? undefined : filterMethod,
        includeDeleted: filterDeleted === 'SHOW_ALL'
      })
      logApiSuccess('GetAll', response)
      return response
    }
  })

  const { data: paymentDetailData } = useQuery({
    queryKey: ['payment-detail', selectedPaymentId],
    queryFn: async () => {
      if (!selectedPaymentId) return null
      const response = await paymentsApi.getDetailById(selectedPaymentId)
      logApiSuccess('GetDetail', response)
      return response
    },
    enabled: Boolean(selectedPaymentId)
  })

  const list = data?.data?.data || []
  const totalPages = Number(data?.data?.totalPages || 0)
  const currentPage = Number(data?.data?.page || 0)
  const selectedPaymentDetail = paymentDetailData?.data?.data
  const summary = {
    total: list.length,
    pending: list.filter((p: any) => p.status === 'PENDING').length,
    success: list.filter((p: any) => p.status === 'SUCCESS').length,
    failed: list.filter((p: any) => p.status === 'FAILED').length,
    deleted: list.filter((p: any) => Boolean(p.deletedAt)).length
  }

  const createMutation = useMutation({
    mutationFn: (payload: any) => paymentsApi.create(payload),
    onSuccess: (response) => {
      logApiSuccess('Create', response)
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      setScreenError(null)
    },
    onError: (err: any) => {
      logApiError('Create', err)
      setScreenError(getApiErrorMessage(err, 'Tạo thanh toán thất bại'))
    }
  })
  const deleteMutation = useMutation({
    mutationFn: (id: string) => paymentsApi.delete(id),
    onSuccess: (response) => {
      logApiSuccess('Delete', response)
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      setScreenError(null)
    },
    onError: (err: any) => {
      logApiError('Delete', err)
      setScreenError(getApiErrorMessage(err, 'Xóa thanh toán thất bại'))
    }
  })
  const restoreMutation = useMutation({
    mutationFn: (id: string) => paymentsApi.restore(id),
    onSuccess: (response) => {
      logApiSuccess('Restore', response)
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      setScreenError(null)
    },
    onError: (err: any) => {
      logApiError('Restore', err)
      setScreenError(getApiErrorMessage(err, 'Khôi phục thanh toán thất bại'))
    }
  })

  if (isError) logApiError('GetAll', error)

  return (
    <div className='min-h-screen bg-[#F8F9FA] p-8 font-sans'>
      <div className='mx-auto max-w-6xl'>
      <div className='mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
        <div>
          <span className='rounded bg-[#DDE7FF] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0052CC]'>
            Administration
          </span>
          <h1 className='mt-4 mb-2 text-3xl font-bold text-gray-900'>Quản lý thanh toán</h1>
          <p className='text-sm text-gray-500'>Theo dõi giao dịch, lọc theo phương thức/trạng thái và hỗ trợ xóa/khôi phục.</p>
        </div>
        <button
          type='button'
          onClick={() => setIsCreateOpen(true)}
          className='rounded-lg bg-[#0052CC] px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700'
        >
          + Tạo thanh toán
        </button>
      </div>

      <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-5'>
        <div className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm'>
          <div className='text-sm text-gray-500'>Tổng trên trang</div>
          <div className='mt-2 text-3xl font-bold text-gray-900'>{summary.total}</div>
        </div>
        <div className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm'>
          <div className='text-sm text-gray-500'>PENDING</div>
          <div className='mt-2 text-3xl font-bold text-amber-600'>{summary.pending}</div>
        </div>
        <div className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm'>
          <div className='text-sm text-gray-500'>SUCCESS</div>
          <div className='mt-2 text-3xl font-bold text-emerald-600'>{summary.success}</div>
        </div>
        <div className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm'>
          <div className='text-sm text-gray-500'>FAILED</div>
          <div className='mt-2 text-3xl font-bold text-red-500'>{summary.failed}</div>
        </div>
        <div className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm'>
          <div className='text-sm text-gray-500'>Đã xóa</div>
          <div className='mt-2 text-3xl font-bold text-slate-600'>{summary.deleted}</div>
        </div>
      </div>

      {(screenError || isError) && (
        <div className='mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600'>
          {screenError || getApiErrorMessage(error, 'Tải danh sách thanh toán thất bại')}
        </div>
      )}
      {isCreateOpen && <form
        className='mb-6 grid grid-cols-1 gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:grid-cols-5'
        onSubmit={(e) => {
          e.preventDefault()
          setScreenError(null)
          const fd = new FormData(e.currentTarget)
          createMutation.mutate({
            invoiceId: Number(fd.get('invoiceId')),
            amount: Number(fd.get('amount')),
            paymentMethod: fd.get('paymentMethod') || 'CASH',
            paymentGateway: fd.get('paymentMethod') === 'BANK_TRANSFER' ? 'MB_VIETQR' : 'OFFLINE',
            status: fd.get('status') || 'PENDING',
            paymentDate: fd.get('paymentDate') || undefined
          })
          e.currentTarget.reset()
          setIsCreateOpen(false)
        }}
      >
        <input name='invoiceId' placeholder='Invoice ID' className='rounded-lg border border-gray-200 px-4 py-2.5' />
        <input name='amount' placeholder='Số tiền' className='rounded-lg border border-gray-200 px-4 py-2.5' />
        <select
          name='paymentMethod'
          className='rounded-lg border border-gray-200 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
        >
          <option value='CASH'>CASH</option>
          <option value='BANK_TRANSFER'>BANK_TRANSFER</option>
        </select>
        <select
          name='status'
          className='rounded-lg border border-gray-200 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
        >
          <option value='PENDING'>PENDING</option>
          <option value='SUCCESS'>SUCCESS</option>
          <option value='FAILED'>FAILED</option>
        </select>
        <button className='rounded-lg bg-[#0052CC] px-4 py-2.5 font-semibold text-white transition hover:bg-blue-700'>
          {createMutation.isPending ? 'Đang lưu...' : 'Tạo thanh toán'}
        </button>
        <button
          type='button'
          className='rounded-lg bg-gray-100 px-4 py-2.5 font-semibold text-gray-700 transition hover:bg-gray-200'
          onClick={() => setIsCreateOpen(false)}
        >
          Hủy
        </button>
      </form>}
      <div className='mb-6 grid grid-cols-1 gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:grid-cols-4'>
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value as 'ALL' | 'PENDING' | 'SUCCESS' | 'FAILED')
            setPage(0)
          }}
          className='rounded-lg border border-gray-200 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
        >
          <option value='ALL'>Trạng thái: tất cả</option>
          <option value='PENDING'>PENDING</option>
          <option value='SUCCESS'>SUCCESS</option>
          <option value='FAILED'>FAILED</option>
        </select>
        <select
          value={filterMethod}
          onChange={(e) => {
            setFilterMethod(e.target.value as 'ALL' | 'CASH' | 'BANK_TRANSFER')
            setPage(0)
          }}
          className='rounded-lg border border-gray-200 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
        >
          <option value='ALL'>Phương thức: tất cả</option>
          <option value='CASH'>CASH</option>
          <option value='BANK_TRANSFER'>BANK_TRANSFER</option>
        </select>
        <select
          value={filterDeleted}
          onChange={(e) => {
            setFilterDeleted(e.target.value as 'HIDE_DELETED' | 'SHOW_ALL')
            setPage(0)
          }}
          className='rounded-lg border border-gray-200 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
        >
          <option value='HIDE_DELETED'>Ẩn đã xóa</option>
          <option value='SHOW_ALL'>Hiện tất cả (kể cả đã xóa)</option>
        </select>
        <button
          type='button'
          onClick={() => {
            setFilterStatus('ALL')
            setFilterMethod('ALL')
            setFilterDeleted('HIDE_DELETED')
            setPage(0)
          }}
          className='rounded-lg bg-gray-100 px-4 py-2.5 font-semibold text-gray-700 transition hover:bg-gray-200'
        >
          Xóa lọc
        </button>
      </div>
      <div className='overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm'>
        <table className='w-full border-collapse text-left'>
          <thead>
            <tr className='border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-400'>
              <th className='px-6 py-4'>ID</th>
              <th className='px-6 py-4'>Invoice</th>
              <th className='px-6 py-4'>Số tiền</th>
              <th className='px-6 py-4'>Phương thức</th>
              <th className='px-6 py-4'>Trạng thái</th>
              <th className='px-6 py-4'>Xóa</th>
              <th className='px-6 py-4 text-right'>Hành động</th>
            </tr>
          </thead>
          <tbody className='text-sm text-gray-700'>
            {list.map((item) => (
              <tr key={item.id}>
                <td className='px-6 py-4 text-gray-500'>#{item.id}</td>
                <td className='px-6 py-4 font-semibold text-gray-900'>{item.invoiceId}</td>
                <td className='px-6 py-4'>{item.amount}</td>
                <td className='px-6 py-4'>{item.paymentMethod || '-'}</td>
                <td className='px-6 py-4'>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      item.status === 'SUCCESS'
                        ? 'bg-emerald-50 text-emerald-700'
                        : item.status === 'PENDING'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className='px-6 py-4'>{item.deletedAt ? <span className='text-red-600'>Có</span> : 'Không'}</td>
                <td className='px-6 py-4 text-right'>
                  <div className='inline-flex gap-2'>
                    <button
                      className='rounded-lg bg-blue-100 px-3 py-1.5 text-xs text-blue-700'
                      onClick={() => setSelectedPaymentId(item.id)}
                    >
                      Chi tiết
                    </button>
                    {item.deletedAt ? (
                      <button
                        className='rounded-lg bg-emerald-100 px-3 py-1.5 text-xs text-emerald-700'
                        onClick={() => restoreMutation.mutate(item.id)}
                      >
                        Khôi phục
                      </button>
                    ) : (
                      <button
                        className='rounded-lg bg-red-100 px-3 py-1.5 text-xs text-red-700'
                        onClick={() => deleteMutation.mutate(item.id)}
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td className='px-6 py-8 text-center text-gray-500' colSpan={7}>
                  Không có dữ liệu phù hợp bộ lọc.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className='mt-4 flex items-center justify-end gap-2 text-sm'>
        <button
          type='button'
          className='rounded bg-slate-200 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50'
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
          className='rounded bg-slate-200 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50'
          disabled={totalPages === 0 || currentPage + 1 >= totalPages}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Trang sau
        </button>
      </div>
      </div>

      {selectedPaymentId && selectedPaymentDetail && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 backdrop-blur-sm'
          onClick={() => setSelectedPaymentId(null)}
        >
          <div className='w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl' onClick={(e) => e.stopPropagation()}>
            <div className='flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4'>
              <h3 className='text-xl font-bold text-gray-800'>Chi tiết thanh toán</h3>
              <button className='text-gray-400 transition hover:text-gray-600' onClick={() => setSelectedPaymentId(null)}>
                Đóng
              </button>
            </div>
            <div className='space-y-2 p-6 text-sm text-gray-700'>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div className='rounded-xl bg-slate-50 p-4'>
                  <div className='text-xs font-bold uppercase tracking-wider text-gray-400'>Payment</div>
                  <div className='mt-2 space-y-1'>
                    <div>ID: {selectedPaymentDetail.id}</div>
                    <div>Status: {selectedPaymentDetail.status}</div>
                    <div>Amount: {selectedPaymentDetail.amount}</div>
                    <div>Method: {selectedPaymentDetail.paymentMethod || '-'}</div>
                    <div>Gateway: {selectedPaymentDetail.paymentGateway || '-'}</div>
                  </div>
                </div>
                <div className='rounded-xl bg-slate-50 p-4'>
                  <div className='text-xs font-bold uppercase tracking-wider text-gray-400'>Invoice</div>
                  <div className='mt-2 space-y-1'>
                    <div>Invoice ID: {selectedPaymentDetail.invoiceId}</div>
                    <div>Mã hóa đơn: {selectedPaymentDetail.invoiceCode || '-'}</div>
                    <div>Căn hộ: {selectedPaymentDetail.apartmentId || '-'}</div>
                    <div>
                      Kỳ: {selectedPaymentDetail.billingMonth || '-'}/{selectedPaymentDetail.billingYear || '-'}
                    </div>
                    <div>TT hóa đơn: {selectedPaymentDetail.invoiceStatus || '-'}</div>
                  </div>
                </div>
              </div>
              <div className='rounded-xl bg-slate-50 p-4'>
                <div className='text-xs font-bold uppercase tracking-wider text-gray-400'>Thông tin thêm</div>
                <div className='mt-2 grid grid-cols-1 gap-2 md:grid-cols-2'>
                  <div>Mã giao dịch: {selectedPaymentDetail.gatewayTransactionNo || '-'}</div>
                  <div>Ngày thanh toán: {selectedPaymentDetail.paymentDate || '-'}</div>
                  <div>Đã xóa: {selectedPaymentDetail.deletedAt ? 'Có' : 'Không'}</div>
                </div>
              </div>
            </div>
            <div className='flex justify-end gap-3 border-t border-gray-100 bg-white px-6 py-4'>
              <button
                type='button'
                className='rounded-lg bg-gray-100 px-5 py-2.5 font-bold text-gray-600 transition hover:bg-gray-200'
                onClick={() => setSelectedPaymentId(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
