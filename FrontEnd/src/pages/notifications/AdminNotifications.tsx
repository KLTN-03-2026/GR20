import React, { useState, useEffect, useCallback } from 'react'
import { buildingApi } from 'src/apis/building_api/buildings.api'
import type { Buildings } from 'src/types/buildings.type'
import { toast } from 'react-toastify'
import {
  notificationAdminApi,
  type INotificationAdmin,
  type IResident
} from 'src/apis/notification/notificationADMIN.api'

// Giả sử bạn có API lấy danh sách tòa nhà, nếu không thì hardcode tạm
// import { buildingApi } from 'src/apis/building.api'

interface IBuilding {
  id: number
  name: string
}

export default function AdminNotifications() {
  const [history, setHistory] = useState<INotificationAdmin[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [targetType, setTargetType] = useState<'ALL' | 'BUILDING' | 'INDIVIDUAL'>('ALL')

  // Tòa nhà
  const [buildings, setBuildings] = useState<Buildings[]>([])
  const [selectedBuildingId, setSelectedBuildingId] = useState<number | ''>('')

  // Chọn cư dân
  const [showResidentPicker, setShowResidentPicker] = useState(false)
  const [residentSearch, setResidentSearch] = useState('')
  const [residents, setResidents] = useState<IResident[]>([])
  const [isLoadingResidents, setIsLoadingResidents] = useState(false)
  const [selectedResident, setSelectedResident] = useState<IResident | null>(null)

  // Load tòa nhà (thay bằng API thật của bạn)
  // Thay useEffect load buildings — xóa hardcode đi, thay bằng:
  useEffect(() => {
    buildingApi
      .getAllBuildings({ status: 'ACTIVE' })
      .then((res) => {
        setBuildings(res.data.data)
      })
      .catch(() => {
        toast.error('Không tải được danh sách tòa nhà')
      })
  }, [])

  const fetchHistory = async () => {
    try {
      setIsLoading(true)
      const res = await notificationAdminApi.getHistory()
      if (res.data.success) setHistory(res.data.data)
    } catch {
      toast.error('Không tải được lịch sử thông báo')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  // Khi bấm "Chọn cư dân" — load danh sách theo tòa nhà đã chọn
  const handleOpenPicker = async () => {
    if (!selectedBuildingId) {
      toast.warning('Vui lòng chọn tòa nhà trước')
      return
    }
    setShowResidentPicker(true)
    setResidentSearch('')
    setIsLoadingResidents(true)
    try {
      const res = await notificationAdminApi.getResidentsByBuilding(Number(selectedBuildingId))
      if (res.data.success) setResidents(res.data.data)
    } catch {
      toast.error('Không tải được danh sách cư dân')
    } finally {
      setIsLoadingResidents(false)
    }
  }

  // Tìm kiếm realtime trên client (đã có sẵn danh sách)
  const filteredResidents = residents.filter((r) => r.fullName?.toLowerCase().includes(residentSearch.toLowerCase()))

  const handleSelectResident = (r: IResident) => {
    setSelectedResident(r)
    setShowResidentPicker(false)
  }

  // Reset khi đổi targetType
  const handleChangeTargetType = (val: 'ALL' | 'BUILDING' | 'INDIVIDUAL') => {
    setTargetType(val)
    setSelectedBuildingId('')
    setSelectedResident(null)
    setShowResidentPicker(false)
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      toast.error('Vui lòng nhập đầy đủ Tiêu đề và Nội dung')
      return
    }
    if (targetType === 'BUILDING' && !selectedBuildingId) {
      toast.error('Vui lòng chọn tòa nhà')
      return
    }
    if (targetType === 'INDIVIDUAL' && !selectedResident) {
      toast.error('Vui lòng chọn cư dân')
      return
    }

    try {
      setIsSubmitting(true)
      const res = await notificationAdminApi.sendNotification({
        title,
        content,
        targetType,
        buildingId: targetType === 'BUILDING' || targetType === 'INDIVIDUAL' ? Number(selectedBuildingId) : undefined,
        targetUserId: targetType === 'INDIVIDUAL' ? Number(selectedResident!.userId) : undefined
      })
      if (res.data.success) {
        toast.success('Gửi thông báo thành công!')
        setTitle('')
        setContent('')
        setTargetType('ALL')
        setSelectedBuildingId('')
        setSelectedResident(null)
        fetchHistory()
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Gửi thông báo thất bại')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRecall = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn thu hồi thông báo này?')) return
    try {
      const res = await notificationAdminApi.recallNotification(id)
      if (res.data.success) {
        toast.success('Đã thu hồi thành công')
        setHistory((prev) => prev.filter((item) => item.id !== id))
      }
    } catch (error: any) {
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
          {/* ===== FORM GỬI ===== */}
          <div className='lg:col-span-4'>
            <div className='sticky top-24 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm'>
              <h2 className='mb-6 flex items-center gap-2 text-xl font-bold text-gray-900'>
                <span
                  className='material-symbols-outlined text-[#0052CC]'
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  send
                </span>
                Phát thông báo mới
              </h2>

              <form onSubmit={handleSend} className='space-y-4'>
                {/* Tiêu đề */}
                <div>
                  <label className='mb-1 block text-sm font-semibold text-gray-700'>Tiêu đề</label>
                  <input
                    type='text'
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder='Nhập tiêu đề thông báo...'
                    className={inputCls}
                  />
                </div>

                {/* Đối tượng nhận */}
                <div>
                  <label className='mb-1 block text-sm font-semibold text-gray-700'>Đối tượng nhận</label>
                  <select
                    value={targetType}
                    onChange={(e) => handleChangeTargetType(e.target.value as any)}
                    className={inputCls}
                  >
                    <option value='ALL'>Toàn thể cư dân</option>
                    <option value='BUILDING'>Theo tòa nhà</option>
                    <option value='INDIVIDUAL'>Gửi cá nhân</option>
                  </select>
                </div>

                {/* Chọn tòa nhà (hiện khi BUILDING hoặc INDIVIDUAL) */}
                {(targetType === 'BUILDING' || targetType === 'INDIVIDUAL') && (
                  <div>
                    <label className='mb-1 block text-sm font-semibold text-gray-700'>Chọn tòa nhà</label>
                    <select
                      value={selectedBuildingId}
                      onChange={(e) => {
                        setSelectedBuildingId(Number(e.target.value))
                        setSelectedResident(null) // reset cư dân khi đổi tòa
                      }}
                      className={inputCls}
                    >
                      <option value=''>-- Chọn tòa nhà --</option>
                      {buildings.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Chọn cư dân (chỉ INDIVIDUAL) */}
                {targetType === 'INDIVIDUAL' && (
                  <div>
                    <label className='mb-1 block text-sm font-semibold text-gray-700'>Cư dân nhận</label>

                    {/* Hiển thị người đã chọn */}
                    {selectedResident ? (
                      <div className='flex items-center justify-between rounded-xl border border-[#0052CC] bg-[#DDE7FF]/40 px-4 py-2.5'>
                        <div>
                          <p className='font-semibold text-gray-900'>{selectedResident.fullName}</p>
                          <p className='text-xs text-gray-500'>{selectedResident.phone}</p>
                        </div>
                        <button
                          type='button'
                          onClick={() => setSelectedResident(null)}
                          className='text-gray-400 hover:text-red-500'
                        >
                          <span className='material-symbols-outlined text-lg'>close</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        type='button'
                        onClick={handleOpenPicker}
                        className='w-full rounded-xl border border-dashed border-[#0052CC] py-2.5 text-sm font-semibold text-[#0052CC] hover:bg-[#DDE7FF]/40 transition'
                      >
                        + Chọn cư dân
                      </button>
                    )}

                    {/* Modal chọn cư dân */}
                    {showResidentPicker && (
                      <div className='mt-2 rounded-xl border border-gray-200 bg-white shadow-lg'>
                        <div className='border-b border-gray-100 p-3'>
                          <input
                            autoFocus
                            type='text'
                            value={residentSearch}
                            onChange={(e) => setResidentSearch(e.target.value)}
                            placeholder='Gõ tên để tìm (vd: nh)...'
                            className='w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#0052CC]'
                          />
                        </div>
                        <ul className='max-h-52 overflow-y-auto'>
                          {isLoadingResidents ? (
                            <li className='py-6 text-center text-sm text-gray-500'>Đang tải...</li>
                          ) : filteredResidents.length === 0 ? (
                            <li className='py-6 text-center text-sm text-gray-500'>Không tìm thấy cư dân</li>
                          ) : (
                            filteredResidents.map((r) => (
                              <li key={r.userId}>
                                <button
                                  type='button'
                                  onClick={() => handleSelectResident(r)}
                                  className='flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50'
                                >
                                  <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#DDE7FF] text-sm font-bold text-[#0052CC]'>
                                    {r.fullName?.charAt(0) ?? '?'}
                                  </div>
                                  <div>
                                    <p className='text-sm font-semibold text-gray-900'>{r.fullName}</p>
                                    <p className='text-xs text-gray-400'>{r.phone}</p>
                                  </div>
                                </button>
                              </li>
                            ))
                          )}
                        </ul>
                        <div className='border-t border-gray-100 p-2 text-right'>
                          <button
                            type='button'
                            onClick={() => setShowResidentPicker(false)}
                            className='text-xs text-gray-400 hover:text-gray-700'
                          >
                            Đóng
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Nội dung */}
                <div>
                  <label className='mb-1 block text-sm font-semibold text-gray-700'>Nội dung</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
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

          {/* ===== LỊCH SỬ ===== */}
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
                        <span className='material-symbols-outlined text-2xl text-emerald-600'>campaign</span>
                      </div>
                      <div className='min-w-0 flex-1 pr-20'>
                        <div className='flex flex-wrap items-center gap-3'>
                          <h3 className='text-lg font-bold text-gray-900'>{noti.title}</h3>
                          <span className='whitespace-nowrap rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500'>
                            {new Date(noti.createdAt).toLocaleString('vi-VN')}
                          </span>
                        </div>
                        <p className='mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-600'>{noti.content}</p>
                      </div>
                      <div className='absolute right-4 top-4 opacity-0 transition-opacity group-hover:opacity-100'>
                        <button
                          type='button'
                          onClick={() => handleRecall(noti.id)}
                          className='flex items-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100'
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
