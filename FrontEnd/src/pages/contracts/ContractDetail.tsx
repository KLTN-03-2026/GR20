import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import http from 'src/utils/http';
import TerminateContractModal from './TerminateContractModal';
import ContractForm from './ContractForm'; 

export default function ContractDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const contractsListPath = pathname.startsWith('/admin') ? '/admin/contracts' : '/contracts';
  const [showTerminate, setShowTerminate] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['contract', id],
    queryFn: () => http.get(`/api/contracts/${id}`),
    enabled: !!id,
  });

  const contract = data?.data?.data || null;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '---';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount || 0);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-100 text-amber-700'; 
      case 'ACTIVE': return 'bg-emerald-100 text-emerald-700';
      case 'EXPIRED': return 'bg-slate-100 text-slate-600';
      case 'TERMINATED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getMonthsDiff = (start: string, end: string) => {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24 * 30));
  };

  if (isLoading) {
    return (
      <div className="ml-64 pt-24 flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-3 text-slate-400">
          <span className="material-symbols-outlined animate-spin">sync</span>
          <span className="text-sm">Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="ml-64 pt-24 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">error_outline</span>
          <p className="text-slate-500 font-semibold">Không tìm thấy hợp đồng</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 text-sm font-bold hover:underline">Quay lại</button>
        </div>
      </div>
    );
  }

  const months = getMonthsDiff(contract.startDate, contract.endDate);
  const progressPercent = Math.min(100, Math.round((months / 12) * 100));

  return (
    <div className='ml-64 min-h-screen'>
      {/* Top Header */}
      <header className='sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-8 h-16 flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <button
            onClick={() => navigate(-1)}
            className='p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all'
          >
            <span className='material-symbols-outlined'>arrow_back</span>
          </button>
          <div className='flex items-center gap-2 text-xs text-slate-400'>
            <button type='button' onClick={() => navigate(contractsListPath)} className='hover:text-blue-500'>
              Hợp đồng
            </button>
            <span className='material-symbols-outlined text-[14px]'>chevron_right</span>
            <span className='text-slate-600 font-medium'>Chi tiết #{contract.id}</span>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <div className='h-8 w-8 rounded-full bg-slate-200 overflow-hidden'>
            <img className='w-full h-full object-cover' src='https://via.placeholder.com/32' alt='Avatar' />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className='p-10 max-w-5xl mx-auto'>
        {/* Page Header */}
        <div className='flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10'>
          <div>
            <h1 className='text-3xl font-bold text-slate-900 flex items-center gap-3'>
              Chi tiết hợp đồng
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(contract.status)}`}>
                {contract.status}
              </span>
            </h1>
            <p className='text-slate-500 text-sm mt-1'>Hợp đồng #{contract.id}</p>
          </div>
          <div className='flex flex-wrap gap-2'>
            {(contract.status === 'PENDING' || contract.status === 'ACTIVE') && (
              <button
                onClick={() => setShowForm(true)}
                className='px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors flex items-center gap-1.5'
              >
                <span className='material-symbols-outlined text-lg'>edit</span>
                Chỉnh sửa
              </button>
            )}
            <button
              onClick={() => setShowTerminate(true)}
              className='px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-full hover:bg-red-50 transition-colors flex items-center gap-1.5'
            >
              <span className='material-symbols-outlined text-lg'>cancel</span>
              Chấm dứt
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Left - Apartment Info */}
          <div className='lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden'>
            <div className='relative h-48 bg-gradient-to-br from-blue-500 to-blue-700 flex items-end p-6'>
              <div className='text-white'>
                <p className='text-xs font-bold uppercase tracking-wider text-blue-100 mb-1'>Căn hộ</p>
                <h2 className='text-2xl font-bold'>{contract.apartment?.apartmentNumber || contract.apartmentCode}</h2>
                <p className='text-sm text-blue-100'>{contract.apartment?.buildingName || '---'}</p>
              </div>
            </div>
            <div className='p-6'>
              <div className='grid grid-cols-2 gap-4 text-sm'>
                <div>
                  <p className='text-slate-400 text-xs uppercase font-semibold mb-1'>Loại hợp đồng</p>
                  <p className='font-bold text-slate-800'>{contract.contractType}</p>
                </div>
                <div>
                  <p className='text-slate-400 text-xs uppercase font-semibold mb-1'>Trạng thái</p>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusBadge(contract.status)}`}>
                    {contract.status}
                  </span>
                </div>
                <div>
                  <p className='text-slate-400 text-xs uppercase font-semibold mb-1'>Ngày bắt đầu</p>
                  <p className='font-semibold text-slate-700'>{formatDate(contract.startDate)}</p>
                </div>
                <div>
                  <p className='text-slate-400 text-xs uppercase font-semibold mb-1'>Ngày kết thúc</p>
                  <p className='font-semibold text-slate-700'>{formatDate(contract.endDate)}</p>
                </div>
              </div>

              {/* Progress */}
              <div className='mt-6 pt-6 border-t border-slate-100'>
                <div className='flex justify-between text-xs font-medium text-slate-500 mb-2'>
                  <span>Thời hạn</span>
                  <span>{months} Tháng</span>
                </div>
                <div className='w-full bg-slate-100 h-2 rounded-full overflow-hidden'>
                  <div className='h-full bg-blue-500 rounded-full' style={{ width: `${progressPercent}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Financial */}
          <div className='space-y-6'>
            <div className='bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl p-6 border border-blue-100/50'>
              <p className='text-xs font-bold text-slate-400 uppercase tracking-wider mb-4'>Tài chính</p>
              <div className='mb-4'>
                <p className='text-xs text-slate-400 mb-1'>Tiền thuê (tháng) - mua</p>
                <p className='text-3xl font-bold text-slate-900'>
                  {formatCurrency(contract.monthlyRent)} <span className='text-sm font-medium text-slate-400'>VND</span>
                </p>
              </div>
              <div className='pt-4 border-t border-blue-100/30'>
                <p className='text-xs text-slate-400 mb-1'>Tiền đặt cọc</p>
                <p className='text-xl font-bold text-slate-800'>
                  {formatCurrency(contract.deposit)} <span className='text-xs font-medium text-slate-400'>VND</span>
                </p>
              </div>
            </div>

            {/* Signer */}
            {contract.signer && (
              <div className='bg-white rounded-2xl p-6 border border-slate-100 shadow-sm'>
                <p className='text-xs font-bold text-slate-400 uppercase tracking-wider mb-4'>Người ký</p>
                <div className='flex items-center gap-3'>
                  <div className='w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-sm font-bold text-white'>
                    {contract.signer.fullName
                      ?.split(' ')
                      .map((n: string) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div>
                    <p className='font-bold text-slate-800'>{contract.signer.fullName}</p>
                    <p className='text-xs text-slate-400'>{contract.signer.email}</p>
                  </div>
                </div>
                <div className='mt-4 space-y-2 text-sm'>
                  <div className='flex items-center gap-2 text-slate-500'>
                    <span className='material-symbols-outlined text-base'>call</span>
                    {contract.signer.phone}
                  </div>
                  <div className='flex items-center gap-2 text-slate-500'>
                    <span className='material-symbols-outlined text-base'>mail</span>
                    {contract.signer.email}
                  </div>
                </div>
              </div>
            )}

            {/* E-Signature */}
            {contract.eSignature && (
              <div className='bg-white rounded-2xl p-6 border border-slate-100 shadow-sm'>
                <p className='text-xs font-bold text-slate-400 uppercase tracking-wider mb-3'>Chữ ký điện tử</p>
                <code className='block p-3 bg-slate-50 rounded-lg text-xs text-slate-600 break-all'>
                  {contract.eSignature.signatureHash}
                </code>
                <p className='text-xs text-slate-400 mt-2'>Ký lúc: {formatDate(contract.eSignature.signedAt)}</p>
                <div className='flex items-center gap-1.5 mt-1 text-emerald-600'>
                  <span className='material-symbols-outlined text-sm'>verified</span>
                  <span className='text-xs font-bold uppercase'>Hợp lệ</span>
                </div>
              </div>
            )}

            {/* Note */}
            {contract.note && (
              <div className='bg-amber-50 rounded-2xl p-6 border border-amber-100'>
                <p className='text-xs font-bold text-amber-600 uppercase tracking-wider mb-2'>Ghi chú</p>
                <p className='text-sm text-slate-700'>{contract.note}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className='mt-10 pt-6 border-t border-slate-100 flex justify-between text-xs text-slate-400'>
          <span>
            Hợp đồng ID: {contract.id} • Cập nhật: {formatDate(contract.updatedAt)}
          </span>
          <span>© 2026 Homelink AI</span>
        </div>
      </div>

      <TerminateContractModal
        contractId={Number(id)}
        contractCode={contract.id.toString()}
        isOpen={showTerminate}
        onClose={() => setShowTerminate(false)}
      />

      <ContractForm
        contractId={Number(id)}
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        currentStatus={contract?.status}
      />
    </div>
  )
}