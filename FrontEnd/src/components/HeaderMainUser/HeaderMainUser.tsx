import { useContext, useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppContext } from 'src/contexts/app.context'

export default function HeaderMainUser() {
  const navigate = useNavigate()
  const { user, setUser } = useContext(AppContext)

  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const goNotification = () => {
    navigate('/notifications')
  }

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')

    setUser(null)
    navigate('/login', { replace: true })
  }

  const getAvatarUrl = () => {
    if (!user?.avatarUrl) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || user?.name || 'User')}&background=005ab7&color=fff`
    }

    // Lấy tên file từ đường dẫn
    const filename = user.avatarUrl.split('/').pop()
    return `http://localhost:8000/test-file/${filename}`
  }

  return (
    <header className='w-full top-0 sticky z-40 bg-surface/80 backdrop-blur-md'>
      <div className='flex justify-between items-center w-full px-6 py-4 max-w-screen-2xl mx-auto'>
        <div className='flex flex-col'>
          <h2 className='text-xl font-bold font-manrope tracking-tight text-primary'>
            Chào mừng, {user?.fullName || user?.name}
          </h2>
        </div>

        <div className='flex items-center space-x-4'>
          {/* Search */}
          <div className='hidden md:flex items-center gap-2 bg-[#f2f4f6] px-4 py-1.5 rounded-full'>
            <span className='material-symbols-outlined text-sm text-[#717786]'>search</span>

            <input
              className='bg-transparent border-none text-xl focus:ring-0 p-0 w-35 outline-none'
              placeholder='Tìm kiếm...'
              type='text'
            />
          </div>

          {/* Notification */}
          <button
            onClick={goNotification}
            className='w-10 h-10 flex items-center justify-center rounded-full 
  hover:bg-blue-50 hover:scale-110 active:scale-95
  transition-all duration-200 relative group'
          >
            <span className='material-symbols-outlined text-slate-600 group-hover:text-blue-600 transition-colors'>
              notifications
            </span>

            <span className='absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-surface'></span>
          </button>

          {/* Settings */}
          <button
            className='w-10 h-10 flex items-center justify-center rounded-full 
  hover:bg-blue-50 hover:scale-110 active:scale-95
  transition-all duration-200 relative group'
          >
            <span className='material-symbols-outlined text-slate-600 group-hover:text-blue-600 transition-colors'>
              settings
            </span>

            <span className='absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-surface'></span>
          </button>

          {/* Avatar Dropdown */}
          <div className='relative' ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className='w-10 h-10 rounded-full overflow-hidden border-2 border-secondary-container/30 
    hover:scale-110 hover:shadow-lg hover:border-blue-300
    active:scale-95 transition-all duration-200'
            >
              <img
                alt='Profile'
                src={getAvatarUrl()}
                // src={user?.avatarUrl ? `http://localhost:8000${user.avatarUrl}` : '/default-avatar.png'}
                className='w-full h-full object-cover'
              />
            </button>

            {/* Dropdown */}
            {isOpen && (
              <div className='absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200'>
                {/* Profile */}
                <Link
                  to='/profile'
                  className='flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-all duration-200 hover:pl-5 group'
                >
                  <span className='material-symbols-outlined text-slate-600 group-hover:text-blue-600 transition-colors'>
                    account_circle
                  </span>

                  <span className='text-sm font-medium text-slate-700 group-hover:text-blue-600'>Hồ sơ cá nhân</span>
                </Link>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className='w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-all duration-200 hover:pl-5 text-red-500 group'
                >
                  <span className='material-symbols-outlined group-hover:rotate-12 transition-transform'>logout</span>

                  <span className='text-sm font-semibold'>Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
