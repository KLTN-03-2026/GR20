import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface AIAssistantWidgetProps {
  occupancyRate?: number
  expiringContracts?: number
  analyticsPath?: string
}

export default function AIAssistantWidget({
  occupancyRate = 0,
  expiringContracts = 0,
  analyticsPath = '/admin'
}: AIAssistantWidgetProps) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  return (
    <div className='fixed bottom-32 right-5 z-40 flex flex-col items-end gap-3 pb-[env(safe-area-inset-bottom)] sm:right-8'>
      {open ? (
        <div className='w-[min(20rem,calc(100vw-2rem))] transition-opacity duration-200'>
          <div className='relative overflow-hidden rounded-3xl border border-white/60 bg-white/75 p-5 shadow-xl shadow-blue-950/15 backdrop-blur-xl'>
            <div className='pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-blue-400/25 blur-3xl' />
            <div className='pointer-events-none absolute bottom-0 left-0 h-28 w-28 rounded-full bg-indigo-500/10 blur-2xl' />

            <div className='relative z-10 mb-4 flex items-start gap-4'>
              <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-600/35'>
                <span
                  className='material-symbols-outlined text-[26px] text-white'
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  insights
                </span>
              </div>
              <div className='min-w-0 flex-1 pt-0.5'>
                <h4 className='text-base font-extrabold tracking-tight text-slate-900'>Homelink AI Insight</h4>
                <p className='mt-1 text-xs leading-relaxed text-slate-600'>
                  Trợ lý phân tích tỉ lệ lấp đầy và hợp đồng sắp hết hạn theo dữ liệu hệ thống — tương tự bảng điều khiển GR20_1.
                </p>
              </div>
              <button
                type='button'
                onClick={() => setOpen(false)}
                className='-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700'
                aria-label='Thu gọn trợ lý AI'
              >
                <span className='material-symbols-outlined text-xl'>close</span>
              </button>
            </div>

            <div className='relative z-10 mb-4 space-y-2.5'>
              <div className='flex items-center justify-between rounded-2xl border border-emerald-100/80 bg-emerald-50/90 px-3.5 py-2.5'>
                <span className='text-[11px] font-semibold text-emerald-800'>Tỉ lệ lấp đầy</span>
                <span className='text-base font-bold tabular-nums text-emerald-700'>{occupancyRate}%</span>
              </div>
              <div className='flex items-center justify-between rounded-2xl border border-amber-100/80 bg-amber-50/90 px-3.5 py-2.5'>
                <span className='text-[11px] font-semibold text-amber-900'>Hợp đồng sắp hết hạn</span>
                <span className='text-base font-bold tabular-nums text-amber-800'>{expiringContracts} căn</span>
              </div>
            </div>

            <div className='relative z-10 flex gap-2'>
              <button
                type='button'
                onClick={() => {
                  navigate(analyticsPath)
                  setOpen(false)
                }}
                className='flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-2.5 text-[11px] font-bold text-white shadow-md transition-all hover:bg-slate-800 active:scale-[0.98]'
              >
                <span className='material-symbols-outlined text-base'>analytics</span>
                Xem phân tích
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <button
        type='button'
        onClick={() => setOpen((v) => !v)}
        className='group flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-700/40 ring-4 ring-white/80 transition-transform hover:scale-105 active:scale-95'
        aria-expanded={open}
        aria-label={open ? 'Đóng trợ lý AI' : 'Mở trợ lý AI Homelink'}
      >
        <span className='material-symbols-outlined text-[28px] transition-transform group-hover:rotate-12' style={{ fontVariationSettings: "'FILL' 1" }}>
          auto_awesome
        </span>
      </button>
    </div>
  )
}
