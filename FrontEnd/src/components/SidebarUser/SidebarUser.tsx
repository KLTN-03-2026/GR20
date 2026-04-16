import { Link } from 'react-router-dom'

export default function SidebarUser() {
  return (
    <aside className='hidden lg:flex flex-col p-6 space-y-8 h-screen w-64 fixed left-0 top-0 bg-surface-container-low shadow-sm z-50'>
      {/* Thay bg-surface-container-low bằng bg-gray-100 hoặc màu cụ thể */}
      <div className='flex flex-col space-y-2'>
        <div className='flex items-center space-x-3 mb-6'>
          <div className='w-10 h-10 bg-blue-900 rounded-xl flex items-center justify-center text-white'>
            <span className='material-symbols-outlined' style={{ fontVariationSettings: "'FILL' 1" }}>
              home_app_logo
            </span>
          </div>
          <div>
            <h1 className='text-xl font-extrabold text-blue-900 tracking-tight'>HomeLink AI</h1>
            {/* Thay text-primary bằng text-blue-900 */}
            <p className='text-[10px] font-medium text-teal-700 uppercase tracking-widest'>The Intelligent Sanctuary</p>
          </div>
        </div>
        <nav className='flex-1 space-y-1'>
          <Link
            className='flex items-center space-x-3 px-4 py-3 rounded-lg text-blue-900 font-bold border-l-4 border-blue-900 bg-surface hover:bg-secondary-container/20  transition-all duration-300'
            to='/'
          >
            <span className='material-symbols-outlined'>dashboard</span>
            <span className='text-sm font-manrope'>Dashboard</span>
          </Link>
          <Link
            className='flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-500 hover:text-blue-900 hover:bg-secondary-container/20  transition-all duration-300'
            to='/maintenance'
          >
            <span className='material-symbols-outlined'>build</span>
            <span className='text-sm font-manrope'>Maintenance</span>
          </Link>
          <Link
            className='flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-500 hover:text-blue-900 hover:bg-secondary-container/20  transition-all duration-300'
            to='/payments'
          >
            <span className='material-symbols-outlined'>payments</span>
            <span className='text-sm font-manrope'>Payments</span>
          </Link>
          <Link
            className='flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-500 hover:text-blue-900 hover:bg-secondary-container/20  transition-all duration-300'
            to='/access'
          >
            <span className='material-symbols-outlined'>qr_code_2</span>
            <span className='text-sm font-manrope'>Access</span>
          </Link>
          <Link
            className='flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-500 hover:text-blue-900 hover:bg-secondary-container/20  transition-all duration-300'
            to='/utilities'
          >
            <span className='material-symbols-outlined'>apartment</span>
            <span className='text-sm font-manrope'>Utilities</span>
          </Link>
          <Link
            className='flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-500 hover:text-blue-900 hover:bg-secondary-container/20  transition-all duration-300'
            to='/chat'
          >
            <span className='material-symbols-outlined'>chat_bubble</span>
            <span className='text-sm font-manrope'>Chat</span>
          </Link>
        </nav>
      </div>
      <div className='mt-auto space-y-1 pt-6 border-t border-gray-200'>
        <Link
          className='flex items-center space-x-3 px-4 py-2 rounded-lg text-slate-500 hover:text-blue-900 transition-colors hover:bg-secondary-container/20 '
          to='/settings'
        >
          <span className='material-symbols-outlined'>settings</span>
          <span className='text-sm'>Settings</span>
        </Link>
        <Link
          className='flex items-center space-x-3 px-4 py-2 rounded-lg text-slate-500 hover:text-blue-900 transition-colors hover:bg-secondary-container/20 '
          to='/support'
        >
          <span className='material-symbols-outlined'>help</span>
          <span className='text-sm'>Support</span>
        </Link>
      </div>
    </aside>
  )
}
