import React from 'react'

export default function SidebarProtect() {
  return (
    <aside className='hidden lg:flex flex-col h-screen w-64 fixed left-0 top-0 bg-white dark:bg-slate-950 shadow-2xl shadow-blue-900/5 z-50 p-4 space-y-4'>
      <div className='px-2 py-4'>
        <span className='text-lg font-black text-blue-700 tracking-tighter'>Homelink AI Security</span>
      </div>
      <div className='flex items-center space-x-3 px-2 pb-6'>
        <div className='w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center overflow-hidden'>
          <img
            alt='Security Guard Identification'
            className='w-full h-full object-cover'
            src='https://lh3.googleusercontent.com/aida-public/AB6AXuBXVPiosIDYlFWm89IzH3ybG-UFvXln53igSYaQY5AomsqswsWB1wKnLWU6GcnSTkBzQicyFTD-NIMD409zfnfPfd7JGyylmicBfuR6f8zxE2QYO49Lawv-Lymui1jzTKw7El6sQMS6v72q1C4LU34LC2G5et4McIq4YQ5kCsFYdnCvCKldU4JQ-6zQWtogW0y1oTjolhPH7no5c1fS71sW_kPQfTvn0nn8EEi9BBgadUXZLs0HC0oJ9TI95w8kGqfSpz2k_uKA4FDP'
          />
        </div>
        <div>
          <p className='font-manrope text-sm font-bold tracking-tight text-on-surface'>Officer Miller</p>
          <p className='font-manrope text-[10px] uppercase tracking-widest text-on-surface-variant'>
            North Gate Station
          </p>
        </div>
      </div>
      <nav className='flex-1 space-y-2'>
        <a
          className='flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-bold rounded-lg transition-all scale-95 duration-150'
          href='#'
        >
          <span className='material-symbols-outlined'>dashboard</span>
          <span className='font-manrope text-sm font-medium uppercase tracking-widest'>Dashboard</span>
        </a>
        <a
          className='flex items-center space-x-3 p-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200'
          href='#'
        >
          <span className='material-symbols-outlined'>qr_code_scanner</span>
          <span className='font-manrope text-sm font-medium uppercase tracking-widest'>QR Scanner</span>
        </a>
        <a
          className='flex items-center space-x-3 p-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200'
          href='#'
        >
          <span className='material-symbols-outlined'>history</span>
          <span className='font-manrope text-sm font-medium uppercase tracking-widest'>Access History</span>
        </a>
        <a
          className='flex items-center space-x-3 p-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200'
          href='#'
        >
          <span className='material-symbols-outlined'>person_search</span>
          <span className='font-manrope text-sm font-medium uppercase tracking-widest'>Resident Lookup</span>
        </a>
        <a
          className='flex items-center space-x-3 p-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200'
          href='#'
        >
          <span className='material-symbols-outlined'>report_problem</span>
          <span className='font-manrope text-sm font-medium uppercase tracking-widest'>Incident Report</span>
        </a>
      </nav>
      <button className='mt-auto w-full py-3 px-4 bg-error text-on-error font-bold rounded-full text-xs uppercase tracking-widest active:opacity-80 transition-opacity'>
        Emergency Alert
      </button>
      <div className='pt-4 border-t border-slate-100 dark:border-slate-800'>
        <a
          className='flex items-center gap-3 px-2 py-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-all text-xs font-bold uppercase tracking-widest'
          href='#'
        >
          <span className='material-symbols-outlined text-lg'>help_outline</span>
          <span>Support</span>
        </a>
        <a
          className='flex items-center gap-3 px-2 py-2 text-slate-500 dark:text-slate-400 hover:text-red-500 transition-all text-xs font-bold uppercase tracking-widest'
          href='#'
        >
          <span className='material-symbols-outlined text-lg'>logout</span>
          <span>Logout</span>
        </a>
      </div>
    </aside>
  )
}
