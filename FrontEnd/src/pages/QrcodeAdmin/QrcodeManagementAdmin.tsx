import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { qrApiAdmin } from 'src/apis/QrcodeAdmin/QrcodeAdmin.api'
import type { historyQrcodeAdmin, historyQrcodeAdmin1 } from 'src/types/qrcode.type'
import { useState } from 'react'
import { toast } from 'react-toastify'

interface UpdateQrcodeParams {
  id: string
  status: string
  expiresAt: string
}

interface PostQRcode {
  userId: string
  apartmentId: string
  expiresAt: string
}
export default function QrcodeManagementAdmin() {
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [selectedResident, setSelectedResident] = useState<{ id: string; name: string } | null>(null)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<UpdateQrcodeParams | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedUserForCreate, setSelectedUserForCreate] = useState<PostQRcode | null>(null)

  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (id: string) => qrApiAdmin.deleteQrcodeAdmin(id),
    onSuccess: () => {
      toast.success('Đã thu hồi mã QR thành công')
      queryClient.invalidateQueries({ queryKey: ['personal/list'] })
    },
    onError: () => {
      toast.error('Thu hồi thất bại')
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: { status: string; expiresAt: string } }) =>
      qrApiAdmin.updateQrcodeAdmin(id, body),
    onSuccess: () => {
      toast.success('Cập nhật mã QR thành công')
      queryClient.invalidateQueries({ queryKey: ['personal/list'] })
      setIsUpdateModalOpen(false)
      setSelectedItem(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Cập nhật thất bại')
    }
  })
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['personal/list'],
    queryFn: () => qrApiAdmin.getAllQrcodd()
  })

  const createMutation = useMutation({
    mutationFn: (body: PostQRcode) => qrApiAdmin.postQrcodeAdmin(body),
    onSuccess: () => {
      toast.success('Tạo mã QR thành công')
      queryClient.invalidateQueries({ queryKey: ['personal/list'] })
      setIsCreateModalOpen(false)
      setSelectedUserForCreate(null)
      refetch() // Refetch lại dữ liệu
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Tạo QR thất bại')
    }
  })

  // Lấy lịch sử quét của cư dân theo userId
  const {
    data: historyData,
    isLoading: isLoadingHistory,
    refetch: refetchHistory
  } = useQuery({
    queryKey: ['resident-history', selectedResident?.id],
    queryFn: () => qrApiAdmin.getAllHistoryQrCodeId(selectedResident!.id),
    enabled: false // Không tự động chạy, chỉ chạy khi gọi refetch
  })

  const dataListQr: historyQrcodeAdmin[] = data?.data?.data || []
  const historyList: historyQrcodeAdmin1[] = historyData?.data?.data || []

  const totalIssued = dataListQr.filter((item) => item.qr_id !== null).length
  const activeKeys = dataListQr.filter((item) => item.qr_status === 'ACTIVE').length
  const revokedKeys = dataListQr.filter((item) => item.qr_status === 'REVOKED').length
  const activePercentage = totalIssued > 0 ? (activeKeys / totalIssued) * 100 : 0

  // Format ngày tháng
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`,
      time: `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`
    }
  }

  // Lấy trạng thái badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return {
          text: 'HOẠT ĐỘNG',
          bgColor: 'bg-green-100',
          textColor: 'text-green-700'
        }
      case 'EXPIRED':
        return {
          text: 'HẾT HẠN',
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-700'
        }
      case 'REVOKED':
        return {
          text: 'ĐÃ THU HỒI',
          bgColor: 'bg-error-container/30',
          textColor: 'text-error'
        }
      default:
        return {
          text: status,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700'
        }
    }
  }

  // Lấy badge kết quả quét
  const getResultBadge = (result: string) => {
    if (result === 'SUCCESS') {
      return {
        text: 'THÀNH CÔNG',
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-700',
        dotColor: 'bg-emerald-500'
      }
    }
    return {
      text: 'TỪ CHỐI',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      dotColor: 'bg-red-500'
    }
  }

  // Lấy icon hướng
  const getDirectionIcon = (direction: string) => {
    if (direction === 'IN') {
      return { icon: 'login', color: 'text-blue-500', text: 'VÀO' }
    }
    return { icon: 'logout', color: 'text-orange-500', text: 'RA' }
  }

  // Xử lý copy mã QR
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
  }

  // Xử lý xem lịch sử quét
  const handleViewHistory = (userId: string, userName: string) => {
    setSelectedResident({ id: userId, name: userName })
    setIsHistoryModalOpen(true)
    // Gọi API lấy lịch sử
    setTimeout(() => {
      refetchHistory()
    }, 100)
  }

  const handleEdit = (item: historyQrcodeAdmin) => {
    if (!item.qr_id) {
      toast.warning('Cư dân chưa có mã QR để chỉnh sửa')
      return
    }
    setSelectedItem({
      id: item.qr_id, // ✅ Dùng qr_id, không phải user_id
      status: item.qr_status || 'ACTIVE',
      expiresAt: item.expires_at || new Date().toISOString()
    })
    setIsUpdateModalOpen(true)
  }

  // Xử lý thu hồi
  const handleRevoke = (item: historyQrcodeAdmin) => {
    if (!item.qr_id) {
      toast.warning('Cư dân chưa có mã QR')
      return
    }
    if (window.confirm(`Bạn có chắc muốn thu hồi mã QR của ${item.user_name}?`)) {
      deleteMutation.mutate(item.qr_id) // Đúng: truyền qr_id
    }
  }

  if (isLoading) {
    return (
      <div className="bg-surface text-on-surface min-h-screen font-['Manrope',sans-serif] flex items-center justify-center">
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
          <p className='mt-4 text-on-surface-variant'>Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen font-['Manrope',sans-serif] antialiased overflow-x-hidden">
      {/* Main Content Canvas */}
      <main className='md:pl-64 pt-16 min-h-screen'>
        <div className='p-8 max-w-7xl mx-auto space-y-12'>
          {/* Header Section */}
          <section className='flex flex-col md:flex-row md:items-end justify-between gap-6'>
            <div className='max-w-xl'>
              <span className='text-xs font-bold tracking-[0.2em] text-primary uppercase mb-2 block'>
                Trung tâm bảo mật
              </span>
              <h1 className='text-4xl font-extrabold tracking-tight text-on-surface'>Mã QR Cư dân</h1>
              <p className='mt-4 text-on-surface-variant text-lg leading-relaxed'>
                Quản lý và giám sát chìa khóa truy cập kỹ thuật số cho hệ sinh thái cư dân.
              </p>
            </div>
            <div className='flex gap-4'>
              <Link
                to={'/historyQrcodeAdmin'}
                className='px-6 py-3 bg-[#007FFF] text-white font-bold rounded-full transition-all active:scale-95 flex items-center gap-2 hover:opacity-90'
              >
                <span className='material-symbols-outlined text-sm'>history</span>
                Toàn bộ lịch sử quét
              </Link>
            </div>
          </section>

          {/* Statistics Bento Grid */}
          <section className='grid grid-cols-1 md:grid-cols-4 gap-6'>
            <div className='md:col-span-2 bg-surface-container-lowest p-8 rounded-[2rem] shadow-[0_32px_64px_rgba(68,93,128,0.06)] relative overflow-hidden group'>
              <div className='absolute -right-8 -top-8 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors'></div>
              <div className='relative z-10'>
                <div className='flex items-center gap-3 mb-6'>
                  <div className='p-3 bg-primary-fixed rounded-2xl text-primary'>
                    <span className='material-symbols-outlined'>analytics</span>
                  </div>
                  <span className='label-md font-bold tracking-widest text-on-surface-variant opacity-60'>
                    TỔNG SỐ ĐÃ CẤP
                  </span>
                </div>
                <div className='flex items-baseline gap-4'>
                  <h2 className='text-6xl font-extrabold text-on-surface'>{totalIssued}</h2>
                </div>
                <p className='text-on-surface-variant text-sm mt-2 font-medium'>Chìa khóa được tạo trong hệ thống</p>
              </div>
            </div>

            <div className='bg-secondary-fixed/30 backdrop-blur-sm p-8 rounded-[2rem] border border-white/40 flex flex-col justify-between'>
              <div>
                <span className='label-md font-bold tracking-widest text-on-secondary-fixed-variant opacity-70'>
                  CHÌA KHÓA HOẠT ĐỘNG
                </span>
                <h3 className='text-4xl font-extrabold text-on-secondary-fixed mt-2'>{activeKeys}</h3>
              </div>
              <div className='w-full bg-white/50 h-1.5 rounded-full mt-6 overflow-hidden'>
                <div className='bg-primary h-full rounded-full' style={{ width: `${activePercentage}%` }}></div>
              </div>
            </div>

            <div className='bg-error-container/20 p-8 rounded-[2rem] flex flex-col justify-between'>
              <div>
                <span className='label-md font-bold tracking-widest text-on-error-container opacity-70'>
                  ĐÃ THU HỒI
                </span>
                <h3 className='text-4xl font-extrabold text-on-error-container mt-2'>{revokedKeys}</h3>
              </div>
              <p className='text-[10px] font-bold text-on-error-container/60 uppercase tracking-tighter'>
                Cần dọn dẹp hệ thống
              </p>
            </div>
          </section>

          {/* Table Content */}
          <div className='bg-surface-container-lowest rounded-[2rem] overflow-hidden shadow-[0_16px_48px_rgba(68,93,128,0.04)]'>
            <div className='overflow-x-auto'>
              <table className='w-full text-left border-collapse min-w-[1000px]'>
                <thead>
                  <tr className='bg-surface-container-low/50'>
                    <th className='px-8 py-5 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-widest'>
                      ID / Người dùng
                    </th>
                    <th className='px-6 py-5 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-widest'>
                      Thông tin liên hệ
                    </th>
                    <th className='px-6 py-5 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-widest'>
                      Căn hộ
                    </th>
                    <th className='px-6 py-5 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-widest'>
                      Mã truy cập
                    </th>
                    <th className='px-6 py-5 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-widest text-center'>
                      Trạng thái
                    </th>
                    <th className='px-8 py-5 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-widest text-right'>
                      Hết hạn
                    </th>
                    <th className='px-8 py-5 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-widest text-right'>
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-surface-container-low'>
                  {dataListQr.map((item, index) => {
                    const statusBadge = getStatusBadge(item.qr_status)
                    return (
                      <tr
                        key={`${item.user_id}-${item.apartment_id || index}-${item.qr_id || index}`}
                        className='group hover:bg-surface-container-low/20 transition-colors'
                      >
                        <td className='px-8 py-6'>
                          <div className='flex items-center gap-3'>
                            <div className='w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-xs font-bold text-on-surface-variant'>
                              {index + 1}
                            </div>
                            <div>
                              <p className='font-bold text-on-surface'>{item.user_name}</p>
                              <p className='text-[10px] text-on-surface-variant font-bold uppercase tracking-tight'>
                                {item.user_phone ? 'Cư dân' : 'Nhân viên'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className='px-6 py-6 text-sm text-on-surface-variant'>
                          <div>{item.user_email}</div>
                          <div className='text-xs text-on-surface-variant/70'>{item.user_phone || 'Chưa có SĐT'}</div>
                        </td>
                        {/* <td className='px-6 py-6'>
                          <span className='inline-flex items-center px-3 py-1 bg-surface-container-high rounded-full text-xs font-bold text-on-surface'>
                            {item.apartment_code}
                          </span>
                        </td> */}
                        <td className='px-6 py-6'>
                          {item.apartment_code ? (
                            <span className='inline-flex items-center px-3 py-1 bg-surface-container-high rounded-full text-xs font-bold text-on-surface'>
                              {item.apartment_code}
                            </span>
                          ) : (
                            <span className='text-xs text-on-surface-variant italic'>Chưa có căn hộ</span>
                          )}
                        </td>
                        {/* <td className='px-6 py-6'>
                          <div
                            className='flex items-center gap-2 group/code cursor-pointer'
                            onClick={() => handleCopyCode(item.qr_code)}
                          >
                            <code className='text-xs font-mono bg-surface-container-low px-2 py-1 rounded text-on-secondary-fixed-variant max-w-[120px] truncate'>
                              {item.qr_code.slice(0, 20)}...
                            </code>
                            <span className='material-symbols-outlined text-xs text-outline opacity-0 group-hover/code:opacity-100 transition-opacity'>
                              content_copy
                            </span>
                          </div>
                        </td> */}
                        <td className='px-6 py-6'>
                          {item.qr_code ? (
                            <div
                              className='flex items-center gap-2 group/code cursor-pointer'
                              onClick={() => handleCopyCode(item.qr_code)}
                            >
                              <code className='text-xs font-mono bg-surface-container-low px-2 py-1 rounded text-on-secondary-fixed-variant max-w-[120px] truncate'>
                                {item.qr_code.slice(0, 20)}...
                              </code>
                              <span className='material-symbols-outlined text-xs text-outline opacity-0 group-hover/code:opacity-100 transition-opacity'>
                                content_copy
                              </span>
                            </div>
                          ) : (
                            <span className='text-xs text-on-surface-variant italic'>Chưa có QR</span>
                          )}
                        </td>
                        <td className='px-6 py-6 text-center'>
                          <span
                            className={`inline-flex items-center px-4 py-1.5 rounded-full font-extrabold text-[10px] uppercase tracking-wider ${statusBadge.bgColor} ${statusBadge.textColor}`}
                          >
                            {statusBadge.text}
                          </span>
                        </td>
                        <td className='px-8 py-6 text-right'>
                          <p className='text-sm font-bold text-on-surface'>{formatDate(item.expires_at)}</p>
                          <p className='text-[10px] text-on-surface-variant'>
                            {item.qr_status === 'ACTIVE'
                              ? 'Còn hiệu lực'
                              : item.qr_status === 'EXPIRED'
                                ? 'Đã hết hạn'
                                : 'Đã thu hồi'}
                          </p>
                        </td>
                        <td className='px-8 py-6 text-right'>
                          <div className='flex justify-end gap-2'>
                            {/* Nút xem lịch sử */}
                            <button
                              onClick={() => handleViewHistory(item.user_id, item.user_name)}
                              className='p-2 bg-surface-container-low rounded-lg hover:bg-primary hover:text-white transition-all group'
                              title='Xem lịch sử quét'
                            >
                              <span className='material-symbols-outlined text-sm text-on-surface-variant group-hover:text-white'>
                                history
                              </span>
                            </button>

                            {item.qr_id ? (
                              // Có QR - hiển thị nút sửa và xóa
                              <>
                                <button
                                  onClick={() => handleEdit(item)}
                                  className='p-2 bg-surface-container-low rounded-lg hover:bg-primary hover:text-white transition-all group'
                                  title='Chỉnh sửa'
                                >
                                  <span className='material-symbols-outlined text-sm text-on-surface-variant group-hover:text-white'>
                                    edit
                                  </span>
                                </button>
                                <button
                                  onClick={() => handleRevoke(item)}
                                  className='p-2 bg-surface-container-low rounded-lg hover:bg-red-500 hover:text-white transition-all group'
                                  title='Thu hồi'
                                >
                                  <span className='material-symbols-outlined text-sm text-on-surface-variant group-hover:text-white'>
                                    block
                                  </span>
                                </button>
                              </>
                            ) : item.apartment_code ? (
                              // Chưa có QR nhưng có căn hộ - hiển thị nút tạo
                              <button
                                onClick={() => {
                                  setSelectedUserForCreate({
                                    userId: item.user_id,
                                    apartmentId: String(item.apartment_id),
                                    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
                                  })
                                  setIsCreateModalOpen(true)
                                }}
                                className='p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all'
                                title='Tạo QR'
                              >
                                <span className='material-symbols-outlined text-sm'>add</span>
                              </button>
                            ) : (
                              // Không có căn hộ - disabled
                              <button
                                disabled
                                className='p-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed'
                                title='Cư dân chưa có căn hộ, không thể tạo QR'
                              >
                                <span className='material-symbols-outlined text-sm'>add</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className='p-6 bg-surface-container-low/30 border-t border-surface-container-low flex items-center justify-between'>
              <p className='text-xs font-bold text-on-surface-variant'>
                Hiển thị {dataListQr.length} trên {totalIssued} kết quả
              </p>
              <div className='flex items-center gap-2'>
                <button className='w-10 h-10 flex items-center justify-center rounded-xl bg-white text-on-surface-variant hover:bg-primary hover:text-white transition-all'>
                  <span className='material-symbols-outlined'>chevron_left</span>
                </button>
                <button className='w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-white font-bold text-sm'>
                  1
                </button>
                <button className='w-10 h-10 flex items-center justify-center rounded-xl bg-white text-on-surface-variant hover:bg-primary hover:text-white transition-all'>
                  2
                </button>
                <button className='w-10 h-10 flex items-center justify-center rounded-xl bg-white text-on-surface-variant hover:bg-primary hover:text-white transition-all'>
                  3
                </button>
                <button className='w-10 h-10 flex items-center justify-center rounded-xl bg-white text-on-surface-variant hover:bg-primary hover:text-white transition-all'>
                  <span className='material-symbols-outlined'>chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Lịch sử quét */}
      {isHistoryModalOpen && selectedResident && (
        <div className='fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4'>
          <div className='bg-white rounded-2xl max-w-5xl w-full max-h-[85vh] overflow-hidden shadow-2xl'>
            {/* Modal Header */}
            <div className='p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-white'>
              <div>
                <h2 className='text-2xl font-bold text-on-surface'>Lịch sử quét QR</h2>
                <p className='text-sm text-on-surface-variant mt-1'>
                  Cư dân: <span className='font-semibold text-primary'>{selectedResident.name}</span>
                </p>
              </div>
              <button
                onClick={() => {
                  setIsHistoryModalOpen(false)
                  setSelectedResident(null)
                }}
                className='p-2 hover:bg-gray-100 rounded-full transition-all'
              >
                <span className='material-symbols-outlined'>close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className='p-6 overflow-y-auto max-h-[calc(85vh-80px)]'>
              {isLoadingHistory ? (
                <div className='flex items-center justify-center py-12'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
                  <p className='ml-3 text-on-surface-variant'>Đang tải lịch sử...</p>
                </div>
              ) : historyList.length === 0 ? (
                <div className='text-center py-12'>
                  <span className='material-symbols-outlined text-5xl text-gray-300'>history</span>
                  <p className='mt-3 text-on-surface-variant'>Chưa có lịch sử quét</p>
                </div>
              ) : (
                <table className='w-full text-left border-collapse'>
                  <thead className='sticky top-0 bg-white'>
                    <tr className='border-b border-gray-200'>
                      <th className='px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider'>
                        STT
                      </th>
                      <th className='px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider'>
                        Thời gian
                      </th>
                      <th className='px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider'>
                        Hướng
                      </th>
                      <th className='px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider'>
                        Cổng
                      </th>
                      <th className='px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider'>
                        Kết quả
                      </th>
                      <th className='px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider'>
                        Người quét
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-100'>
                    {historyList.map((item, index) => {
                      const dateTime = formatDateTime(item.scan_time)
                      const resultBadge = getResultBadge(item.result)
                      const directionIcon = getDirectionIcon(item.direction)
                      return (
                        <tr key={item.id} className='hover:bg-gray-50 transition-colors'>
                          <td className='px-4 py-3 text-sm text-on-surface-variant'>{index + 1}</td>
                          <td className='px-4 py-3'>
                            <div className='text-sm font-medium text-on-surface'>{dateTime.date}</div>
                            <div className='text-xs text-on-surface-variant'>{dateTime.time}</div>
                          </td>
                          <td className='px-4 py-3'>
                            <div className='flex items-center gap-1'>
                              <span className={`material-symbols-outlined text-sm ${directionIcon.color}`}>
                                {directionIcon.icon}
                              </span>
                              <span className={`text-xs font-medium ${directionIcon.color}`}>{directionIcon.text}</span>
                            </div>
                          </td>
                          <td className='px-4 py-3 text-sm text-on-surface-variant'>{item.gate || '---'}</td>
                          <td className='px-4 py-3'>
                            <span
                              className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold ${resultBadge.bgColor} ${resultBadge.textColor}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${resultBadge.dotColor}`}></span>
                              {resultBadge.text}
                            </span>
                          </td>
                          <td className='px-4 py-3 text-sm text-on-surface-variant'>{item.scanned_by_name || '---'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Modal Footer */}
            <div className='p-4 border-t border-gray-100 bg-gray-50 flex justify-end'>
              <button
                onClick={() => {
                  setIsHistoryModalOpen(false)
                  setSelectedResident(null)
                }}
                className='px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all'
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cập nhật QR */}
      {isUpdateModalOpen && selectedItem && (
        <div className='fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4'>
          <div className='bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl'>
            <div className='p-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white'>
              <div className='flex justify-between items-center'>
                <h2 className='text-xl font-bold text-on-surface'>Cập nhật mã QR</h2>
                <button
                  onClick={() => {
                    setIsUpdateModalOpen(false)
                    setSelectedItem(null)
                  }}
                  className='p-1 hover:bg-gray-100 rounded-full transition-all'
                >
                  <span className='material-symbols-outlined'>close</span>
                </button>
              </div>
            </div>

            <div className='p-5 space-y-4'>
              <div>
                <label className='block text-sm font-bold text-on-surface-variant mb-2'>Trạng thái</label>
                <select
                  id='status'
                  defaultValue={selectedItem.status}
                  className='w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary'
                >
                  <option value='ACTIVE'>Hoạt động</option>
                  <option value='EXPIRED'>Hết hạn</option>
                  <option value='REVOKED'>Đã thu hồi</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-bold text-on-surface-variant mb-2'>Ngày hết hạn</label>
                <input
                  id='expiresAt'
                  type='datetime-local'
                  defaultValue={new Date(selectedItem.expiresAt).toISOString().slice(0, 16)}
                  className='w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary'
                />
              </div>
            </div>

            <div className='p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3'>
              <button
                onClick={() => {
                  setIsUpdateModalOpen(false)
                  setSelectedItem(null)
                }}
                className='px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all'
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  const status = (document.getElementById('status') as HTMLSelectElement).value
                  const expiresAt = (document.getElementById('expiresAt') as HTMLInputElement).value
                  updateMutation.mutate({
                    id: selectedItem.id,
                    body: { status, expiresAt: new Date(expiresAt).toISOString() }
                  })
                }}
                className='px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all'
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tạo QR */}
      {isCreateModalOpen && selectedUserForCreate && (
        <div className='fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4'>
          <div className='bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl'>
            <div className='p-5 border-b border-gray-100 bg-gradient-to-r from-green-50 to-white'>
              <div className='flex justify-between items-center'>
                <h2 className='text-xl font-bold text-on-surface'>Tạo mã QR cho cư dân</h2>
                <button
                  onClick={() => {
                    setIsCreateModalOpen(false)
                    setSelectedUserForCreate(null)
                  }}
                  className='p-1 hover:bg-gray-100 rounded-full transition-all'
                >
                  <span className='material-symbols-outlined'>close</span>
                </button>
              </div>
              <p className='text-sm text-on-surface-variant mt-1'>
                Cư dân: <span className='font-semibold text-green-600'>{selectedUserForCreate.userId}</span>
              </p>
            </div>

            <div className='p-5 space-y-4'>
              <div>
                <label className='block text-sm font-bold text-on-surface-variant mb-2'>Ngày hết hạn</label>
                <input
                  id='expiresAt'
                  type='datetime-local'
                  defaultValue={new Date(selectedUserForCreate.expiresAt).toISOString().slice(0, 16)}
                  className='w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500'
                />
              </div>
            </div>

            <div className='p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3'>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false)
                  setSelectedUserForCreate(null)
                }}
                className='px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all'
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  const expiresAt = (document.getElementById('expiresAt') as HTMLInputElement).value
                  createMutation.mutate({
                    userId: selectedUserForCreate.userId,
                    apartmentId: selectedUserForCreate.apartmentId,
                    expiresAt: new Date(expiresAt).toISOString()
                  })
                }}
                className='px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all'
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Đang tạo...' : 'Tạo QR'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
