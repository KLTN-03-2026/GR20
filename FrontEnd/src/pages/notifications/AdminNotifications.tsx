import React, { useState, useEffect } from 'react'
import { Send, Clock, AlertTriangle, Trash2, Megaphone, FileText, Settings } from 'lucide-react'
import { toast } from 'react-toastify'
import { notificationAdminApi, type INotificationAdmin } from '../../apis/notification/notificationADMIN.api'

export default function AdminNotifications() {
  const [history, setHistory] = useState<INotificationAdmin[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // State cho Form gửi thông báo
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'NORMAL',
    targetType: 'ALL',
    targetId: ''
  })

  const fetchHistory = async () => {
    try {
      setIsLoading(true)
      const res = await notificationAdminApi.getHistory()
      if (res.data.success) {
        setHistory(res.data.data)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  // Xử lý gửi thông báo
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.content) {
      toast.error('Vui lòng nhập đầy đủ Tiêu đề và Nội dung')
      return
    }

    try {
      setIsSubmitting(true)
      const payload = {
        ...formData,
        targetId: formData.targetId ? Number(formData.targetId) : undefined
      }

      const res = await notificationAdminApi.sendNotification(payload)
      if (res.data.success) {
        toast.success(res.data.message || 'Gửi thông báo thành công!')
        // Reset form
        setFormData({ title: '', content: '', type: 'NORMAL', targetType: 'ALL', targetId: '' })
        // Load lại lịch sử
        fetchHistory()
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Xử lý thu hồi
  const handleRecall = async (id: number) => {
    if (
      !window.confirm('CẢNH BÁO: Bạn có chắc chắn muốn thu hồi thông báo này? Nó sẽ bị xóa khỏi máy của tất cả cư dân.')
    )
      return

    try {
      const res = await notificationAdminApi.recallNotification(id)
      if (res.data.success) {
        toast.success(res.data.message || 'Đã thu hồi thành công')
        // Xóa khỏi danh sách UI
        setHistory((prev) => prev.filter((item) => item.id !== id))
      }
    } catch (error) {
      console.error(error)
    }
  }

  const renderIcon = (type: string) => {
    switch (type) {
      case 'PAYMENT':
        return <FileText size={20} className='text-blue-600' />
      case 'MAINTENANCE':
        return <Settings size={20} className='text-gray-600' />
      case 'EMERGENCY':
        return <AlertTriangle size={20} className='text-red-600' />
      default:
        return <Megaphone size={20} className='text-green-600' />
    }
  }

  return (
    <div className='flex gap-6 p-6 bg-gray-50 min-h-screen font-sans'>
      {/* CỘT TRÁI: FORM GỬI THÔNG BÁO */}
      <div className='w-1/3'>
        <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-6'>
          <h2 className='text-xl font-bold text-gray-800 mb-6 flex items-center gap-2'>
            <Send size={24} className='text-blue-600' /> Phát thông báo mới
          </h2>

          <form onSubmit={handleSend} className='space-y-4'>
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-1'>Tiêu đề</label>
              <input
                type='text'
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder='Nhập tiêu đề thông báo...'
                className='w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-1'>Loại thông báo</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className='w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value='NORMAL'>Thông thường (Tin tức)</option>
                <option value='PAYMENT'>Hóa đơn & Biểu phí</option>
                <option value='MAINTENANCE'>Bảo trì hệ thống</option>
                <option value='EMERGENCY'>Khẩn cấp</option>
              </select>
            </div>

            <div className='flex gap-4'>
              <div className='w-1/2'>
                <label className='block text-sm font-semibold text-gray-700 mb-1'>Đối tượng nhận</label>
                <select
                  value={formData.targetType}
                  onChange={(e) => setFormData({ ...formData, targetType: e.target.value, targetId: '' })}
                  className='w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <option value='ALL'>Toàn thể cư dân</option>
                  <option value='BUILDING'>Theo Tòa nhà</option>
                  <option value='FLOOR'>Theo Tầng</option>
                  <option value='INDIVIDUAL'>Gửi cá nhân</option>
                </select>
              </div>

              {formData.targetType !== 'ALL' && (
                <div className='w-1/2'>
                  <label className='block text-sm font-semibold text-gray-700 mb-1'>Mã (ID) đối tượng</label>
                  <input
                    type='number'
                    value={formData.targetId}
                    onChange={(e) => setFormData({ ...formData, targetId: e.target.value })}
                    placeholder={`ID ${formData.targetType}`}
                    className='w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                </div>
              )}
            </div>

            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-1'>Nội dung</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder='Nhập nội dung chi tiết...'
                rows={5}
                className='w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
              ></textarea>
            </div>

            <button
              type='submit'
              disabled={isSubmitting}
              className={`w-full py-3 rounded-xl font-bold text-white transition-colors ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isSubmitting ? 'Đang gửi...' : 'Gửi thông báo'}
            </button>
          </form>
        </div>
      </div>

      {/* CỘT PHẢI: LỊCH SỬ ĐÃ GỬI */}
      <div className='w-2/3 bg-white rounded-2xl shadow-sm border border-gray-100 p-8'>
        <div className='flex justify-between items-center mb-8'>
          <div>
            <h1 className='text-2xl font-bold text-gray-800 flex items-center gap-2'>
              <Clock className='text-gray-500' /> Lịch sử đã gửi
            </h1>
            <p className='text-gray-500 mt-1'>Danh sách các thông báo do Ban Quản Lý phát hành</p>
          </div>
        </div>

        <div className='space-y-4'>
          {isLoading ? (
            <p className='text-center text-gray-500 py-10'>Đang tải dữ liệu...</p>
          ) : history.length === 0 ? (
            <p className='text-center text-gray-500 py-10'>Chưa có thông báo nào được gửi đi.</p>
          ) : (
            history.map((noti) => (
              <div
                key={noti.id}
                className='group flex items-start gap-4 p-5 bg-white border border-gray-200 rounded-xl transition-all hover:border-blue-300 relative'
              >
                <div className='p-3 bg-gray-50 rounded-full shrink-0'>{renderIcon(noti.type)}</div>

                <div className='flex-1 pr-16'>
                  <div className='flex items-center gap-3'>
                    <h3 className='font-bold text-lg text-gray-800'>{noti.title}</h3>
                    <span className='text-xs text-gray-500 font-medium whitespace-nowrap bg-gray-100 px-2 py-1 rounded-md'>
                      {new Date(noti.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>

                  <p className='text-gray-600 mt-2 text-sm leading-relaxed whitespace-pre-wrap'>{noti.content}</p>

                  <div className='mt-3 flex gap-2'>
                    <span className='px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full'>
                      Phân loại: {noti.type}
                    </span>
                    <span className='px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-full'>
                      Đối tượng: {noti.targetType} {noti.targetId && `(ID: ${noti.targetId})`}
                    </span>
                  </div>
                </div>

                {/* Nút Thu hồi hiện lên khi Hover */}
                <div className='absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity'>
                  <button
                    onClick={() => handleRecall(noti.id)}
                    title='Thu hồi thông báo'
                    className='flex items-center gap-1 px-3 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-sm font-semibold'
                  >
                    <Trash2 size={16} /> Thu hồi
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
