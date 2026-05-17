// src/components/SearchBar/SearchBar.tsx
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchMenuByKeyword } from 'src/config/menuConfig'

type UserRole = 'ADMIN' | 'Quản lý' | 'Nhân viên' | 'Bảo vệ' | 'Người Dùng'

interface SearchBarProps {
  userRole: UserRole // 'ADMIN' | 'Quản lý' | 'Nhân viên' | 'Bảo vệ' | 'Người Dùng'
  onClose?: () => void
  placeholder?: string
}

export default function SearchBar({ userRole, onClose, placeholder = 'Tìm kiếm trang...' }: SearchBarProps) {
  const [keyword, setKeyword] = useState('')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // Tìm kiếm khi gõ
  useEffect(() => {
    if (keyword.trim()) {
      const results = searchMenuByKeyword(keyword, userRole)
      setSuggestions(results)
      setIsOpen(true)
      setSelectedIndex(-1)
    } else {
      setSuggestions([])
      setIsOpen(false)
    }
  }, [keyword, userRole])

  // Đóng gợi ý khi click ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Xử lý chọn menu item
  const handleSelect = (path: string) => {
    navigate(path)
    setKeyword('')
    setIsOpen(false)
    setSelectedIndex(-1)
    if (onClose) onClose()
  }

  // Xử lý phím tắt
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % suggestions.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelect(suggestions[selectedIndex].path)
        } else if (suggestions.length > 0) {
          handleSelect(suggestions[0].path)
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        break
    }
  }

  // Cuộn đến item được chọn
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionsRef.current) {
      const selectedElement = suggestionsRef.current.children[selectedIndex] as HTMLElement
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex])

  return (
    <div className='relative'>
      <div className='flex items-center gap-2 bg-[#f2f4f6] px-4 py-1.5 rounded-full min-w-[280px]'>
        <span className='material-symbols-outlined text-sm text-[#717786]'>search</span>
        <input
          ref={inputRef}
          className='bg-transparent border-none text-sm focus:ring-0 p-0 flex-1 outline-none'
          placeholder={placeholder}
          type='text'
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => keyword.trim() && setIsOpen(true)}
        />
        {keyword && (
          <button
            onClick={() => {
              setKeyword('')
              setIsOpen(false)
              inputRef.current?.focus()
            }}
            className='text-gray-400 hover:text-gray-600 transition-colors'
          >
            <span className='material-symbols-outlined text-sm'>close</span>
          </button>
        )}
      </div>

      {/* Dropdown gợi ý */}
      {isOpen && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className='absolute top-full left-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200'
        >
          <div className='max-h-96 overflow-y-auto py-2'>
            {suggestions.map((item, index) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item.path)}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 
                  transition-all duration-150 text-left
                  ${index === selectedIndex ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50'}
                `}
              >
                {item.icon && (
                  <span
                    className={`material-symbols-outlined text-xl ${index === selectedIndex ? 'text-blue-600' : 'text-slate-500'}`}
                  >
                    {item.icon}
                  </span>
                )}
                <div className='flex-1'>
                  <div
                    className={`text-sm font-medium ${index === selectedIndex ? 'text-blue-600' : 'text-slate-700'}`}
                  >
                    {item.name}
                  </div>
                  {/* <div className='text-xs text-slate-400 mt-0.5 font-mono'>{item.path}</div> */}
                </div>
                <span
                  className={`material-symbols-outlined text-sm ${index === selectedIndex ? 'text-blue-600' : 'text-slate-400'}`}
                >
                  keyboard_arrow_right
                </span>
              </button>
            ))}
          </div>

          {/* Hướng dẫn phím tắt */}
          <div className='border-t border-slate-100 px-4 py-2 bg-slate-50 text-xs text-slate-500 flex items-center gap-4'>
            <div className='flex items-center gap-1'>
              <kbd className='px-1.5 py-0.5 bg-white rounded border text-[10px] font-mono shadow-sm'>↑</kbd>
              <kbd className='px-1.5 py-0.5 bg-white rounded border text-[10px] font-mono shadow-sm'>↓</kbd>
              <span>điều hướng</span>
            </div>
            <div className='flex items-center gap-1'>
              <kbd className='px-1.5 py-0.5 bg-white rounded border text-[10px] font-mono shadow-sm'>↵</kbd>
              <span>chọn</span>
            </div>
            <div className='flex items-center gap-1'>
              <kbd className='px-1.5 py-0.5 bg-white rounded border text-[10px] font-mono shadow-sm'>ESC</kbd>
              <span>đóng</span>
            </div>
          </div>
        </div>
      )}

      {/* Thông báo không có kết quả */}
      {isOpen && keyword.trim() && suggestions.length === 0 && (
        <div className='absolute top-full left-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200'>
          <div className='px-4 py-8 text-center'>
            <span className='material-symbols-outlined text-4xl text-slate-300 mb-2'>search_off</span>
            <p className='text-sm text-slate-500'>Không tìm thấy trang nào phù hợp</p>
            <p className='text-xs text-slate-400 mt-1'>Vui lòng thử từ khóa khác</p>
          </div>
        </div>
      )}
    </div>
  )
}
