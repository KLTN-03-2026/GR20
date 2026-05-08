import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { notificationAdminApi, type INotificationAdmin } from 'src/apis/notification/notificationADMIN.api'

function TypeIcon({ type }: { type: string }) {
  const cls = 'material-symbols-outlined shrink-0 text-2xl leading-none'
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

export default function AdminNotifications() {
  const [history, setHistory] = useState<INotificationAdmin[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      toast.error('Không tải được lịch sử thông báo')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

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
        setFormData({ title: '', content: '', type: 'NORMAL', targetType: 'ALL', targetId: '' })
        fetchHistory()
      }
    } catch (error: any) {
      console.error(error)
      const msg = error?.response?.data?.message || 'Gửi thông báo thất bại'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRecall = async (id: number) => {
    if (
      !window.confirm('CẢNH BÁO: Bạn có chắc chắn muốn thu hồi thông báo này? Nó sẽ bị xóa khỏi máy của tất cả cư dân.')
    ) {
      return
    }

    try {
      const res = await notificationAdminApi.recallNotification(id)
      if (res.data.success) {
        toast.success(res.data.message || 'Đã thu hồi thành công')
        setHistory((prev) => prev.filter((item) => item.id !== id))
      }
    } catch (error: any) {
      console.error(error)
      toast.error(error?.response?.data?.message || 'Thu hồi thất bại')
    }
  }

  const inputCls =
    'w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'

  return (
    <div className='min-h-screen bg-[#F8F9FA] p-6 font-sans text-slate-900 md:p-8'>
      <div className='mx-auto max-w-7xl'>
        <div className='mb-8'>
          <span className='rounded bg-[#DDE7FF] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0052CC]'>
            Administration
          </span>
          <h1 className='mt-4 text-3xl font-bold text-gray-900'>Quản lý thông báo</h1>
          <p className='mt-2 text-sm text-gray-500'>
            Gửi thông báo tới cư dân và theo dõi lịch sử; có thể thu hồi thông báo đã phát.
          </p>
        </div>

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
          <div className='lg:col-span-4'>
            <div className='sticky top-24 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm'>
              <h2 className='mb-6 flex items-center gap-2 text-xl font-bold text-gray-900'>
                <span className='material-symbols-outlined text-[#0052CC]' style={{ fontVariationSettings: "'FILL' 1" }}>
                  send
                </span>
                Phát thông báo mới
              </h2>

              <form onSubmit={handleSend} className='space-y-4'>
                <div>
                  <label className='mb-1 block text-sm font-semibold text-gray-700'>Tiêu đề</label>
                  <input
                    type='text'
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder='Nhập tiêu đề thông báo...'
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className='mb-1 block text-sm font-semibold text-gray-700'>Loại thông báo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className={inputCls}
                  >
                    <option value='NORMAL'>Thông thường (Tin tức)</option>
                    <option value='PAYMENT'>Hóa đơn & Biểu phí</option>
                    <option value='MAINTENANCE'>Bảo trì hệ thống</option>
                    <option value='EMERGENCY'>Khẩn cấp</option>
                  </select>
                </div>

                <div className='flex flex-col gap-4 sm:flex-row'>
                  <div className='min-w-0 flex-1'>
                    <label className='mb-1 block text-sm font-semibold text-gray-700'>Đối tượng nhận</label>
                    <select
                      value={formData.targetType}
                      onChange={(e) => setFormData({ ...formData, targetType: e.target.value, targetId: '' })}
                      className={inputCls}
                    >
                      <option value='ALL'>Toàn thể cư dân</option>
                      <option value='BUILDING'>Theo Tòa nhà</option>
                      <option value='FLOOR'>Theo Tầng</option>
                      <option value='INDIVIDUAL'>Gửi cá nhân</option>
                    </select>
                  </div>

                  {formData.targetType !== 'ALL' && (
                    <div className='min-w-0 flex-1'>
                      <label className='mb-1 block text-sm font-semibold text-gray-700'>Mã (ID) đối tượng</label>
                      <input
                        type='number'
                        value={formData.targetId}
                        onChange={(e) => setFormData({ ...formData, targetId: e.target.value })}
                        placeholder={`ID ${formData.targetType}`}
                        className={inputCls}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className='mb-1 block text-sm font-semibold text-gray-700'>Nội dung</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder='Nhập nội dung chi tiết...'
                    rows={5}
                    className={`${inputCls} resize-none`}
                  />
                </div>

                <button
                  type='submit'
                  disabled={isSubmitting}
                  className={`w-full rounded-xl py-3 text-center text-sm font-bold text-white transition ${
                    isSubmitting ? 'cursor-not-allowed bg-blue-400' : 'bg-[#0052CC] hover:bg-blue-700'
                  }`}
                >
                  {isSubmitting ? 'Đang gửi...' : 'Gửi thông báo'}
                </button>
              </form>
            </div>
          </div>

          <div className='lg:col-span-8'>
            <div className='rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8'>
              <div className='mb-8 flex items-start gap-3'>
                <span className='material-symbols-outlined text-3xl text-gray-400'>schedule</span>
                <div>
                  <h2 className='text-2xl font-bold text-gray-900'>Lịch sử đã gửi</h2>
                  <p className='mt-1 text-sm text-gray-500'>Danh sách các thông báo do Ban Quản Lý phát hành</p>
                </div>
              </div>

              <div className='space-y-4'>
                {isLoading ? (
                  <p className='py-10 text-center text-gray-500'>Đang tải dữ liệu...</p>
                ) : history.length === 0 ? (
                  <p className='py-10 text-center text-gray-500'>Chưa có thông báo nào được gửi đi.</p>
                ) : (
                  history.map((noti) => (
                    <div
                      key={noti.id}
                      className='group relative flex items-start gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-[#0052CC]/30 hover:shadow-md'
                    >
                      <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gray-50'>
                        <TypeIcon type={noti.type} />
                      </div>

                      <div className='min-w-0 flex-1 pr-20'>
                        <div className='flex flex-wrap items-center gap-3'>
                          <h3 className='text-lg font-bold text-gray-900'>{noti.title}</h3>
                          <span className='whitespace-nowrap rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500'>
                            {new Date(noti.createdAt).toLocaleString('vi-VN')}
                          </span>
                        </div>

                        <p className='mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-600'>{noti.content}</p>

                        <div className='mt-3 flex flex-wrap gap-2'>
                          <span className='rounded-full bg-[#DDE7FF] px-3 py-1 text-xs font-bold text-[#0052CC]'>
                            Loại: {noti.type}
                          </span>
                          <span className='rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700'>
                            Đối tượng: {noti.targetType} {noti.targetId != null && `(ID: ${noti.targetId})`}
                          </span>
                        </div>
                      </div>

                      <div className='absolute right-4 top-4 opacity-0 transition-opacity group-hover:opacity-100'>
                        <button
                          type='button'
                          onClick={() => handleRecall(noti.id)}
                          title='Thu hồi thông báo'
                          className='flex items-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100'
                        >
                          <span className='material-symbols-outlined text-lg'>delete</span>
                          Thu hồi
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
