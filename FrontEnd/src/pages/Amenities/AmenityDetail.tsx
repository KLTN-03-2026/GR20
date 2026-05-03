import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import http from 'src/utils/http';
import { useState } from 'react';
import AmenityForm from './AmenityForm';

export default function AmenityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['amenity', id],
    queryFn: () => http.get(`/api/amenities/${id}`),
    enabled: !!id,
  });

  const amenity = data?.data?.data || null;

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

  if (!amenity) {
    return (
      <div className="ml-64 pt-24 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-slate-200 mb-4">pool</span>
          <h2 className="text-xl font-bold text-slate-700 mb-2">Không tìm thấy tiện ích</h2>
          <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 text-sm font-bold hover:underline">Quay lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className='ml-64 min-h-screen'>
      {/* Header */}
      <header className='sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-8 h-16 flex items-center'>
        <button
          onClick={() => navigate(-1)}
          className='p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all mr-4'
        >
          <span className='material-symbols-outlined'>arrow_back</span>
        </button>
        <div className='flex items-center gap-2 text-xs text-slate-400'>
          <button onClick={() => navigate('/amenities')} className='hover:text-blue-500'>
            Tiện ích
          </button>
          <span className='material-symbols-outlined text-[14px]'>chevron_right</span>
          <span className='text-slate-600 font-medium'>{amenity.name}</span>
        </div>
      </header>

      {/* Content */}
      <main className='p-8 max-w-4xl mx-auto'>
        {/* Hero Image */}
        <div className='relative h-[350px] rounded-2xl overflow-hidden shadow-lg mb-8'>
          <img
            className='w-full h-full object-cover'
            src={amenity.imageUrl || 'https://placehold.co/800x400?text=No+Image'}
            alt={amenity.name}
          />
          <div className='absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent'></div>
          <div className='absolute bottom-8 left-8 text-white'>
            <h1 className='text-4xl font-extrabold mb-2'>{amenity.name}</h1>
            <p className='text-blue-200 text-sm italic'>{amenity.location}</p>
          </div>
          {/* Status Badge */}
          <div className='absolute top-6 right-6'>
            <span
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase ${
                amenity.status === 'OPEN' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
              }`}
            >
              {amenity.status === 'OPEN' ? 'Đang hoạt động' : amenity.status === 'CLOSED' ? 'Tạm đóng' : 'Bảo trì'}
            </span>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Main Info */}
          <div className='lg:col-span-2 space-y-6'>
            <div className='bg-white rounded-2xl p-8 shadow-sm border border-slate-100'>
              <h2 className='text-lg font-bold text-slate-900 mb-4 flex items-center gap-2'>
                <span className='material-symbols-outlined text-blue-600'>info</span>
                Thông tin chung
              </h2>
              <div className='space-y-4'>
                <div>
                  <label className='text-[10px] font-bold uppercase tracking-wider text-slate-400'>Mô tả</label>
                  <p className='text-slate-700 mt-1 leading-relaxed'>{amenity.description || 'Chưa có mô tả'}</p>
                </div>
                <div>
                  <label className='text-[10px] font-bold uppercase tracking-wider text-slate-400'>Vị trí</label>
                  <div className='flex items-center gap-2 mt-1 text-slate-700'>
                    <span className='material-symbols-outlined text-blue-600'>location_on</span>
                    <span className='font-medium'>{amenity.location || '---'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reason if closed */}
            {amenity.closedReason && (
              <div className='bg-red-50 rounded-2xl p-6 border border-red-100'>
                <p className='text-xs font-bold text-red-600 uppercase tracking-wider mb-2'>Lý do đóng cửa</p>
                <p className='text-red-700 text-sm'>{amenity.closedReason}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            {/* Status */}
            <div className='bg-white rounded-2xl p-6 shadow-sm border border-slate-100'>
              <h2 className='text-lg font-bold text-slate-900 mb-4'>Trạng thái</h2>
              <div
                className={`px-4 py-3 rounded-xl text-sm font-semibold ${
                  amenity.status === 'OPEN' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                }`}
              >
                <span className='material-symbols-outlined text-sm mr-2'>
                  {amenity.status === 'OPEN' ? 'check_circle' : 'cancel'}
                </span>
                {amenity.status === 'OPEN' ? 'Đang mở cửa cho cư dân' : 'Đang tạm đóng'}
              </div>
            </div>

            {/* Hours */}
            <div className='bg-white rounded-2xl p-6 shadow-sm border border-slate-100'>
              <h2 className='text-lg font-bold text-slate-900 mb-4'>Giờ hoạt động</h2>
              <div className='flex items-center gap-2 text-slate-600'>
                <span className='material-symbols-outlined text-blue-600'>schedule</span>
                <span className='font-semibold'>{amenity.operatingHours || '---'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className='flex justify-end gap-4 mt-10 pt-6 border-t border-slate-100'>
          <button
            onClick={() => navigate(-1)}
            className='px-8 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-full transition-colors text-sm'
          >
            Quay lại
          </button>
          <button
            onClick={() => setShowForm(true)}
            className='px-8 py-3 bg-slate-800 text-white font-bold rounded-full text-sm hover:bg-slate-700 transition-colors flex items-center gap-2'
          >
            <span className='material-symbols-outlined text-lg'>edit</span>
            Chỉnh sửa
          </button>
        </div>
      </main>
      <AmenityForm
        amenityId={Number(id)}
        buildingId={amenity.buildingId}
        isOpen={showForm}
        onClose={() => setShowForm(false)}
      />
    </div>
  )
}