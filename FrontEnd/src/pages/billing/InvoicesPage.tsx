import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { invoiceItemsApi } from 'src/apis/billing_api/invoice-items.api'
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
    ['Invoice not found or not cancelled', 'Không tìm thấy hóa đơn đã xóa mềm để khôi phục'],
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
  const queryClient = useQueryClient()
  const pageSize = 10
  const [page, setPage] = useState(0)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null)
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
  const selectedInvoice = list.find((invoice) => Number(invoice.id) === Number(selectedInvoiceId))

  const { data: invoiceItemsData } = useQuery({
    queryKey: ['invoice-items-by-invoice', selectedInvoiceId],
    queryFn: () => invoiceItemsApi.getByInvoiceId(String(selectedInvoiceId)),
    enabled: Boolean(selectedInvoiceId)
  })
  const selectedInvoiceItems = invoiceItemsData?.data?.data || []
  const amountByType = selectedInvoiceItems.reduce<Record<string, number>>((acc, item) => {
    const upperName = item.itemName.toUpperCase()
    let typeLabel = 'Khác'
    if (upperName.includes('ELECTRIC')) typeLabel = 'Tiền điện'
    else if (upperName.includes('WATER')) typeLabel = 'Tiền nước'
    acc[typeLabel] = (acc[typeLabel] || 0) + Number(item.amount)
    return acc
  }, {})

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
    onSuccess: (response, id) => {
      logApiSuccess('Delete', response)
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      setSelectedInvoiceId((current) => (current === Number(id) ? null : current))
      setErrorMsg(null)
    },
    onError: (err: any) => {
      logApiError('Delete', err)
      setErrorMsg(getApiErrorMessage(err, 'Xóa mềm hóa đơn thất bại'))
    }
  })
  const restoreMutation = useMutation({
    mutationFn: (id: string) => invoicesApi.restore(id),
    onSuccess: (response, id) => {
      logApiSuccess('Restore', response)
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      setSelectedInvoiceId((current) => (current === Number(id) ? null : current))
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

  return (
    <div className='min-h-screen bg-slate-50 px-6 py-6 text-slate-900'>
      <div className='mx-auto max-w-6xl'>
        <div className='mb-6 flex items-end justify-between gap-4'>
          <div>
            <h2 className='text-3xl font-extrabold tracking-tight'>Danh sách hóa đơn</h2>
            <p className='mt-1 text-sm text-slate-500'>Tạo hóa đơn tự động từ meter readings và utility pricing.</p>
          </div>
        </div>

        {errorMsg && <div className='mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-600'>{errorMsg}</div>}

        <form
          className='mb-6 grid grid-cols-1 gap-2 rounded-xl bg-white p-4 shadow-sm md:grid-cols-6'
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
          }}
        >
          <input name='invoiceCode' placeholder='Invoice code' className='rounded border px-2 py-2' />
          <input name='apartmentId' placeholder='Apartment ID' className='rounded border px-2 py-2' />
          <input name='billingMonth' placeholder='Month' className='rounded border px-2 py-2' />
          <input name='billingYear' placeholder='Year' className='rounded border px-2 py-2' />
          <input name='dueDate' type='date' className='rounded border px-2 py-2' />
          <select name='status' className='rounded border px-2 py-2 md:col-span-2'>
            <option value='PENDING'>PENDING</option>
            <option value='PAID'>PAID</option>
            <option value='OVERDUE'>OVERDUE</option>
          </select>
          <button className='rounded bg-blue-600 px-3 py-2 text-white md:col-span-2'>
            {createMutation.isPending ? 'Saving...' : 'Create invoice'}
          </button>
        </form>

        <div className='overflow-hidden rounded-2xl bg-white shadow-sm'>
          <div className='overflow-x-auto'>
            <table className='w-full border-collapse text-left'>
              <thead>
                <tr className='bg-slate-50'>
                  {['Mã hóa đơn', 'Căn hộ', 'Kỳ', 'Tổng tiền', 'Trạng thái', 'Thao tác'].map((h) => (
                    <th
                      key={h}
                      className={`px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 ${
                        h === 'Thao tác' ? 'text-right' : ''
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100'>
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
                      <td className='px-6 py-4 text-sm text-slate-700'>{item.status}</td>
                      <td className='px-6 py-4 text-right'>
                        <div className='inline-flex gap-2'>
                          <button
                            className='rounded bg-blue-100 px-2 py-1 text-xs'
                            onClick={() => setSelectedInvoiceId(Number(item.id))}
                          >
                            Xem chi tiết
                          </button>
                          <button
                            className='rounded bg-red-100 px-2 py-1 text-xs'
                            onClick={() => {
                              setErrorMsg(null)
                              if (item.status === 'CANCELLED') {
                                restoreMutation.mutate(item.id)
                                return
                              }
                              deleteMutation.mutate(item.id)
                            }}
                          >
                            {item.status === 'CANCELLED' ? 'Khôi phục' : 'Xóa mềm'}
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

      {selectedInvoice && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4'
          onClick={() => {
            setSelectedInvoiceId(null)
          }}
        >
          <div className='max-h-[85vh] w-full max-w-3xl overflow-auto rounded bg-white p-4' onClick={(e) => e.stopPropagation()}>
            <div className='mb-3 flex items-center justify-between'>
              <h3 className='text-lg font-semibold'>Chi tiết hóa đơn</h3>
              <button
                className='rounded bg-gray-100 px-2 py-1'
                onClick={() => {
                  setSelectedInvoiceId(null)
                }}
              >
                Đóng
              </button>
            </div>
            <div className='mt-2 text-sm'>
              <div>Căn hộ: {selectedInvoice.apartmentId}</div>
              <div>
                Tháng: {selectedInvoice.billingMonth}/{selectedInvoice.billingYear}
              </div>
              <div className='text-blue-700'>Chi tiết bên dưới được hệ thống tự tính từ meter readings + utility pricing.</div>
            </div>

            <div className='mt-4 rounded border p-3'>
              {Object.entries(amountByType).length > 0 ? (
                <div className='space-y-2'>
                  {Object.entries(amountByType).map(([typeLabel, amount]) => (
                    <div key={typeLabel} className='flex items-center justify-between'>
                      <span>{typeLabel}:</span>
                      <span className='font-medium'>{amount}</span>
                    </div>
                  ))}
                  <div className='my-2 border-t' />
                  <div className='flex items-center justify-between font-semibold'>
                    <span>Tổng:</span>
                    <span>{selectedInvoice.totalAmount}</span>
                  </div>
                </div>
              ) : (
                <div className='text-sm text-gray-500'>Chưa có chi tiết cho hóa đơn này.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
