import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { invoicesApi } from 'src/apis/billing_api/invoices.api'
import { logResourceConsoleError } from 'src/utils/payment-console-log'
import {
  formatVnd,
  invoiceStatusBadgeClass,
  invoiceStatusVi
} from 'src/utils/billing-ui'
import {
  ROW_ACTION_DELETE,
  ROW_ACTION_EDIT,
  ROW_ACTION_RESTORE
} from 'src/utils/row-action-buttons'

const getApiErrorMessage = (err: any, fallbackMessage: string) => {
  const apiErr = err?.response?.data
  const firstFieldError = apiErr?.errors ? Object.values(apiErr.errors).flat()?.[0] : null
  const rawMessage = firstFieldError || apiErr?.formErrors?.[0] || apiErr?.details || apiErr?.message || fallbackMessage
  if (typeof rawMessage !== 'string') return fallbackMessage

  const translatedMessages: Array<[string, string]> = [
    ['Validation failed', 'Dữ liệu không hợp lệ'],
    ['billingMonth and billingYear must be provided together', 'Tháng và năm lập hóa đơn phải được nhập cùng nhau'],
    ['Provide totalAmount, or provide billingMonth and billingYear to auto-calculate from meter readings', 'Cần nhập tổng tiền, hoặc nhập tháng/năm để hệ thống tự tính'],
    ['auto-calculate from utilities and/or active RENT contract', 'Cần nhập tổng tiền, hoặc nhập tháng/năm để hệ thống tự tính (tiện ích và/hoặc hợp đồng thuê)'],
    ['Apartment not found', 'Không tìm thấy căn hộ'],
    ['No active utility meters found for this apartment', 'Căn hộ chưa có đồng hồ đang hoạt động'],
    ['No active pricing found for meter type', 'Không tìm thấy giá tiện ích đang áp dụng cho loại đồng hồ'],
    ['No meter readings found for this billing period', 'Không có chỉ số công tơ cho kỳ hóa đơn này'],
    ['No billable lines', 'Không có khoản tính phí: cần chỉ số đồng hồ + giá tiện ích cho kỳ này, hoặc hợp đồng thuê (RENT) đang hiệu lực có tiền thuê'],
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
      logResourceConsoleError('Invoices', 'Create', err)
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
      logResourceConsoleError('Invoices', 'Delete', err)
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
      logResourceConsoleError('Invoices', 'Restore', err)
      setErrorMsg(getApiErrorMessage(err, 'Khôi phục hóa đơn thất bại'))
    }
  })

  if (isError) {
    logResourceConsoleError('Invoices', 'GetAll', error)
  }
  const summary = {
    total: list.length,
    pending: list.filter((item) => item.status === 'PENDING').length,
    paid: list.filter((item) => item.status === 'PAID').length,
    overdue: list.filter((item) => item.status === 'OVERDUE').length,
    cancelled: list.filter((item) => item.status === 'CANCELLED').length
  }

  return (
    <div className='min-h-screen bg-slate-50 p-6 font-sans text-slate-900 sm:p-8'>
      <div className='mx-auto max-w-6xl'>
        <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <span className='rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700 ring-1 ring-blue-100'>
              Quản trị
            </span>
            <h1 className='mt-3 text-3xl font-bold tracking-tight text-slate-900'>Quản lý hóa đơn</h1>
            <p className='mt-1 max-w-xl text-sm text-slate-600'>
              Tạo hóa đơn theo kỳ, xem tổng tiền và trạng thái. Ghi nhận thanh toán tại mục thanh toán liên kết bên dưới.
            </p>
            <p className='mt-2 max-w-2xl text-xs leading-relaxed text-slate-500'>
              Khi tạo hóa đơn có nhập <strong>tháng + năm</strong> và không nhập tổng tiền: hệ thống tự cộng{' '}
              <strong>tiền thuê tháng</strong> (từ hợp đồng loại RENT, trạng thái ACTIVE, có monthly rent và kỳ nằm trong
              thời hạn hợp đồng) với <strong>tiền điện/nước</strong> (chỉ số trong kỳ × đơn giá tiện ích). Hợp đồng còn ở
              trạng thái PENDING chưa được tính tiền thuê trên hóa đơn.
            </p>
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            <Link
              to='/admin/payments'
              className='inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50'
            >
              Quản lý thanh toán
            </Link>
            <button
              type='button'
              onClick={() => setIsCreateOpen(true)}
              className='inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700'
            >
              + Tạo hóa đơn
            </button>
          </div>
        </div>

        <div className='mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5'>
          <div className='rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm'>
            <div className='text-xs font-medium text-slate-500'>Trên trang này</div>
            <div className='mt-1 text-2xl font-bold text-slate-900'>{summary.total}</div>
            <div className='mt-0.5 text-xs text-slate-500'>hóa đơn</div>
          </div>
          <div className='rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm'>
            <div className='text-xs font-medium text-slate-500'>{invoiceStatusVi.PENDING}</div>
            <div className='mt-1 text-2xl font-bold text-amber-600'>{summary.pending}</div>
          </div>
          <div className='rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm'>
            <div className='text-xs font-medium text-slate-500'>{invoiceStatusVi.PAID}</div>
            <div className='mt-1 text-2xl font-bold text-emerald-600'>{summary.paid}</div>
          </div>
          <div className='rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm'>
            <div className='text-xs font-medium text-slate-500'>{invoiceStatusVi.OVERDUE}</div>
            <div className='mt-1 text-2xl font-bold text-red-600'>{summary.overdue}</div>
          </div>
          <div className='col-span-2 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm sm:col-span-1'>
            <div className='text-xs font-medium text-slate-500'>{invoiceStatusVi.CANCELLED}</div>
            <div className='mt-1 text-2xl font-bold text-slate-600'>{summary.cancelled}</div>
          </div>
        </div>

        {errorMsg && <div className='mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-600'>{errorMsg}</div>}

        {isCreateOpen && (
          <form
            className='mb-6 grid grid-cols-1 gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm md:grid-cols-6'
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
              <option value='PENDING'>{invoiceStatusVi.PENDING}</option>
              <option value='PAID'>{invoiceStatusVi.PAID}</option>
              <option value='OVERDUE'>{invoiceStatusVi.OVERDUE}</option>
            </select>
            <button className='rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-700 md:col-span-2'>
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

        <div className='overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm'>
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
                      <td className='px-6 py-4 text-sm font-semibold tabular-nums text-slate-800'>
                        {formatVnd(item.totalAmount)}
                      </td>
                      <td className='px-6 py-4 text-sm'>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${invoiceStatusBadgeClass(item.status)}`}
                        >
                          {invoiceStatusVi[item.status as keyof typeof invoiceStatusVi] || item.status}
                        </span>
                      </td>
                      <td className='px-6 py-4 text-right'>
                        <div className='inline-flex flex-wrap justify-end gap-2'>
                          <button type='button' className={ROW_ACTION_EDIT} onClick={() => navigate(`/admin/invoices/${item.id}`)}>
                            Chi tiết
                          </button>
                          {item.status === 'CANCELLED' ? (
                            <button
                              type='button'
                              className={ROW_ACTION_RESTORE}
                              onClick={() => {
                                setErrorMsg(null)
                                restoreMutation.mutate(item.id)
                              }}
                            >
                              Khôi phục
                            </button>
                          ) : (
                            <button
                              type='button'
                              className={ROW_ACTION_DELETE}
                              onClick={() => {
                                setErrorMsg(null)
                                if (!window.confirm('Xóa mềm hóa đơn này? Bạn có thể khôi phục sau.')) return
                                deleteMutation.mutate(item.id)
                              }}
                            >
                              Xóa
                            </button>
                          )}
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
