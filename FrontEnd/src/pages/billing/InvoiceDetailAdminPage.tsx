import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { invoicesApi } from 'src/apis/billing_api/invoices.api'
import { invoiceItemsApi } from 'src/apis/billing_api/invoice-items.api'
import type { InvoiceItem } from 'src/types/invoice-item.type'
import {
  formatVnd,
  invoiceStatusBadgeClass,
  invoiceStatusVi
} from 'src/utils/billing-ui'

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

  const itemsSum = useMemo(
    () => Number(items.reduce((s, row) => s + Number(row.amount || 0), 0).toFixed(2)),
    [items]
  )

  return (
    <div className='min-h-screen bg-slate-50 px-6 py-8 font-sans text-slate-900 md:px-8'>
      <div className='mx-auto max-w-6xl'>
        <div className='flex flex-wrap items-center gap-x-6 gap-y-2'>
          <Link
            to='/admin/invoices'
            className='inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline'
          >
            ← Quản lý hóa đơn
          </Link>
          <Link
            to='/admin/payments'
            className='inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:underline'
          >
            Quản lý thanh toán →
          </Link>
        </div>

        <div className='mt-6 border-b border-slate-200/80 pb-8'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800 ring-1 ring-blue-100'>
              Chi tiết hóa đơn
            </span>
            {invoiceId ? (
              <span className='rounded-full bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-600'>#{invoiceId}</span>
            ) : null}
          </div>
          <h1 className='mt-3 text-3xl font-extrabold tracking-tight md:text-4xl'>
            {invoice?.invoiceCode || (invoiceId ? `Hóa đơn #${invoiceId}` : 'Hóa đơn')}
          </h1>
          <p className='mt-2 max-w-2xl text-sm text-slate-600'>
            Tổng tiền trên hóa đơn là tổng các dòng mục (điện/nước/gas theo chỉ số × đơn giá, cộng tiền thuê nếu có hợp đồng thuê).
          </p>
          {invoice != null && invoice.billingMonth != null && invoice.billingYear != null && (
            <div className='mt-4 flex flex-wrap gap-3'>
              <Link
                to={`/admin/meter-readings?apartmentId=${encodeURIComponent(String(invoice.apartmentId))}&billingMonth=${encodeURIComponent(String(invoice.billingMonth))}&billingYear=${encodeURIComponent(String(invoice.billingYear))}`}
                className='inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-900 transition hover:bg-blue-100'
              >
                Xem chỉ số công tơ kỳ này
              </Link>
              <Link
                to='/admin/utility-meters'
                className='inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50'
              >
                Quản lý đồng hồ
              </Link>
            </div>
          )}
        </div>

        {(invoiceLoading || invoiceError || !invoice) && (
          <div className='mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm'>
            <p className={invoiceError ? 'text-red-600' : 'text-slate-600'}>
              {invoiceError ? 'Không tải được hóa đơn.' : invoiceLoading ? 'Đang tải…' : 'Không có dữ liệu.'}
            </p>
          </div>
        )}

        {invoice && (
          <>
            <div className='mt-6 overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm'>
              <dl className='grid grid-cols-1 gap-5 text-sm md:grid-cols-2'>
                <div>
                  <dt className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Căn hộ</dt>
                  <dd className='mt-1 font-medium text-slate-900'>Mã căn ID {invoice.apartmentId}</dd>
                </div>
                <div>
                  <dt className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Kỳ thanh toán</dt>
                  <dd className='mt-1 font-medium text-slate-900'>
                    Tháng {invoice.billingMonth}/{invoice.billingYear}
                  </dd>
                </div>
                <div>
                  <dt className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Trạng thái</dt>
                  <dd className='mt-2'>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${invoiceStatusBadgeClass(invoice.status)}`}
                    >
                      {invoiceStatusVi[String(invoice.status || '').toUpperCase()] || invoice.status}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Tổng tiền hóa đơn</dt>
                  <dd className='mt-1 text-2xl font-bold tabular-nums text-slate-900'>{formatVnd(invoice.totalAmount)}</dd>
                </div>
                {invoice.dueDate && (
                  <div className='md:col-span-2'>
                    <dt className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Hạn thanh toán</dt>
                    <dd className='mt-1 text-slate-900'>{String(invoice.dueDate).slice(0, 10)}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className='mt-6 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm'>
              <div className='border-b border-slate-100 px-6 py-4'>
                <h2 className='text-lg font-bold text-slate-900'>Dòng mục (invoice items)</h2>
                <p className='text-sm text-slate-500'>
                  Mỗi dòng là một khoản đã cộng vào tổng; hệ thống lưu tổng trên bảng hóa đơn sau khi tạo các dòng.
                </p>
              </div>
              <div className='overflow-x-auto'>
                <table className='w-full border-collapse text-left text-sm'>
                  <thead>
                    <tr className='border-b border-slate-100 bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500'>
                      <th className='px-6 py-4'>Tên mục</th>
                      <th className='px-6 py-4 text-right'>Số tiền</th>
                    </tr>
                  </thead>
                  <tbody className='text-slate-800'>
                    {itemsLoading && (
                      <tr>
                        <td colSpan={2} className='px-6 py-6 text-slate-500'>
                          Đang tải…
                        </td>
                      </tr>
                    )}
                    {!itemsLoading && items.length === 0 && (
                      <tr>
                        <td colSpan={2} className='px-6 py-6 text-slate-500'>
                          Chưa có mục hóa đơn.
                        </td>
                      </tr>
                    )}
                    {!itemsLoading &&
                      items.map((row) => (
                        <tr key={row.id} className='border-b border-slate-50'>
                          <td className='px-6 py-4 font-medium'>{row.itemName}</td>
                          <td className='px-6 py-4 text-right tabular-nums font-medium'>{formatVnd(row.amount)}</td>
                        </tr>
                      ))}
                  </tbody>
                  {!itemsLoading && items.length > 0 && (
                    <tfoot>
                      <tr className='bg-slate-50/80'>
                        <td className='px-6 py-4 text-right text-sm font-semibold text-slate-700'>Cộng các mục</td>
                        <td className='px-6 py-4 text-right text-sm font-bold tabular-nums text-slate-900'>
                          {formatVnd(itemsSum)}
                        </td>
                      </tr>
                      {Math.abs(itemsSum - Number(invoice.totalAmount || 0)) > 0.01 && (
                        <tr>
                          <td colSpan={2} className='px-6 py-3 text-right text-xs text-amber-700'>
                            Lưu ý: tổng các mục ({formatVnd(itemsSum)}) khác tổng trên hóa đơn ({formatVnd(invoice.totalAmount)}).
                          </td>
                        </tr>
                      )}
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
