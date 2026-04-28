import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apartmentApi } from 'src/apis/apartment_api/apartment_api';

interface DeleteConfirmModalProps {
  apartmentId: number;
  apartmentCode: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function DeleteConfirmModal({
  apartmentId,
  apartmentCode,
  isOpen,
  onClose,
  onSuccess,
}: DeleteConfirmModalProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => apartmentApi.deleteApartment(apartmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apartments'] });
      onClose();
      onSuccess?.();
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Gradient line top */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400/0 via-red-400/40 to-red-400/0"></div>

        <div className="p-8 flex flex-col items-center text-center">
          {/* Warning Icon */}
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
            <span
              className="material-symbols-outlined text-red-500 text-4xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              warning
            </span>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-slate-900 mb-3">
            Xác nhận xóa căn hộ
          </h2>

          {/* Message */}
          <p className="text-slate-500 leading-relaxed mb-8 text-sm">
            Bạn có chắc chắn muốn xóa căn hộ{' '}
            <span className="font-bold text-slate-800">{apartmentCode}</span> không?{' '}
            Hành động này không thể hoàn tác và toàn bộ dữ liệu liên quan sẽ bị loại bỏ khỏi hệ thống.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={onClose}
              disabled={deleteMutation.isPending}
              className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 font-semibold rounded-full hover:bg-slate-200 transition-colors active:scale-95 duration-150 order-2 sm:order-1"
            >
              Hủy bỏ
            </button>
            <button
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-full shadow-lg shadow-red-200 transition-all active:scale-95 duration-150 order-1 sm:order-2 disabled:opacity-50"
            >
              {deleteMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                  Đang xóa...
                </span>
              ) : (
                'Xác nhận xóa'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
