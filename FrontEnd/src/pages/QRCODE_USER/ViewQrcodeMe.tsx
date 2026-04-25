import { useQuery } from '@tanstack/react-query'
import { QRCodeApi } from 'src/apis/QrcodeApi/Qr.api'
import { toast } from 'react-toastify'

export default function ViewQrcodeMe() {
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

  const qrInfo = qrData?.data?.data
  const isSuccess = qrData?.data?.code === 'OK'

  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getDate()} Tháng ${date.getMonth() + 1}, ${date.getFullYear()}`
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')} ${date.getHours() >= 12 ? 'Chiều' : 'Sáng'}`
  }

  const formatCreatedAt = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getDate()} Tháng ${date.getMonth() + 1}, ${date.getFullYear()}`
  }

  // Xử lý tải QR
  const handleDownloadQR = () => {
    if (!qrInfo?.qrImage) {
      toast.error('Không có ảnh QR để tải')
      return
    }

    const link = document.createElement('a')
    link.href = qrInfo.qrImage
    link.download = `QR_${qrInfo.qr_code.slice(-12)}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Đã tải mã QR thành công')
  }

  // Xử lý chia sẻ QR
  const handleShareQR = async () => {
    if (!qrInfo?.qrImage) {
      toast.error('Không có ảnh QR để chia sẻ')
      return
    }

    try {
      // Chuyển đổi base64 thành blob
      const response = await fetch(qrInfo.qrImage)
      const blob = await response.blob()
      const file = new File([blob], `QR_${qrInfo.qr_code.slice(-12)}.png`, { type: 'image/png' })

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

  // Xử lý refresh
  const handleRefresh = () => {
    refetch()
    toast.info('Đang làm mới dữ liệu...')
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

  // Xác định trạng thái hiển thị
  const isActive = qrInfo.status === 'ACTIVE'
  const statusText = isActive ? 'HOẠT ĐỘNG' : qrInfo.status === 'EXPIRED' ? 'HẾT HẠN' : 'ĐÃ THU HỒI'
  const statusColor = isActive ? 'bg-emerald-500' : qrInfo.status === 'EXPIRED' ? 'bg-orange-500' : 'bg-red-500'

  return (
    <main className='min-h-screen bg-surface'>
      <div className='max-w-6xl mx-auto p-8 md:p-12'>
        {/* Hero Title Section */}
        <header className='mb-12'>
          <div className='flex flex-col md:flex-row md:items-end justify-between gap-6'>
            <div className='space-y-2'>
              <span className='inline-block px-3 py-1 bg-secondary-fixed text-on-secondary-fixed-variant text-[10px] font-extrabold uppercase tracking-[0.2em] rounded-sm'>
                Giao Thức Truy Cập An Toàn
              </span>
              <h1 className='text-4xl md:text-5xl font-extrabold text-on-surface tracking-tighter leading-tight'>
                Chìa Khóa Cư Dân Kỹ Thuật Số
              </h1>
              <p className='text-lg text-on-surface-variant max-w-xl'>
                Sử dụng chữ ký mã hóa này để truy cập liền mạch qua cổng chính, phòng tập thể dục và các sảnh cộng đồng.
              </p>
            </div>
            <div className='flex items-center gap-3'>
              <div className='flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-outline-variant/10'>
                <span className={`flex h-2 w-2 rounded-full ${statusColor}`}></span>
                <span className='text-sm font-bold text-on-surface'>TRẠNG THÁI: {statusText}</span>
              </div>
              {/* <button
                onClick={handleRefresh}
                className='p-2 bg-white rounded-full shadow-sm hover:bg-surface-container-low transition-all'
                title='Làm mới'
              >
                <span className='material-symbols-outlined text-on-surface-variant'>refresh</span>
              </button> */}
            </div>
          </div>
        </header>

        {/* Asymmetric Bento Layout */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
          {/* QR Code Central Module */}
          <div className='lg:col-span-7'>
            <div className='bg-surface-container-lowest rounded-[2rem] p-8 md:p-12 shadow-[0_24px_48px_-12px_rgba(0,90,183,0.08)] flex flex-col items-center justify-center relative overflow-hidden'>
              {/* Atmospheric Gradient Background */}
              <div className='absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl'></div>
              <div className='absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-secondary/5 rounded-full blur-3xl'></div>

              {/* The QR Code Image Container */}
              <div className='relative z-10 p-8 bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.03)] group transition-transform duration-500 hover:scale-[1.02]'>
                <div className='w-96 h-96 md:w-[32rem] md:h-[32rem] bg-slate-50 flex items-center justify-center border border-outline-variant/20 rounded-2xl overflow-hidden'>
                  <img
                    alt='Resident Access QR Code'
                    className='w-[70%] h-[70%] object-contain p-4'
                    src={qrInfo.qrImage}
                  />
                </div>
              </div>

              <div className='mt-10 text-center space-y-4'>
                <code className='px-4 py-2 bg-surface-container-low rounded-lg text-sm font-mono text-on-surface-variant tracking-wider'>
                  MÃ: {qrInfo.qr_code}
                </code>
                <div className='flex flex-wrap justify-center gap-4'>
                  <button
                    onClick={handleDownloadQR}
                    className='flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-full font-bold transition-all hover:bg-primary-container active:scale-95 shadow-lg shadow-primary/20'
                  >
                    <span className='material-symbols-outlined'>download</span> Tải Mã QR
                  </button>
                  <button
                    onClick={handleShareQR}
                    className='flex items-center gap-2 px-8 py-4 bg-surface-container-low text-on-surface rounded-full font-bold transition-all hover:bg-surface-container-high active:scale-95'
                  >
                    <span className='material-symbols-outlined'>share</span> Chia Sẻ
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Information Clusters */}
          <div className='lg:col-span-5 space-y-8'>
            {/* Insight Module: Expiration */}
            <div className='bg-primary text-on-primary p-8 rounded-[2rem] shadow-xl shadow-primary/10 relative overflow-hidden'>
              <div className='absolute top-0 right-0 p-8'>
                <span className='material-symbols-outlined text-white/20 text-6xl'>event_available</span>
              </div>
              <div className='relative z-10 space-y-6'>
                <span className='text-[10px] font-black uppercase tracking-[0.3em] text-white/70'>
                  Thời Hạn Hiệu Lực
                </span>
                <div>
                  <p className='text-sm text-white/60 mb-1'>Hết hạn vào</p>
                  <p className='text-3xl font-extrabold tracking-tight'>{formatDate(qrInfo.expires_at)}</p>
                  <p className='text-white/80 font-medium'>lúc {formatTime(qrInfo.expires_at)}</p>
                </div>
                <div className='pt-4 border-t border-white/10 flex items-center gap-3'>
                  <span className='material-symbols-outlined text-sm'>schedule</span>
                  <span className='text-xs font-medium text-white/70'>Tạo: {formatCreatedAt(qrInfo.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Usage Instructions Glass Card */}
            <div className='glass-card p-8 rounded-[2rem] border border-white shadow-sm space-y-6'>
              <h2 className='text-xl font-bold tracking-tight text-on-surface flex items-center gap-3'>
                <span className='material-symbols-outlined text-primary' style={{ fontVariationSettings: "'FILL' 1" }}>
                  info
                </span>
                Hướng Dẫn Truy Cập
              </h2>
              <div className='space-y-6'>
                <div className='flex gap-4'>
                  <div className='flex-shrink-0 w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed-variant font-black text-xs'>
                    1
                  </div>
                  <div>
                    <h4 className='font-bold text-on-surface text-sm'>Tại Cầu Gác/Lối Vào</h4>
                    <p className='text-sm text-on-surface-variant leading-relaxed'>
                      Trình màn hình điện thoại của bạn cho máy quét quang học ở các bục ở lối vào.
                    </p>
                  </div>
                </div>
                <div className='flex gap-4'>
                  <div className='flex-shrink-0 w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed-variant font-black text-xs'>
                    2
                  </div>
                  <div>
                    <h4 className='font-bold text-on-surface text-sm'>Quét Tối Ưu</h4>
                    <p className='text-sm text-on-surface-variant leading-relaxed'>
                      Đảm bảo độ sáng màn hình của bạn ở mức tối đa để nhận dạng nhanh nhất.
                    </p>
                  </div>
                </div>
                <div className='flex gap-4'>
                  <div className='flex-shrink-0 w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed-variant font-black text-xs'>
                    3
                  </div>
                  <div>
                    <h4 className='font-bold text-on-surface text-sm'>Truy Cập Khách</h4>
                    <p className='text-sm text-on-surface-variant leading-relaxed'>
                      Đây là chìa khóa cư dân cá nhân của bạn. Để khách, vui lòng sử dụng tính năng 'Mời' để tạo lệnh
                      thông hành tạm thời.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Insight Chip */}
            <div className='bg-secondary-fixed p-6 rounded-2xl flex items-center gap-4 border border-outline-variant/10'>
              <div className='bg-white p-2 rounded-xl'>
                <span
                  className='material-symbols-outlined text-on-secondary-fixed-variant'
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  auto_awesome
                </span>
              </div>
              <div>
                <p className='text-xs font-bold text-on-secondary-fixed-variant/60 uppercase tracking-widest'>
                  Gợi Ý AI Homelink
                </p>
                <p className='text-sm font-semibold text-on-secondary-fixed-variant'>
                  Lệnh thông hành của bạn được sử dụng thường xuyên nhất từ 8:00 - 9:30 Sáng.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Context Section */}
        <section className='mt-20'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-12 items-center'>
            <div className='order-2 md:order-1 rounded-[2rem] overflow-hidden shadow-2xl'>
              <img
                alt='Property Entrance'
                className='w-full h-[400px] object-cover'
                src='https://lh3.googleusercontent.com/aida-public/AB6AXuB2NqEIcDarw1ZVFvimM9p_VGIJLJD-PthQaVbKtYwIeaQWkRxOoAKIPcea8ui91KUL7Uc785WN5THG93GEkz481m_YPwFW33CZQ0YFULsqpEcmnZoZI7o6i1ijr1U8bqoQOfTMYS4CI4V0Qq8dPz0u2rvDRedW1njSTOO3YF1sTCAHF3H39ou0d5JUrLEf3WZh82s5VbiSCC7G4WjTnb2Xs37k2yepk-s1fmKZrlYDINLBjzp8ITMh54PZvJGUCT4MXtK4jhtOaS5D'
              />
            </div>
            <div className='order-1 md:order-2 space-y-6'>
              <span className='text-primary font-bold text-sm tracking-widest uppercase'>An Ninh Cộng Đồng</span>
              <h3 className='text-3xl font-extrabold tracking-tight'>
                An ninh của bạn là ưu tiên hàng đầu của chúng tôi.
              </h3>
              <p className='text-on-surface-variant leading-relaxed'>
                Mỗi lần vào và ra sử dụng Mã QR cá nhân của bạn đều được ghi nhật ký trong cổng thông tin cư dân của bạn
                để bảo vệ bạn. Nếu bạn mất thiết bị, bạn có thể thu hồi ngay lệnh thông hành này và tạo một lệnh mới từ
                cài đặt bảo mật của bạn.
              </p>
              <div className='pt-4'>
                <a className='inline-flex items-center gap-2 text-primary font-bold hover:underline' href='#'>
                  Xem Nhật Ký Bảo Mật
                  <span className='material-symbols-outlined text-sm'>arrow_forward</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
