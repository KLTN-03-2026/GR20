import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import http from 'src/utils/http';

export default function MyContract() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['myApartment'],
    queryFn: () => http.get('/api/apartments/my'),
  });

  const apartment = data?.data?.data || null;
  const contract = apartment?.currentContract || null;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '---';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '---';
    return new Date(dateStr).toLocaleString('vi-VN');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount || 0);
  };

  const getDaysRemaining = (endDate: string) => {
    if (!endDate) return 0;
    return Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
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

  return (
    <div className='min-h-screen'>
      {/* Header */}
      <header className='fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl shadow-sm'>
        <div className='flex justify-between items-center px-6 py-3 ml-64'>
          <span className='text-xl font-bold text-slate-900'>HomeLink AI</span>
          <nav className='hidden md:flex items-center gap-6 text-sm font-medium'>
            <a className='text-slate-500 hover:text-slate-900 px-3 py-1 rounded-full' href='#'>
              Trang chủ
            </a>
            <a className='text-slate-500 hover:text-slate-900 px-3 py-1 rounded-full' href='#'>
              Căn hộ
            </a>
            <a className='text-blue-600 border-b-2 border-blue-600 px-3 py-1' href='#'>
              Hợp đồng
            </a>
            <a className='text-slate-500 hover:text-slate-900 px-3 py-1 rounded-full' href='#'>
              Hỗ trợ
            </a>
          </nav>
          <div className='flex items-center gap-4'>
            <button className='p-2 rounded-full hover:bg-slate-100'>
              <span className='material-symbols-outlined text-slate-500'>notifications</span>
            </button>
            <div className='h-8 w-8 rounded-full bg-slate-200 overflow-hidden'>
              <img className='h-full w-full object-cover' src='https://via.placeholder.com/32' alt='Avatar' />
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className='h-screen w-64 fixed left-0 top-0 z-40 bg-white border-r flex flex-col py-20 px-4'>
        <div className='mb-8 px-4'>
          <p className='text-xs font-semibold uppercase tracking-widest text-slate-400'>Welcome Home</p>
          <h3 className='text-slate-900 font-bold text-lg'>{apartment?.apartment_code || '---'}</h3>
        </div>
        <nav className='space-y-1'>
          <div className='flex items-center gap-3 py-3 px-4 text-slate-500 hover:text-slate-900 hover:translate-x-1 transition-transform cursor-pointer text-sm uppercase tracking-widest font-semibold'>
            <span className='material-symbols-outlined'>dashboard</span>
            <span>Dashboard</span>
          </div>
          <div className='flex items-center gap-3 py-3 px-4 text-slate-500 hover:text-slate-900 hover:translate-x-1 transition-transform cursor-pointer text-sm uppercase tracking-widest font-semibold'>
            <span className='material-symbols-outlined'>domain</span>
            <span>Căn hộ</span>
          </div>
          <div className='flex items-center gap-3 py-3 px-4 text-blue-600 bg-blue-50 rounded-r-full font-bold text-sm uppercase tracking-widest'>
            <span className='material-symbols-outlined'>description</span>
            <span>Hợp đồng</span>
          </div>
          <div className='flex items-center gap-3 py-3 px-4 text-slate-500 hover:text-slate-900 hover:translate-x-1 transition-transform cursor-pointer text-sm uppercase tracking-widest font-semibold'>
            <span className='material-symbols-outlined'>support</span>
            <span>Hỗ trợ</span>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className='ml-64 pt-20 pb-12'>
        <div className='max-w-6xl mx-auto px-8 py-8'>
          {/* Breadcrumbs */}
          <nav className='flex items-center gap-2 text-sm text-slate-400 mb-6 font-medium'>
            <a className='hover:text-blue-500 cursor-pointer'>Trang chủ</a>
            <span className='material-symbols-outlined text-xs'>chevron_right</span>
            <a className='hover:text-blue-500 cursor-pointer'>Căn hộ của tôi</a>
            <span className='material-symbols-outlined text-xs'>chevron_right</span>
            <span className='text-blue-600 font-semibold'>Chi tiết hợp đồng</span>
          </nav>

          {/* Title */}
          <div className='mb-10'>
            <h1 className='text-3xl font-extrabold text-slate-900 mb-2'>Chi tiết hợp đồng</h1>
            <div className='w-20 h-1.5 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full'></div>
          </div>

          {contract ? (
            <div className='space-y-8'>
              {/* Header Card */}
              <div className='relative overflow-hidden rounded-2xl bg-white shadow-sm p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-100'>
                <div className='flex items-center gap-6'>
                  <div className='w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center'>
                    <span className='material-symbols-outlined text-blue-600 text-3xl'>gavel</span>
                  </div>
                  <div>
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
                  className={`px-6 py-2.5 rounded-full font-bold text-xs tracking-widest uppercase flex items-center gap-2 ${
                    contract.status === 'ACTIVE'
                      ? 'bg-emerald-100 text-emerald-700'
                      : contract.status === 'EXPIRED'
                        ? 'bg-slate-100 text-slate-600'
                        : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${contract.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-current'}`}
                  ></span>
                  {contract.status}
                </span>
              </div>

              <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
                {/* Thông tin chung */}
                <div className='lg:col-span-7 bg-white rounded-2xl p-8 shadow-sm border border-slate-100'>
                  <div className='flex items-center gap-3 mb-6'>
                    <span className='material-symbols-outlined text-blue-600'>info</span>
                    <h3 className='text-sm font-bold uppercase tracking-widest text-slate-400'>Thông tin chung</h3>
                  </div>
                  <div className='grid grid-cols-2 gap-y-6 gap-x-8'>
                    <div>
                      <label className='text-[10px] uppercase tracking-wider text-slate-400 font-bold'>
                        Loại hợp đồng
                      </label>
                      <p className='text-slate-900 font-semibold text-lg'>{contract.contractType}</p>
                    </div>
                    <div>
                      <label className='text-[10px] uppercase tracking-wider text-slate-400 font-bold'>Căn hộ</label>
                      <p className='text-slate-900 font-semibold text-lg'>
                        {apartment.apartment_code}, {apartment.building_name}
                      </p>
                    </div>
                    <div>
                      <label className='text-[10px] uppercase tracking-wider text-slate-400 font-bold'>
                        Ngày bắt đầu
                      </label>
                      <div className='flex items-center gap-2 text-slate-900'>
                        <span className='material-symbols-outlined text-sm text-blue-600'>calendar_today</span>
                        <p className='font-semibold text-lg'>{formatDate(contract.startDate)}</p>
                      </div>
                    </div>
                    <div>
                      <label className='text-[10px] uppercase tracking-wider text-slate-400 font-bold'>
                        Ngày kết thúc
                      </label>
                      <div className='flex items-center gap-2 text-slate-900'>
                        <span className='material-symbols-outlined text-sm text-red-500'>event_busy</span>
                        <p className='font-semibold text-lg'>{formatDate(contract.endDate)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tài chính */}
                <div className='lg:col-span-5 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white'>
                  <div className='flex items-center gap-3 mb-6'>
                    <span className='material-symbols-outlined'>payments</span>
                    <h3 className='text-sm font-bold uppercase tracking-widest text-white/80'>Tài chính</h3>
                  </div>
                  <div className='space-y-6'>
                    <div className='pb-4 border-b border-white/10'>
                      <p className='text-[10px] uppercase tracking-wider text-white/60 mb-1'>Tiền thuê/tháng</p>
                      <p className='text-3xl font-extrabold'>{formatCurrency(contract.monthlyRent)} VND</p>
                    </div>
                    <div>
                      <p className='text-[10px] uppercase tracking-wider text-white/60 mb-1'>Tiền đặt cọc</p>
                      <p className='text-xl font-bold'>{formatCurrency(contract.deposit)} VND</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chữ ký */}
              <div className='bg-white rounded-2xl p-8 shadow-sm border border-slate-100'>
                <div className='flex items-center gap-3 mb-6'>
                  <span className='material-symbols-outlined text-blue-600'>verified_user</span>
                  <h3 className='text-sm font-bold uppercase tracking-widest text-slate-400'>
                    Người ký &amp; Xác thực
                  </h3>
                </div>
                <div className='grid grid-cols-2 gap-6'>
                  {/* Người ký - từ contract.signer hoặc apartment.owner */}
                  <div className='p-6 rounded-2xl bg-slate-50 border border-slate-100'>
                    <h4 className='text-xl font-extrabold text-slate-900 mb-4'>
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

                  {/* Chữ ký điện tử */}
                  <div className='p-6 rounded-2xl bg-blue-50/50 border border-blue-100'>
                    <div className='flex items-center gap-2 mb-4'>
                      <span className='material-symbols-outlined text-emerald-600 text-sm'>verified</span>
                      <span className='text-[10px] uppercase tracking-wider text-emerald-600 font-bold'>
                        Chữ ký điện tử
                      </span>
                    </div>
                    <div className='space-y-3'>
                      <div>
                        <label className='text-[10px] uppercase tracking-wider text-slate-400 font-bold'>
                          Thời gian ký
                        </label>
                        <p className='text-slate-900 font-semibold'>
                          {contract.eSignature?.signedAt
                            ? new Date(contract.eSignature.signedAt).toLocaleString('vi-VN')
                            : formatDate(contract.startDate)}
                        </p>
                      </div>
                      <div>
                        <label className='text-[10px] uppercase tracking-wider text-slate-400 font-bold'>Mã băm</label>
                        <code className='text-xs bg-white px-3 py-1.5 rounded-md block truncate'>
                          {contract.eSignature?.signatureHash || 'Chưa có chữ ký điện tử'}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ghi chú */}
              {contract.note && (
                <div className='bg-white rounded-2xl p-8 shadow-sm border border-slate-100'>
                  <div className='flex items-center gap-3 mb-4'>
                    <span className='material-symbols-outlined text-blue-600'>description</span>
                    <h3 className='text-sm font-bold uppercase tracking-widest text-slate-400'>Ghi chú</h3>
                  </div>
                  <div className='p-4 bg-slate-50 rounded-xl'>
                    <p className='text-slate-700 italic'>"{contract.note}"</p>
                  </div>
                </div>
              )}

              {/* AI Insight */}
              <div className='relative h-48 rounded-2xl overflow-hidden shadow-lg bg-slate-200'>
                <img
                  className='w-full h-full object-cover'
                  src={apartment.image_url || 'https://via.placeholder.com/1200x400?text=Your+Apartment'}
                  alt='Apartment'
                />
                <div className='absolute inset-0 bg-gradient-to-r from-slate-900/80 to-transparent flex items-center px-12'>
                  <div className='max-w-md bg-white/20 backdrop-blur-xl p-6 rounded-2xl border border-white/20'>
                    <div className='flex items-center gap-2 mb-2'>
                      <span className='material-symbols-outlined text-blue-400 text-sm'>auto_awesome</span>
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
          ) : (
            <div className='text-center py-20'>
              <span className='material-symbols-outlined text-5xl text-slate-200 mb-4'>description</span>
              <h2 className='text-xl font-bold text-slate-700 mb-2'>Chưa có hợp đồng</h2>
              <p className='text-slate-400'>Bạn chưa có hợp đồng nào cho căn hộ này</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}