import { useNavigate } from 'react-router-dom';

interface AIAssistantWidgetProps {
  occupancyRate?: number;
  expiringContracts?: number;
}

export default function AIAssistantWidget({ 
  occupancyRate = 85, 
  expiringContracts = 3 
}: AIAssistantWidgetProps) {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-6 right-6 w-64 bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 z-40 hover:shadow-2xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
          <span 
            className="material-symbols-outlined text-sm text-white" 
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            auto_awesome
          </span>
        </div>
        <div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider leading-tight">
            Trợ lý AI
          </p>
          <p className="text-[9px] text-slate-400 font-medium">Homelink Insight</p>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2.5 mb-3">
        <div className="flex items-center justify-between bg-emerald-50 rounded-lg px-3 py-2">
          <span className="text-[11px] text-emerald-700 font-medium">Tỉ lệ lấp đầy</span>
          <span className="text-sm font-bold text-emerald-700">{occupancyRate}%</span>
        </div>
        
        <div className="flex items-center justify-between bg-amber-50 rounded-lg px-3 py-2">
          <span className="text-[11px] text-amber-700 font-medium">Sắp hết hạn</span>
          <span className="text-sm font-bold text-amber-700">{expiringContracts} căn</span>
        </div>
      </div>

      {/* CTA Button */}
      <button 
        onClick={() => navigate('/analytics')}
        className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-semibold rounded-lg transition-all active:scale-95 flex items-center justify-center gap-1.5"
      >
        <span className="material-symbols-outlined text-sm">insights</span>
        Xem chi tiết phân tích
      </button>
    </div>
  );
}
