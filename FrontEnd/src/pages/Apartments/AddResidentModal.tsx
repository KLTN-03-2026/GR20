import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import http from 'src/utils/http';

interface AddResidentModalProps {
  apartmentId: number;
  apartmentCode: string;
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  fullName: string;
  phone: string;
  email: string;
  relationship: string;
  moveInDate: string;
}

const relationshipOptions = [
  { value: 'OWNER', label: 'Chủ hộ' },
  { value: 'FAMILY', label: 'Thành viên gia đình' },
  { value: 'TENANT', label: 'Người thuê' },
];

const initialFormData: FormData = {
  fullName: '',
  phone: '',
  email: '',
  relationship: 'FAMILY',
  moveInDate: new Date().toISOString().split('T')[0],
};

export default function AddResidentModal({ apartmentId, apartmentCode, isOpen, onClose }: AddResidentModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addMutation = useMutation({
    mutationFn: (data: any) => http.post(`/api/apartments/${apartmentId}/residents`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apartment', apartmentId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['apartments'] });
      setFormData(initialFormData);
      setErrors({});
      onClose();
    },
  });

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ tên';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^(0|\+84)[1-9][0-9]{8}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Số điện thoại không hợp lệ (VD: 0901234567)';
    }

    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Email không hợp lệ (VD: example@email.com)';
    }

    if (!formData.moveInDate) {
      newErrors.moveInDate = 'Vui lòng chọn ngày vào ở';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    addMutation.mutate({
      fullName: formData.fullName.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim() || null,
      relationship: formData.relationship,
      moveInDate: formData.moveInDate,
      status: 'ACTIVE',
    });
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400/0 via-blue-500/50 to-blue-400/0"></div>

        <div className="px-8 pt-8 pb-2">
          <div className="flex items-center justify-between mb-1">
            <nav className="flex items-center gap-2 text-slate-400 text-[10px] font-semibold tracking-widest uppercase">
              <span>{apartmentCode}</span>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <span className="text-blue-500">Thêm cư dân</span>
            </nav>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors">
              <span className="material-symbols-outlined text-slate-400 text-lg">close</span>
            </button>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Thêm cư dân mới</h2>
          <p className="text-sm text-slate-500 mt-1">Thêm thành viên vào căn hộ {apartmentCode}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-8 py-6 space-y-5">
            {/* Họ tên */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Họ và tên <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-slate-300">
                  <span className="material-symbols-outlined text-lg">person</span>
                </span>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  className={`w-full bg-slate-50 border ${errors.fullName ? 'border-red-300' : 'border-slate-200'} rounded-xl pl-10 pr-4 py-3 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all placeholder:text-slate-300`}
                  placeholder="Nguyễn Văn A"
                />
              </div>
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">warning</span>
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* SĐT + Email */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Số điện thoại <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-slate-300">
                    <span className="material-symbols-outlined text-lg">call</span>
                  </span>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className={`w-full bg-slate-50 border ${errors.phone ? 'border-red-300' : 'border-slate-200'} rounded-xl pl-10 pr-4 py-3 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all placeholder:text-slate-300`}
                    placeholder="0901234567"
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">warning</span>
                    {errors.phone}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Email</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-slate-300">
                    <span className="material-symbols-outlined text-lg">mail</span>
                  </span>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all placeholder:text-slate-300"
                    placeholder="email@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">warning</span>
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            {/* Mối quan hệ + Ngày vào */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Mối quan hệ
                </label>
                <select
                  value={formData.relationship}
                  onChange={(e) => handleChange('relationship', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                >
                  {relationshipOptions.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Ngày vào ở <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={formData.moveInDate}
                  onChange={(e) => handleChange('moveInDate', e.target.value)}
                  className={`w-full bg-slate-50 border ${errors.moveInDate ? 'border-red-300' : 'border-slate-200'} rounded-xl px-4 py-3 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all`}
                />
                {errors.moveInDate && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">warning</span>
                    {errors.moveInDate}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer - NẰM TRONG FORM */}
          <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-3 rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 rounded-full transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={addMutation.isPending}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-full shadow-lg shadow-slate-200 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {addMutation.isPending ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                  Đang thêm...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">person_add</span>
                  Thêm cư dân
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}