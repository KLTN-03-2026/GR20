import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { paymentsApi } from 'src/apis/billing_api/payments.api'
import type { Payment } from 'src/types/payment.type'
import {
  formatVnd,
  paymentMethodVi,
  paymentStatusBadgeClass,
  paymentStatusVi
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
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const pageSize = 10
  const [page, setPage] = useState(0)
  const [screenError, setScreenError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'SUCCESS' | 'FAILED'>('ALL')
  const [filterMethod, setFilterMethod] = useState<'ALL' | 'CASH' | 'BANK_TRANSFER'>('ALL')
  const [filterDeleted, setFilterDeleted] = useState<'HIDE_DELETED' | 'SHOW_ALL'>('SHOW_ALL')
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const { data, error, isLoading, isError } = useQuery({
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

  const list = data?.data?.data || []
  const totalPages = Number(data?.data?.totalPages || 0)
  const currentPage = Number(data?.data?.page || 0)
  const summary = {
    total: list.length,
    pending: list.filter((p: Payment) => p.status === 'PENDING').length,
    success: list.filter((p: Payment) => p.status === 'SUCCESS').length,
    failed: list.filter((p: Payment) => p.status === 'FAILED').length,
    deleted: list.filter((p: Payment) => Boolean(p.deletedAt)).length
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
    <div className='min-h-screen bg-slate-50 p-6 font-sans text-slate-900 sm:p-8'>
      <div className='mx-auto max-w-6xl'>
        <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <span className='rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700 ring-1 ring-blue-100'>
              Quản trị
            </span>
            <h1 className='mt-3 text-3xl font-bold tracking-tight text-slate-900'>Quản lý thanh toán</h1>
            <p className='mt-1 max-w-xl text-sm text-slate-600'>
              Ghi nhận giao dịch theo hóa đơn, lọc theo trạng thái và phương thức. Mở hóa đơn để đối chiếu kỳ cước và dòng tiền.
            </p>
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            <Link
              to='/admin/invoices'
              className='inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50'
            >
              Quản lý hóa đơn
            </Link>
            <button
              type='button'
              onClick={() => setIsCreateOpen(true)}
              className='inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700'
            >
              + Tạo thanh toán
            </button>
          </div>
        </div>

        <div className='mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5'>
          <div className='rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm'>
            <div className='text-xs font-medium text-slate-500'>Trên trang này</div>
            <div className='mt-1 text-2xl font-bold text-slate-900'>{summary.total}</div>
            <div className='mt-0.5 text-xs text-slate-500'>giao dịch</div>
          </div>
          <div className='rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm'>
            <div className='text-xs font-medium text-slate-500'>{paymentStatusVi.PENDING}</div>
            <div className='mt-1 text-2xl font-bold text-amber-600'>{summary.pending}</div>
          </div>
          <div className='rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm'>
            <div className='text-xs font-medium text-slate-500'>{paymentStatusVi.SUCCESS}</div>
            <div className='mt-1 text-2xl font-bold text-emerald-600'>{summary.success}</div>
          </div>
          <div className='rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm'>
            <div className='text-xs font-medium text-slate-500'>{paymentStatusVi.FAILED}</div>
            <div className='mt-1 text-2xl font-bold text-red-600'>{summary.failed}</div>
          </div>
          <div className='col-span-2 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm sm:col-span-1'>
            <div className='text-xs font-medium text-slate-500'>Đã xóa mềm</div>
            <div className='mt-1 text-2xl font-bold text-slate-600'>{summary.deleted}</div>
          </div>
        </div>

        {(screenError || isError) && (
          <div className='mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600'>
            {screenError || getApiErrorMessage(error, 'Tải danh sách thanh toán thất bại')}
          </div>
        )}
        {isCreateOpen && (
          <form
            className='mb-6 grid grid-cols-1 gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm md:grid-cols-6'
            onSubmit={(e) => {
              e.preventDefault()
              setScreenError(null)
              const fd = new FormData(e.currentTarget)
              const paymentDateRaw = fd.get('paymentDate') as string | null
              createMutation.mutate({
                invoiceId: Number(fd.get('invoiceId')),
                amount: Number(fd.get('amount')),
                paymentMethod: fd.get('paymentMethod') || 'CASH',
                paymentGateway: fd.get('paymentMethod') === 'BANK_TRANSFER' ? 'MB_VIETQR' : 'OFFLINE',
                status: fd.get('status') || 'PENDING',
                paymentDate: paymentDateRaw && paymentDateRaw.trim() !== '' ? paymentDateRaw : undefined
              })
              e.currentTarget.reset()
              setIsCreateOpen(false)
            }}
          >
            <input
              name='invoiceId'
              required
              inputMode='numeric'
              placeholder='ID hóa đơn *'
              className='rounded-lg border border-gray-200 px-4 py-2.5'
            />
            <input name='amount' required inputMode='decimal' placeholder='Số tiền (VND) *' className='rounded-lg border border-gray-200 px-4 py-2.5' />
            <input name='paymentDate' type='date' title='Ngày thanh toán (tuỳ chọn)' className='rounded-lg border border-gray-200 px-4 py-2.5' />
            <select
              name='paymentMethod'
              className='rounded-lg border border-gray-200 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
            >
              <option value='CASH'>{paymentMethodVi.CASH}</option>
              <option value='BANK_TRANSFER'>{paymentMethodVi.BANK_TRANSFER}</option>
            </select>
            <select
              name='status'
              className='rounded-lg border border-gray-200 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
            >
              <option value='PENDING'>{paymentStatusVi.PENDING}</option>
              <option value='SUCCESS'>{paymentStatusVi.SUCCESS}</option>
              <option value='FAILED'>{paymentStatusVi.FAILED}</option>
            </select>
            <button className='rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-700'>
              {createMutation.isPending ? 'Đang lưu...' : 'Tạo thanh toán'}
            </button>
            <button
              type='button'
              className='rounded-lg bg-slate-100 px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-200 md:col-span-2'
              onClick={() => setIsCreateOpen(false)}
            >
              Hủy
            </button>
          </form>
        )}
        <div className='mb-6 grid grid-cols-1 gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm md:grid-cols-4'>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value as 'ALL' | 'PENDING' | 'SUCCESS' | 'FAILED')
              setPage(0)
            }}
            className='rounded-lg border border-gray-200 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
          >
            <option value='ALL'>Trạng thái: tất cả</option>
            <option value='PENDING'>{paymentStatusVi.PENDING}</option>
            <option value='SUCCESS'>{paymentStatusVi.SUCCESS}</option>
            <option value='FAILED'>{paymentStatusVi.FAILED}</option>
          </select>
          <select
            value={filterMethod}
            onChange={(e) => {
              setFilterMethod(e.target.value as 'ALL' | 'CASH' | 'BANK_TRANSFER')
              setPage(0)
            }}
            className='rounded-lg border border-gray-200 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
          >
            <option value='ALL'>Phương thức: tất cả</option>
            <option value='CASH'>{paymentMethodVi.CASH}</option>
            <option value='BANK_TRANSFER'>{paymentMethodVi.BANK_TRANSFER}</option>
          </select>
          <select
            value={filterDeleted}
            onChange={(e) => {
              setFilterDeleted(e.target.value as 'HIDE_DELETED' | 'SHOW_ALL')
              setPage(0)
            }}
            className='rounded-lg border border-gray-200 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
          >
            <option value='HIDE_DELETED'>Ẩn đã xóa</option>
            <option value='SHOW_ALL'>Hiện tất cả (kể cả đã xóa)</option>
          </select>
          <button
            type='button'
            onClick={() => {
              setFilterStatus('ALL')
              setFilterMethod('ALL')
              setFilterDeleted('SHOW_ALL')
              setPage(0)
            }}
            className='rounded-lg bg-gray-100 px-4 py-2.5 font-semibold text-gray-700 transition hover:bg-gray-200'
          >
            Xóa lọc
          </button>
        </div>
        <div className='overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm'>
          <div className='overflow-x-auto'>
            <table className='w-full min-w-[720px] border-collapse text-left'>
              <thead>
                <tr className='border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400'>
                  <th className='px-6 py-4'>Mã TT</th>
                  <th className='px-6 py-4'>Hóa đơn</th>
                  <th className='px-6 py-4'>Số tiền</th>
                  <th className='px-6 py-4'>Phương thức</th>
                  <th className='px-6 py-4'>Trạng thái</th>
                  <th className='px-6 py-4'>Đã xóa</th>
                  <th className='px-6 py-4 text-right'>Thao tác</th>
                </tr>
              </thead>
              <tbody className='text-sm text-slate-700'>
                {isLoading && (
                  <tr>
                    <td className='px-6 py-8 text-slate-500' colSpan={7}>
                      Đang tải danh sách thanh toán…
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  !isError &&
                  list.map((item) => {
                    const method = item.paymentMethod || ''
                    const methodLabel =
                      method && method in paymentMethodVi
                        ? paymentMethodVi[method as keyof typeof paymentMethodVi]
                        : method || '—'
                    return (
                      <tr key={item.id} className='border-b border-slate-50 last:border-0'>
                        <td className='px-6 py-4 font-mono text-xs text-slate-500'>#{item.id}</td>
                        <td className='px-6 py-4'>
                          <Link
                            to={`/admin/invoices/${item.invoiceId}`}
                            className='font-semibold text-blue-600 hover:text-blue-700 hover:underline'
                          >
                            Hóa đơn #{item.invoiceId}
                          </Link>
                        </td>
                        <td className='px-6 py-4 font-semibold tabular-nums text-slate-900'>{formatVnd(item.amount)}</td>
                        <td className='px-6 py-4'>{methodLabel}</td>
                        <td className='px-6 py-4'>
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${paymentStatusBadgeClass(item.status)}`}
                          >
                            {paymentStatusVi[item.status] || item.status}
                          </span>
                        </td>
                        <td className='px-6 py-4'>{item.deletedAt ? <span className='font-medium text-red-600'>Có</span> : 'Không'}</td>
                        <td className='px-6 py-4 text-right'>
                          <div className='inline-flex flex-wrap justify-end gap-2'>
                            <button type='button' className={ROW_ACTION_EDIT} onClick={() => navigate(`/admin/payments/${item.id}`)}>
                              Chi tiết
                            </button>
                            {item.deletedAt ? (
                              <button type='button' className={ROW_ACTION_RESTORE} onClick={() => restoreMutation.mutate(item.id)}>
                                Khôi phục
                              </button>
                            ) : (
                              <button
                                type='button'
                                className={ROW_ACTION_DELETE}
                                onClick={() => {
                                  if (!window.confirm('Xóa mềm thanh toán này? Có thể khôi phục sau.')) return
                                  deleteMutation.mutate(item.id)
                                }}
                              >
                                Xóa
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                {!isLoading && !isError && list.length === 0 && (
                  <tr>
                    <td className='px-6 py-8 text-center text-slate-500' colSpan={7}>
                      Không có dữ liệu phù hợp bộ lọc.
                    </td>
                  </tr>
                )}
                {!isLoading && isError && (
                  <tr>
                    <td className='px-6 py-8 text-center text-red-600' colSpan={7}>
                      Không tải được danh sách thanh toán.
                    </td>
                  </tr>
                )}
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
