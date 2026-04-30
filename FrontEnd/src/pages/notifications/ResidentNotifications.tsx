import React, { useState, useEffect } from 'react'
import { Bell, FileText, Megaphone, Settings, Trash2, CheckCircle2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { notificationApi, type INotification } from '../../apis/notification/notification.api'

export default function ResidentNotifications() {
  const [notifications, setNotifications] = useState<INotification[]>([])
  const [activeTab, setActiveTab] = useState<string>('ALL')
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // 1. Gọi API lấy danh sách khi mới vào trang
  const fetchNotifications = async () => {
    try {
      setIsLoading(true)
      const res = await notificationApi.getMyNotifications()
      if (res.data.success) {
        setNotifications(res.data.data)
      }
    } catch (error) {
      // File http.ts của bạn đã tự động hiện toast lỗi rồi nên ở đây không cần toast error nữa
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  // 2. Hàm xử lý: Đánh dấu đã đọc
  const handleMarkAsRead = async (receiverId: number) => {
    try {
      const res = await notificationApi.markAsRead(receiverId)
      if (res.data.success) {
        toast.success(res.data.message || 'Đã đọc thông báo')
        // Cập nhật lại UI ngay lập tức mà không cần gọi lại API
        setNotifications((prev) =>
          prev.map((noti) => (noti.receiverId === receiverId ? { ...noti, isRead: true } : noti))
        )
      }
    } catch (error) {
      console.error(error)
    }
  }

  // 3. Hàm xử lý: Xóa thông báo
  const handleDelete = async (receiverId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thông báo này không?')) return

    try {
      const res = await notificationApi.deleteNotification(receiverId)
      if (res.data.success) {
        toast.success(res.data.message || 'Đã xóa thông báo')
        // Lọc bỏ thông báo đã xóa khỏi UI
        setNotifications((prev) => prev.filter((noti) => noti.receiverId !== receiverId))
      }
    } catch (error) {
      console.error(error)
    }
  }

  // Lọc dữ liệu theo Tab đang chọn
  const filteredNotifications = notifications.filter((noti) => {
    if (activeTab === 'ALL') return true
    return noti.type === activeTab
  })

  // Hàm render icon tùy theo loại thông báo
  const renderIcon = (type: string) => {
    switch (type) {
      case 'PAYMENT':
        return <FileText size={24} />
      case 'MAINTENANCE':
        return <Settings size={24} />
      case 'EMERGENCY':
        return <Bell size={24} className='text-red-600' />
      default:
        return <Megaphone size={24} />
    }
  }

  return (
    <div className='flex gap-6 p-6 bg-gray-50 min-h-screen font-sans'>
      {/* CỘT TRÁI: SIDEBAR DANH MỤC */}
      <div className='w-1/4 flex flex-col gap-6'>
        <div className='bg-white p-4 rounded-2xl shadow-sm border border-gray-100'>
          <p className='text-xs font-semibold text-gray-400 mb-4 tracking-wider uppercase'>Hạng mục</p>
          <ul className='space-y-2'>
            {[
              { id: 'ALL', label: 'Tất cả thông báo', icon: <Bell size={20} /> },
              { id: 'PAYMENT', label: 'Hóa đơn & Phí', icon: <FileText size={20} /> },
              { id: 'NORMAL', label: 'Tin tức tòa nhà', icon: <Megaphone size={20} /> },
              { id: 'MAINTENANCE', label: 'Hệ thống', icon: <Settings size={20} /> }
            ].map((tab) => (
              <li key={tab.id}>
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {tab.icon} {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* CỘT PHẢI: DANH SÁCH THÔNG BÁO */}
      <div className='flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-8'>
        <div className='flex justify-between items-center mb-8'>
          <div>
            <h1 className='text-2xl font-bold text-gray-800'>Trung tâm thông báo</h1>
            <p className='text-gray-500 mt-1'>Cập nhật thông tin mới nhất từ Ban Quản Lý</p>
          </div>
        </div>

        <div className='space-y-4'>
          {isLoading ? (
            <p className='text-center text-gray-500 py-10'>Đang tải thông báo...</p>
          ) : filteredNotifications.length === 0 ? (
            <p className='text-center text-gray-500 py-10'>Bạn không có thông báo nào trong mục này.</p>
          ) : (
            filteredNotifications.map((noti) => (
              <div
                key={noti.receiverId}
                className={`group flex items-start gap-4 p-5 rounded-xl transition-all hover:shadow-md relative border ${!noti.isRead ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'bg-white border-gray-100'}`}
              >
                <div
                  className={`p-3 rounded-full shadow-sm ${!noti.isRead ? 'bg-white text-blue-600' : 'bg-gray-50 text-gray-400'}`}
                >
                  {renderIcon(noti.type)}
                </div>

                <div className='flex-1 pr-16'>
                  <div className='flex items-start gap-3'>
                    <h3 className={`font-bold text-lg ${!noti.isRead ? 'text-gray-800' : 'text-gray-600'}`}>
                      {noti.title}
                    </h3>
                    <span className='text-xs text-gray-400 font-medium whitespace-nowrap mt-1'>
                      {new Date(noti.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  <p className={`${!noti.isRead ? 'text-gray-600' : 'text-gray-500'} mt-1 leading-relaxed`}>
                    {noti.content}
                  </p>

                  <div className='mt-3 flex gap-2'>
                    <span className='px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full'>
                      {noti.type}
                    </span>
                  </div>
                </div>

                {/* Chấm xanh báo chưa đọc */}
                {!noti.isRead && <div className='w-3 h-3 bg-blue-600 rounded-full mt-2 shrink-0'></div>}

                {/* Nút hành động hiện lên khi Hover */}
                <div className='absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2'>
                  {!noti.isRead && (
                    <button
                      title='Đánh dấu đã đọc'
                      onClick={() => handleMarkAsRead(noti.receiverId)}
                      className='p-2 text-green-600 bg-green-50 rounded-full hover:bg-green-100 transition-colors'
                    >
                      <CheckCircle2 size={18} />
                    </button>
                  )}
                  <button
                    title='Xóa thông báo'
                    onClick={() => handleDelete(noti.receiverId)}
                    className='p-2 text-red-600 bg-red-50 rounded-full hover:bg-red-100 transition-colors'
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
