import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { QRCodeApi } from 'src/apis/QrcodeApi/Qr.api'
import { useState, useEffect } from 'react'
import QRCode from 'qrcode'
import { toast } from 'react-toastify'
import type { HistoryModalProps } from 'src/types/qrcode.type'

export default function GuestQRDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [qrImage, setQrImage] = useState('')
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)

  // Query chi tiết QR
  const { data, isLoading } = useQuery({
    queryKey: ['guest-detail', id],
    queryFn: () => QRCodeApi.getDetailQrList(id!),
    enabled: !!id
  })

  // Query lịch sử (chỉ cần 1 lần)
  const { data: dataHistory, isLoading: isHistoryLoading } = useQuery({
    queryKey: [`guest-qrs/${id}/history`],
    queryFn: () => QRCodeApi.getHistoryQrKhachId(id as string),
    enabled: !!id
  })

  const guestQR = data?.data?.data

  const historyData = dataHistory?.data?.data || []

  // Lấy 10 lần quét gần nhất
  const recentHistory = historyData.slice(0, 10)
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

              {/* Scan History Section - Recent 10 */}
              <div className='bg-surface-container-lowest rounded-[1.5rem] shadow-sm overflow-hidden'>
                <div className='px-8 py-6 border-b border-outline-variant/10 flex justify-between items-center'>
                  <div className='flex items-center space-x-3'>
                    <span className='material-symbols-outlined text-primary text-2xl'>history</span>
                    <h3 className='text-lg font-bold text-on-surface tracking-tight'>Lịch sử quét</h3>
                    {totalElements > 0 && (
                      <span className='text-xs text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full'>
                        {recentHistory.length} / {totalElements}
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
                  ) : recentHistory.length === 0 ? (
                    <div className='text-center py-12 text-on-surface-variant'>Chưa có lịch sử quét</div>
                  ) : (
                    recentHistory.map((item) => {
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

      {/* History Modal */}
      {isHistoryModalOpen && (
        <HistoryModal
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          historyData={historyData}
          guestQR={guestQR}
          formatDateTime={formatDateTime}
          getResultBadge={getResultBadge}
          getDirectionIcon={getDirectionIcon}
        />
      )}
    </div>
  )
}

// Modal Component để xem tất cả lịch sử
function HistoryModal({
  // isOpen,
  onClose,
  historyData,
  guestQR,
  formatDateTime,
  getResultBadge,
  getDirectionIcon
}: HistoryModalProps) {
  const [searchInput, setSearchInput] = useState('')
  const [resultFilter, setResultFilter] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Filter dữ liệu
  const filteredData = historyData.filter((item) => {
    const matchesSearch =
      !searchInput ||
      item.gate?.toLowerCase().includes(searchInput.toLowerCase()) ||
      item.scanned_by_name?.toLowerCase().includes(searchInput.toLowerCase())

    const matchesResult = !resultFilter || item.result === resultFilter

    const itemDate = item.scan_time ? new Date(item.scan_time).toISOString().split('T')[0] : ''
    const matchesFromDate = !fromDate || itemDate >= fromDate
    const matchesToDate = !toDate || itemDate <= toDate

    return matchesSearch && matchesResult && matchesFromDate && matchesToDate
  })

  const totalPages = Math.ceil(filteredData.length / pageSize)
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleResetFilters = () => {
    setSearchInput('')
    setResultFilter('')
    setFromDate('')
    setToDate('')
    setCurrentPage(1)
  }

  return (
    <div className='fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4'>
      <div className='bg-surface rounded-2xl max-w-5xl w-full max-h-[85vh] overflow-hidden shadow-2xl'>
        {/* Header */}
        <div className='p-6 border-b border-outline-variant/10 flex justify-between items-start bg-surface-container-lowest'>
          <div>
            <h2 className='text-2xl font-bold text-on-surface'>Lịch sử quét QR</h2>
            <p className='text-sm mt-1 text-on-surface-variant'>
              Khách: <span className='font-semibold text-primary'>{guestQR.visitor_name}</span>
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
            placeholder='Tìm kiếm cổng, người quét...'
            className='flex-1 min-w-[200px] px-3 py-2 border border-outline-variant/30 rounded-lg text-sm bg-surface focus:outline-none focus:border-primary transition-colors'
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value)
              setCurrentPage(1)
            }}
          />
          <select
            className='px-3 py-2 border border-outline-variant/30 rounded-lg text-sm bg-surface focus:outline-none focus:border-primary transition-colors'
            value={resultFilter}
            onChange={(e) => {
              setResultFilter(e.target.value)
              setCurrentPage(1)
            }}
          >
            <option value=''>Tất cả kết quả</option>
            <option value='SUCCESS'>Thành công</option>
            <option value='DENIED'>Từ chối</option>
          </select>
          <input
            type='date'
            className='px-3 py-2 border border-outline-variant/30 rounded-lg text-sm bg-surface focus:outline-none focus:border-primary transition-colors'
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value)
              setCurrentPage(1)
            }}
          />
          <span className='material-symbols-outlined text-on-surface-variant/60 text-base self-center'>east</span>
          <input
            type='date'
            className='px-3 py-2 border border-outline-variant/30 rounded-lg text-sm bg-surface focus:outline-none focus:border-primary transition-colors'
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value)
              setCurrentPage(1)
            }}
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
          {filteredData.length === 0 ? (
            <div className='text-center py-12'>
              <span className='material-symbols-outlined text-5xl text-on-surface-variant/30'>history</span>
              <p className='mt-3 text-on-surface-variant'>Không có dữ liệu phù hợp</p>
            </div>
          ) : (
            <table className='w-full text-left border-collapse'>
              <thead>
                <tr className='border-b border-outline-variant/10'>
                  <th className='px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider'>STT</th>
                  <th className='px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider'>
                    Thời gian
                  </th>
                  <th className='px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider'>
                    Hướng
                  </th>
                  <th className='px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider'>
                    Tên chủ hộ
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
                {paginatedData.map((item, index: number) => {
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
                        </span>{' '}
                        <span className='text-sm'>{directionIcon.text}</span>
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
          )}
        </div>

        {/* Pagination & Footer */}
        {filteredData.length > 0 && (
          <>
            <div className='px-6 py-4 border-t border-outline-variant/10 bg-surface-container-low flex justify-between items-center'>
              <p className='text-xs text-on-surface-variant'>
                Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredData.length)}{' '}
                trên {filteredData.length}
              </p>
              <div className='flex gap-2'>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className='px-4 py-2 border border-outline-variant/30 rounded-lg text-sm font-medium hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                >
                  Trước
                </button>
                <span className='px-4 py-2 text-sm font-medium text-on-surface-variant'>
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className='px-4 py-2 border border-outline-variant/30 rounded-lg text-sm font-medium hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                >
                  Sau
                </button>
              </div>
            </div>
          </>
        )}

        {/* Close Button */}
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
