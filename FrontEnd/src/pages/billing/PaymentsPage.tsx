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
    ['Payment not found or not deleted', 'Không tìm thấy thanh toán đã xóa mềm để khôi phục'],
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
      setScreenError(getApiErrorMessage(err, 'Xóa mềm thanh toán thất bại'))
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
    <div className='min-h-screen bg-slate-50 px-8 py-8'>
      <div className='mx-auto max-w-7xl'>
      <h2 className='mb-4 text-3xl font-extrabold tracking-tight text-slate-900'>Quản lý thanh toán</h2>
      {(screenError || isError) && (
        <div className='mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-600'>
          {screenError || getApiErrorMessage(error, 'Tải danh sách thanh toán thất bại')}
        </div>
      )}
      <form
        className='mb-6 grid grid-cols-1 gap-2 rounded-xl bg-white p-4 shadow-sm md:grid-cols-5'
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
        }}
      >
        <input name='invoiceId' placeholder='Invoice ID' className='rounded border px-2 py-2' />
        <input name='amount' placeholder='Amount' className='rounded border px-2 py-2' />
        <select name='paymentMethod' className='rounded border px-2 py-2'>
          <option value='CASH'>CASH</option>
          <option value='BANK_TRANSFER'>BANK_TRANSFER</option>
        </select>
        <select name='status' className='rounded border px-2 py-2'>
          <option value='PENDING'>PENDING</option>
          <option value='SUCCESS'>SUCCESS</option>
          <option value='FAILED'>FAILED</option>
        </select>
        <button className='rounded bg-blue-600 px-3 py-2 text-white'>{createMutation.isPending ? 'Saving...' : 'Create payment'}</button>
      </form>
      <div className='mb-4 grid grid-cols-1 gap-2 md:grid-cols-4'>
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value as 'ALL' | 'PENDING' | 'SUCCESS' | 'FAILED')
            setPage(0)
          }}
          className='rounded border px-2 py-2'
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
          className='rounded border px-2 py-2'
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
          className='rounded border px-2 py-2'
        >
          <option value='HIDE_DELETED'>Ẩn đã xóa mềm</option>
          <option value='SHOW_ALL'>Hiện tất cả (kể cả đã xóa mềm)</option>
        </select>
        <button
          type='button'
          onClick={() => {
            setFilterStatus('ALL')
            setFilterMethod('ALL')
            setFilterDeleted('HIDE_DELETED')
            setPage(0)
          }}
          className='rounded bg-slate-200 px-3 py-2'
        >
          Xóa lọc
        </button>
      </div>
      <div className='overflow-hidden rounded-xl bg-white shadow-sm'>
        <table className='w-full border-collapse text-left'>
          <thead>
            <tr className='bg-slate-50'>
              <th className='px-4 py-3 text-xs font-bold uppercase text-slate-500'>ID</th>
              <th className='px-4 py-3 text-xs font-bold uppercase text-slate-500'>Invoice</th>
              <th className='px-4 py-3 text-xs font-bold uppercase text-slate-500'>Số tiền</th>
              <th className='px-4 py-3 text-xs font-bold uppercase text-slate-500'>Phương thức</th>
              <th className='px-4 py-3 text-xs font-bold uppercase text-slate-500'>Trạng thái</th>
              <th className='px-4 py-3 text-xs font-bold uppercase text-slate-500'>Đã xóa mềm</th>
              <th className='px-4 py-3 text-right text-xs font-bold uppercase text-slate-500'>Hành động</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-slate-100'>
            {list.map((item) => (
              <tr key={item.id}>
                <td className='px-4 py-3'>{item.id}</td>
                <td className='px-4 py-3'>{item.invoiceId}</td>
                <td className='px-4 py-3'>{item.amount}</td>
                <td className='px-4 py-3'>{item.paymentMethod || '-'}</td>
                <td className='px-4 py-3'>{item.status}</td>
                <td className='px-4 py-3'>{item.deletedAt ? 'Có' : 'Không'}</td>
                <td className='px-4 py-3 text-right'>
                  <div className='inline-flex gap-2'>
                    <button className='rounded bg-sky-100 px-2 py-1 text-xs' onClick={() => setSelectedPaymentId(item.id)}>
                      Chi tiết
                    </button>
                    {item.deletedAt ? (
                      <button className='rounded bg-green-100 px-2 py-1 text-xs' onClick={() => restoreMutation.mutate(item.id)}>
                        Khôi phục
                      </button>
                    ) : (
                      <button className='rounded bg-red-100 px-2 py-1 text-xs' onClick={() => deleteMutation.mutate(item.id)}>
                        Xóa mềm
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td className='px-4 py-4 text-sm text-slate-500' colSpan={7}>
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
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4' onClick={() => setSelectedPaymentId(null)}>
          <div className='w-full max-w-lg rounded-xl bg-white p-5 shadow-lg' onClick={(e) => e.stopPropagation()}>
            <div className='mb-3 flex items-center justify-between'>
              <h3 className='text-lg font-semibold'>Chi tiết thanh toán</h3>
              <button className='rounded bg-slate-100 px-2 py-1' onClick={() => setSelectedPaymentId(null)}>
                Đóng
              </button>
            </div>
            <div className='space-y-1 text-sm text-slate-700'>
              <div>Payment ID: {selectedPaymentDetail.id}</div>
              <div>Invoice ID: {selectedPaymentDetail.invoiceId}</div>
              <div>Mã hóa đơn: {selectedPaymentDetail.invoiceCode || '-'}</div>
              <div>Căn hộ: {selectedPaymentDetail.apartmentId || '-'}</div>
              <div>Kỳ: {selectedPaymentDetail.billingMonth || '-'}/{selectedPaymentDetail.billingYear || '-'}</div>
              <div>Số tiền: {selectedPaymentDetail.amount}</div>
              <div>Phương thức: {selectedPaymentDetail.paymentMethod || '-'}</div>
              <div>Cổng: {selectedPaymentDetail.paymentGateway || '-'}</div>
              <div>Mã giao dịch: {selectedPaymentDetail.gatewayTransactionNo || '-'}</div>
              <div>Trạng thái thanh toán: {selectedPaymentDetail.status}</div>
              <div>Trạng thái hóa đơn: {selectedPaymentDetail.invoiceStatus || '-'}</div>
              <div>Ngày thanh toán: {selectedPaymentDetail.paymentDate || '-'}</div>
              <div>Đã xóa mềm: {selectedPaymentDetail.deletedAt ? 'Có' : 'Không'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
