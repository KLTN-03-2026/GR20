/** Nút hàng bảng admin (đồng hồ / giá / chỉ số): cùng kích thước & viền */
export const ROW_ACTION_BASE =
  'inline-flex min-w-[5.75rem] items-center justify-center rounded-lg border px-3 py-1.5 text-xs font-semibold shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50'

export const ROW_ACTION_EDIT = `${ROW_ACTION_BASE} border-slate-200 bg-white text-slate-800 hover:bg-slate-50 focus:ring-slate-300`
export const ROW_ACTION_SAVE = `${ROW_ACTION_BASE} border-blue-300 bg-blue-50 text-blue-900 hover:bg-blue-100 focus:ring-blue-400`
export const ROW_ACTION_CANCEL = `${ROW_ACTION_BASE} border-slate-200 bg-white text-slate-600 hover:bg-slate-50 focus:ring-slate-300`
export const ROW_ACTION_RESTORE = `${ROW_ACTION_BASE} border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 focus:ring-emerald-400`
export const ROW_ACTION_DELETE = `${ROW_ACTION_BASE} border-red-300 bg-red-50 text-red-900 hover:bg-red-100 focus:ring-red-400`
