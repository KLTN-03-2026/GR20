import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { QRCodeApi } from 'src/apis/QrcodeApi/Qr.api'
import { useState, useEffect } from 'react'
import QRCode from 'qrcode'
import { toast } from 'react-toastify'
import { ChangePinModal } from '../PinReset/ChangePinModal'

export default function GuestQRDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [qrImage, setQrImage] = useState('')
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [showChangePinModal, setShowChangePinModal] = useState(false)

  // Query chi tiết QR
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['guest-detail', id],
    queryFn: () => QRCodeApi.getDetailQrList(id!),
    enabled: !!id
  })

  // Query lịch sử (chỉ lấy 10 record đầu tiên)
  const { data: dataHistory, isLoading: isHistoryLoading } = useQuery({
    queryKey: [`guest-qrs/${id}/history`],
    queryFn: () => QRCodeApi.getHistoryQrKhachId(id as string, { page: 1, limit: 10 }),
    enabled: !!id
  })

  const guestQR = data?.data?.data
  const historyData = dataHistory?.data?.data || []
  const totalElements = dataHistory?.data?.totalElements || 0
  const hasMore = totalElements > 10

  // Tạo ảnh QR từ qr_code
  useEffect(() => {
    if (guestQR?.qr_code) {
      QRCode.toDataURL(guestQR.qr_code, {
        width: 400,
        margin: 2,
        scale: 8,
        errorCorrectionLevel: 'H'
      }).then(setQrImage)
    }
  }, [guestQR])

  const formatDate = (dateString: string) => {
    if (!dateString) return '---'
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  // Thay thế hàm formatDateTime hiện tại bằng hàm này
  const formatDateTime = (dateString: string) => {
    if (!dateString) return '---'
    const date = new Date(dateString)
    const vnDate = new Date(date.getTime() + 7 * 60 * 60 * 1000) // Cộng thêm 7 tiếng (UTC+7)
    const hours = vnDate.getHours().toString().padStart(2, '0')
    const minutes = vnDate.getMinutes().toString().padStart(2, '0')
    const seconds = vnDate.getSeconds().toString().padStart(2, '0')
    const day = vnDate.getDate().toString().padStart(2, '0')
    const month = (vnDate.getMonth() + 1).toString().padStart(2, '0')
    const year = vnDate.getFullYear()
    return `${hours}:${minutes}:${seconds} - ${day}/${month}/${year}`
  }

  const getResultBadge = (result: string) => {
    if (result === 'SUCCESS') {
      return { text: 'THÀNH CÔNG', bg: 'bg-green-100', textColor: 'text-green-700' }
    }
    return { text: 'TỪ CHỐI', bg: 'bg-red-100', textColor: 'text-red-700' }
  }

  const getDirectionIcon = (direction: string) => {
    if (direction === 'IN') return { icon: 'login', color: 'text-blue-500', text: 'VÀO' }
    return { icon: 'logout', color: 'text-orange-500', text: 'RA' }
  }

  const usagePercent = guestQR ? (guestQR.used_entries / guestQR.max_entries) * 100 : 0
  const isUsedUp = guestQR?.used_entries && guestQR?.used_entries >= guestQR?.max_entries
  const isExpired = guestQR?.valid_to ? new Date(guestQR.valid_to) < new Date() : false
  const isActive = guestQR?.status === 'ACTIVE' && !isExpired && !isUsedUp

  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
      </div>
    )
  }

  if (!guestQR) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='text-center'>
          <p className='text-on-surface-variant'>Không tìm thấy thông tin QR</p>
          <button onClick={() => navigate(-1)} className='mt-4 px-4 py-2 bg-primary text-white rounded-lg'>
            Quay lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='bg-surface text-on-surface min-h-screen'>
      <main className='min-h-screen'>
        <div className='max-w-7xl mx-auto'>
          {/* Header */}
          <div className='flex justify-between items-end mb-8'>
            <div className='space-y-1'>
              <h2 className='text-3xl font-extrabold text-on-surface tracking-tight leading-tight'>
                Chi tiết mã QR Khách
              </h2>
            </div>
            <div className='flex items-center space-x-3'>
              <button
                onClick={() => navigate(-1)}
                className='flex items-center px-6 py-2.5 rounded-full bg-surface-container-lowest text-on-surface-variant text-sm font-semibold border border-outline-variant/15 hover:bg-surface-container transition-colors shadow-sm'
              >
                <span className='material-symbols-outlined mr-2 text-lg'>arrow_back</span>
                Quay lại
              </button>
            </div>
          </div>

          <div className='grid grid-cols-12 gap-10'>
            {/* Left Column: QR Display */}
            <div className='col-span-12 lg:col-span-5 xl:col-span-4 space-y-8'>
              <div className='bg-surface-container-lowest p-8 rounded-[1.5rem] shadow-sm relative overflow-hidden'>
                <div className='absolute top-0 right-0 p-4 opacity-10'>
                  <span className='material-symbols-outlined text-6xl'>qr_code_2</span>
                </div>
                <div className='flex flex-col items-center'>
                  <div className='bg-white p-6 rounded-2xl shadow-inner mb-6 border border-outline-variant/10'>
                    {qrImage ? (
                      <img src={qrImage} alt='QR Code' className='w-full max-w-[240px] aspect-square object-contain' />
                    ) : (
                      <div className='w-60 h-60 bg-surface-container rounded-xl flex items-center justify-center'>
                        <span className='material-symbols-outlined text-primary/40 text-7xl'>qr_code</span>
                      </div>
                    )}
                  </div>
                  <div className='text-center w-full'>
                    <p className='text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-1'>
                      Mã QR ID
                    </p>
                    <p className='text-xs font-mono text-on-surface bg-surface-container-low px-4 py-2 rounded-lg break-all'>
                      {guestQR.qr_code}
                    </p>
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-4 mt-8'>
                  <a
                    href={qrImage}
                    download={`guest-qr-${guestQR.id}.png`}
                    className='flex flex-col items-center justify-center p-4 rounded-2xl bg-primary/5 hover:bg-primary/10 text-primary transition-all duration-300 border border-primary/10'
                  >
                    <span className='material-symbols-outlined mb-2'>download</span>
                    <span className='text-xs font-bold uppercase tracking-wide'>Tải xuống mã</span>
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(guestQR.qr_code)
                      toast.success('Đã sao chép mã QR')
                    }}
                    className='flex flex-col items-center justify-center p-4 rounded-2xl bg-secondary-container/10 hover:bg-secondary-container/20 text-secondary transition-all duration-300 border border-secondary/10'
                  >
                    <span className='material-symbols-outlined mb-2'>content_copy</span>
                    <span className='text-xs font-bold uppercase tracking-wide'>Sao chép mã</span>
                  </button>
                </div>
              </div>

              {/* AI Insight Box */}
              <div className='bg-surface-container-lowest p-6 rounded-3xl border border-primary/5 shadow-md'>
                <div className='flex items-start space-x-4'>
                  <div className='bg-primary-container p-2 rounded-xl text-white'>
                    <span className='material-symbols-outlined text-lg'>auto_awesome</span>
                  </div>
                  <div>
                    <h4 className='text-sm font-bold text-primary mb-1 tracking-tight'>Gợi ý từ Homelink AI</h4>
                    <p className='text-sm text-on-surface-variant leading-relaxed'>
                      {isUsedUp
                        ? 'Mã QR này đã sử dụng hết số lượt cho phép. Bạn có thể gia hạn hoặc tạo mã mới.'
                        : isExpired
                          ? 'Mã QR này đã hết hạn. Vui lòng tạo mã mới để cấp cho khách.'
                          : 'Bạn có thể thu hồi mã này bất kỳ lúc nào nếu khách đã hoàn thành chuyến thăm để tăng cường bảo mật.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Information Cards */}
            <div className='col-span-12 lg:col-span-7 xl:col-span-8 space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* Visitor Info */}
                <div className='bg-surface-container-lowest p-8 rounded-[1.5rem] shadow-sm'>
                  <div className='flex items-center space-x-3 mb-8'>
                    <span className='material-symbols-outlined text-primary text-2xl'>person_outline</span>
                    <h3 className='text-lg font-bold text-on-surface tracking-tight'>Thông tin Khách</h3>
                  </div>
                  <div className='space-y-6'>
                    <div className='flex justify-between items-end'>
                      <p className='text-[11px] font-bold text-on-surface-variant uppercase tracking-wider'>
                        Họ và tên
                      </p>
                      <p className='text-sm font-medium text-on-surface'>{guestQR.visitor_name || 'Chưa cập nhật'}</p>
                    </div>
                    <div className='flex justify-between items-end'>
                      <p className='text-[11px] font-bold text-on-surface-variant uppercase tracking-wider'>
                        Số điện thoại
                      </p>
                      <p className='text-sm font-medium text-on-surface'>{guestQR.visitor_phone || '---'}</p>
                    </div>
                    <div className='flex justify-between items-end'>
                      <p className='text-[11px] font-bold text-on-surface-variant uppercase tracking-wider'>CCCD/ID</p>
                      <p className='text-sm font-medium text-on-surface'>{guestQR.visitor_id_card || '---'}</p>
                    </div>
                  </div>
                </div>

                {/* Access Rights */}
                <div className='bg-surface-container-lowest p-8 rounded-[1.5rem] shadow-sm'>
                  <div className='flex items-center space-x-3 mb-8'>
                    <span className='material-symbols-outlined text-primary text-2xl'>vpn_key</span>
                    <h3 className='text-lg font-bold text-on-surface tracking-tight'>Quyền truy cập</h3>
                  </div>
                  <div className='space-y-6'>
                    <div className='flex justify-between items-center'>
                      <p className='text-[11px] font-bold text-on-surface-variant uppercase tracking-wider'>Căn hộ</p>
                      <p className='text-base font-extrabold text-primary'>{guestQR.apartment_code || '---'}</p>
                    </div>
                    <div className='flex justify-between items-center'>
                      <p className='text-[11px] font-bold text-on-surface-variant uppercase tracking-wider'>
                        Trạng thái
                      </p>
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          isActive
                            ? 'bg-green-100 text-green-700'
                            : isExpired
                              ? 'bg-orange-100 text-orange-700'
                              : isUsedUp
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {isActive ? 'HOẠT ĐỘNG' : isExpired ? 'HẾT HẠN' : isUsedUp ? 'HẾT LƯỢT' : 'ĐÃ KHÓA'}
                      </span>
                    </div>
                    <div className='space-y-2'>
                      <div className='flex justify-between items-center'>
                        <p className='text-[11px] font-bold text-on-surface-variant uppercase tracking-wider'>
                          Số lần sử dụng
                        </p>
                        <p className='text-xs font-bold text-on-surface'>
                          {guestQR.used_entries}/{guestQR.max_entries} lượt
                        </p>
                      </div>
                      <div className='w-full h-2 bg-surface-container rounded-full overflow-hidden'>
                        <div
                          className={`h-full transition-all duration-500 ${isUsedUp ? 'bg-red-500' : 'bg-primary'}`}
                          style={{ width: `${Math.min(usagePercent, 100)}%` }}
                        ></div>
                      </div>
                      {isUsedUp && (
                        <p className='text-[10px] text-red-500 font-medium text-right italic'>Đã sử dụng hết lượt</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Validity Period */}
                <div className='bg-surface-container-lowest p-8 rounded-[1.5rem] shadow-sm md:col-span-2'>
                  <div className='flex items-center space-x-3 mb-8'>
                    <span className='material-symbols-outlined text-primary text-2xl'>event_available</span>
                    <h3 className='text-lg font-bold text-on-surface tracking-tight'>Thời hạn hiệu lực</h3>
                  </div>
                  <div className='flex flex-col md:flex-row md:items-center space-y-6 md:space-y-0 md:space-x-12'>
                    <div className='flex-1'>
                      <p className='text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2'>
                        Từ ngày
                      </p>
                      <div className='flex items-center space-x-3'>
                        <span className='material-symbols-outlined text-on-surface-variant'>calendar_today</span>
                        <p className='text-lg font-bold text-on-surface'>{formatDate(guestQR.valid_from)}</p>
                      </div>
                    </div>
                    <div className='flex items-center justify-center hidden md:flex'>
                      <span className='material-symbols-outlined text-primary/30 text-3xl'>trending_flat</span>
                    </div>
                    <div className='flex-1'>
                      <p className='text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2'>
                        Đến ngày
                      </p>
                      <div className='flex items-center space-x-3'>
                        <span className='material-symbols-outlined text-on-surface-variant'>event</span>
                        <p className='text-lg font-bold text-on-surface'>{formatDate(guestQR.valid_to)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Đổi mã PIN */}
              <div className='bg-surface-container-lowest p-6 rounded-[1.5rem] shadow-sm'>
                <div className='flex items-center space-x-3 mb-4'>
                  <span className='material-symbols-outlined text-primary text-2xl'>pin</span>
                  <h3 className='text-lg font-bold text-on-surface tracking-tight'>Mã PIN bảo mật</h3>
                </div>
                <div className='flex justify-between items-center mb-4'>
                  <p className='text-sm text-on-surface-variant'>Trạng thái PIN</p>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${guestQR.qr_code ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
                  >
                    {guestQR.qr_code ? 'ĐÃ CÀI ĐẶT' : 'CHƯA CÀI ĐẶT'}
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

              {/* Scan History Section - Recent 10 */}
              <div className='bg-surface-container-lowest rounded-[1.5rem] shadow-sm overflow-hidden'>
                <div className='px-8 py-6 border-b border-outline-variant/10 flex justify-between items-center'>
                  <div className='flex items-center space-x-3'>
                    <span className='material-symbols-outlined text-primary text-2xl'>history</span>
                    <h3 className='text-lg font-bold text-on-surface tracking-tight'>Lịch sử quét</h3>
                    {totalElements > 0 && (
                      <span className='text-xs text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full'>
                        {historyData.length} / {totalElements}
                      </span>
                    )}
                  </div>
                  {hasMore && (
                    <button
                      onClick={() => setIsHistoryModalOpen(true)}
                      className='text-xs font-bold text-primary uppercase tracking-widest hover:underline transition-all'
                    >
                      Xem tất cả ({totalElements})
                    </button>
                  )}
                </div>
                <div className='divide-y divide-outline-variant/5 max-h-96 overflow-y-auto'>
                  {isHistoryLoading ? (
                    <div className='flex justify-center py-12'>
                      <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
                    </div>
                  ) : historyData.length === 0 ? (
                    <div className='text-center py-12 text-on-surface-variant'>Chưa có lịch sử quét</div>
                  ) : (
                    historyData.map((item) => {
                      const resultBadge = getResultBadge(item.result)
                      const directionIcon = getDirectionIcon(item.direction)
                      const dateTime = formatDateTime(item.scan_time)
                      return (
                        <div
                          key={item.id}
                          className='px-8 py-5 flex items-center justify-between hover:bg-surface-container-low transition-colors'
                        >
                          <div className='flex items-center space-x-4'>
                            <div
                              className={`p-2 rounded-full ${
                                item.result === 'SUCCESS' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                              }`}
                            >
                              <span className='material-symbols-outlined text-base'>{directionIcon.icon}</span>
                            </div>
                            <div>
                              <p className='text-sm font-bold text-on-surface'>
                                {item.gate || `Cổng ${directionIcon.text}`}
                              </p>
                              <p className='text-[11px] text-on-surface-variant'>
                                {resultBadge.text} • {item.scanned_by_name || 'Hệ thống'}
                              </p>
                            </div>
                          </div>
                          <div className='text-right'>
                            <p className='text-sm font-bold text-on-surface'>{dateTime.split(' ')[1]}</p>
                            <p className='text-[10px] text-on-surface-variant uppercase tracking-wide'>
                              {dateTime.split(' ')[0]}
                            </p>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Change PIN Modal */}
      {showChangePinModal && (
        <ChangePinModal
          onClose={() => setShowChangePinModal(false)}
          qrCode={guestQR.qr_code}
          qrType='guest'
          onSuccess={() => {
            setShowChangePinModal(false)
            refetch()
          }}
        />
      )}

      {/* History Modal */}
      {isHistoryModalOpen && (
        <HistoryModal
          onClose={() => setIsHistoryModalOpen(false)}
          guestQR={guestQR}
          formatDateTime={formatDateTime}
          getResultBadge={getResultBadge}
          getDirectionIcon={getDirectionIcon}
          qrId={id!}
        />
      )}
    </div>
  )
}

// Modal Component với phân trang từ API
function HistoryModal({
  onClose,
  guestQR,
  formatDateTime,
  getResultBadge,
  getDirectionIcon,
  qrId
}: {
  onClose: () => void
  guestQR: any
  formatDateTime: (date: string) => string
  getResultBadge: (result: string) => { text: string; bg: string; textColor: string }
  getDirectionIcon: (direction: string) => { icon: string; color: string; text: string }
  qrId: string
}) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [resultFilter, setResultFilter] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const pageSize = 10

  // Gọi API lịch sử với phân trang
  const { data: historyData, isLoading } = useQuery({
    queryKey: ['guest-history', qrId, currentPage, resultFilter, fromDate, toDate, searchInput],
    queryFn: () =>
      QRCodeApi.getHistoryQrKhachId(qrId, {
        page: currentPage,
        limit: pageSize,
        result: resultFilter || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        search: searchInput || undefined
      }),
    enabled: !!qrId
  })

  const historyList = historyData?.data?.data || []
  const totalElements = historyData?.data?.totalElements || 0
  const totalPages = historyData?.data?.totalPages || 0

  // Reset page khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1)
  }, [searchInput, resultFilter, fromDate, toDate])

  const handleResetFilters = () => {
    setSearchInput('')
    setResultFilter('')
    setFromDate('')
    setToDate('')
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (isLoading && currentPage === 1 && historyList.length === 0) {
    return (
      <div className='fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4'>
        <div className='bg-surface rounded-2xl p-8'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
          <p className='mt-4 text-center'>Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4'>
      <div className='bg-surface rounded-2xl max-w-7xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col'>
        {/* Header */}
        <div className='p-6 border-b border-outline-variant/10 flex justify-between items-start bg-surface-container-lowest flex-shrink-0'>
          <div>
            <h2 className='text-2xl font-bold text-on-surface'>Lịch sử quét QR</h2>
            <p className='text-sm mt-1 text-on-surface-variant'>
              Khách: <span className='font-semibold text-primary'>{guestQR.visitor_name}</span>
              {totalElements > 0 && (
                <span className='ml-2 text-xs bg-surface-container-high px-2 py-0.5 rounded-full'>
                  Tổng: {totalElements} lượt
                </span>
              )}
            </p>
          </div>
          <button onClick={onClose} className='p-2 hover:bg-surface-container rounded-full transition-colors'>
            <span className='material-symbols-outlined text-on-surface-variant'>close</span>
          </button>
        </div>

        {/* Filters */}
        <div className='flex flex-wrap gap-3 p-4 bg-surface-container-low border-b border-outline-variant/10 flex-shrink-0'>
          <input
            type='text'
            placeholder='Tìm kiếm...'
            className='flex-1 min-w-[200px] px-3 py-2 border border-outline-variant/30 rounded-lg text-sm bg-surface focus:outline-none focus:border-primary transition-colors'
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />

          <input
            type='date'
            className='px-3 py-2 border border-outline-variant/30 rounded-lg text-sm bg-surface focus:outline-none focus:border-primary transition-colors'
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <span className='material-symbols-outlined text-on-surface-variant/60 text-base self-center'>east</span>
          <input
            type='date'
            className='px-3 py-2 border border-outline-variant/30 rounded-lg text-sm bg-surface focus:outline-none focus:border-primary transition-colors'
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
          <button
            onClick={handleResetFilters}
            className='p-2 hover:bg-surface-container rounded-lg transition-colors text-on-surface-variant hover:text-primary'
          >
            <span className='material-symbols-outlined text-sm'>refresh</span>
          </button>
        </div>

        {/* Content - FIX: thêm flex-1 và overflow-y-auto */}
        <div className='p-6 overflow-y-auto flex-1 min-h-0'>
          {historyList.length === 0 ? (
            <div className='text-center py-12'>
              <span className='material-symbols-outlined text-5xl text-on-surface-variant/30'>history</span>
              <p className='mt-3 text-on-surface-variant'>Không có dữ liệu phù hợp</p>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full text-left border-collapse min-w-[1000px]'>
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
                      Tên khách
                    </th>
                    <th className='px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider'>
                      Thông tin khách
                    </th>
                    <th className='px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider'>
                      Căn hộ
                    </th>
                    <th className='px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider'>
                      Chủ nhà
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
                  {historyList.map((item, index: number) => {
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
                        <td className='px-4 py-3 text-sm font-medium text-on-surface'>{item.visitor_name || '---'}</td>
                        <td className='px-4 py-3 text-sm'>
                          <div className='flex flex-col gap-0.5'>
                            {item.visitor_phone && (
                              <div className='flex items-center gap-1'>
                                <span className='material-symbols-outlined text-xs text-on-surface-variant'>phone</span>
                                <span className='text-xs'>{item.visitor_phone}</span>
                              </div>
                            )}
                            {item.visitor_id_card && (
                              <div className='flex items-center gap-1'>
                                <span className='material-symbols-outlined text-xs text-on-surface-variant'>badge</span>
                                <span className='text-xs font-mono'>{item.visitor_id_card}</span>
                              </div>
                            )}
                            {!item.visitor_phone && !item.visitor_id_card && (
                              <span className='text-xs text-on-surface-variant'>---</span>
                            )}
                          </div>
                        </td>
                        <td className='px-4 py-3 text-sm'>
                          <span className='px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-semibold'>
                            {item.apartment_code || '---'}
                          </span>
                        </td>
                        <td className='px-4 py-3 text-sm'>{item.host_name || '---'}</td>
                        <td className='px-4 py-3'>
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${resultBadge.bg} ${resultBadge.textColor}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${resultBadge.bg}`}></span>
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

        {/* Pagination - FIX: thêm flex-shrink-0 để không bị thu nhỏ */}
        {totalPages > 1 && (
          <div className='px-6 py-4 border-t border-outline-variant/10 bg-surface-container-low flex justify-between items-center flex-wrap gap-3 flex-shrink-0'>
            <p className='text-xs text-on-surface-variant'>
              Trang {currentPage} / {totalPages}
            </p>
            <div className='flex gap-2'>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className='px-4 py-2 border border-outline-variant/30 rounded-lg text-sm font-medium hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                Trước
              </button>
              <div className='flex gap-1'>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-primary text-white'
                          : 'border border-outline-variant/30 hover:bg-surface-container'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className='px-4 py-2 border border-outline-variant/30 rounded-lg text-sm font-medium hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
