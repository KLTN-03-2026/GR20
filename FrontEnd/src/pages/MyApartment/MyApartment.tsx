import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import http from 'src/utils/http';

export default function MyApartment() {
  const navigate = useNavigate();

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '---';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount || 0);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['myApartment'],
    queryFn: () => http.get('/api/apartments/my'),
  });

  const apartment = data?.data?.data || null;

  const getInitials = (name: string) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen ml-64">
        <div className="flex items-center gap-3 text-slate-400">
          <span className="material-symbols-outlined animate-spin">sync</span>
          <span className="text-sm">Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  if (!apartment) {
    return (
      <div className="flex items-center justify-center min-h-screen ml-64">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-slate-200 mb-4">home_work</span>
          <h2 className="text-xl font-bold text-slate-700 mb-2">Chưa có căn hộ</h2>
          <p className="text-slate-400 text-sm">Bạn chưa được gán vào căn hộ nào</p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex min-h-screen'>
      {/* Sidebar */}
      <aside className='w-64 bg-white border-r flex flex-col justify-between py-8 fixed left-0 top-16 bottom-0'>
        <div>
          <div className='px-8 mb-10'>
            <h2 className='text-xs font-bold text-blue-600 tracking-widest uppercase'>Cổng cư dân</h2>
            <p className='text-[10px] text-slate-400 mt-1'>AZURE SERENITY TIER</p>
          </div>
          <nav className='space-y-1'>
            <a className='flex items-center gap-3 px-8 py-4 text-slate-400 font-semibold hover:bg-slate-50 transition-colors text-sm' href='#'>
              <span className='material-symbols-outlined'>home</span>
              <span>TỔNG QUAN</span>
            </a>
            <a className='flex items-center gap-3 px-8 py-4 bg-blue-50 text-blue-600 border-r-4 border-blue-600 font-semibold text-sm' href='#'>
              <span className='material-symbols-outlined'>key</span>
              <span>CĂN HỘ CỦA TÔI</span>
            </a>
            <a className='flex items-center gap-3 px-8 py-4 text-slate-400 font-semibold hover:bg-slate-50 transition-colors text-sm' href='#'>
              <span className='material-symbols-outlined'>credit_card</span>
              <span>THANH TOÁN</span>
            </a>
            <a className='flex items-center gap-3 px-8 py-4 text-slate-400 font-semibold hover:bg-slate-50 transition-colors text-sm' href='#'>
              <span className='material-symbols-outlined'>chat</span>
              <span>PHẢN HỒI</span>
            </a>
            <a className='flex items-center gap-3 px-8 py-4 text-slate-400 font-semibold hover:bg-slate-50 transition-colors text-sm' href='#'>
              <span className='material-symbols-outlined'>help</span>
              <span>HỖ TRỢ</span>
            </a>
          </nav>
        </div>
        <div className='px-8 mt-auto pt-8 border-t border-slate-100'>
          <a className='flex items-center gap-3 text-slate-400 font-semibold hover:text-red-500 transition-colors text-sm' href='#'>
            <span className='material-symbols-outlined'>logout</span>
            <span>ĐĂNG XUẤT</span>
          </a>
        </div>
      </aside>

      {/* Header */}
      <header className='h-16 bg-white border-b flex items-center justify-between px-8 fixed top-0 left-0 right-0 z-40 ml-64'>
        <div className='flex items-center gap-12'>
          <span className='text-2xl font-bold text-slate-900'>HomeLink AI</span>
          <nav className='hidden md:flex items-center gap-8 text-slate-500 font-medium text-sm'>
            <a className='hover:text-blue-600 transition-colors' href='#'>Trang chủ</a>
            <a className='text-blue-600 border-b-2 border-blue-600 pb-5 translate-y-[2px]' href='#'>Căn hộ của tôi</a>
            <a className='hover:text-blue-600 transition-colors' href='#'>Tiện ích</a>
            <a className='hover:text-blue-600 transition-colors' href='#'>Hóa đơn</a>
          </nav>
        </div>
        <div className='flex items-center gap-6'>
          <button className='text-slate-500 hover:text-slate-700'>
            <span className='material-symbols-outlined'>notifications</span>
          </button>
          <button className='text-slate-500 hover:text-slate-700'>
            <span className='material-symbols-outlined'>settings</span>
          </button>
          <div className='w-10 h-10 rounded-full overflow-hidden border border-slate-200'>
            <img className='w-full h-full object-cover' src='https://placehold.co/40' alt='Avatar' />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='flex-1 ml-64 pt-24 p-10'>
        <div className='flex justify-between items-start mb-8'>
          <div>
            <nav className='text-xs font-bold text-slate-400 flex items-center gap-2 uppercase mb-4 tracking-wider'>
              <a href='#' className='hover:text-blue-500'>Trang chủ</a>
              <span className='material-symbols-outlined text-[14px]'>chevron_right</span>
              <span className='text-slate-600'>Chi tiết căn hộ cá nhân</span>
            </nav>
            <h1 className='text-4xl font-bold text-slate-900 mb-4'>Căn hộ của tôi</h1>
            <p className='text-slate-500 max-w-xl leading-relaxed text-sm'>
              Xem thông tin hợp đồng, thành viên trong căn hộ và các tiện ích dành riêng cho bạn.
            </p>
          </div>
        </div>

        <div className='grid grid-cols-12 gap-8'>
          {/* Left Column */}
          <div className='col-span-8 space-y-8'>
            {/* Hero Image */}
            <div className='relative rounded-3xl overflow-hidden aspect-[16/9] shadow-lg bg-slate-200'>
              <img
                className='w-full h-full object-cover'
                src={apartment.image_url || 'https://placehold.co/800x450?text=No+Image'}
                alt={apartment.apartment_code}
              />
            </div>

            {/* Residents */}
            <section className='bg-white rounded-3xl p-8 shadow-sm border border-slate-100'>
              <h3 className='text-xl font-bold text-slate-900 mb-6'>Thành viên trong hộ</h3>
              <div className='space-y-4'>
                {apartment.residents?.length > 0 ? (
                  apartment.residents.map((resident: any) => (
                    <div key={resident.id} className='flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-colors'>
                      <div className='flex items-center gap-4'>
                        <div className='w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold'>
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
                      <span className='px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full uppercase'>Đã xác minh</span>
                    </div>
                  ))
                ) : (
                  <p className='text-slate-400 text-center py-8'>Chưa có thành viên</p>
                )}
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className='col-span-4 space-y-6'>
            {/* Thông tin căn hộ */}
            <section className='bg-white rounded-3xl p-8 shadow-sm border border-slate-100'>
              <div className='flex items-center gap-2 mb-8'>
                <span className='material-symbols-outlined text-slate-400'>info</span>
                <h3 className='text-xs font-bold text-slate-400 uppercase tracking-widest'>Thông tin căn hộ</h3>
              </div>
              <div className='grid grid-cols-2 gap-y-10 gap-x-4'>
                <div>
                  <span className='text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1'>Số phòng</span>
                  <p className='text-xl font-bold text-slate-900'>{apartment.apartment_code}</p>
                </div>
                <div>
                  <span className='text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1'>Tòa nhà</span>
                  <p className='text-xl font-bold text-slate-900'>{apartment.building_name}</p>
                </div>
                <div>
                  <span className='text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1'>Tầng</span>
                  <p className='text-xl font-bold text-slate-900'>{apartment.floor_number}</p>
                </div>
                <div>
                  <span className='text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1'>Diện tích</span>
                  <p className='text-xl font-bold text-slate-900'>{apartment.area} m²</p>
                </div>
                <div>
                  <span className='text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1'>Phòng ngủ</span>
                  <div className='flex items-center gap-2'>
                    <p className='text-xl font-bold text-slate-900'>{String(apartment.bedrooms).padStart(2, '0')}</p>
                    <span className='material-symbols-outlined text-slate-300'>bed</span>
                  </div>
                </div>
                <div>
                  <span className='text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1'>Phòng tắm</span>
                  <div className='flex items-center gap-2'>
                    <p className='text-xl font-bold text-slate-900'>{String(apartment.bathrooms).padStart(2, '0')}</p>
                    <span className='material-symbols-outlined text-slate-300'>bathtub</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Hợp đồng */}
            <section className='bg-white rounded-3xl p-8 shadow-sm border border-slate-100'>
              <div className='flex items-start gap-4 mb-6'>
                <div className='w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-xl font-bold text-blue-600'>
                  <span className='material-symbols-outlined'>description</span>
                </div>
                <div>
                  <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1'>Hợp đồng</span>
                  <h4 className='text-xl font-bold text-slate-900'>Thông tin hợp đồng</h4>
                  <p className='text-xs text-slate-400 mt-1'>Xem chi tiết hợp đồng thuê/mua căn hộ</p>
                </div>
              </div>

              {apartment.currentContract ? (
                <>
                  <div className='space-y-3 mb-6'>
                    <div className='flex justify-between p-3 bg-slate-50 rounded-xl'>
                      <span className='text-sm text-slate-500'>Loại</span>
                      <span className='text-sm font-bold text-slate-800'>{apartment.currentContract.contractType}</span>
                    </div>
                    <div className='flex justify-between p-3 bg-slate-50 rounded-xl'>
                      <span className='text-sm text-slate-500'>Trạng thái</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${apartment.currentContract.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {apartment.currentContract.status}
                      </span>
                    </div>
                    <div className='flex justify-between p-3 bg-slate-50 rounded-xl'>
                      <span className='text-sm text-slate-500'>Tiền thuê/tháng</span>
                      <span className='text-sm font-bold text-slate-800'>{formatCurrency(apartment.currentContract.monthlyRent)} VND</span>
                    </div>
                  </div>
                  <button onClick={() => navigate('/my-contract')} className='w-full py-4 bg-blue-600 rounded-xl text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2'>
                    <span className='material-symbols-outlined'>visibility</span>
                    Xem chi tiết hợp đồng
                  </button>
                </>
              ) : (
                <p className='text-sm text-slate-400 text-center py-4'>Chưa có hợp đồng</p>
              )}
            </section>

            {/* Báo cáo sự cố */}
            <div className='space-y-4'>
              <button className='w-full flex items-center justify-between group'>
                <div className='flex items-center gap-3 text-slate-600 font-bold group-hover:text-blue-600 transition-colors'>
                  <span className='material-symbols-outlined'>warning</span>
                  <span>Báo cáo sự cố kỹ thuật</span>
                </div>
                <span className='material-symbols-outlined text-slate-300 group-hover:text-blue-600'>chevron_right</span>
              </button>
              <p className='text-[11px] text-slate-400 italic'>Lưu ý: Bạn có thể theo dõi tiến độ xử lý sự cố trong mục Phản hồi.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}