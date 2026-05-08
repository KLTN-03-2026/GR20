import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { invoicesApi } from 'src/apis/billing_api/invoices.api'

const getApiErrorMessage = (err: any, fallbackMessage: string) => {
  const apiErr = err?.response?.data
  const firstFieldError = apiErr?.errors ? Object.values(apiErr.errors).flat()?.[0] : null
  const rawMessage = firstFieldError || apiErr?.formErrors?.[0] || apiErr?.details || apiErr?.message || fallbackMessage
  if (typeof rawMessage !== 'string') return fallbackMessage

  const translatedMessages: Array<[string, string]> = [
    ['Validation failed', 'Dữ liệu không hợp lệ'],
    ['billingMonth and billingYear must be provided together', 'Tháng và năm lập hóa đơn phải được nhập cùng nhau'],
    ['Provide totalAmount, or provide billingMonth and billingYear to auto-calculate from meter readings', 'Cần nhập tổng tiền, hoặc nhập tháng/năm để hệ thống tự tính'],
    ['Apartment not found', 'Không tìm thấy căn hộ'],
    ['No active utility meters found for this apartment', 'Căn hộ chưa có đồng hồ đang hoạt động'],
    ['No active pricing found for meter type', 'Không tìm thấy giá tiện ích đang áp dụng cho loại đồng hồ'],
    ['No meter readings found for this billing period', 'Không có chỉ số công tơ cho kỳ hóa đơn này'],
    ['Invoice not found or not cancelled', 'Không tìm thấy hóa đơn đã xóa để khôi phục'],
    ['Invoice not found', 'Không tìm thấy hóa đơn']
  ]
  const mapped = translatedMessages.find(([en]) => rawMessage.includes(en))
  return mapped?.[1] || rawMessage
}

const logApiSuccess = (action: string, response: any) => {
  console.log(`[Invoices][${action}] success`, {
    status: response?.status,
    endpoint: response?.config?.url,
    method: response?.config?.method,
    data: response?.data
  })
}

const logApiError = (action: string, err: any) => {
  console.error(`[Invoices][${action}] error`, {
    status: err?.response?.status,
    endpoint: err?.config?.url || err?.response?.config?.url,
    method: err?.config?.method || err?.response?.config?.method,
    data: err?.response?.data,
    message: err?.message
  })
}

export default function InvoicesPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const pageSize = 10
  const [page, setPage] = useState(0)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const { data, error, isLoading, isError } = useQuery({
    queryKey: ['invoices', page],
    queryFn: async () => {
      const response = await invoicesApi.getAll({ page, size: pageSize })
      logApiSuccess('GetAll', response)
      return response
    }
  })
  const list = data?.data?.data || []
  const totalPages = Number(data?.data?.totalPages || 0)
  const currentPage = Number(data?.data?.page || 0)

  const createMutation = useMutation({
    mutationFn: (payload: any) => invoicesApi.create(payload),
    onSuccess: (response) => {
      logApiSuccess('Create', response)
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['invoice-items-by-invoice'] })
      setErrorMsg(null)
    },
    onError: (err: any) => {
      logApiError('Create', err)
      setErrorMsg(getApiErrorMessage(err, 'Tạo hóa đơn thất bại'))
    }
  })
  const deleteMutation = useMutation({
    mutationFn: (id: string) => invoicesApi.delete(id),
    onSuccess: (response) => {
      logApiSuccess('Delete', response)
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      setErrorMsg(null)
    },
    onError: (err: any) => {
      logApiError('Delete', err)
      setErrorMsg(getApiErrorMessage(err, 'Xóa hóa đơn thất bại'))
    }
  })
  const restoreMutation = useMutation({
    mutationFn: (id: string) => invoicesApi.restore(id),
    onSuccess: (response) => {
      logApiSuccess('Restore', response)
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      setErrorMsg(null)
    },
    onError: (err: any) => {
      logApiError('Restore', err)
      setErrorMsg(getApiErrorMessage(err, 'Khôi phục hóa đơn thất bại'))
    }
  })

  if (isError) {
    logApiError('GetAll', error)
  }
  const summary = {
    total: list.length,
    pending: list.filter((item) => item.status === 'PENDING').length,
    paid: list.filter((item) => item.status === 'PAID').length,
    cancelled: list.filter((item) => item.status === 'CANCELLED').length
  }

  return (
    <div className='min-h-screen bg-[#F8F9FA] p-8 font-sans text-slate-900'>
      <div className='mx-auto max-w-6xl'>
        <div className='mb-8 flex items-end justify-between gap-4'>
          <div>
            <span className='rounded bg-[#DDE7FF] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0052CC]'>
              Administration
            </span>
            <h1 className='mt-4 mb-2 text-3xl font-bold text-gray-900'>Quản lý hóa đơn</h1>
            <p className='text-sm text-gray-500'>Tạo hóa đơn từ chỉ số đồng hồ và quản lý trạng thái thanh toán.</p>
          </div>
          <button
            type='button'
            onClick={() => setIsCreateOpen(true)}
            className='rounded-lg bg-[#0052CC] px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700'
          >
            + Tạo hóa đơn
          </button>
        </div>

        <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-4'>
          <div className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm'>
            <div className='text-sm text-gray-500'>Tổng trên trang</div>
            <div className='mt-2 text-3xl font-bold text-gray-900'>{summary.total}</div>
          </div>
          <div className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm'>
            <div className='text-sm text-gray-500'>PENDING</div>
            <div className='mt-2 text-3xl font-bold text-amber-600'>{summary.pending}</div>
          </div>
          <div className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm'>
            <div className='text-sm text-gray-500'>PAID</div>
            <div className='mt-2 text-3xl font-bold text-emerald-600'>{summary.paid}</div>
          </div>
          <div className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm'>
            <div className='text-sm text-gray-500'>CANCELLED</div>
            <div className='mt-2 text-3xl font-bold text-red-500'>{summary.cancelled}</div>
          </div>
        </div>

        {errorMsg && <div className='mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-600'>{errorMsg}</div>}

        {isCreateOpen && (
          <form
            className='mb-6 grid grid-cols-1 gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:grid-cols-6'
            onSubmit={(e) => {
              e.preventDefault()
              setErrorMsg(null)
              const fd = new FormData(e.currentTarget)
              createMutation.mutate({
                invoiceCode: fd.get('invoiceCode') || undefined,
                apartmentId: Number(fd.get('apartmentId')),
                status: (fd.get('status') as string) || undefined,
                billingMonth: Number(fd.get('billingMonth')),
                billingYear: Number(fd.get('billingYear')),
                dueDate: (fd.get('dueDate') as string) || undefined
              })
              e.currentTarget.reset()
              setIsCreateOpen(false)
            }}
          >
            <input name='invoiceCode' placeholder='Mã hóa đơn (tuỳ chọn)' className='rounded-lg border border-gray-200 px-4 py-2.5' />
            <input name='apartmentId' placeholder='Apartment ID' className='rounded-lg border border-gray-200 px-4 py-2.5' />
            <input name='billingMonth' placeholder='Tháng' className='rounded-lg border border-gray-200 px-4 py-2.5' />
            <input name='billingYear' placeholder='Năm' className='rounded-lg border border-gray-200 px-4 py-2.5' />
            <input name='dueDate' type='date' className='rounded-lg border border-gray-200 px-4 py-2.5' />
            <select name='status' className='rounded-lg border border-gray-200 px-4 py-2.5 md:col-span-2'>
              <option value='PENDING'>PENDING</option>
              <option value='PAID'>PAID</option>
              <option value='OVERDUE'>OVERDUE</option>
            </select>
            <button className='rounded-lg bg-[#0052CC] px-4 py-2.5 font-semibold text-white transition hover:bg-blue-700 md:col-span-2'>
              {createMutation.isPending ? 'Đang lưu...' : 'Tạo hóa đơn'}
            </button>
            <button
              type='button'
              className='rounded-lg bg-gray-100 px-4 py-2.5 font-semibold text-gray-700 transition hover:bg-gray-200 md:col-span-2'
              onClick={() => setIsCreateOpen(false)}
            >
              Hủy
            </button>
          </form>
        )}

        <div className='overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm'>
          <div className='overflow-x-auto'>
            <table className='w-full border-collapse text-left'>
              <thead>
                <tr className='border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-400'>
                  {['Mã hóa đơn', 'Căn hộ', 'Kỳ', 'Tổng tiền', 'Trạng thái', 'Thao tác'].map((h) => (
                    <th
                      key={h}
                      className={`px-6 py-4 ${h === 'Thao tác' ? 'text-right' : ''}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className='text-sm text-gray-700'>
                {isLoading && (
                  <tr>
                    <td className='px-6 py-6 text-sm text-slate-500' colSpan={6}>
                      Đang tải danh sách hóa đơn...
                    </td>
                  </tr>
                )}
                {isError && (
                  <tr>
                    <td className='px-6 py-6 text-sm text-red-500' colSpan={6}>
                      Không tải được danh sách hóa đơn.
                    </td>
                  </tr>
                )}
                {!isLoading && !isError && list.length === 0 && (
                  <tr>
                    <td className='px-6 py-6 text-sm text-slate-500' colSpan={6}>
                      Chưa có dữ liệu hóa đơn.
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  !isError &&
                  list.map((item) => (
                    <tr key={item.id}>
                      <td className='px-6 py-4 text-sm font-medium text-slate-800'>{item.invoiceCode || item.id}</td>
                      <td className='px-6 py-4 text-sm text-slate-700'>Apt {item.apartmentId}</td>
                      <td className='px-6 py-4 text-sm text-slate-700'>
                        {item.billingMonth}/{item.billingYear}
                      </td>
                      <td className='px-6 py-4 text-sm font-semibold text-slate-800'>{item.totalAmount}</td>
                      <td className='px-6 py-4 text-sm'>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            item.status === 'PAID'
                              ? 'bg-emerald-50 text-emerald-700'
                              : item.status === 'PENDING'
                                ? 'bg-amber-50 text-amber-700'
                                : item.status === 'CANCELLED'
                                  ? 'bg-red-50 text-red-700'
                                  : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className='px-6 py-4 text-right'>
                        <div className='inline-flex gap-2'>
                          <button
                            className='rounded-lg bg-blue-100 px-3 py-1.5 text-xs text-blue-700'
                            type='button'
                            onClick={() => navigate(`/admin/invoices/${item.id}`)}
                          >
                            Xem chi tiết
                          </button>
                          <button
                            className='rounded-lg bg-red-100 px-3 py-1.5 text-xs text-red-700'
                            type='button'
                            onClick={() => {
                              setErrorMsg(null)
                              if (item.status === 'CANCELLED') {
                                restoreMutation.mutate(item.id)
                                return
                              }
                              deleteMutation.mutate(item.id)
                            }}
                          >
                            {item.status === 'CANCELLED' ? 'Khôi phục' : 'Xóa'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
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
    </div>
  )
}
