import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import http from 'src/utils/http';

interface DeleteContractModalProps {
  contractId: number;
  contractCode: string;
  currentStatus: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteContractModal({
  contractId,
  contractCode,
  currentStatus,
  isOpen,
  onClose,
}: DeleteContractModalProps) {
  const queryClient = useQueryClient();

  const canDelete = currentStatus === 'PENDING';

  const deleteMutation = useMutation({
    mutationFn: () => http.delete(`/api/contracts/${contractId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      onClose();
    },
  });

  const getMessage = () => {
    switch (currentStatus) {
      case 'PENDING':
        return {
          title: 'Xác nhận xóa hợp đồng',
          message: (
            <p className='text-slate-500 leading-relaxed mb-8 text-sm'>
              Bạn có chắc chắn muốn xóa hợp đồng{' '}
              <span className='font-bold text-slate-800'>#{contractCode}</span> không?{' '}
              Hành động này không thể hoàn tác.
            </p>
          ),
        };
      case 'ACTIVE':
        return {
          title: 'Không thể xóa',
          message: (
            <p className='text-slate-500 leading-relaxed mb-8 text-sm'>
              Hợp đồng <span className='font-bold text-slate-800'>#{contractCode}</span> đang ở trạng thái{' '}
              <span className='font-bold text-emerald-600'>ACTIVE</span>.{' '}
              Vui lòng chấm dứt hợp đồng trước khi xóa.
            </p>
          ),
        };
      case 'EXPIRED':
        return {
          title: 'Không thể xóa',
          message: (
            <p className='text-slate-500 leading-relaxed mb-8 text-sm'>
              Hợp đồng <span className='font-bold text-slate-800'>#{contractCode}</span> đã{' '}
              <span className='font-bold text-slate-600'>hết hạn</span>.{' '}
              Hợp đồng cũ được lưu trữ để đối chiếu và báo cáo.
            </p>
          ),
        };
      case 'TERMINATED':
        return {
          title: 'Không thể xóa',
          message: (
            <p className='text-slate-500 leading-relaxed mb-8 text-sm'>
              Hợp đồng <span className='font-bold text-slate-800'>#{contractCode}</span> đã{' '}
              <span className='font-bold text-red-500'>chấm dứt</span>.{' '}
              Hợp đồng được lưu trữ làm chứng từ pháp lý.
            </p>
          ),
        };
      default:
        return {
          title: 'Không thể xóa',
          message: (
            <p className='text-slate-500 leading-relaxed mb-8 text-sm'>
              Không thể xóa hợp đồng này.
            </p>
          ),
        };
    }
  };

  const { title, message } = getMessage();

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4'>
      <div className='relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden'>
        {/* Gradient line top */}
        <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400/0 via-red-400/40 to-red-400/0'></div>

        <div className='p-8 flex flex-col items-center text-center'>
          {/* Icon */}
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${
            canDelete ? 'bg-red-50' : 'bg-slate-50'
          }`}>
            <span
              className={`material-symbols-outlined text-4xl ${
                canDelete ? 'text-red-500' : 'text-slate-300'
              }`}
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {canDelete ? 'delete' : 'info'}
            </span>
          </div>

          {/* Title */}
          <h2 className='text-xl font-bold text-slate-900 mb-3'>{title}</h2>

          {/* Message */}
          {message}

          {/* Buttons */}
          <div className='flex flex-col sm:flex-row gap-3 w-full'>
            <button
              onClick={onClose}
              className='flex-1 px-6 py-3 bg-slate-100 text-slate-600 font-semibold rounded-full hover:bg-slate-200 transition-colors active:scale-95 duration-150 order-2 sm:order-1'
            >
              {canDelete ? 'Hủy bỏ' : 'Đóng'}
            </button>
            {canDelete && (
              <button
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className='flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-full shadow-lg shadow-red-200 transition-all active:scale-95 duration-150 order-1 sm:order-2 disabled:opacity-50'
              >
                {deleteMutation.isPending ? (
                  <span className='flex items-center justify-center gap-2'>
                    <span className='material-symbols-outlined animate-spin text-sm'>sync</span>
                    Đang xóa...
                  </span>
                ) : (
                  'Xác nhận xóa'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}