import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useCallback, useContext } from 'react'
import { AppContext } from 'src/contexts/app.context'
import { ADMIN_NAV_ITEMS } from 'src/constants/adminSidebarNav'
import { clearLS } from 'src/utils/auth'

type Props = {
  collapsed?: boolean
  onToggle?: () => void
}

/** Active state khớp cả các alias route cũ (/roles, /users-test). */
function isSidebarItemActive(pathname: string, to: string) {
  if (to === '/admin') return pathname === '/admin'
  if (to === '/admin/roles') return pathname.startsWith('/admin/roles') || pathname === '/roles'
  if (to === '/admin/users') return pathname.startsWith('/admin/users') || pathname === '/users-test'
  return pathname === to || pathname.startsWith(`${to}/`)
}

export default function SidebarProtect({ collapsed = false, onToggle }: Props) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, reset } = useContext(AppContext)

  const displayName = user?.fullName || user?.name || 'Admin'
  const roleLine = user?.roles?.join(', ') || 'Workspace'

  const handleLogout = useCallback(() => {
    clearLS()
    reset()
    navigate('/login')
  }, [navigate, reset])

  return (
    <aside
      className={`hidden lg:flex flex-col h-screen fixed left-0 top-0 bg-white dark:bg-slate-950 shadow-2xl shadow-blue-900/5 z-50 p-4 space-y-4 transition-all duration-200 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className='flex items-center justify-between px-2 py-2'>
        {!collapsed && (
          <div>
            <span className='text-[10px] font-bold uppercase tracking-widest text-blue-700'>Administration</span>
            <span className='block text-lg font-black text-blue-700 tracking-tighter'>Homelink</span>
          </div>
        )}
        <button
          type='button'
          onClick={onToggle}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition hover:bg-slate-200 ${collapsed ? 'mx-auto' : 'ml-auto'}`}
          title={collapsed ? 'Mở sidebar' : 'Thu gọn sidebar'}
        >
          <span className='material-symbols-outlined'>{collapsed ? 'chevron_right' : 'chevron_left'}</span>
        </button>
      </div>

      {!collapsed && (
        <div className='flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-2 py-2 dark:bg-slate-900/80 dark:border-slate-800'>
          <div className='flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary-container'>
            <span className='material-symbols-outlined text-on-surface'>manage_accounts</span>
          </div>
          <div className='min-w-0'>
            <p className='truncate font-manrope text-sm font-bold tracking-tight text-on-surface'>{displayName}</p>
            <p className='truncate font-manrope text-[10px] uppercase tracking-widest text-on-surface-variant'>
              {roleLine}
            </p>
          </div>
        </div>
      )}

      <nav className='flex flex-1 flex-col space-y-1 overflow-y-auto pr-1'>
        {!collapsed && (
          <p className='px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400'>Menu admin</p>
        )}
        {ADMIN_NAV_ITEMS.map((item, index) => {
          const active = isSidebarItemActive(pathname, item.to)
          const showBillingHeading =
            !collapsed && item.group === 'billing' && (index === 0 || ADMIN_NAV_ITEMS[index - 1]?.group !== 'billing')
          const showUtilityHeading =
            !collapsed && item.group === 'utility' && (index === 0 || ADMIN_NAV_ITEMS[index - 1]?.group !== 'utility')

          return (
            <div key={item.to}>
              {showBillingHeading && (
                <div className='px-3 pb-1 pt-2'>
                  <p className='text-[10px] font-bold uppercase tracking-widest text-slate-400'>Billing &amp; Finance</p>
                </div>
              )}
              {showUtilityHeading && (
                <div className='px-3 pb-1 pt-2'>
                  <p className='text-[10px] font-bold uppercase tracking-widest text-slate-400'>Utilities</p>
                </div>
              )}
              <NavLink
                to={item.to}
                title={item.description}
                className={`flex items-center rounded-lg py-3 transition-all duration-200 ${
                  collapsed ? 'justify-center px-0' : item.group ? 'space-x-3 pl-8 pr-3' : 'space-x-3 px-3'
                } ${
                  active
                    ? 'scale-[0.98] bg-blue-50 font-bold text-blue-700 dark:bg-blue-900/25 dark:text-blue-200 shadow-sm'
                    : 'font-manrope font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                <span className='material-symbols-outlined text-[22px] shrink-0' aria-hidden>
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className='text-sm uppercase tracking-widest leading-snug'>{item.label}</span>
                )}
              </NavLink>
            </div>
          )
        })}
      </nav>

      {!collapsed && (
        <button
          type='button'
          className='mt-auto w-full rounded-full bg-error py-3 px-4 text-xs font-bold uppercase tracking-widest text-on-error transition-opacity active:opacity-80'
        >
          Emergency Alert
        </button>
      )}
      <div className='border-t border-slate-100 pt-4 dark:border-slate-800'>
        <NavLink
          to='/'
          title='Trang chủ'
          className={`flex items-center rounded-lg px-2 py-2 text-xs font-bold uppercase tracking-widest text-slate-500 transition hover:bg-slate-100 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-800 ${
            collapsed ? 'justify-center' : 'gap-3'
          }`}
        >
          <span className='material-symbols-outlined text-lg'>home</span>
          {!collapsed && <span>Trang chủ</span>}
        </NavLink>
        <button
          type='button'
          onClick={handleLogout}
          className={`flex w-full items-center rounded-lg px-2 py-2 text-xs font-bold uppercase tracking-widest text-slate-500 transition hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/30 ${
            collapsed ? 'justify-center' : 'gap-3'
          }`}
        >
          <span className='material-symbols-outlined text-lg'>logout</span>
          {!collapsed && <span>Đăng xuất</span>}
        </button>
      </div>
    </aside>
  )
}
