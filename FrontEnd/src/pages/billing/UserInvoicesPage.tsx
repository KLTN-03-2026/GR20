import { useQuery } from '@tanstack/react-query'
import { useContext, useState } from 'react'
import { invoiceItemsApi } from 'src/apis/billing_api/invoice-items.api'
import { invoicesApi } from 'src/apis/billing_api/invoices.api'
import { utilityPricingApi } from 'src/apis/utility_api/utility-pricing.api'
import { AppContext } from 'src/contexts/app.context'

const logApiError = (action: string, err: any) => {
  console.error(`[UserInvoices][${action}] error`, {
    status: err?.response?.status,
    endpoint: err?.config?.url || err?.response?.config?.url,
    method: err?.config?.method || err?.response?.config?.method,
    data: err?.response?.data,
    message: err?.message
  })
}

export default function UserInvoicesPage() {
  const { user } = useContext(AppContext)
  const userId = String((user as any)?.id || (user as any)?._id || '')
  const [page, setPage] = useState(0)
  const pageSize = 10
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null)

  const { data, error, isError, isLoading } = useQuery({
    queryKey: ['user-invoices', userId, page],
    queryFn: () => invoicesApi.getByUserId(userId, { page, size: pageSize }),
    enabled: Boolean(userId)
  })

  if (isError) logApiError('GetByUserId', error)

  const list = data?.data?.data || []
  const totalPages = Number(data?.data?.totalPages || 0)
  const currentPage = Number(data?.data?.page || 0)
  const selectedInvoice = selectedInvoiceId ? list.find((i) => String(i.id) === String(selectedInvoiceId)) : null

  const invoiceItemsQuery = useQuery({
    queryKey: ['user-invoice-items', selectedInvoiceId],
    queryFn: () => invoiceItemsApi.getByInvoiceId(String(selectedInvoiceId)),
    enabled: Boolean(selectedInvoiceId)
  })
  const activePricingQuery = useQuery({
    queryKey: ['active-utility-pricing'],
    queryFn: () => utilityPricingApi.getActive()
  })

  return (
    <div className='min-h-screen bg-slate-50 px-6 py-6'>
      <div className='mx-auto max-w-6xl'>
        <h2 className='mb-4 text-3xl font-extrabold tracking-tight text-slate-900'>Hóa đơn của tôi</h2>
        <div className='overflow-hidden rounded-xl bg-white shadow-sm'>
          <table className='w-full border-collapse text-left'>
            <thead>
              <tr className='bg-slate-50'>
                <th className='px-4 py-3 text-xs font-bold uppercase text-slate-500'>Mã hóa đơn</th>
                <th className='px-4 py-3 text-xs font-bold uppercase text-slate-500'>Căn hộ</th>
                <th className='px-4 py-3 text-xs font-bold uppercase text-slate-500'>Kỳ</th>
                <th className='px-4 py-3 text-xs font-bold uppercase text-slate-500'>Tổng tiền</th>
                <th className='px-4 py-3 text-xs font-bold uppercase text-slate-500'>Trạng thái</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100'>
              {isLoading && (
                <tr>
                  <td className='px-4 py-4 text-sm text-slate-500' colSpan={5}>
                    Đang tải...
                  </td>
                </tr>
              )}
              {!isLoading &&
                list.map((item) => (
                  <tr key={item.id}>
                    <td className='px-4 py-3'>{item.invoiceCode || item.id}</td>
                    <td className='px-4 py-3'>Apt {item.apartmentId}</td>
                    <td className='px-4 py-3'>
                      {item.billingMonth}/{item.billingYear}
                    </td>
                    <td className='px-4 py-3'>{item.totalAmount}</td>
                    <td className='px-4 py-3'>{item.status}</td>
                    <td className='px-4 py-3 text-right'>
                      <button
                        className='rounded bg-sky-100 px-2 py-1 text-xs'
                        onClick={() => setSelectedInvoiceId(String(item.id))}
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
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

      {selectedInvoice && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4' onClick={() => setSelectedInvoiceId(null)}>
          <div className='w-full max-w-lg rounded-xl bg-white p-5 shadow-lg' onClick={(e) => e.stopPropagation()}>
            <div className='mb-3 flex items-center justify-between'>
              <h3 className='text-lg font-semibold'>Chi tiết hóa đơn</h3>
              <button className='rounded bg-slate-100 px-2 py-1' onClick={() => setSelectedInvoiceId(null)}>
                Đóng
              </button>
            </div>
            <div className='space-y-1 text-sm text-slate-700'>
              <div>Hóa đơn: {selectedInvoice.invoiceCode || selectedInvoice.id}</div>
              <div>Căn hộ: {selectedInvoice.apartmentId}</div>
              <div>Kỳ: {selectedInvoice.billingMonth}/{selectedInvoice.billingYear}</div>
              <div>Tổng tiền: {selectedInvoice.totalAmount}</div>
              <div>Trạng thái: {selectedInvoice.status}</div>
            </div>

            <div className='mt-4 rounded border p-3'>
              <div className='mb-2 text-sm font-semibold text-slate-800'>Chi tiết dòng tiền</div>
              {(invoiceItemsQuery.data?.data?.data || []).length === 0 ? (
                <div className='text-xs text-slate-500'>Chưa có chi tiết hóa đơn.</div>
              ) : (
                <div className='space-y-1 text-xs text-slate-700'>
                  {(invoiceItemsQuery.data?.data?.data || []).map((it) => (
                    <div key={it.id} className='flex items-center justify-between'>
                      <span>{it.itemName}</span>
                      <span className='font-medium'>{it.amount}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className='mt-3 rounded border p-3'>
              <div className='mb-2 text-sm font-semibold text-slate-800'>Bảng giá đang áp dụng</div>
              {(activePricingQuery.data?.data?.data || []).length === 0 ? (
                <div className='text-xs text-slate-500'>Chưa có bảng giá active.</div>
              ) : (
                <div className='space-y-1 text-xs text-slate-700'>
                  {(activePricingQuery.data?.data?.data || []).map((p) => (
                    <div key={p.id} className='flex items-center justify-between'>
                      <span>
                        {p.meterType} ({p.unit})
                      </span>
                      <span className='font-medium'>{p.pricePerUnit}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
