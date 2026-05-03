import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import http from 'src/utils/http'

export default function MyContract() {
  const { data, isLoading } = useQuery({
    queryKey: ['myApartment'],
    queryFn: () => http.get('/api/apartments/my')
  })

  const apartment = data?.data?.data ?? null
  const contract = apartment?.currentContract || null

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '---'
    return new Date(dateStr).toLocaleDateString('vi-VN')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount || 0)
  }

  const getDaysRemaining = (endDate: string) => {
    if (!endDate) return 0
    return Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  }

  if (isLoading) {
    return (
      <div className='flex min-h-[40vh] items-center justify-center text-slate-400'>
        <span className='material-symbols-outlined animate-spin'>sync</span>
        <span className='ml-2 text-sm'>Đang tải dữ liệu...</span>
      </div>
    )
  }

  return (
    <div className='pb-8'>
      <nav className='mb-6 flex flex-wrap items-center gap-2 text-sm font-medium text-slate-400'>
        <Link to='/' className='hover:text-blue-500'>
          Trang chủ
        </Link>
        <span className='material-symbols-outlined text-xs'>chevron_right</span>
        <Link to='/my-apartment' className='hover:text-blue-500'>
          Căn hộ của tôi
        </Link>
        <span className='material-symbols-outlined text-xs'>chevron_right</span>
        <span className='font-semibold text-blue-600'>Chi tiết hợp đồng</span>
      </nav>

      <div className='mb-8'>
        <h1 className='mb-2 text-3xl font-extrabold text-slate-900'>Chi tiết hợp đồng</h1>
        <div className='h-1.5 w-20 rounded-full bg-gradient-to-r from-blue-500 to-blue-700' />
        {apartment?.apartment_code && (
          <p className='mt-2 text-sm text-slate-500'>
            Căn {apartment.apartment_code}
            {apartment.building_name ? ` — ${apartment.building_name}` : ''}
          </p>
        )}
      </div>

      {!apartment ? (
        <div className='rounded-2xl border border-slate-100 bg-white p-12 text-center text-slate-500'>
          Không có dữ liệu căn hộ. Liên kết của bạn chưa được gán vào căn nào.
        </div>
      ) : !contract ? (
        <div className='rounded-2xl border border-slate-100 bg-white py-16 text-center'>
          <span className='material-symbols-outlined mb-4 block text-5xl text-slate-200'>description</span>
          <h2 className='mb-2 text-xl font-bold text-slate-700'>Chưa có hợp đồng gắn với tài khoản của bạn</h2>
          <p className='mx-auto max-w-md text-slate-400'>
            Hệ thống chỉ hiển thị hợp đồng mà bạn là{' '}
            <strong className='text-slate-600'>người ký (resident)</strong> trong bảng hợp đồng. Nếu bạn là thành
            viên hộ nhưng hợp đồng đứng tên người khác, hãy nhờ chủ hộ/ban quản lý cập nhật.
          </p>
        </div>
      ) : (
        <div className='space-y-8'>
          <div className='relative flex flex-col justify-between gap-6 overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:flex-row md:items-center md:p-8'>
            <div className='flex items-center gap-6'>
              <div className='flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-50'>
                <span className='material-symbols-outlined text-3xl text-blue-600'>gavel</span>
              </div>
              <div className='min-w-0'>
                <h2 className='text-2xl font-bold text-slate-900'>Mã hợp đồng: #{contract.id}</h2>
                <p className='text-slate-500'>
                  Hợp đồng{' '}
                  {contract.contractType === 'RENT'
                    ? 'thuê'
                    : contract.contractType === 'OWNERSHIP'
                      ? 'mua bán'
                      : 'chuyển nhượng'}{' '}
                  căn hộ
                </p>
              </div>
            </div>
            <span
              className={`inline-flex shrink-0 items-center gap-2 rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-widest ${
                contract.status === 'ACTIVE'
                  ? 'bg-emerald-100 text-emerald-700'
                  : contract.status === 'EXPIRED'
                    ? 'bg-slate-100 text-slate-600'
                    : 'bg-amber-100 text-amber-700'
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${contract.status === 'ACTIVE' ? 'animate-pulse bg-emerald-500' : 'bg-current'}`}
              />
              {contract.status}
            </span>
          </div>

          <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
            <div className='rounded-2xl border border-slate-100 bg-white p-8 shadow-sm lg:col-span-7'>
              <div className='mb-6 flex items-center gap-3'>
                <span className='material-symbols-outlined text-blue-600'>info</span>
                <h3 className='text-xs font-bold uppercase tracking-widest text-slate-400'>Thông tin chung</h3>
              </div>
              <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
                <div>
                  <label className='text-[10px] font-bold uppercase tracking-wider text-slate-400'>Loại hợp đồng</label>
                  <p className='text-lg font-semibold text-slate-900'>{contract.contractType}</p>
                </div>
                <div>
                  <label className='text-[10px] font-bold uppercase tracking-wider text-slate-400'>Căn hộ</label>
                  <p className='text-lg font-semibold text-slate-900'>
                    {apartment.apartment_code}, {apartment.building_name}
                  </p>
                </div>
                <div>
                  <label className='text-[10px] font-bold uppercase tracking-wider text-slate-400'>Ngày bắt đầu</label>
                  <div className='flex items-center gap-2 text-slate-900'>
                    <span className='material-symbols-outlined text-sm text-blue-600'>calendar_today</span>
                    <p className='text-lg font-semibold'>{formatDate(contract.startDate)}</p>
                  </div>
                </div>
                <div>
                  <label className='text-[10px] font-bold uppercase tracking-wider text-slate-400'>Ngày kết thúc</label>
                  <div className='flex items-center gap-2 text-slate-900'>
                    <span className='material-symbols-outlined text-sm text-red-500'>event_busy</span>
                    <p className='text-lg font-semibold'>{formatDate(contract.endDate)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className='rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-8 text-white lg:col-span-5'>
              <div className='mb-6 flex items-center gap-3'>
                <span className='material-symbols-outlined'>payments</span>
                <h3 className='text-xs font-bold uppercase tracking-widest text-white/80'>Tài chính</h3>
              </div>
              <div className='space-y-6'>
                <div className='border-b border-white/10 pb-4'>
                  <p className='mb-1 text-[10px] uppercase tracking-wider text-white/60'>Tiền thuê/tháng</p>
                  <p className='text-3xl font-extrabold'>{formatCurrency(contract.monthlyRent)} VND</p>
                </div>
                <div>
                  <p className='mb-1 text-[10px] uppercase tracking-wider text-white/60'>Tiền đặt cọc</p>
                  <p className='text-xl font-bold'>{formatCurrency(contract.deposit)} VND</p>
                </div>
              </div>
            </div>
          </div>

          <div className='rounded-2xl border border-slate-100 bg-white p-8 shadow-sm'>
            <div className='mb-6 flex items-center gap-3'>
              <span className='material-symbols-outlined text-blue-600'>verified_user</span>
              <h3 className='text-xs font-bold uppercase tracking-widest text-slate-400'>Người ký &amp; Xác thực</h3>
            </div>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <div className='rounded-2xl border border-slate-100 bg-slate-50 p-6'>
                <h4 className='mb-4 text-xl font-extrabold text-slate-900'>
                  {contract.signer?.fullName || apartment?.owner?.fullName || '---'}
                </h4>
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-sm text-slate-500'>
                    <span className='material-symbols-outlined text-base'>call</span>
                    {contract.signer?.phone || apartment?.owner?.phone || '---'}
                  </div>
                  <div className='flex items-center gap-2 text-sm text-slate-500'>
                    <span className='material-symbols-outlined text-base'>mail</span>
                    {contract.signer?.email || apartment?.owner?.email || '---'}
                  </div>
                </div>
              </div>

              <div className='rounded-2xl border border-blue-100 bg-blue-50/50 p-6'>
                <div className='mb-4 flex items-center gap-2'>
                  <span className='material-symbols-outlined text-sm text-emerald-600'>verified</span>
                  <span className='text-[10px] font-bold uppercase tracking-wider text-emerald-600'>Chữ ký điện tử</span>
                </div>
                <div className='space-y-3'>
                  <div>
                    <label className='text-[10px] font-bold uppercase tracking-wider text-slate-400'>Thông tin</label>
                    <p className='font-semibold text-slate-900'>
                      Hợp đồng điện tử được lưu trên hệ thống Ban quản lý.
                      {contract.eSignature?.signedAt
                        ? ` Ký lúc: ${new Date(contract.eSignature.signedAt).toLocaleString('vi-VN')}`
                        : ''}
                    </p>
                  </div>
                  {contract.eSignature?.signatureHash && (
                    <div>
                      <label className='text-[10px] font-bold uppercase tracking-wider text-slate-400'>Mã băm</label>
                      <code className='mt-1 block truncate rounded-md bg-white px-3 py-1.5 text-xs'>
                        {contract.eSignature.signatureHash}
                      </code>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {contract.note && (
            <div className='rounded-2xl border border-slate-100 bg-white p-8 shadow-sm'>
              <div className='mb-4 flex items-center gap-3'>
                <span className='material-symbols-outlined text-blue-600'>description</span>
                <h3 className='text-xs font-bold uppercase tracking-widest text-slate-400'>Ghi chú</h3>
              </div>
              <div className='rounded-xl bg-slate-50 p-4'>
                <p className='italic text-slate-700'>&quot;{contract.note}&quot;</p>
              </div>
            </div>
          )}

          <div className='relative h-48 overflow-hidden rounded-2xl bg-slate-200 shadow-lg'>
            <img
              className='h-full w-full object-cover'
              src={apartment.image_url || 'https://via.placeholder.com/1200x400?text=Your+Apartment'}
              alt=''
            />
            <div className='absolute inset-0 flex items-center bg-gradient-to-r from-slate-900/80 to-transparent px-6 sm:px-12'>
              <div className='max-w-md rounded-2xl border border-white/20 bg-white/20 p-6 backdrop-blur-xl'>
                <div className='mb-2 flex items-center gap-2'>
                  <span className='material-symbols-outlined text-sm text-blue-400'>auto_awesome</span>
                  <span className='text-[10px] font-bold uppercase tracking-widest text-white'>AI Insight</span>
                </div>
                <p className='text-sm text-white'>
                  {contract.status === 'ACTIVE'
                    ? `Hợp đồng của bạn còn ${getDaysRemaining(contract.endDate)} ngày. Chúng tôi sẽ nhắc bạn gia hạn trước khi hết hạn.`
                    : 'Hợp đồng đã hết hiệu lực. Vui lòng liên hệ BQL để được hỗ trợ.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
