import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { invoicesApi } from 'src/apis/billing_api/invoices.api'
import { invoiceItemsApi } from 'src/apis/billing_api/invoice-items.api'
import type { InvoiceItem } from 'src/types/invoice-item.type'

export default function InvoiceDetailAdminPage() {
  const { id } = useParams<{ id: string }>()
  const invoiceId = id ?? ''

  const {
    data: invoiceRes,
    isLoading: invoiceLoading,
    isError: invoiceError
  } = useQuery({
    queryKey: ['invoice-detail-admin', invoiceId],
    queryFn: () => invoicesApi.getById(invoiceId),
    enabled: Boolean(invoiceId)
  })

  const { data: itemsRes, isLoading: itemsLoading } = useQuery({
    queryKey: ['invoice-items-by-invoice', invoiceId],
    queryFn: () => invoiceItemsApi.getByInvoiceId(invoiceId),
    enabled: Boolean(invoiceId)
  })

  const invoice = invoiceRes?.data?.data
  const items: InvoiceItem[] = itemsRes?.data?.data || []

  return (
    <div className='min-h-screen bg-[#F8F9FA] p-8 font-sans'>
      <div className='mx-auto max-w-6xl'>
        <Link to='/admin/invoices' className='inline-flex items-center gap-2 text-sm font-semibold text-[#0052CC] hover:underline'>
          ← Quản lý hóa đơn
        </Link>

        <div className='mt-6'>
          <span className='rounded bg-[#DDE7FF] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0052CC]'>
            Administration
          </span>
          <h1 className='mt-4 text-3xl font-bold text-gray-900'>
            Chi tiết hóa đơn {invoice?.invoiceCode ? `(${invoice.invoiceCode})` : invoiceId ? `#${invoiceId}` : ''}
          </h1>
          <p className='mt-2 text-sm text-gray-500'>Thông tin hóa đơn và các dòng mục.</p>
        </div>

        {(invoiceLoading || invoiceError || !invoice) && (
          <div className='mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm'>
            <p className={invoiceError ? 'text-red-600' : 'text-gray-600'}>
              {invoiceError ? 'Không tải được hóa đơn.' : invoiceLoading ? 'Đang tải…' : 'Không có dữ liệu.'}
            </p>
          </div>
        )}

        {invoice && (
          <>
            <div className='mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm'>
              <dl className='grid grid-cols-1 gap-4 text-sm md:grid-cols-2'>
                <div>
                  <dt className='font-semibold text-gray-500'>Căn hộ</dt>
                  <dd className='mt-1 text-gray-900'>APT ID {invoice.apartmentId}</dd>
                </div>
                <div>
                  <dt className='font-semibold text-gray-500'>Tổng tiền</dt>
                  <dd className='mt-1 text-xl font-bold text-gray-900'>{invoice.totalAmount}</dd>
                </div>
                <div>
                  <dt className='font-semibold text-gray-500'>Kỳ</dt>
                  <dd className='mt-1 text-gray-900'>
                    {invoice.billingMonth}/{invoice.billingYear}
                  </dd>
                </div>
                <div>
                  <dt className='font-semibold text-gray-500'>Trạng thái</dt>
                  <dd className='mt-1'>
                    <span className='rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-800'>{invoice.status}</span>
                  </dd>
                </div>
                {invoice.dueDate && (
                  <div className='md:col-span-2'>
                    <dt className='font-semibold text-gray-500'>Hạn thanh toán</dt>
                    <dd className='mt-1 text-gray-900'>{invoice.dueDate}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className='mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm'>
              <div className='border-b border-gray-100 px-6 py-4'>
                <h2 className='text-lg font-bold text-gray-900'>Mục hóa đơn</h2>
                <p className='text-sm text-gray-500'>Phân bổ chi phí trong hóa đơn.</p>
              </div>
              <div className='overflow-x-auto'>
                <table className='w-full border-collapse text-left text-sm'>
                  <thead>
                    <tr className='border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-400'>
                      <th className='px-6 py-4'>Tên mục</th>
                      <th className='px-6 py-4 text-right'>Số tiền</th>
                    </tr>
                  </thead>
                  <tbody className='text-gray-700'>
                    {itemsLoading && (
                      <tr>
                        <td colSpan={2} className='px-6 py-6 text-gray-500'>
                          Đang tải…
                        </td>
                      </tr>
                    )}
                    {!itemsLoading && items.length === 0 && (
                      <tr>
                        <td colSpan={2} className='px-6 py-6 text-gray-500'>
                          Chưa có mục hóa đơn.
                        </td>
                      </tr>
                    )}
                    {!itemsLoading &&
                      items.map((row) => (
                        <tr key={row.id} className='border-b border-gray-50'>
                          <td className='px-6 py-4 font-medium text-gray-900'>{row.itemName}</td>
                          <td className='px-6 py-4 text-right tabular-nums'>{row.amount}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
