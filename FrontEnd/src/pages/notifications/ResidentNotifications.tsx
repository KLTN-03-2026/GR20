import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { notificationApi, type INotification } from 'src/apis/notification/notification.api'

const TABS: { id: string; label: string; icon: string }[] = [
  { id: 'ALL', label: 'Tất cả thông báo', icon: 'notifications' },
  { id: 'PAYMENT', label: 'Hóa đơn & Phí', icon: 'receipt_long' },
  { id: 'NORMAL', label: 'Tin tức tòa nhà', icon: 'campaign' },
  { id: 'MAINTENANCE', label: 'Hệ thống', icon: 'handyman' },
  { id: 'EMERGENCY', label: 'Khẩn cấp', icon: 'warning' }
]

function TypeIcon({ type }: { type: string }) {
  const cls = 'material-symbols-outlined text-2xl leading-none'
  switch (type) {
    case 'PAYMENT':
      return <span className={`${cls} text-blue-600`}>receipt_long</span>
    case 'MAINTENANCE':
      return <span className={`${cls} text-slate-600`}>handyman</span>
    case 'EMERGENCY':
      return <span className={`${cls} text-red-600`}>warning</span>
    default:
      return <span className={`${cls} text-emerald-600`}>campaign</span>
  }
}

export default function ResidentNotifications() {
  const [notifications, setNotifications] = useState<INotification[]>([])
  const [activeTab, setActiveTab] = useState<string>('ALL')
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const fetchNotifications = async () => {
    try {
      setIsLoading(true)
      const res = await notificationApi.getMyNotifications()
      if (res.data.success) {
        setNotifications(res.data.data)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleMarkAsRead = async (receiverId: number) => {
    try {
      const res = await notificationApi.markAsRead(receiverId)
      if (res.data.success) {
        toast.success(res.data.message || 'Đã đọc thông báo')
        setNotifications((prev) =>
          prev.map((noti) => (noti.receiverId === receiverId ? { ...noti, isRead: true } : noti))
        )
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleDelete = async (receiverId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thông báo này không?')) return

    try {
      const res = await notificationApi.deleteNotification(receiverId)
      if (res.data.success) {
        toast.success(res.data.message || 'Đã xóa thông báo')
        setNotifications((prev) => prev.filter((noti) => noti.receiverId !== receiverId))
      }
    } catch (error) {
      console.error(error)
    }
  }

  const filteredNotifications = notifications.filter((noti) => {
    if (activeTab === 'ALL') return true
    return noti.type === activeTab
  })

  return (
    <div className='min-h-screen bg-[#F8F9FA] p-4 font-sans text-slate-900 md:p-6'>
      <div className='mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row'>
        <div className='w-full shrink-0 lg:w-64 xl:w-72'>
          <div className='rounded-2xl border border-gray-100 bg-white p-4 shadow-sm'>
            <p className='mb-4 text-xs font-bold uppercase tracking-wider text-gray-400'>Hạng mục</p>
            <ul className='space-y-2'>
              {TABS.map((tab) => (
                <li key={tab.id}>
                  <button
                    type='button'
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-[#0052CC] text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className='material-symbols-outlined text-xl'>{tab.icon}</span>
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className='min-w-0 flex-1 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8'>
          <div className='mb-8'>
            <h1 className='text-2xl font-bold text-gray-900'>Trung tâm thông báo</h1>
            <p className='mt-1 text-sm text-gray-500'>Cập nhật thông tin mới nhất từ Ban Quản Lý</p>
          </div>

          <div className='space-y-4'>
            {isLoading ? (
              <p className='py-10 text-center text-gray-500'>Đang tải thông báo...</p>
            ) : filteredNotifications.length === 0 ? (
              <p className='py-10 text-center text-gray-500'>Bạn không có thông báo nào trong mục này.</p>
            ) : (
              filteredNotifications.map((noti) => (
                <div
                  key={noti.receiverId}
                  className={`group relative flex items-start gap-4 rounded-xl border p-5 transition-all hover:shadow-md ${
                    !noti.isRead
                      ? 'border-l-4 border-l-[#0052CC] bg-[#DDE7FF]/30 border-gray-100'
                      : 'border-gray-100 bg-white'
                  }`}
                >
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow-sm ${
                      !noti.isRead ? 'bg-white text-[#0052CC]' : 'bg-gray-50 text-gray-400'
                    }`}
                  >
                    <TypeIcon type={noti.type} />
                  </div>

                  <div className='min-w-0 flex-1 pr-24'>
                    <div className='flex flex-wrap items-start gap-3'>
                      <h3 className={`text-lg font-bold ${!noti.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                        {noti.title}
                      </h3>
                      <span className='mt-0.5 whitespace-nowrap text-xs font-medium text-gray-400'>
                        {new Date(noti.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>

                    <p className={`mt-1 leading-relaxed ${!noti.isRead ? 'text-gray-600' : 'text-gray-500'}`}>
                      {noti.content}
                    </p>

                    <div className='mt-3'>
                      <span className='rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600'>
                        {noti.type}
                      </span>
                    </div>
                  </div>

                  {!noti.isRead && <div className='mt-2 h-3 w-3 shrink-0 rounded-full bg-[#0052CC]' />}

                  <div className='absolute right-4 top-4 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100'>
                    {!noti.isRead && (
                      <button
                        type='button'
                        title='Đánh dấu đã đọc'
                        onClick={() => handleMarkAsRead(noti.receiverId)}
                        className='rounded-full bg-emerald-50 p-2 text-emerald-600 transition-colors hover:bg-emerald-100'
                      >
                        <span className='material-symbols-outlined text-lg'>check_circle</span>
                      </button>
                    )}
                    <button
                      type='button'
                      title='Xóa thông báo'
                      onClick={() => handleDelete(noti.receiverId)}
                      className='rounded-full bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100'
                    >
                      <span className='material-symbols-outlined text-lg'>delete</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
