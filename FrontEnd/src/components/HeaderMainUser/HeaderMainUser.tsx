import { useContext, useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppContext } from 'src/contexts/app.context'
import SearchBar from '../SearchBar/SearchBar'

type UserRole = 'ADMIN' | 'Quản lý' | 'Nhân viên' | 'Bảo vệ' | 'Người Dùng'

export default function HeaderMainUser() {
  const navigate = useNavigate()
  const { user, setUser } = useContext(AppContext)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Xác định role của user - ưu tiên roleName đầu tiên
  const getUserRole = (): UserRole => {
    if (user?.roleName) {
      return user.roleName as UserRole
    }

    if (user?.roles && user.roles.length > 0) {
      return user.roles[0] as UserRole
    }

    return 'Người Dùng'
  }
  const goNotification = () => {
    navigate('/notifications')
  }

  const goSettings = () => {
    navigate('/settings')
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
    localStorage.removeItem('homelink_chat_messages')

    setUser(null)
    navigate('/login', { replace: true })
  }

  const getAvatarUrl = () => {
    if (!user?.avatarUrl) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || user?.name || 'User')}&background=005ab7&color=fff`
    }

    // Kiểm tra nếu avatarUrl đã là URL đầy đủ
    if (user.avatarUrl.startsWith('http')) {
      return user.avatarUrl
    }

    const filename = user.avatarUrl.split('/').pop()
    return `http://localhost:8000/test-file/${filename}`
  }

  // Hiển thị icon theo role
  const getRoleIcon = () => {
    const role = getUserRole()
    switch (role) {
      case 'Người Dùng':
        return '🏠'
      case 'Bảo vệ':
        return '🛡️'
      case 'ADMIN':
        return '👑'
      case 'Quản lý':
        return '📋'
      case 'Nhân viên':
        return '👨‍💼'
      default:
        return '👤'
    }
  }

  // Hiển thị text theo role
  const getRoleText = () => {
    const role = getUserRole()
    switch (role) {
      case 'Người Dùng':
        return 'Cư dân'
      case 'Bảo vệ':
        return 'Bảo vệ'
      case 'ADMIN':
        return 'Quản trị viên'
      case 'Quản lý':
        return 'Ban quản lý'
      case 'Nhân viên':
        return 'Nhân viên'
      default:
        return role
    }
  }

  return (
    <header className='w-full top-0 sticky z-40 bg-surface/80 backdrop-blur-md'>
      <div className='flex justify-between items-center w-full px-6 py-4 max-w-screen-2xl mx-auto'>
        <div className='flex flex-col'>
          <h2 className='text-xl font-bold font-manrope tracking-tight text-primary'>
            Chào mừng, {user?.fullName || user?.name || user?.username}
          </h2>
          {/* Hiển thị role hiện tại */}
          <span className='text-xs text-slate-400 mt-0.5'>
            {getRoleIcon()} {getRoleText()}
          </span>
        </div>

        <div className='flex items-center space-x-4'>
          {/* Search Bar - Component mới */}
          <SearchBar userRole={getUserRole()} placeholder='Tìm kiếm trang, chức năng...' />

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
            <span className='absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white'></span>
          </button>

          {/* Settings */}
          <button
            onClick={goSettings}
            className='w-10 h-10 flex items-center justify-center rounded-full 
              hover:bg-blue-50 hover:scale-110 active:scale-95
              transition-all duration-200 relative group'
          >
            <span className='material-symbols-outlined text-slate-600 group-hover:text-blue-600 transition-colors'>
              settings
            </span>
          </button>

          {/* Avatar Dropdown */}
          <div className='relative' ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className='w-10 h-10 rounded-full overflow-hidden border-2 border-slate-200 
                hover:scale-110 hover:shadow-lg hover:border-blue-300
                active:scale-95 transition-all duration-200'
            >
              <img
                alt='Profile'
                src={getAvatarUrl()}
                className='w-full h-full object-cover'
                onError={(e) => {
                  // Fallback nếu ảnh lỗi
                  const target = e.target as HTMLImageElement
                  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || user?.name || 'User')}&background=005ab7&color=fff`
                }}
              />
            </button>

            {/* Dropdown */}
            {isOpen && (
              <div className='absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200'>
                <Link
                  to='/profile'
                  className='flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-all duration-200 hover:pl-5 group'
                  onClick={() => setIsOpen(false)}
                >
                  <span className='material-symbols-outlined text-slate-600 group-hover:text-blue-600 transition-colors'>
                    account_circle
                  </span>
                  <span className='text-sm font-medium text-slate-700 group-hover:text-blue-600'>Hồ sơ cá nhân</span>
                </Link>

                <div className='border-t border-slate-100 my-1'></div>

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
