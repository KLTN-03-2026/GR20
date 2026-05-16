import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useContext } from 'react'
import { AppContext } from 'src/contexts/app.context'
import { invoiceItemsApi } from 'src/apis/billing_api/invoice-items.api'
import { invoicesApi } from 'src/apis/billing_api/invoices.api'
import { utilityPricingApi } from 'src/apis/utility_api/utility-pricing.api'

function statusStyle(s?: string) {
  const x = String(s || '').toUpperCase()
  if (x === 'PAID') return 'bg-emerald-100 text-emerald-800'
  if (x === 'OVERDUE') return 'bg-red-100 text-red-800'
  if (x === 'PENDING') return 'bg-amber-100 text-amber-900'
  return 'bg-slate-100 text-slate-700'
}

export default function UserInvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useContext(AppContext)
  const userId = String((user as any)?.id || (user as any)?._id || '')

  const invoiceQuery = useQuery({
    queryKey: ['user-invoice-detail', userId, id],
    queryFn: () => invoicesApi.getByUserIdAndInvoiceId(userId, String(id)),
    enabled: Boolean(userId && id)
  })

  const inv = invoiceQuery.data?.data?.data ?? null

  const itemsQuery = useQuery({
    queryKey: ['invoice-items', id],
    queryFn: () => invoiceItemsApi.getByInvoiceId(String(id)),
    enabled: Boolean(inv && id)
  })

  const pricingQuery = useQuery({
    queryKey: ['active-utility-pricing'],
    queryFn: () => utilityPricingApi.getActive()
  })

  const fmtMoney = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(n) || 0)

  const items = itemsQuery.data?.data?.data || []
  const pricing = pricingQuery.data?.data?.data || []

  if (!userId) {
    return (
      <div className='pb-8 text-center text-slate-500'>
        Vui lòng đăng nhập.
      </div>
    )
  }

  if (invoiceQuery.isLoading) {
    return (
      <div className='flex min-h-[40vh] items-center justify-center text-slate-400'>
        <span className='material-symbols-outlined animate-spin'>sync</span>
        <span className='ml-2 text-sm'>Đang tải...</span>
      </div>
    )
  }

  if (!inv) {
    return (
      <div className='pb-10'>
        <nav className='mb-6 flex flex-wrap items-center gap-2 text-sm font-medium text-slate-400'>
          <Link to='/' className='hover:text-blue-500'>Trang chủ</Link>
          <span className='material-symbols-outlined text-xs'>chevron_right</span>
          <Link to='/invoices' className='hover:text-blue-500'>
            Hóa đơn của tôi
          </Link>
          <span className='material-symbols-outlined text-xs'>chevron_right</span>
          <span className='font-semibold text-blue-600'>Chi tiết</span>
        </nav>
        <div className='rounded-2xl border border-slate-100 bg-white py-16 text-center'>
          <span className='material-symbols-outlined mx-auto mb-4 block text-5xl text-slate-200'>receipt_long</span>
          <p className='font-semibold text-slate-700'>Không tìm thấy hóa đơn</p>
          <button type='button' className='mt-4 text-sm font-bold text-blue-600 hover:underline' onClick={() => navigate(-1)}>Quay lại</button>
        </div>
      </div>
    )
  }

  const code = inv.invoiceCode || String(inv.id)

  return (
    <div className='pb-10'>
      <nav className='mb-6 flex flex-wrap items-center gap-2 text-sm font-medium text-slate-400'>
        <Link to='/' className='hover:text-blue-500'>Trang chủ</Link>
        <span className='material-symbols-outlined text-xs'>chevron_right</span>
        <Link to='/invoices' className='hover:text-blue-500'>
          Hóa đơn của tôi
        </Link>
        <span className='material-symbols-outlined text-xs'>chevron_right</span>
        <span className='font-semibold text-blue-600'>Chi tiết hóa đơn</span>
      </nav>

      <div className='mb-8'>
        <h1 className='mb-2 text-3xl font-extrabold text-slate-900'>Chi tiết hóa đơn</h1>
        <div className='h-1.5 w-20 rounded-full bg-gradient-to-r from-blue-500 to-blue-700' />
        <p className='mt-2 text-sm text-slate-500'>
          {code} · Căn hộ #{inv.apartmentId} · Kỳ{' '}
          {inv.billingMonth != null && inv.billingYear != null ? `${inv.billingMonth}/${inv.billingYear}` : '—'}
        </p>
      </div>

      <div className='relative mb-8 flex flex-col justify-between gap-6 overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:flex-row md:items-center md:p-8'>
        <div className='flex items-center gap-6'>
          <div className='flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-50'>
            <span className='material-symbols-outlined text-3xl text-blue-600'>description</span>
          </div>
          <div>
            <p className='text-xl font-bold text-slate-900 md:text-2xl'>{fmtMoney(inv.totalAmount)}</p>
            <p className='text-sm text-slate-500'>Tổng thanh toán đề xuất</p>
          </div>
        </div>
        <span className={`inline-flex shrink-0 rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wide ${statusStyle(inv.status)}`}>
          {String(inv.status || '—')}
        </span>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
        <div className='rounded-2xl border border-slate-100 bg-white p-8 shadow-sm lg:col-span-8'>
          <div className='mb-4 flex items-center gap-3'>
            <span className='material-symbols-outlined text-blue-600'>list_alt</span>
            <h3 className='text-xs font-bold uppercase tracking-widest text-slate-400'>Chi tiết dòng</h3>
          </div>
          {itemsQuery.isLoading ? (
            <p className='text-sm text-slate-400'>Đang tải dòng hóa đơn...</p>
          ) : items.length === 0 ? (
            <p className='text-sm text-slate-500'>Chưa có dòng chi tiết.</p>
          ) : (
            <div className='divide-y divide-slate-100'>
              {(items as { id?: string; itemName?: string; amount?: number }[]).map((it) => (
                <div key={String(it.id)} className='flex items-center justify-between py-3 first:pt-0'>
                  <span className='text-sm font-medium text-slate-800'>{it.itemName ?? '—'}</span>
                  <span className='text-sm font-bold tabular-nums text-slate-900'>
                    {fmtMoney(Number(it.amount) || 0)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className='space-y-6 lg:col-span-4'>
          <div className='rounded-2xl bg-gradient-to-br from-slate-800 to-blue-950 p-6 text-white'>
            <h3 className='mb-4 text-xs font-bold uppercase tracking-widest text-white/70'>Thông tin</h3>
            <dl className='space-y-3 text-sm'>
              <div>
                <dt className='text-[10px] uppercase text-white/50'>Mã</dt>
                <dd className='font-semibold'>{code}</dd>
              </div>
              <div>
                <dt className='text-[10px] uppercase text-white/50'>Căn</dt>
                <dd className='font-semibold'>#{inv.apartmentId}</dd>
              </div>
              {inv.dueDate && (
                <div>
                  <dt className='text-[10px] uppercase text-white/50'>Hạn</dt>
                  <dd>{new Date(inv.dueDate).toLocaleDateString('vi-VN')}</dd>
                </div>
              )}
            </dl>
            <Link
              to='/payments'
              className='mt-4 inline-flex items-center gap-2 text-xs font-bold text-blue-200 hover:text-white hover:underline'
            >
              Sang trang Thanh toán của tôi
              <span className='material-symbols-outlined text-sm'>payments</span>
            </Link>
          </div>

          <div className='rounded-2xl border border-slate-100 bg-white p-6 shadow-sm'>
            <h3 className='mb-3 text-xs font-bold uppercase tracking-wider text-slate-400'>Bảng giá tham khảo</h3>
            {pricingQuery.isLoading ? (
              <p className='text-xs text-slate-400'>Đang tải...</p>
            ) : pricing.length === 0 ? (
              <p className='text-xs text-slate-500'>Chưa có dữ liệu giá đơn vị.</p>
            ) : (
              <div className='space-y-2 text-xs text-slate-700'>
                {(pricing as { id?: string; meterType?: string; unit?: string; pricePerUnit?: number }[]).map((p) => (
                  <div key={String(p.id)} className='flex justify-between'>
                    <span>{p.meterType} ({p.unit})</span>
                    <span className='font-semibold'>{fmtMoney(Number(p.pricePerUnit) || 0)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className='relative mt-8 h-32 overflow-hidden rounded-2xl border border-slate-100 bg-slate-100'>
        <div className='flex h-full items-center px-6'>
          <div className='max-w-lg'>
            <div className='mb-1 flex items-center gap-2'>
              <span className='material-symbols-outlined text-sm text-blue-600'>auto_awesome</span>
              <span className='text-[10px] font-bold uppercase tracking-widest text-blue-700'>Homelink AI Insight</span>
            </div>
            <p className='text-sm text-slate-700'>
              Nếu tổng tiền lệch với kỳ trước, kiểm tra lại chỉ số và bảng giá — hoặc liên hệ BQL để đối soát chứng từ.
            </p>
          </div>
        </div>
      </div>

      <Link
        to='/invoices'
        className='mt-8 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50'
      >
        <span className='material-symbols-outlined text-lg'>arrow_back</span>
        Về danh sách hóa đơn
      </Link>
    </div>
  )
}
