import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import http from 'src/utils/http';

interface ContractFormProps {
  contractId?: number | null;
  isOpen: boolean;
  onClose: () => void;
  currentStatus?: string;
}

interface FormData {
  apartmentId: string;
  residentId: string;
  contractType: string;
  status: string;
  startDate: string;
  endDate: string;
  monthlyRent: string;
  deposit: string;
  note: string;
}

const initialFormData: FormData = {
  apartmentId: '',
  residentId: '',
  contractType: 'RENT',
  status: 'PENDING',
  startDate: '',
  endDate: '',
  monthlyRent: '',
  deposit: '',
  note: '',
};

export default function ContractForm({ contractId, isOpen, onClose, currentStatus  }: ContractFormProps) {
  const queryClient = useQueryClient();
  const isEdit = !!contractId;
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [apartments, setApartments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch tất cả căn (form hợp đồng cần chọn được cả căn đang ở / bảo trì, không chỉ AVAILABLE)
  useEffect(() => {
    if (isOpen) {
      http
        .get('/api/apartments', { params: { page: 0, size: 5000 } })
        .then((res) => setApartments(res.data?.data || []))
        .catch(() => setApartments([]))
      http
        .get('/api/users', { params: { page: 0, size: 5000 } })
        .then((res) => setUsers(res.data?.data || []))
        .catch(() => setUsers([]))
    }
  }, [isOpen])

  // Fetch contract detail if editing
  useEffect(() => {
    if (isEdit && contractId && isOpen) {
      http.get(`/api/contracts/${contractId}`).then((res) => {
        const c = res.data?.data;
        if (c) {
          setFormData({
            apartmentId: String(c.apartment?.id ?? c.apartmentId ?? ''),
            residentId: String(c.signer?.id ?? c.residentId ?? ''),
            contractType: c.contractType || 'RENT',
            status: c.status || 'ACTIVE',
            startDate: c.startDate || '',
            endDate: c.endDate || '',
            monthlyRent: c.monthlyRent?.toString() || '',
            deposit: c.deposit?.toString() || '',
            note: c.note || '',
          });
        }
      });
    } else {
      setFormData(initialFormData);
      setErrors({});
    }
  }, [isEdit, contractId, isOpen]);

  const createMutation = useMutation({
    mutationFn: (data: any) => http.post('/api/contracts', data),
    onError: (err: any) => {
      const serverErrors = err.response?.data?.errors
      if (serverErrors) {
        setErrors(serverErrors) 
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
      onClose()
    }
  })

  const updateMutation = useMutation({
    mutationFn: (data: any) => http.put(`/api/contracts/${contractId}`, data),
    onError: (err: any) => {
      const serverErrors = err.response?.data?.errors
      if (serverErrors) {
        setErrors(serverErrors) 
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
      queryClient.invalidateQueries({ queryKey: ['contract', contractId?.toString()] })
      onClose()
    }
  })

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    
    if (!formData.apartmentId) newErrors.apartmentId = 'Vui lòng chọn căn hộ'
    if (!formData.residentId) newErrors.residentId = 'Vui lòng chọn cư dân'
    if (!formData.startDate) {
      newErrors.startDate = 'Vui lòng chọn ngày bắt đầu'
    } else {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const startDate = new Date(formData.startDate)
      if (startDate < today) {
        newErrors.startDate = 'Ngày bắt đầu không được trong quá khứ'
      }
    }
    if (!formData.endDate) newErrors.endDate = 'Vui lòng chọn ngày kết thúc'
    if (!formData.monthlyRent || Number(formData.monthlyRent) < 0) newErrors.monthlyRent = 'Tiền thuê không hợp lệ'
    if (!formData.deposit || Number(formData.deposit) < 0) newErrors.deposit = 'Tiền cọc không hợp lệ'
    if (formData.startDate && formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu'
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    if (isEdit) {
      const newStatus = formData.status

      // PENDING chỉ được chuyển sang ACTIVE
      if (currentStatus === 'PENDING' && newStatus !== 'ACTIVE') {
        setErrors({ status: 'Hợp đồng đang chờ duyệt chỉ có thể chuyển sang ACTIVE.' })
        return
      }

      // Không cho chọn EXPIRED nếu chưa đến ngày kết thúc
      if (newStatus === 'EXPIRED') {
        const endDate = new Date(formData.endDate)
        const today = new Date()
        if (endDate > today) {
          setErrors({
            status:
              'Không thể chuyển sang EXPIRED khi chưa đến ngày kết thúc. Vui lòng chọn TERMINATED nếu muốn chấm dứt sớm'
          })
          return
        }
      }

      if (currentStatus === 'ACTIVE' && newStatus === 'PENDING') {
        setErrors({ status: 'Không thể chuyển từ ACTIVE về PENDING' })
        return
      }
      if (currentStatus === 'EXPIRED' && (newStatus === 'PENDING' || newStatus === 'ACTIVE')) {
        setErrors({ status: 'Không thể chuyển từ EXPIRED về trạng thái trước đó' })
        return
      }
      if (currentStatus === 'TERMINATED' && newStatus !== 'TERMINATED') {
        setErrors({ status: 'Hợp đồng đã chấm dứt, không thể thay đổi trạng thái' })
        return
      }
    }

    const payload = {
      apartmentId: Number(formData.apartmentId),
      residentId: Number(formData.residentId),
      contractType: formData.contractType,
      status: formData.status,
      startDate: formData.startDate.split('T')[0],
      endDate: formData.endDate.split('T')[0],
      monthlyRent: Number(formData.monthlyRent),
      deposit: Number(formData.deposit),
      note: formData.note
    }

    try {
      const userCheck = await http.get(`/api/users/${formData.residentId}`)
      if (!userCheck.data?.data) {
        setErrors({ residentId: 'ID cư dân không tồn tại trong hệ thống' })
        return
      }

      if (isEdit) {
        updateMutation.mutate(payload)
      } else {
        createMutation.mutate(payload)
      }
    } catch (err) {
      setErrors({ residentId: 'Lỗi kiểm tra dữ liệu, vui lòng thử lại' })
    }
  }

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4'>
      <div className='w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col'>
        {/* Header */}
        <div className='px-8 py-6 flex justify-between items-center border-b border-slate-100'>
          <div className='flex items-center gap-4'>
            <div className='h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center'>
              <span className='material-symbols-outlined text-blue-600 text-2xl'>description</span>
            </div>
            <div>
              <h3 className='text-xl font-bold text-slate-900'>{isEdit ? 'Cập nhật hợp đồng' : 'Thêm hợp đồng mới'}</h3>
              <p className='text-sm text-slate-500'>Khởi tạo quy trình quản lý cư dân chuyên nghiệp</p>
            </div>
          </div>
          <button onClick={onClose} className='p-2 hover:bg-slate-100 rounded-full transition-colors'>
            <span className='material-symbols-outlined text-slate-400'>close</span>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className='flex-1 overflow-y-auto px-8 py-6 space-y-6'>
          {/* Căn hộ + Loại hợp đồng + Trạng thái */}
          <section>
            <h4 className='text-xs font-bold uppercase tracking-wider text-blue-600 mb-4 flex items-center gap-2'>
              <span className='w-1 h-4 bg-blue-500 rounded-full'></span>
              Thông tin căn hộ
            </h4>
            <div className='grid grid-cols-3 gap-4'>
              <div>
                <label className='block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5'>
                  Căn hộ <span className='text-red-400'>*</span>
                </label>
                <select
                  value={formData.apartmentId}
                  onChange={(e) => handleChange('apartmentId', e.target.value)}
                  disabled={isEdit}
                  className={`w-full bg-slate-50 border ${errors.apartmentId ? 'border-red-300' : 'border-slate-200'} rounded-xl px-4 py-3 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all`}
                >
                  <option value=''>Chọn căn hộ</option>
                  {apartments.map((a: any) => {
                    const code = a.apartmentCode || a.apartment_code || `Căn #${a.id}`
                    const building = a.buildingName ?? a.building_name ?? (a.buildingId != null ? `Tòa #${a.buildingId}` : '')
                    const st = a.status ? ` · ${a.status}` : ''
                    return (
                      <option key={a.id} value={String(a.id)}>
                        {[code, building].filter(Boolean).join(' — ')}
                        {st}
                      </option>
                    )
                  })}
                </select>
                {errors.apartmentId && <p className='text-red-500 text-xs mt-1'>{errors.apartmentId}</p>}
              </div>
              <div>
                <label className='block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5'>
                  Loại hợp đồng
                </label>
                <select
                  value={formData.contractType}
                  onChange={(e) => handleChange('contractType', e.target.value)}
                  className='w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all'
                >
                  <option value='RENT'>RENT - Thuê</option>
                  <option value='OWNERSHIP'>OWNERSHIP - Mua bán</option>
                  <option value='TRANSFER'>TRANSFER - Chuyển nhượng</option>
                </select>
              </div>
              <div>
                <label className='block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5'>
                  Trạng thái {!isEdit && <span className='text-slate-300'>(mặc định PENDING)</span>}
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  disabled={!isEdit}
                  className='w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50'
                >
                  <option value='PENDING'>PENDING - Chờ duyệt</option>
                  <option value='ACTIVE'>ACTIVE - Đang hoạt động</option>
                  <option value='EXPIRED'>EXPIRED - Hết hạn</option>
                  <option value='TERMINATED'>TERMINATED - Đã chấm dứt</option>
                </select>
                {errors.status && (
                  <p className='text-red-500 text-xs mt-1 flex items-center gap-1'>
                    <span className='material-symbols-outlined text-sm'>warning</span>
                    {errors.status}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Cư dân */}
          <section>
            <h4 className='text-xs font-bold uppercase tracking-wider text-blue-600 mb-4 flex items-center gap-2'>
              <span className='w-1 h-4 bg-blue-500 rounded-full'></span>
              Thông tin người thuê
            </h4>
            <div className='max-w-xl'>
              <label className='block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5'>
                Người ký / cư dân (user trong hệ thống) <span className='text-red-400'>*</span>
              </label>
              <select
                value={formData.residentId}
                onChange={(e) => handleChange('residentId', e.target.value)}
                disabled={isEdit}
                className={`w-full bg-slate-50 border ${errors.residentId ? 'border-red-300' : 'border-slate-200'} rounded-xl px-4 py-3 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all`}
              >
                <option value=''>Chọn người dùng</option>
                {users.map((u: any) => {
                  const name = u.fullName || u.full_name || u.username || `#${u.id}`
                  const login = u.username ? ` @${u.username}` : ''
                  const mail = u.email ? ` — ${u.email}` : ''
                  const role = u.roleName ? ` [${u.roleName}]` : ''
                  return (
                    <option key={u.id} value={String(u.id)}>
                      #{u.id} · {name}
                      {login}
                      {mail}
                      {role}
                    </option>
                  )
                })}
              </select>
              {errors.residentId && <p className='text-red-500 text-xs mt-1'>{errors.residentId}</p>}
            </div>
          </section>

          {/* Thời hạn & Tài chính */}
          <div className='grid grid-cols-2 gap-6'>
            <section>
              <h4 className='text-xs font-bold uppercase tracking-wider text-blue-600 mb-4 flex items-center gap-2'>
                <span className='w-1 h-4 bg-blue-500 rounded-full'></span>
                Thời hạn
              </h4>
              <div className='space-y-4'>
                <div>
                  <label className='block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5'>
                    Ngày bắt đầu <span className='text-red-400'>*</span>
                  </label>
                  <input
                    type='date'
                    value={formData.startDate}
                    onChange={(e) => handleChange('startDate', e.target.value)}
                    className={`w-full bg-slate-50 border ${errors.startDate ? 'border-red-300' : 'border-slate-200'} rounded-xl px-4 py-3 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all`}
                  />
                  {errors.startDate && <p className='text-red-500 text-xs mt-1'>{errors.startDate}</p>}
                </div>
                <div>
                  <label className='block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5'>
                    Ngày kết thúc <span className='text-red-400'>*</span>
                  </label>
                  <input
                    type='date'
                    value={formData.endDate}
                    onChange={(e) => handleChange('endDate', e.target.value)}
                    className={`w-full bg-slate-50 border ${errors.endDate ? 'border-red-300' : 'border-slate-200'} rounded-xl px-4 py-3 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all`}
                  />
                  {errors.endDate && <p className='text-red-500 text-xs mt-1'>{errors.endDate}</p>}
                </div>
              </div>
            </section>

            <section className='bg-amber-50/50 rounded-2xl p-5'>
              <h4 className='text-xs font-bold uppercase tracking-wider text-amber-700 mb-4 flex items-center gap-2'>
                <span className='w-1 h-4 bg-amber-500 rounded-full'></span>
                Tài chính
              </h4>
              <div className='space-y-4'>
                <div>
                  <label className='block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5'>
                    Tiền thuê (tháng) - Mua (VNĐ) <span className='text-red-400'>*</span>
                  </label>
                  <input
                    type='number'
                    value={formData.monthlyRent}
                    onChange={(e) => handleChange('monthlyRent', e.target.value)}
                    className={`w-full bg-white border ${errors.monthlyRent ? 'border-red-300' : 'border-slate-200'} rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all`}
                    placeholder='5.000.000'
                  />
                  {errors.monthlyRent && <p className='text-red-500 text-xs mt-1'>{errors.monthlyRent}</p>}
                </div>
                <div>
                  <label className='block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5'>
                    Tiền đặt cọc (VNĐ) <span className='text-red-400'>*</span>
                  </label>
                  <input
                    type='number'
                    value={formData.deposit}
                    onChange={(e) => handleChange('deposit', e.target.value)}
                    className={`w-full bg-white border ${errors.deposit ? 'border-red-300' : 'border-slate-200'} rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all`}
                    placeholder='10.000.000'
                  />
                  {errors.deposit && <p className='text-red-500 text-xs mt-1'>{errors.deposit}</p>}
                </div>
              </div>
            </section>
          </div>

          {/* Ghi chú */}
          <section>
            <h4 className='text-xs font-bold uppercase tracking-wider text-blue-600 mb-4 flex items-center gap-2'>
              <span className='w-1 h-4 bg-blue-500 rounded-full'></span>
              Ghi chú
            </h4>
            <textarea
              value={formData.note}
              onChange={(e) => handleChange('note', e.target.value)}
              className='w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-300'
              placeholder='Nhập ghi chú bổ sung...'
              rows={3}
            />
          </section>
        </form>

        {/* Footer */}
        <div className='px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-3'>
          <button
            type='button'
            onClick={onClose}
            className='px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200/50 rounded-full transition-colors'
          >
            Hủy
          </button>
          <button
            type='submit'
            onClick={handleSubmit}
            disabled={createMutation.isPending || updateMutation.isPending}
            className='px-8 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-full shadow-lg shadow-slate-200 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2'
          >
            {createMutation.isPending || updateMutation.isPending ? (
              <>
                <span className='material-symbols-outlined animate-spin text-sm'>sync</span> Đang lưu...
              </>
            ) : isEdit ? (
              'Cập nhật'
            ) : (
              'Tạo hợp đồng'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}