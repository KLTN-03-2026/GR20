import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import http from 'src/utils/http'

export default function MyApartment() {
  const navigate = useNavigate()

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '---'
    return new Date(dateStr).toLocaleDateString('vi-VN')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount || 0)
  }

  const { data, isLoading } = useQuery({
    queryKey: ['myApartment'],
    queryFn: () => http.get('/api/apartments/my')
  })

  const apartment = data?.data?.data ?? null

  const getInitials = (name: string) => {
    if (!name) return ''
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (isLoading) {
    return (
      <div className='flex min-h-[40vh] items-center justify-center text-slate-400'>
        <span className='material-symbols-outlined animate-spin'>sync</span>
        <span className='ml-2 text-sm'>Đang tải dữ liệu...</span>
      </div>
    )
  }

  if (!apartment) {
    return (
      <div className='flex min-h-[40vh] flex-col items-center justify-center px-4 text-center'>
        <span className='material-symbols-outlined mb-4 text-5xl text-slate-200'>home_work</span>
        <h2 className='mb-2 text-xl font-bold text-slate-700'>Chưa có căn hộ</h2>
        <p className='text-sm text-slate-400'>Bạn chưa được gán vào căn hộ nào</p>
      </div>
    )
  }

  const currentContract = apartment.currentContract

  return (
    <div className='pb-8'>
      <div className='mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-start'>
        <div>
          <nav className='mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400'>
            <Link to='/' className='hover:text-blue-500'>
              Trang chủ
            </Link>
            <span className='material-symbols-outlined text-[14px]'>chevron_right</span>
            <span className='text-slate-600'>Chi tiết căn hộ cá nhân</span>
          </nav>
          <h1 className='mb-2 text-3xl font-bold text-slate-900 sm:text-4xl'>Căn hộ của tôi</h1>
          <p className='max-w-xl text-sm leading-relaxed text-slate-500'>
            Xem thông tin hợp đồng, thành viên trong căn hộ và các tiện ích dành riêng cho bạn.
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-8 lg:grid-cols-12'>
        <div className='space-y-8 lg:col-span-8'>
          <div className='relative aspect-[16/9] overflow-hidden rounded-3xl bg-slate-200 shadow-lg'>
            <img
              className='h-full w-full object-cover'
              src={apartment.image_url || 'https://placehold.co/800x450?text=No+Image'}
              alt={apartment.apartment_code}
            />
          </div>

          <section className='rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8'>
            <h3 className='mb-6 text-xl font-bold text-slate-900'>Thành viên trong hộ</h3>
            <div className='space-y-4'>
              {apartment.residents?.length > 0 ? (
                apartment.residents.map((resident: { id: string; fullName: string; relationship: string; moveInDate: string }) => (
                  <div
                    key={resident.id}
                    className='flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-colors hover:bg-slate-100'
                  >
                    <div className='flex items-center gap-4'>
                      <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-600'>
                        {getInitials(resident.fullName)}
                      </div>
                      <div>
                        <h4 className='font-bold text-slate-900'>{resident.fullName}</h4>
                        <p className='text-xs text-slate-500'>
                          {resident.relationship === 'OWNER' ? 'Chủ hộ (Bạn)' : 'Thành viên'}
                          {resident.moveInDate && ` • Ở từ ${formatDate(resident.moveInDate)}`}
                        </p>
                      </div>
                    </div>
                    <span className='rounded-full bg-blue-100 px-3 py-1 text-[10px] font-bold uppercase text-blue-700'>Đã xác minh</span>
                  </div>
                ))
              ) : (
                <p className='py-8 text-center text-slate-400'>Chưa có thành viên</p>
              )}
            </div>
          </section>
        </div>

        <div className='space-y-6 lg:col-span-4'>
          <section className='rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8'>
            <div className='mb-8 flex items-center gap-2'>
              <span className='material-symbols-outlined text-slate-400'>info</span>
              <h3 className='text-xs font-bold uppercase tracking-widest text-slate-400'>Thông tin căn hộ</h3>
            </div>
            <div className='grid grid-cols-2 gap-x-4 gap-y-10'>
              <div>
                <span className='mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400'>Số phòng</span>
                <p className='text-xl font-bold text-slate-900'>{apartment.apartment_code}</p>
              </div>
              <div>
                <span className='mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400'>Tòa nhà</span>
                <p className='text-xl font-bold text-slate-900'>{apartment.building_name}</p>
              </div>
              <div>
                <span className='mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400'>Tầng</span>
                <p className='text-xl font-bold text-slate-900'>{apartment.floor_number}</p>
              </div>
              <div>
                <span className='mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400'>Diện tích</span>
                <p className='text-xl font-bold text-slate-900'>{apartment.area} m²</p>
              </div>
              <div>
                <span className='mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400'>Phòng ngủ</span>
                <div className='flex items-center gap-2'>
                  <p className='text-xl font-bold text-slate-900'>{String(apartment.bedrooms).padStart(2, '0')}</p>
                  <span className='material-symbols-outlined text-slate-300'>bed</span>
                </div>
              </div>
              <div>
                <span className='mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400'>Phòng tắm</span>
                <div className='flex items-center gap-2'>
                  <p className='text-xl font-bold text-slate-900'>{String(apartment.bathrooms).padStart(2, '0')}</p>
                  <span className='material-symbols-outlined text-slate-300'>bathtub</span>
                </div>
              </div>
            </div>
          </section>

          <section className='rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8'>
            <div className='mb-6 flex gap-4'>
              <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600'>
                <span className='material-symbols-outlined'>description</span>
              </div>
              <div>
                <span className='mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-400'>Hợp đồng</span>
                <h4 className='text-xl font-bold text-slate-900'>Thông tin hợp đồng</h4>
                <p className='mt-1 text-xs text-slate-400'>Xem chi tiết hợp đồng thuê/mua căn hộ</p>
              </div>
            </div>

            {currentContract ? (
              <>
                <div className='mb-6 space-y-3'>
                  <div className='flex justify-between rounded-xl bg-slate-50 p-3'>
                    <span className='text-sm text-slate-500'>Loại</span>
                    <span className='text-sm font-bold text-slate-800'>{currentContract.contractType}</span>
                  </div>
                  <div className='flex justify-between rounded-xl bg-slate-50 p-3'>
                    <span className='text-sm text-slate-500'>Trạng thái</span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        currentContract.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {currentContract.status}
                    </span>
                  </div>
                  <div className='flex justify-between rounded-xl bg-slate-50 p-3'>
                    <span className='text-sm text-slate-500'>Tiền thuê/tháng</span>
                    <span className='text-sm font-bold text-slate-800'>{formatCurrency(currentContract.monthlyRent)} VND</span>
                  </div>
                </div>
                <button
                  type='button'
                  onClick={() => navigate('/my-contract')}
                  className='flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 font-bold text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700'
                >
                  <span className='material-symbols-outlined'>visibility</span>
                  Xem chi tiết hợp đồng
                </button>
              </>
            ) : (
              <p className='py-4 text-center text-sm text-slate-400'>Chưa có hợp đồng</p>
            )}
          </section>

          <Link
            to='/maintenance'
            className='flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 text-slate-600 transition-colors hover:bg-slate-50'
          >
            <div className='flex items-center gap-3 font-bold'>
              <span className='material-symbols-outlined'>warning</span>
              <span>Báo cáo sự cố / bảo trì</span>
            </div>
            <span className='material-symbols-outlined text-slate-300'>chevron_right</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
