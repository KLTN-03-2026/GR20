import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { maintenanceRequestApi } from 'src/apis/maintenanceRequest_api/maintenanceRequest.api';

export default function AddMaintenanceRequest() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'HIGH' // Mặc định là Cao
  });
  const [errors, setErrors] = useState({
    title: '',
    description: ''
  });

  const priorities = [
    { value: 'LOW', label: 'Thấp' },
    { value: 'MEDIUM', label: 'Trung bình' },
    { value: 'HIGH', label: 'Cao' },
    { value: 'URGENT', label: 'Khẩn cấp' }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePriorityChange = (value: string) => {
    setFormData(prev => ({ ...prev, priority: value }));
  };

  const validateForm = (): boolean => {
    const newErrors = { title: '', description: '' };
    let isValid = true;

    if (!formData.title.trim()) {
      newErrors.title = 'Vui lòng nhập tiêu đề';
      isValid = false;
    } else if (formData.title.length < 5) {
      newErrors.title = 'Tiêu đề phải có ít nhất 5 ký tự';
      isValid = false;
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Vui lòng nhập mô tả chi tiết';
      isValid = false;
    } else if (formData.description.length < 10) {
      newErrors.description = 'Mô tả phải có ít nhất 10 ký tự';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại thông tin');
      return;
    }

    setLoading(true);
    try {
      const response = await maintenanceRequestApi.createMaintenanceRequest(formData);
      
      if (response.data.success) {
        toast.success('Tạo yêu cầu bảo trì thành công!');
        setTimeout(() => {
          navigate('/maintenance');
        }, 1500);
      }
    } catch (error: any) {
      console.error('Error creating request:', error);
      const message = error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityButtonClass = (priorityValue: string) => {
    const baseClass = "py-3 px-4 rounded-xl font-semibold text-sm transition-all border border-transparent";
    if (formData.priority === priorityValue) {
      switch (priorityValue) {
        case 'LOW':
          return `${baseClass} bg-green-100 text-green-800 border-green-400 shadow-md`;
        case 'MEDIUM':
          return `${baseClass} bg-yellow-100 text-yellow-800 border-yellow-400 shadow-md`;
        case 'HIGH':
          return `${baseClass} bg-orange-100 text-orange-800 border-orange-400 shadow-md`;
        case 'URGENT':
          return `${baseClass} bg-red-100 text-red-800 border-red-400 shadow-md`;
        default:
          return `${baseClass} bg-primary-container text-white shadow-lg shadow-primary-container/20`;
      }
    }
    return `${baseClass} bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest`;
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface antialiased pb-24 md:pb-0">
      <main className="pt-24 pb-12 px-4 md:px-12 max-w-5xl mx-auto">
        {/* Back Button */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/maintenance')}
            className="group flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-medium"
          >
            <span className="material-symbols-outlined text-xl group-hover:-translate-x-1 transition-transform">
              arrow_back
            </span>
            <span>Quay lại danh sách</span>
          </button>
        </div>

        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight mb-2">
            Tạo yêu cầu bảo trì
          </h1>
          <p className="text-on-surface-variant text-lg">
            Vui lòng cung cấp thông tin chi tiết về sự cố cần sửa chữa
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Canvas */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-surface-container-lowest p-6 md:p-10 rounded-[2rem] shadow-[0_32px_64px_rgba(68,93,128,0.04)]">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Title Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold tracking-widest uppercase text-on-surface-variant ml-1">
                    Tiêu đề <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="VD: Hỏng đèn chiếu sáng, Máy lạnh không hoạt động, Rò rỉ nước..."
                    className={`w-full px-5 py-4 bg-surface-container-low border-none focus:ring-2 rounded-xl text-on-surface placeholder:text-outline-variant transition-all outline-none
                      ${errors.title ? 'focus:ring-red-500 ring-2 ring-red-500' : 'focus:ring-primary/20'}`}
                    disabled={loading}
                  />
                  {errors.title && (
                    <p className="text-sm text-error ml-1">{errors.title}</p>
                  )}
                </div>

                {/* Priority Selection */}
                <div className="space-y-4">
                  <label className="block text-sm font-bold tracking-widest uppercase text-on-surface-variant ml-1">
                    Mức độ ưu tiên
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {priorities.map((priority) => (
                      <button
                        key={priority.value}
                        type="button"
                        onClick={() => handlePriorityChange(priority.value)}
                        className={getPriorityButtonClass(priority.value)}
                        disabled={loading}
                      >
                        {priority.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description Field */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end ml-1">
                    <label className="block text-sm font-bold tracking-widest uppercase text-on-surface-variant">
                      Mô tả chi tiết <span className="text-error">*</span>
                    </label>
                    <span className="text-xs font-medium text-outline">
                      {formData.description.length} / 1000 ký tự
                    </span>
                  </div>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Mô tả chi tiết về sự cố..."
                    rows={6}
                    className={`w-full px-5 py-4 bg-surface-container-low border-none focus:ring-2 rounded-xl text-on-surface placeholder:text-outline-variant transition-all outline-none resize-none custom-scrollbar
                      ${errors.description ? 'focus:ring-red-500 ring-2 ring-red-500' : 'focus:ring-primary/20'}`}
                    disabled={loading}
                  />
                  {errors.description && (
                    <p className="text-sm text-error ml-1">{errors.description}</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col md:flex-row items-center gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto px-10 py-4 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-full transition-transform active:scale-95 shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Đang gửi...
                      </span>
                    ) : (
                      'Gửi yêu cầu'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/maintenance')}
                    disabled={loading}
                    className="w-full md:w-auto px-10 py-4 bg-surface-container-low text-on-surface-variant font-bold rounded-full transition-colors hover:bg-surface-container-high active:scale-95 disabled:opacity-50"
                  >
                    Hủy bỏ
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Side Info Panels */}
          <div className="space-y-6">
            {/* Info Box */}
            <div className="bg-secondary-fixed p-8 rounded-[2rem] relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6 text-on-secondary-fixed-variant">
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    info
                  </span>
                  <h3 className="font-bold text-lg">Lưu ý</h3>
                </div>
                <ul className="space-y-5">
                  <li className="flex gap-3 items-start group">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <p className="text-sm leading-relaxed text-on-secondary-fixed-variant">
                      Yêu cầu sẽ được xử lý trong vòng 24h đối với mức độ khẩn cấp.
                    </p>
                  </li>
                  <li className="flex gap-3 items-start group">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <p className="text-sm leading-relaxed text-on-secondary-fixed-variant">
                      Bạn có thể theo dõi trạng thái yêu cầu trong danh sách.
                    </p>
                  </li>
                  <li className="flex gap-3 items-start group">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <p className="text-sm leading-relaxed text-on-secondary-fixed-variant">
                      Nhân viên sẽ liên hệ với bạn qua số điện thoại đã đăng ký.
                    </p>
                  </li>
                  <li className="flex gap-3 items-start group">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <p className="text-sm leading-relaxed text-on-secondary-fixed-variant font-medium">
                      Yêu cầu chỉ có thể sửa/xóa khi đang ở trạng thái "Đang mở".
                    </p>
                  </li>
                </ul>
              </div>
              <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
            </div>

            {/* Glass Insight Module */}
            <div className="bg-white/60 backdrop-blur-xl p-8 rounded-[2rem] border border-white/40 shadow-[0_32px_64px_rgba(68,93,128,0.04)]">
              <div className="flex items-center gap-3 mb-4 text-primary">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  auto_awesome
                </span>
                <span className="text-xs font-bold uppercase tracking-widest">AI Insights</span>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Hệ thống ghi nhận <span className="font-bold text-primary">"{formData.title || '...'}"</span>. 
                Đội ngũ kỹ thuật của chúng tôi sẽ xử lý yêu cầu của bạn trong thời gian sớm nhất.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}