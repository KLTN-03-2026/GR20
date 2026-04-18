import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { QRCodeApi } from 'src/apis/QrcodeApi/Qr.api'
import type { Qrcodes } from 'src/types/qrcode.type'

export default function ViewQRcodeDetails() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  // Lấy chi tiết QR
  const { data: qrDetailData, isLoading } = useQuery({
    queryKey: ['qr-detail', id],
    queryFn: () => QRCodeApi.getGuestQrDetail(id!),
    enabled: !!id
  })

  const qrDetail = qrDetailData?.data?.data as Qrcodes | undefined

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
  }

  const getStatusText = (qr: Qrcodes) => {
    if (qr.isRevoked) return 'REVOKED'
    if (qr.isExpired) return 'EXPIRED'
    if (qr.isActive) return 'ACTIVE'
    return qr.status
  }

  const getStatusColor = (qr: Qrcodes) => {
    if (qr.isRevoked) return 'bg-red-100 text-red-700'
    if (qr.isExpired) return 'bg-slate-200 text-slate-500'
    if (qr.isActive) return 'bg-green-100 text-green-700'
    return 'bg-slate-200 text-slate-500'
  }

  const getUsagePercent = (qr: Qrcodes) => {
    if (qr.maxEntries === 0) return 0
    return (qr.usedEntries / qr.maxEntries) * 100
  }

  const handleShare = () => {
    // TODO: Implement share functionality
    navigator.clipboard.writeText(qrDetail?.qrCode || '')
    alert('Đã sao chép mã QR')
  }

  const handleDownload = () => {
    // TODO: Implement download QR image
    alert('Tính năng đang phát triển')
  }

  if (isLoading) {
    return (
      <div className="bg-surface text-on-surface min-h-screen font-['Manrope',sans-serif] flex items-center justify-center">
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
          <p className='mt-4 text-on-surface-variant'>Đang tải thông tin...</p>
        </div>
      </div>
    )
  }

  if (!qrDetail) {
    return (
      <div className="bg-surface text-on-surface min-h-screen font-['Manrope',sans-serif] flex items-center justify-center">
        <div className='text-center'>
          <p className='text-on-surface-variant'>Không tìm thấy thông tin QR</p>
          <button onClick={() => navigate(-1)} className='mt-4 px-6 py-2 bg-primary text-white rounded-full'>
            Quay lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface text-on-surface antialiased min-h-screen font-['Manrope',sans-serif]">
      <main className='pb-32 px-4 md:px-8 max-w-5xl mx-auto'>
        {/* Hero Asymmetric Layout */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'>
          {/* Left Column: The QR Ticket */}
          <div className='lg:col-span-5 flex flex-col items-center'>
            <div className='relative w-full max-w-[360px] bg-surface-container-lowest rounded-[2rem] overflow-hidden shadow-2xl shadow-blue-900/10'>
              {/* Ticket Header */}
              <div className='bg-primary p-8 text-on-primary text-center relative'>
                <div className='absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-surface-container-lowest rounded-full'></div>
                <h2 className='label-md uppercase tracking-[0.2em] opacity-80 mb-1'>Entry Pass</h2>
                <p className='text-2xl font-extrabold tracking-tight'>{qrDetail.visitor.name}</p>
              </div>

              {/* QR Content */}
              <div className='p-10 pt-12 flex flex-col items-center bg-white'>
                <div
                  className='qr-gradient-border rounded-2xl mb-8'
                  style={{ background: 'linear-gradient(135deg, #005ab7 0%, #0072e5 100%)', padding: '2px' }}
                >
                  <div className='bg-white p-4 rounded-[calc(1rem-2px)]'>
                    {qrDetail.qrImage ? (
                      <img alt='Guest Access QR Code' className='w-48 h-48' src={qrDetail.qrImage} />
                    ) : (
                      <div className='w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center'>
                        <span className='material-symbols-outlined text-6xl text-gray-400'>qr_code_2</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className='text-center space-y-1'>
                  <p className='text-on-surface-variant text-sm font-medium'>Scan at Building A Gate</p>
                  <p className='text-primary font-bold tracking-widest'>{qrDetail.qrCode.slice(-8)}</p>
                </div>

                {/* Status Badge */}
                <div
                  className={`mt-8 px-6 py-2 rounded-full text-xs font-bold tracking-widest uppercase ${getStatusColor(qrDetail)}`}
                >
                  {getStatusText(qrDetail)}
                </div>
              </div>

              {/* Perforated Line Effect */}
              <div className='flex items-center px-4 overflow-hidden bg-white'>
                <div className='w-4 h-8 bg-surface -ml-6 rounded-full'></div>
                <div className='flex-1 border-t-2 border-dashed border-surface-container-high mx-2'></div>
                <div className='w-4 h-8 bg-surface -mr-6 rounded-full'></div>
              </div>

              {/* Ticket Footer Info */}
              <div className='p-8 bg-white grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-[10px] uppercase tracking-wider text-on-surface-variant opacity-60'>Apartment</p>
                  <p className='font-bold text-on-surface'>{qrDetail.apartmentCode}</p>
                </div>
                <div className='text-right'>
                  <p className='text-[10px] uppercase tracking-wider text-on-surface-variant opacity-60'>Usage</p>
                  <p className='font-bold text-on-surface'>
                    {qrDetail.usedEntries} / {qrDetail.maxEntries} Left
                  </p>
                </div>
              </div>
            </div>

            {/* Action Group */}
            <div className='mt-8 flex gap-4 w-full max-w-[360px]'>
              <button
                onClick={handleShare}
                className='flex-1 bg-gradient-to-br from-primary to-primary-container text-on-primary h-12 rounded-full font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all'
              >
                <span className='material-symbols-outlined text-[20px]'>share</span>
                Chia sẻ
              </button>
              <button
                onClick={handleDownload}
                className='w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center text-primary hover:bg-surface-container-low transition-all active:scale-95'
              >
                <span className='material-symbols-outlined'>download</span>
              </button>
            </div>
          </div>

          {/* Right Column: Details & Insights */}
          <div className='lg:col-span-7 space-y-6'>
            {/* Header Info */}
            <div className='mb-2'>
              <h1 className='text-4xl font-extrabold tracking-tighter text-on-surface mb-2'>Chi tiết mã truy cập</h1>
              <p className='text-on-surface-variant leading-relaxed'>
                Thông tin định danh và lịch sử sử dụng của khách đã được phê duyệt cho khu vực {qrDetail.apartmentCode}.
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Detail Card 1 */}
              <div className='bg-surface-container-lowest p-6 rounded-3xl shadow-sm'>
                <div className='flex items-center gap-4 mb-4'>
                  <div className='w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary'>
                    <span className='material-symbols-outlined'>calendar_today</span>
                  </div>
                  <span className='text-xs font-bold uppercase tracking-widest text-on-surface-variant'>
                    Thời gian hiệu lực
                  </span>
                </div>
                <div className='space-y-2'>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-on-surface-variant'>Bắt đầu</span>
                    <span className='font-bold'>{formatDate(qrDetail.validFrom)}</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-on-surface-variant'>Kết thúc</span>
                    <span className='font-bold'>{formatDate(qrDetail.validTo)}</span>
                  </div>
                </div>
              </div>

              {/* Detail Card 2 */}
              <div className='bg-surface-container-lowest p-6 rounded-3xl shadow-sm'>
                <div className='flex items-center gap-4 mb-4'>
                  <div className='w-10 h-10 rounded-xl bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed-variant'>
                    <span className='material-symbols-outlined'>numbers</span>
                  </div>
                  <span className='text-xs font-bold uppercase tracking-widest text-on-surface-variant'>
                    Hạn mức truy cập
                  </span>
                </div>
                <div className='flex items-end justify-between'>
                  <div>
                    <span className='text-3xl font-extrabold text-on-surface'>{qrDetail.usedEntries}</span>
                    <span className='text-on-surface-variant font-medium'> / {qrDetail.maxEntries} lượt</span>
                  </div>
                  {qrDetail.usedEntries >= qrDetail.maxEntries && (
                    <div className='text-right'>
                      <span className='text-xs font-bold text-error'>Hết lượt dùng</span>
                    </div>
                  )}
                </div>
                {/* Progress Bar */}
                <div className='mt-4 w-full h-2 bg-surface-container-high rounded-full overflow-hidden'>
                  <div
                    className='h-full bg-primary-container rounded-full'
                    style={{ width: `${getUsagePercent(qrDetail)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Glass Insight Module */}
            <div className='bg-surface-bright/60 backdrop-blur-lg p-6 rounded-3xl border border-white/50 shadow-lg shadow-blue-900/5'>
              <div className='flex items-start gap-4'>
                <div className='mt-1 p-2 bg-white rounded-lg shadow-sm'>
                  <span
                    className='material-symbols-outlined text-primary'
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    auto_awesome
                  </span>
                </div>
                <div>
                  <h3 className='font-bold text-on-surface mb-1'>Ghi chú hệ thống</h3>
                  <p className='text-sm text-on-surface-variant leading-relaxed'>
                    Mã QR <span className='font-bold'>{qrDetail.qrCode.slice(-8)}</span> của khách{' '}
                    <span className='font-bold'>{qrDetail.visitor.name}</span>{' '}
                    {qrDetail.usedEntries >= qrDetail.maxEntries
                      ? 'đã đạt giới hạn sử dụng. Vui lòng gia hạn hoặc tạo mã mới nếu khách cần tiếp tục truy cập.'
                      : `đã sử dụng ${qrDetail.usedEntries}/${qrDetail.maxEntries} lượt. Còn ${qrDetail.maxEntries - qrDetail.usedEntries} lượt.`}
                  </p>
                </div>
              </div>
            </div>

            {/* Identity Summary */}
            <div className='bg-surface-container-low p-6 rounded-3xl border border-outline-variant/10'>
              <h4 className='text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4'>
                Thông tin căn hộ &amp; Định danh
              </h4>
              <div className='flex items-center justify-between py-3 border-b border-outline-variant/10'>
                <span className='text-on-surface-variant'>Tên Khách</span>
                <span className='font-bold text-primary'>{qrDetail.visitor.name}</span>
              </div>
              <div className='flex items-center justify-between py-3 border-b border-outline-variant/10'>
                <span className='text-on-surface-variant'>Số điện thoại</span>
                <span className='font-bold text-primary'>{qrDetail.visitor.phone}</span>
              </div>
              <div className='flex items-center justify-between py-3 border-b border-outline-variant/10'>
                <span className='text-on-surface-variant'>Căn hộ</span>
                <span className='font-bold text-primary'>{qrDetail.apartmentCode}</span>
              </div>
              <div className='flex items-center justify-between py-3 border-b border-outline-variant/10'>
                <span className='text-on-surface-variant'>CCCD</span>
                <span className='font-bold text-primary'>{qrDetail.visitor.idCard}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* BottomNavBar - Mobile Only */}
      <nav className='lg:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-6 pb-6 pt-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50'>
        <button
          onClick={() => navigate('/dashboard')}
          className='flex flex-col items-center justify-center text-slate-400'
        >
          <span className='material-symbols-outlined mb-1'>home</span>
          <span className='text-[10px] uppercase tracking-widest font-bold'>Home</span>
        </button>
        <button
          onClick={() => navigate('/qr-management')}
          className='flex flex-col items-center justify-center bg-blue-600 text-white rounded-full p-3 mb-2 transform -translate-y-2 scale-110 duration-300 ease-out'
        >
          <span className='material-symbols-outlined'>qr_code_2</span>
        </button>
        <button className='flex flex-col items-center justify-center text-slate-400'>
          <span className='material-symbols-outlined mb-1'>person_add</span>
          <span className='text-[10px] uppercase tracking-widest font-bold'>Visitors</span>
        </button>
        <button
          onClick={() => navigate('/profile')}
          className='flex flex-col items-center justify-center text-slate-400'
        >
          <span className='material-symbols-outlined mb-1'>person</span>
          <span className='text-[10px] uppercase tracking-widest font-bold'>Profile</span>
        </button>
      </nav>
    </div>
  )
}
