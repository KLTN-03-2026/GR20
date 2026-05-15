import { useQuery } from '@tanstack/react-query'
import { QRCodeApi } from 'src/apis/QrcodeApi/Qr.api'
import { toast } from 'react-toastify'
import { useState } from 'react'
import { ChangePinModal } from '../PinReset/ChangePinModal'

export default function ViewQrcodeMe() {
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [historyPage] = useState(1)
  const [historyLimit] = useState(10)
  const [showChangePinModal, setShowChangePinModal] = useState(false)

  // Lấy thông tin QR cá nhân
  const {
    data: qrData,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['qrcode-me'],
    queryFn: () => QRCodeApi.getQrcodeMe(),
    retry: 1
  })

  // Lấy lịch sử quét QR cá nhân
  const {
    data: historyData,
    isLoading: isHistoryLoading,
    refetch: refetchHistory
  } = useQuery({
    queryKey: ['qrcode-me-history', historyPage, historyLimit],
    queryFn: () => QRCodeApi.getHistoryMe({ page: historyPage, limit: historyLimit }),
    retry: 1
  })

  const qrInfo = qrData?.data?.data
  const isSuccess = qrData?.data?.code === 'OK'

  const historyList = historyData?.data?.data || []
  const totalElements = historyData?.data?.totalElements || 0
  const totalPages = historyData?.data?.totalPages || 0
  const recentHistory = historyList.slice(0, 5)

  const formatDate = (dateString: string) => {
    if (!dateString) return '---'
    const date = new Date(dateString)
    return `${date.getDate()} Tháng ${date.getMonth() + 1}, ${date.getFullYear()}`
  }

  const formatTime = (dateString: string) => {
    if (!dateString) return '---'
    const date = new Date(dateString)
    return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')} ${date.getHours() >= 12 ? 'Chiều' : 'Sáng'}`
  }

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '---'
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${day}/${month}/${year} ${hours}:${minutes}`
  }

  const formatCreatedAt = (dateString: string) => {
    if (!dateString) return '---'
    const date = new Date(dateString)
    return `${date.getDate()} Tháng ${date.getMonth() + 1}, ${date.getFullYear()}`
  }

  const handleDownloadQR = () => {
    if (!qrInfo?.qrImage) {
      toast.error('Không có ảnh QR để tải')
      return
    }
    const link = document.createElement('a')
    link.href = qrInfo.qrImage
    link.download = `QR_${qrInfo.qr_code?.slice(-12) || 'personal'}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Đã tải mã QR thành công')
  }

  const handleShareQR = async () => {
    if (!qrInfo?.qrImage) {
      toast.error('Không có ảnh QR để chia sẻ')
      return
    }
    try {
      const response = await fetch(qrInfo.qrImage)
      const blob = await response.blob()
      const file = new File([blob], `QR_${qrInfo.qr_code?.slice(-12) || 'personal'}.png`, { type: 'image/png' })
      if (navigator.share) {
        await navigator.share({
          title: 'Mã QR Cư dân Homelink',
          text: 'Đây là mã QR truy cập căn hộ của tôi',
          files: [file]
        })
        toast.success('Đã mở cửa sổ chia sẻ')
      } else {
        toast.info('Trình duyệt không hỗ trợ chia sẻ, bạn có thể tải ảnh về')
      }
    } catch (error) {
      console.error('Share error:', error)
    }
  }

  const handleRefresh = () => {
    refetch()
    refetchHistory()
    toast.info('Đang làm mới dữ liệu...')
  }

  const getResultBadge = (result: string) => {
    if (result === 'SUCCESS') {
      return { text: 'THÀNH CÔNG', bg: 'bg-green-100', textColor: 'text-green-700', dot: 'bg-green-500' }
    }
    return { text: 'TỪ CHỐI', bg: 'bg-red-100', textColor: 'text-red-700', dot: 'bg-red-500' }
  }

  const getDirectionIcon = (direction: string) => {
    if (direction === 'IN') return { icon: 'login', color: 'text-blue-500', text: 'VÀO' }
    return { icon: 'logout', color: 'text-orange-500', text: 'RA' }
  }

  if (isLoading) {
    return (
      <main className='pt-20 min-h-screen bg-surface'>
        <div className='max-w-6xl mx-auto p-8 md:p-12 flex items-center justify-center min-h-[60vh]'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
            <p className='mt-4 text-on-surface-variant'>Đang tải thông tin QR...</p>
          </div>
        </div>
      </main>
    )
  }

  if (isError) {
    return (
      <main className='pt-20 min-h-screen bg-surface'>
        <div className='max-w-6xl mx-auto p-8 md:p-12 flex items-center justify-center min-h-[60vh]'>
          <div className='text-center'>
            <span className='material-symbols-outlined text-6xl text-error mb-4'>error_outline</span>
            <h2 className='text-2xl font-bold text-on-surface mb-2'>Không thể tải dữ liệu</h2>
            <p className='text-on-surface-variant mb-6'>Có lỗi xảy ra khi tải thông tin QR. Vui lòng thử lại sau.</p>
            <button
              onClick={handleRefresh}
              className='px-6 py-2 bg-primary text-white rounded-full inline-flex items-center gap-2'
            >
              <span className='material-symbols-outlined'>refresh</span>
              Thử lại
            </button>
          </div>
        </div>
      </main>
    )
  }

  if (!isSuccess || !qrInfo) {
    return (
      <main className='pt-20 min-h-screen bg-surface'>
        <div className='max-w-6xl mx-auto p-8 md:p-12 flex items-center justify-center min-h-[60vh]'>
          <div className='text-center'>
            <span className='material-symbols-outlined text-6xl text-warning mb-4'>qr_code_2</span>
            <h2 className='text-2xl font-bold text-on-surface mb-2'>Chưa có mã QR</h2>
            <p className='text-on-surface-variant mb-6'>
              Bạn chưa được cấp mã QR cá nhân. Vui lòng liên hệ quản trị viên.
            </p>
            <button
              onClick={handleRefresh}
              className='px-6 py-2 bg-primary text-white rounded-full inline-flex items-center gap-2'
            >
              <span className='material-symbols-outlined'>refresh</span>
              Làm mới
            </button>
          </div>
        </div>
      </main>
    )
  }

  const isActive = qrInfo.status === 'ACTIVE'
  const statusText = isActive ? 'HOẠT ĐỘNG' : qrInfo.status === 'EXPIRED' ? 'HẾT HẠN' : 'ĐÃ THU HỒI'
  const statusColor = isActive ? 'bg-emerald-500' : qrInfo.status === 'EXPIRED' ? 'bg-orange-500' : 'bg-red-500'

  return (
    <main className='min-h-screen bg-surface'>
      <div className='max-w-6xl mx-auto p-8 md:p-12'>
        {/* Hero Title Section */}
        <header className='mb-8'>
          <div className='flex flex-col md:flex-row md:items-end justify-between gap-4'>
            <div className='space-y-1'>
              <h1 className='text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight'>Mã QR Cá nhân</h1>
              <p className='text-on-surface-variant max-w-xl'>
                Sử dụng mã QR này để truy cập cổng chính và các tiện ích của tòa nhà
              </p>
            </div>
            <div className='flex items-center gap-3'>
              <div className='flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-outline-variant/10'>
                <span className={`flex h-2 w-2 rounded-full ${statusColor}`}></span>
                <span className='text-sm font-bold text-on-surface'>{statusText}</span>
              </div>
            </div>
          </div>
        </header>

        {/* 2 Column Layout */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Left Column - QR Code */}
          <div className='lg:col-span-1'>
            <div className='bg-surface-container-lowest rounded-2xl p-6 shadow-sm relative overflow-hidden'>
              <div className='flex flex-col items-center'>
                <div className='bg-white p-4 rounded-xl shadow-md mb-4'>
                  <img
                    alt='Resident Access QR Code'
                    className='w-48 h-48 md:w-56 md:h-56 object-contain'
                    src={qrInfo.qrImage}
                  />
                </div>

                <code className='px-3 py-1.5 bg-surface-container-low rounded-lg text-xs font-mono text-on-surface-variant break-all text-center'>
                  {qrInfo.qr_code}
                </code>

                <div className='flex flex-wrap justify-center gap-3 mt-5'>
                  <button
                    onClick={handleDownloadQR}
                    className='flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-medium transition-all hover:bg-primary/90 active:scale-95'
                  >
                    <span className='material-symbols-outlined text-base'>download</span>
                    Tải xuống
                  </button>
                  <button
                    onClick={handleShareQR}
                    className='flex items-center gap-2 px-5 py-2.5 bg-surface-container-low text-on-surface rounded-xl font-medium transition-all hover:bg-surface-container active:scale-95'
                  >
                    <span className='material-symbols-outlined text-base'>share</span>
                    Chia sẻ
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Info */}
          <div className='lg:col-span-1 space-y-5'>
            {/* Thời hạn hiệu lực */}
            <div className='bg-primary rounded-xl p-5 border border-primary/10'>
              <div className='flex items-center gap-3 mb-3'>
                <span className='material-symbols-outlined text-white'>event_available</span>
                <h3 className='font-bold text-white'>Thời hạn hiệu lực</h3>
              </div>
              <div className='flex flex-col gap-1'>
                <p className='text-2xl font-bold text-white'>{formatDate(qrInfo.expires_at)}</p>
                <p className='text-sm text-white'>lúc {formatTime(qrInfo.expires_at)}</p>
                <p className='text-xs text-white mt-2'>Tạo: {formatCreatedAt(qrInfo.created_at)}</p>
              </div>
            </div>

            {/* Card Đổi mã PIN */}
            <div className='bg-surface-container-lowest rounded-xl p-5 shadow-sm'>
              <div className='flex items-center gap-2 mb-4'>
                <span className='material-symbols-outlined text-primary'>pin</span>
                <h3 className='font-bold text-on-surface'>Mã PIN bảo mật</h3>
              </div>
              <div className='flex justify-between items-center mb-4'>
                <p className='text-sm text-on-surface-variant'>Trạng thái PIN</p>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${qrInfo.qr_code ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
                >
                  {qrInfo.qr_code ? 'ĐÃ CÀI ĐẶT' : 'CHƯA CÀI ĐẶT'}
                </span>
              </div>
              <button
                onClick={() => setShowChangePinModal(true)}
                className='w-full py-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl font-semibold transition-colors flex items-center justify-center gap-2'
              >
                <span className='material-symbols-outlined text-base'>lock_reset</span>
                Đổi mã PIN
              </button>
            </div>

            {/* Lịch sử quét gần đây */}
            <div className='bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden'>
              <div className='px-5 py-3 border-b border-outline-variant/10 flex justify-between items-center'>
                <div className='flex items-center gap-2'>
                  <span className='material-symbols-outlined text-primary text-xl'>history</span>
                  <h3 className='font-bold text-on-surface'>Lịch sử quét</h3>
                  {totalElements > 0 && (
                    <span className='text-xs text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full'>
                      {recentHistory.length}/{totalElements}
                    </span>
                  )}
                </div>
                {totalElements > 5 && (
                  <button
                    onClick={() => setIsHistoryModalOpen(true)}
                    className='text-xs font-medium text-primary hover:underline'
                  >
                    Xem tất cả ({totalPages} trang)
                  </button>
                )}
              </div>
              <div className='divide-y divide-outline-variant/5 max-h-64 overflow-y-auto'>
                {isHistoryLoading ? (
                  <div className='flex justify-center py-8'>
                    <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-primary'></div>
                  </div>
                ) : recentHistory.length === 0 ? (
                  <div className='text-center py-8 text-on-surface-variant'>
                    <span className='material-symbols-outlined text-3xl mb-1'>history</span>
                    <p className='text-sm'>Chưa có lịch sử quét</p>
                  </div>
                ) : (
                  recentHistory.map((item) => {
                    const resultBadge = getResultBadge(item.result)
                    const directionIcon = getDirectionIcon(item.direction)
                    const dateTime = formatDateTime(item.scan_time)
                    return (
                      <div
                        key={item.id}
                        className='px-5 py-3 flex items-center justify-between hover:bg-surface-container-low transition-colors'
                      >
                        <div className='flex items-center gap-3'>
                          <div
                            className={`p-1.5 rounded-full ${item.result === 'SUCCESS' ? 'bg-green-100' : 'bg-red-100'}`}
                          >
                            <span className={`material-symbols-outlined text-sm ${directionIcon.color}`}>
                              {directionIcon.icon}
                            </span>
                          </div>
                          <div>
                            <p className='text-sm font-medium text-on-surface'>
                              {item.building_name || `Cổng ${directionIcon.text}`}
                            </p>
                            <p className='text-xs text-on-surface-variant'>
                              {resultBadge.text} • {item.scanned_by_name || 'Hệ thống'}
                            </p>
                          </div>
                        </div>
                        <div className='text-right'>
                          <p className='text-xs font-medium text-on-surface'>{dateTime.split(' ')[1]}</p>
                          <p className='text-[10px] text-on-surface-variant'>{dateTime.split(' ')[0]}</p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Hướng dẫn sử dụng */}
        <div className='mt-8'>
          <div className='bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/10'>
            <div className='flex items-center gap-2 mb-4'>
              <span className='material-symbols-outlined text-primary'>lightbulb</span>
              <h3 className='font-bold text-on-surface'>Hướng dẫn sử dụng</h3>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
              <div className='flex gap-3'>
                <div className='w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0'>
                  1
                </div>
                <div>
                  <h4 className='font-medium text-on-surface text-sm'>Mở ứng dụng</h4>
                  <p className='text-xs text-on-surface-variant'>Mở Homelink và chọn "Mã QR của tôi"</p>
                </div>
              </div>
              <div className='flex gap-3'>
                <div className='w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0'>
                  2
                </div>
                <div>
                  <h4 className='font-medium text-on-surface text-sm'>Đưa mã QR</h4>
                  <p className='text-xs text-on-surface-variant'>Đưa mã QR trước thiết bị quét tại cửa</p>
                </div>
              </div>
              <div className='flex gap-3'>
                <div className='w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0'>
                  3
                </div>
                <div>
                  <h4 className='font-medium text-on-surface text-sm'>Chờ xác nhận</h4>
                  <p className='text-xs text-on-surface-variant'>Cửa sẽ tự động mở khi quét thành công</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change PIN Modal */}
      {showChangePinModal && (
        <ChangePinModal
          onClose={() => setShowChangePinModal(false)}
          qrCode={qrInfo.qr_code}
          qrType='personal'
          onSuccess={() => {
            setShowChangePinModal(false)
            refetch()
          }}
        />
      )}

      {/* History Modal */}
      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        formatDateTime={formatDateTime}
        getResultBadge={getResultBadge}
        getDirectionIcon={getDirectionIcon}
      />
    </main>
  )
}

// Modal Component (giữ nguyên code cũ)
function HistoryModal({ isOpen, onClose, formatDateTime, getResultBadge, getDirectionIcon }: any) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [resultFilter, setResultFilter] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const pageSize = 10

  const { data: historyData, isLoading } = useQuery({
    queryKey: ['personal-history-modal', currentPage, resultFilter, fromDate, toDate, searchInput],
    queryFn: () =>
      QRCodeApi.getHistoryMe({
        page: currentPage,
        limit: pageSize,
        result: resultFilter || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        search: searchInput || undefined
      }),
    enabled: isOpen
  })

  const historyList = historyData?.data?.data || []
  const totalElements = historyData?.data?.totalElements || 0
  const totalPages = historyData?.data?.totalPages || 0

  const handleFilterChange = (setter: any, value: any) => {
    setter(value)
    setCurrentPage(1)
  }

  const handleResetFilters = () => {
    setSearchInput('')
    setResultFilter('')
    setFromDate('')
    setToDate('')
    setCurrentPage(1)
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4'>
      <div className='bg-surface rounded-2xl max-w-5xl w-full max-h-[85vh] overflow-hidden shadow-2xl'>
        {/* Header */}
        <div className='p-6 border-b border-outline-variant/10 flex justify-between items-start bg-surface-container-lowest'>
          <div>
            <h2 className='text-2xl font-bold text-on-surface'>Lịch sử quét QR Cá nhân</h2>
            <p className='text-sm mt-1 text-on-surface-variant'>
              Tổng số lần quét: <span className='font-semibold text-primary'>{totalElements}</span>
            </p>
          </div>
          <button onClick={onClose} className='p-2 hover:bg-surface-container rounded-full transition-colors'>
            <span className='material-symbols-outlined text-on-surface-variant'>close</span>
          </button>
        </div>

        {/* Filters */}
        <div className='flex flex-wrap gap-3 p-4 bg-surface-container-low border-b border-outline-variant/10'>
          <input
            type='text'
            placeholder='Tìm kiếm cổng, người quét, tòa nhà...'
            className='flex-1 min-w-[200px] px-3 py-2 border border-outline-variant/30 rounded-lg text-sm bg-surface focus:outline-none focus:border-primary transition-colors'
            value={searchInput}
            onChange={(e) => handleFilterChange(setSearchInput, e.target.value)}
          />
          <select
            className='px-3 py-2 border border-outline-variant/30 rounded-lg text-sm bg-surface focus:outline-none focus:border-primary transition-colors'
            value={resultFilter}
            onChange={(e) => {
              const value = e.target.value
              setResultFilter(value)
              setCurrentPage(1)
            }}
          >
            <option value=''>Tất cả kết quả</option>
            <option value='SUCCESS'>Thành công</option>
            <option value='FAILED'>Thất bại</option>
          </select>
          <input
            type='date'
            className='px-3 py-2 border border-outline-variant/30 rounded-lg text-sm bg-surface focus:outline-none focus:border-primary transition-colors'
            value={fromDate}
            onChange={(e) => handleFilterChange(setFromDate, e.target.value)}
          />
          <span className='material-symbols-outlined text-on-surface-variant/60 text-base self-center'>east</span>
          <input
            type='date'
            className='px-3 py-2 border border-outline-variant/30 rounded-lg text-sm bg-surface focus:outline-none focus:border-primary transition-colors'
            value={toDate}
            onChange={(e) => handleFilterChange(setToDate, e.target.value)}
          />
          <button
            onClick={handleResetFilters}
            className='p-2 hover:bg-surface-container rounded-lg transition-colors text-on-surface-variant hover:text-primary'
          >
            <span className='material-symbols-outlined text-sm'>refresh</span>
          </button>
        </div>

        {/* Content */}
        <div className='p-6 overflow-y-auto max-h-[calc(85vh-250px)]'>
          {isLoading ? (
            <div className='flex justify-center py-12'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
            </div>
          ) : historyList.length === 0 ? (
            <div className='text-center py-12'>
              <span className='material-symbols-outlined text-5xl text-on-surface-variant/30'>history</span>
              <p className='mt-3 text-on-surface-variant'>Không có dữ liệu phù hợp</p>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full text-left border-collapse min-w-[800px]'>
                <thead>
                  <tr className='border-b border-outline-variant/10'>
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
                      Tòa nhà
                    </th>
                    <th className='px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider'>
                      Kết quả
                    </th>
                    <th className='px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider'>
                      Người quét
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {historyList.map((item: any, index: number) => {
                    const dateTime = formatDateTime(item.scan_time)
                    const resultBadge = getResultBadge(item.result)
                    const directionIcon = getDirectionIcon(item.direction)
                    const rowNumber = (currentPage - 1) * pageSize + index + 1
                    return (
                      <tr
                        key={item.id}
                        className='border-b border-outline-variant/5 hover:bg-surface-container-low transition-colors'
                      >
                        <td className='px-4 py-3 text-sm'>{rowNumber}</td>
                        <td className='px-4 py-3 text-sm'>
                          <div className='font-medium'>{dateTime.split(' ')[0]}</div>
                          <div className='text-xs text-on-surface-variant'>{dateTime.split(' ')[1]}</div>
                        </td>
                        <td className='px-4 py-3'>
                          <span className={`material-symbols-outlined text-sm ${directionIcon.color}`}>
                            {directionIcon.icon}
                          </span>
                          <span className='text-sm ml-1'>{directionIcon.text}</span>
                        </td>
                        <td className='px-4 py-3 text-sm'>{item.building_name || '---'}</td>
                        <td className='px-4 py-3'>
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${resultBadge.bg} ${resultBadge.textColor}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${resultBadge.dot}`}></span>
                            {resultBadge.text}
                          </span>
                        </td>
                        <td className='px-4 py-3 text-sm'>{item.scanned_by_name || '---'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='px-6 py-4 border-t border-outline-variant/10 bg-surface-container-low flex justify-between items-center flex-wrap gap-3'>
            <p className='text-xs text-on-surface-variant'>
              Trang {currentPage} / {totalPages}
            </p>
            <div className='flex gap-2'>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className='px-4 py-2 border border-outline-variant/30 rounded-lg text-sm font-medium hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                Trước
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className='px-4 py-2 border border-outline-variant/30 rounded-lg text-sm font-medium hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                Sau
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className='p-4 border-t border-outline-variant/10 bg-surface-container-lowest flex justify-end'>
          <button
            onClick={onClose}
            className='px-6 py-2.5 bg-surface-container text-on-surface rounded-lg hover:bg-surface-container-high font-semibold transition-colors'
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
