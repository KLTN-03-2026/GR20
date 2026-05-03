import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import http from 'src/utils/http';
import AmenityForm from './AmenityForm.tsx';

interface AmenityListProps {
  isResident?: boolean;
}

export default function AmenityList({ isResident = false }: AmenityListProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedBuilding, setSelectedBuilding] = useState('1');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  // Fetch buildings
  const { data: buildingData } = useQuery({
    queryKey: ['buildings'],
    queryFn: () => http.get('/api/buildings'),
  });
  const buildings = buildingData?.data?.data || [];

  // Fetch amenities
  const { data } = useQuery({
    queryKey: ['amenities', selectedBuilding, statusFilter],
    queryFn: () => {
      const params: any = { size: 50 };
      if (statusFilter) params.status = statusFilter;
      return http.get(`/api/buildings/${selectedBuilding}/amenities`, { params });
    },
    enabled: !!selectedBuilding,
  });

  const amenities = data?.data?.data || [];
  const totalItems = data?.data?.totalElements || 0;
  const activeCount = amenities.filter((a: any) => a.status === 'OPEN').length;

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => http.delete(`/api/amenities/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['amenities'] });
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    },
  });

  const getStatusBadge = (status: string, reason?: string) => {
    switch (status) {
      case 'OPEN':
        return { label: 'Hoạt động', className: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' };
      case 'CLOSED':
        return { label: 'Tạm đóng', className: 'bg-red-100 text-red-700', dot: 'bg-red-500', reason };
      case 'MAINTENANCE':
        return { label: 'Bảo trì', className: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', reason };
      default:
        return { label: status, className: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' };
    }
  };

  return (
    <div className='ml-64 min-h-screen'>
      {/* Header */}
      <header className='sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-8 h-16 flex items-center justify-between'>
        <div className='flex items-center gap-6'>
          <span className='text-xl font-bold text-slate-900'>Quản Lý Tiện Ích</span>
          <select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            className='bg-slate-100 border border-slate-200 rounded-full text-sm font-medium text-slate-600 px-4 py-2 focus:ring-2 focus:ring-blue-500/20'
          >
            {buildings.map((b: any) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className='bg-slate-100 border border-slate-200 rounded-full text-sm font-medium text-slate-600 px-4 py-2 focus:ring-2 focus:ring-blue-500/20'
          >
            <option value=''>Tất cả trạng thái</option>
            <option value='OPEN'>Đang hoạt động</option>
            <option value='CLOSED'>Tạm đóng</option>
            <option value='MAINTENANCE'>Bảo trì</option>
          </select>
        </div>
        {!isResident && (
          <button
            onClick={() => {
              setEditingId(null)
              setShowForm(true)
            }}
            className='bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 shadow-sm'
          >
            <span className='material-symbols-outlined text-lg'>add</span>
            Thêm tiện ích
          </button>
        )}
      </header>

      {/* Notification */}
      {showNotification && (
        <div className='mx-8 mt-4 flex items-center justify-between p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200'>
          <div className='flex items-center gap-3'>
            <span className='material-symbols-outlined' style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
            <p className='text-sm font-medium'>Thao tác thành công!</p>
          </div>
          <button
            onClick={() => setShowNotification(false)}
            className='text-xs font-bold uppercase px-3 py-1 hover:bg-emerald-100 rounded-lg'
          >
            Đóng
          </button>
        </div>
      )}

      {/* Stats */}
      <div className='px-8 py-6 flex gap-4'>
        <div className='bg-white rounded-xl px-6 py-3 border border-slate-100 shadow-sm'>
          <span className='text-[10px] font-bold uppercase tracking-widest text-slate-400'>Tổng tiện ích</span>
          <p className='text-2xl font-bold text-blue-600'>{totalItems}</p>
        </div>
        <div className='bg-white rounded-xl px-6 py-3 border border-slate-100 shadow-sm'>
          <span className='text-[10px] font-bold uppercase tracking-widest text-slate-400'>Đang hoạt động</span>
          <p className='text-2xl font-bold text-emerald-600'>{activeCount}</p>
        </div>
      </div>

      {/* Grid */}
      <div className='px-8 pb-8'>
        {amenities.length === 0 ? (
          <div className='text-center py-16'>
            <span className='material-symbols-outlined text-5xl text-slate-200 mb-4'>pool</span>
            <p className='text-slate-400'>Chưa có tiện ích nào</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {amenities.map((amenity: any) => {
              const statusBadge = getStatusBadge(amenity.status, amenity.closedReason)
              return (
                <div
                  key={amenity.id}
                  className='group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300'
                >
                  <div className='relative h-48 overflow-hidden bg-slate-200'>
                    <img
                      className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${amenity.status !== 'OPEN' ? 'grayscale opacity-60' : ''}`}
                      src={amenity.imageUrl || 'https://placehold.co/400x300?text=No+Image'}
                      alt={amenity.name}
                    />
                    <div className='absolute top-3 right-3'>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${statusBadge.className}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot} mr-1.5`}></span>
                        {statusBadge.label}
                      </span>
                    </div>
                  </div>
                  <div className='p-5'>
                    <div className='flex justify-between items-start mb-2'>
                      <h3 className='text-lg font-bold text-slate-900'>{amenity.name}</h3>
                      <span className='text-xs text-slate-400'>{amenity.location}</span>
                    </div>
                    <p className='text-sm text-slate-500 mb-4 line-clamp-2'>{amenity.description}</p>
                    <div className='flex items-center gap-2 text-xs text-slate-400 mb-4'>
                      <span className='material-symbols-outlined text-base'>schedule</span>
                      <span>{amenity.operatingHours || '---'}</span>
                    </div>
                    {amenity.closedReason && (
                      <div className='bg-red-50 p-3 rounded-lg mb-4'>
                        <p className='text-[10px] font-bold text-red-600 uppercase mb-1'>Lý do:</p>
                        <p className='text-xs text-red-700'>{amenity.closedReason}</p>
                      </div>
                    )}
                    <div className='flex gap-2 pt-4 border-t border-slate-50'>
                      <button
                        onClick={() => navigate(`/amenities/${amenity.id}`)}
                        className='flex-1 text-xs font-bold uppercase text-blue-600 py-2 hover:bg-blue-50 rounded-lg transition-colors'
                      >
                        Chi tiết
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(amenity.id)
                          setShowForm(true)
                        }}
                        className='p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors'
                      >
                        <span className='material-symbols-outlined text-lg'>edit</span>
                      </button>
                      {!isResident &&(
                      <button
                        onClick={() => {
                          if (window.confirm('Xóa tiện ích này?')) deleteMutation.mutate(amenity.id)
                        }}
                        className='p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                      >
                        <span className='material-symbols-outlined text-lg'>delete</span>
                      </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Form Modal */}
      <AmenityForm
        amenityId={editingId}
        buildingId={Number(selectedBuilding)}
        isOpen={showForm}
        onClose={() => {
          setShowForm(false)
          setEditingId(null)
        }}
      />
    </div>
  )
}