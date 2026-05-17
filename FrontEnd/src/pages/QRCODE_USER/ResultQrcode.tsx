import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { QRCodeApi } from 'src/apis/QrcodeApi/Qr.api'
import type { QRScanResult, QRScanResponse } from 'src/types/qrcode.type'
import { useMemo, useState } from 'react'
import type { SuccessResponseApi } from 'src/types/utils.type'

export default function ResultQrcodePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { qrcode } = useParams()
  const qrCode = qrcode

  const searchParams = new URLSearchParams(location.search)
  const direction = searchParams.get('direction') || 'IN'
  const pinVerified = searchParams.get('pinVerified') === 'true'
  const isErrorFromUrl = searchParams.get('error') === 'true'

  const isGuestQrType = qrCode?.startsWith('GUEST_')
  const isPersonalQrType = qrCode?.startsWith('PERSONAL_')

  const [realtimeData, setRealtimeData] = useState<QRScanResponse | null>(null)

  // Đọc flag báo đã hết lượt từ lần quét cuối
  const outOfEntriesFlag = useMemo(() => {
    try {
      const saved = sessionStorage.getItem('qrOutOfEntries')
      if (saved) {
        const parsed = JSON.parse(saved)
        sessionStorage.removeItem('qrOutOfEntries')
        return parsed
      }
    } catch (e) {
      console.error('Error parsing outOfEntries flag:', e)
    }
    return null
  }, [])

  // Lấy lỗi từ sessionStorage
  const lastScanError = useMemo(() => {
    try {
      const saved = sessionStorage.getItem('lastScanResult')
      if (saved) {
        const parsed = JSON.parse(saved)
        sessionStorage.removeItem('lastScanResult')
        return parsed
      }
    } catch (e) {
      console.error('Error parsing last scan result:', e)
    }
    return null
  }, [])

  const errorMessageFromStorage = lastScanError?.errorMessage || lastScanError?.apiResponse?.message

  // Lấy thông tin đã lưu từ sessionStorage (khi cần PIN)
  const savedScanData = useMemo(() => {
    try {
      const saved = sessionStorage.getItem('pendingScanData')
      if (saved) {
        const parsed = JSON.parse(saved)
        console.log('📖 Saved scan data:', parsed)
        return parsed as QRScanResponse
      }
    } catch (e) {
      console.error('Error parsing saved data:', e)
    }
    return null
  }, [])

  const shouldCallApi = useMemo(() => {
    return isGuestQrType || isPersonalQrType
  }, [isGuestQrType, isPersonalQrType])

  // Gọi API scan QR
  const { data: qrDetailData, isLoading } = useQuery({
    queryKey: ['qr-scan-result', qrCode, direction, pinVerified],
    queryFn: async () => {
      if (pinVerified && savedScanData) {
        return {
          data: {
            operationType: 'Success',
            message: 'QR verified',
            code: 'OK',
            data: savedScanData,
            timestamp: new Date().toISOString()
          }
        } as { data: SuccessResponseApi<QRScanResponse> }
      }

      if (isErrorFromUrl) {
        return {
          data: {
            operationType: 'Failed',
            message: 'QR không hợp lệ',
            code: 'ERROR',
            data: null as any,
            timestamp: new Date().toISOString()
          }
        } as { data: SuccessResponseApi<null> }
      }

      if (isGuestQrType) {
        return QRCodeApi.scanGuestQr(qrCode!, {
          direction: direction || 'IN',
          gate: 'Cổng chính'
        })
      } else if (isPersonalQrType) {
        return QRCodeApi.scanPersonalQr(qrCode!, {
          direction: direction || 'IN',
          gate: 'Cổng chính'
        })
      }
      throw new Error('Invalid QR code type')
    },
    enabled: !!qrCode && shouldCallApi,
    retry: false
  })

  const responseData = qrDetailData?.data as SuccessResponseApi<QRScanResponse> | undefined
  const apiCode = responseData?.code
  const apiMessage = responseData?.message || ''
  const scanResponse = (pinVerified ? savedScanData : responseData?.data) as QRScanResponse | undefined

  const effectiveScanResponse = useMemo(() => {
    if (pinVerified && realtimeData) {
      return realtimeData
    }
    if (pinVerified && savedScanData) {
      return savedScanData
    }
    return scanResponse
  }, [pinVerified, realtimeData, savedScanData, scanResponse])

  const scanResult = useMemo((): QRScanResult | null => {
    if (!effectiveScanResponse) return null

    return {
      id: effectiveScanResponse.id,
      qrCode: effectiveScanResponse.qrCode,
      status: effectiveScanResponse.status,
      qrType: effectiveScanResponse.qrType,
      qrImage: effectiveScanResponse.qrImage,
      hostName: effectiveScanResponse.hostName,
      visitorName: effectiveScanResponse.visitorName,
      visitorPhone: effectiveScanResponse.visitorPhone,
      apartmentCode: effectiveScanResponse.apartmentCode,
      usedEntries: effectiveScanResponse.usedEntries,
      maxEntries: effectiveScanResponse.maxEntries,
      remainingEntries:
        effectiveScanResponse.maxEntries && effectiveScanResponse.usedEntries
          ? effectiveScanResponse.maxEntries - effectiveScanResponse.usedEntries
          : undefined,
      validFrom: effectiveScanResponse.validFrom,
      validTo: effectiveScanResponse.validTo,
      userName: effectiveScanResponse.userName,
      userPhone: effectiveScanResponse.userPhone,
      userEmail: effectiveScanResponse.userEmail,
      expiresAt: effectiveScanResponse.expiresAt
    }
  }, [effectiveScanResponse])

  // Xác định trạng thái lỗi
  const isError = isErrorFromUrl || lastScanError?.isError || apiCode !== 'OK'
  const finalErrorMessage = errorMessageFromStorage || apiMessage || 'QR không hợp lệ'

  const isExpired = apiMessage?.includes('hết hạn') || scanResult?.status === 'EXPIRED'
  const isRevoked = apiMessage?.includes('thu hồi') || scanResult?.status === 'REVOKED'
  const isOutOfEntries =
    apiMessage?.includes('hết số lần') ||
    apiMessage?.includes('hết lượt') ||
    (scanResult?.maxEntries !== undefined && scanResult?.remainingEntries === 0) ||
    outOfEntriesFlag?.isOutOfEntries

  // Getter functions
  const displayName = useMemo(() => {
    if (isError) return ''
    if (!scanResult) return 'Không có thông tin'
    if (scanResult.qrType === 'guest') {
      return scanResult.visitorName || 'Khách'
    }
    return scanResult.userName || 'Cư dân'
  }, [isError, scanResult])

  const displayPhone = useMemo(() => {
    if (isError) return ''
    if (!scanResult) return ''
    if (scanResult.qrType === 'guest') {
      return scanResult.visitorPhone || ''
    }
    return scanResult.userPhone || ''
  }, [isError, scanResult])

  const apartmentCode = useMemo(() => {
    if (isError) return ''
    if (!scanResult) return ''
    return scanResult.apartmentCode || ''
  }, [isError, scanResult])

  const hostName = useMemo(() => {
    if (isError) return ''
    if (!scanResult) return ''
    if (scanResult.qrType === 'guest') {
      return scanResult.hostName || 'Admin'
    }
    return 'Quản trị viên'
  }, [isError, scanResult])

  const isGuestQR = useMemo(() => {
    if (isError) return false
    return scanResult?.qrType === 'guest'
  }, [isError, scanResult])

  const remainingEntries = useMemo(() => {
    if (isError || !scanResult || !isGuestQR) return 0
    return scanResult.remainingEntries || 0
  }, [isError, scanResult, isGuestQR])

  const usedEntries = useMemo(() => {
    if (isError || !scanResult || !isGuestQR) return 0
    return scanResult.usedEntries || 0
  }, [isError, scanResult, isGuestQR])

  const maxEntries = useMemo(() => {
    if (isError || !scanResult || !isGuestQR) return 0
    return scanResult.maxEntries || 0
  }, [isError, scanResult, isGuestQR])

  const validFrom = useMemo(() => {
    if (isError || !scanResult || !isGuestQR) return ''
    return scanResult.validFrom || ''
  }, [isError, scanResult, isGuestQR])

  const validTo = useMemo(() => {
    if (isError) return ''
    if (!scanResult) return ''
    if (isGuestQR) return scanResult.validTo || ''
    return scanResult.expiresAt || ''
  }, [isError, scanResult, isGuestQR])

  const usagePercent = useMemo(() => {
    if (!isGuestQR || isError) return 0
    if (maxEntries === 0) return 0
    return (usedEntries / maxEntries) * 100
  }, [isGuestQR, isError, usedEntries, maxEntries])

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
  }

  const requiresPin = useMemo(() => {
    return scanResponse?.requiresPin === true && !pinVerified
  }, [scanResponse, pinVerified])

  if (!qrCode) {
    return (
      <div className="bg-surface text-on-surface min-h-screen font-['Manrope',sans-serif] flex items-center justify-center">
        <div className='text-center'>
          <span className='material-symbols-outlined text-6xl text-slate-400 mb-4'>qr_code_scanner</span>
          <p className='text-on-surface-variant mb-4'>Không có dữ liệu QR</p>
          <div className='flex gap-4 justify-center'>
            <button onClick={() => navigate('/qr-management')} className='px-6 py-2 bg-primary text-white rounded-full'>
              Về trang chủ
            </button>
            <button
              onClick={() => navigate('/scanqr')}
              className='px-6 py-2 border border-primary text-primary rounded-full'
            >
              Quét QR mới
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (requiresPin && !pinVerified) {
    return (
      <div className="bg-surface text-on-surface min-h-screen font-['Manrope',sans-serif] flex items-center justify-center">
        <div className='max-w-md w-full mx-4'>
          <div className='bg-surface-container-lowest p-8 rounded-[2rem] border border-outline-variant/15'>
            <div className='text-center mb-6'>
              <span className='material-symbols-outlined text-6xl text-primary mb-4'>pin</span>
              <h2 className='text-2xl font-bold text-on-surface mb-2'>Yêu cầu nhập PIN</h2>
              <p className='text-on-surface-variant'>QR Code này yêu cầu xác thực PIN để tiếp tục</p>
              {scanResponse && (
                <div className='mt-4 p-3 bg-surface-container-low rounded-xl'>
                  <p className='text-sm text-on-surface-variant'>
                    {isGuestQR
                      ? `Khách: ${scanResponse.visitorName || 'N/A'}`
                      : `Cư dân: ${scanResponse.userName || 'N/A'}`}
                  </p>
                  <p className='text-xs text-error mt-2'>
                    Số lần nhập sai: {scanResponse.pinFailedCount}/{scanResponse.maxPinAttempts}
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={() => navigate(-1)}
              className='w-full bg-primary text-white py-4 rounded-full font-bold text-lg active:scale-95 transition-transform'
            >
              Quay lại nhập PIN
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading && !pinVerified && !isErrorFromUrl) {
    return (
      <div className="bg-surface text-on-surface min-h-screen font-['Manrope',sans-serif] flex items-center justify-center">
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
          <p className='mt-4 text-on-surface-variant'>Đang xác thực QR...</p>
          <p className='text-sm text-on-surface-variant mt-2'>Mã QR: {qrCode.slice(-12)}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen font-['Manrope',sans-serif]">
      <main className='px-4 md:px-8 max-w-7xl mx-auto'>
        <header className='mb-12 flex justify-between items-center'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight text-on-surface mb-2'>Xác minh quét</h1>
            <p className='text-on-surface-variant max-w-xl'>Xác thực thời gian thực và kiểm soát truy cập.</p>
          </div>
          <div className='text-right'>
            <p className='text-xs text-on-surface-variant'>Mã QR</p>
            <p className='font-mono text-sm font-bold'>{qrCode.slice(-16)}</p>
          </div>
        </header>

        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
          <div className='lg:col-span-8 space-y-8'>
            {/* Status Card */}
            <div
              className={`relative overflow-hidden rounded-[2rem] p-8 text-white shadow-2xl shadow-blue-900/20 ${
                !isError
                  ? 'bg-gradient-to-br from-primary to-primary-container'
                  : 'bg-gradient-to-br from-error to-red-700'
              }`}
            >
              <div className='relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6'>
                <div>
                  <div className='inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4'>
                    <span
                      className='material-symbols-outlined text-[14px]'
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {!isError ? 'verified' : 'error'}
                    </span>
                    {!isError ? 'Đã xác thực' : 'Xác thực thất bại'}
                    {pinVerified && !isError && (
                      <span className='ml-1 bg-green-500 text-white px-2 py-0.5 rounded-full text-[10px]'>PIN ✓</span>
                    )}
                  </div>
                  <h2 className='text-4xl md:text-5xl font-black tracking-tighter mb-2'>
                    {!isError ? 'QR hợp lệ' : 'QR không hợp lệ'}
                  </h2>
                  <p className='text-blue-100 text-lg opacity-90'>
                    {isError
                      ? isExpired
                        ? 'QR đã hết hạn'
                        : isRevoked
                          ? 'QR đã bị thu hồi'
                          : isOutOfEntries
                            ? 'QR đã được sử dụng hết số lần cho phép'
                            : finalErrorMessage
                      : pinVerified
                        ? isGuestQR
                          ? `Khách ${displayName} đã xác minh PIN • Hoạt động`
                          : `Cư dân ${displayName} đã xác minh PIN • Hoạt động`
                        : `${isGuestQR ? 'Khách' : 'Cư dân'} ${displayName} • Hoạt động`}
                  </p>
                </div>
                {!isError && isGuestQR && (
                  <div className='bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 text-center min-w-[160px]'>
                    <p className='text-[10px] uppercase tracking-[0.2em] font-bold text-blue-100 mb-2'>
                      Số lượt còn lại
                    </p>
                    <p className='text-5xl font-black'>{remainingEntries}</p>
                    <p className='text-xs mt-2 text-blue-200'>
                      Đã dùng: {usedEntries}/{maxEntries}
                    </p>
                    <div className='mt-2 w-full h-1 bg-white/20 rounded-full overflow-hidden'>
                      <div
                        className='h-full bg-white rounded-full transition-all'
                        style={{ width: `${usagePercent}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
              <div className='absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl'></div>
            </div>

            {/* Cảnh báo đã hết lượt */}
            {outOfEntriesFlag?.isOutOfEntries && !isError && (
              <div className='p-4 bg-amber-50 rounded-xl border border-amber-200'>
                <div className='flex items-center gap-2 text-amber-700'>
                  <span className='material-symbols-outlined'>info</span>
                  <span className='font-medium'>Đã sử dụng hết lượt</span>
                </div>
                <p className='text-amber-600 text-sm mt-1'>
                  QR này đã được sử dụng hết {outOfEntriesFlag.maxEntries}/{outOfEntriesFlag.maxEntries} lượt. Lần quét
                  tiếp theo sẽ báo lỗi.
                </p>
              </div>
            )}

            {/* Profile Info */}
            {!isError && scanResult && (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                {/* ... giữ nguyên phần Profile Info của bạn ... */}
                <div className='bg-surface-container-lowest p-8 rounded-[2rem] border border-outline-variant/15'>
                  <div className='flex justify-between items-start mb-6'>
                    <p className='text-[10px] uppercase tracking-widest font-bold text-primary'>
                      {isGuestQR ? 'HỒ SƠ KHÁCH' : 'HỒ SƠ CƯ DÂN'}
                    </p>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${isGuestQR ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}
                    >
                      {isGuestQR ? 'QR KHÁCH' : 'QR CƯ DÂN'}
                      {pinVerified && !isGuestQR && <span className='ml-1 text-green-600'>✓ PIN</span>}
                    </span>
                  </div>
                  <div className='flex items-center gap-6 mb-8'>
                    <div className='w-20 h-20 rounded-2xl overflow-hidden bg-surface-container-low flex-shrink-0'>
                      <img
                        alt='Avatar'
                        className='w-full h-full object-cover'
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=005ab7&color=fff`}
                      />
                    </div>
                    <div>
                      <h3 className='text-2xl font-bold text-on-surface'>{displayName}</h3>
                      <p className='text-on-surface-variant'>
                        {isGuestQR ? 'Khách • Thăm cư dân' : 'Cư dân • Chủ căn hộ'}
                      </p>
                      <span
                        className={`inline-flex items-center gap-1 text-xs mt-1 ${scanResult.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}`}
                      >
                        <span className='material-symbols-outlined text-xs'>
                          {scanResult.status === 'ACTIVE' ? 'check_circle' : 'cancel'}
                        </span>
                        {scanResult.status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </div>
                  </div>
                  <div className='space-y-4'>
                    <div className='flex justify-between items-center py-3 border-b border-surface-container-low'>
                      <span className='text-sm text-on-surface-variant'>Số điện thoại</span>
                      <span className='font-mono font-medium'>{displayPhone || 'N/A'}</span>
                    </div>
                    <div className='flex justify-between items-center py-3'>
                      <span className='text-sm text-on-surface-variant'>Mã QR</span>
                      <span className='font-mono text-xs'>{scanResult.qrCode?.slice(-12)}</span>
                    </div>
                  </div>
                </div>

                <div className='bg-surface-container-lowest p-8 rounded-[2rem] border border-outline-variant/15'>
                  <p className='text-[10px] uppercase tracking-widest font-bold text-primary mb-6'>
                    THÔNG TIN ĐIỂM ĐẾN
                  </p>
                  <div className='flex items-center gap-4 mb-8 p-4 bg-surface-container-low rounded-2xl'>
                    <div className='w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600'>
                      <span className='material-symbols-outlined'>apartment</span>
                    </div>
                    <div>
                      <p className='text-xs text-on-surface-variant font-bold uppercase tracking-tight'>Căn hộ</p>
                      <p className='text-xl font-bold text-on-surface'>{apartmentCode || 'N/A'}</p>
                    </div>
                  </div>
                  <div className='space-y-4'>
                    <div>
                      <p className='text-[10px] uppercase tracking-widest font-bold text-on-surface-variant'>
                        {isGuestQR ? 'CHỦ NHÀ' : 'ĐƯỢC TẠO BỞI'}
                      </p>
                      <p className='text-lg font-bold text-on-surface'>{hostName}</p>
                      <div className='inline-flex items-center gap-2 text-xs text-on-surface-variant mt-2'>
                        <span className='material-symbols-outlined text-sm'>person</span>
                        {isGuestQR ? 'Cư dân đã xác minh' : 'Quản trị viên'}
                      </div>
                    </div>
                    <div className='pt-4 border-t border-surface-container-low'>
                      <p className='text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-2'>
                        {isGuestQR ? 'HIỆU LỰC ĐẾN' : 'HẾT HẠN LÚC'}
                      </p>
                      <p className='text-sm text-on-surface'>{formatDate(validTo)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {isError && (
              <div className='bg-surface-container-lowest p-8 rounded-[2rem] border border-outline-variant/15 text-center'>
                <span className='material-symbols-outlined text-6xl text-error mb-4'>error_outline</span>
                <h3 className='text-xl font-bold text-on-surface mb-2'>Không thể xác thực</h3>
                <p className='text-on-surface-variant mb-6'>
                  {isExpired
                    ? 'Mã QR này đã hết hạn. Vui lòng yêu cầu tạo mã mới.'
                    : isRevoked
                      ? 'Mã QR này đã bị thu hồi. Vui lòng liên hệ chủ căn hộ hoặc quản trị viên.'
                      : isOutOfEntries
                        ? 'Mã QR này đã được sử dụng hết số lần cho phép. Vui lòng yêu cầu chủ căn hộ cấp mã mới hoặc gia hạn.'
                        : finalErrorMessage || 'Mã QR không tồn tại trong hệ thống hoặc đã bị vô hiệu hóa.'}
                </p>
                <button
                  onClick={() => navigate('/scanqr')}
                  className='px-6 py-3 bg-primary text-white rounded-full inline-flex items-center gap-2'
                >
                  <span className='material-symbols-outlined'>qr_code_scanner</span>
                  Quét QR mới
                </button>
              </div>
            )}
          </div>

          {/* Action Panel */}
          <div className='lg:col-span-4 space-y-8'>
            {!isError && scanResult && (
              <div className='bg-white p-8 rounded-[2rem] border border-outline-variant/15'>
                <p className='text-[10px] uppercase tracking-widest font-bold text-primary mb-6'>THỜI GIAN HIỆU LỰC</p>
                <div className='space-y-6'>
                  {isGuestQR && validFrom && (
                    <div className='flex items-start gap-4'>
                      <div className='w-1 h-12 bg-blue-600 rounded-full mt-1'></div>
                      <div>
                        <p className='text-xs text-on-surface-variant font-bold'>Hiệu lực từ</p>
                        <p className='text-lg font-bold'>{formatDate(validFrom)}</p>
                      </div>
                    </div>
                  )}
                  <div className='flex items-start gap-4'>
                    <div className='w-1 h-12 bg-slate-200 rounded-full mt-1'></div>
                    <div>
                      <p className='text-xs text-on-surface-variant font-bold'>
                        {isGuestQR ? 'Hiệu lực đến' : 'Hết hạn lúc'}
                      </p>
                      <p className='text-lg font-bold'>{formatDate(validTo)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className='space-y-4'>
              <button
                onClick={() => {
                  sessionStorage.removeItem('pendingScanData')
                  sessionStorage.removeItem('pendingQrCode')
                  navigate('/qr-management')
                }}
                className='w-full bg-surface-container-lowest text-on-surface py-6 rounded-full font-bold text-lg border border-outline-variant/15 active:scale-95 transition-transform flex items-center justify-center gap-3'
              >
                <span className='material-symbols-outlined'>home</span>
                Về trang chủ
              </button>
              <Link
                to={'/scanqr'}
                onClick={() => {
                  sessionStorage.removeItem('pendingScanData')
                  sessionStorage.removeItem('pendingQrCode')
                }}
                className='w-full bg-surface-container-low text-on-surface py-4 rounded-full font-medium text-base border border-outline-variant/15 active:scale-95 transition-transform flex items-center justify-center gap-2'
              >
                <span className='material-symbols-outlined'>qr_code_scanner</span>
                Quét QR khác
              </Link>
            </div>

            {!isError && scanResult && (
              <div className='bg-secondary-fixed p-6 rounded-[2rem] border-0'>
                <div className='flex items-start gap-4'>
                  <span
                    className='material-symbols-outlined text-on-secondary-fixed-variant'
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    info
                  </span>
                  <div>
                    <p className='text-sm font-bold text-on-secondary-fixed leading-tight mb-1'>GỢI Ý TỪ BẢO VỆ</p>
                    <p className='text-xs text-on-secondary-fixed-variant leading-relaxed'>
                      {isGuestQR ? 'Khách' : 'Cư dân'} <span className='font-bold'>{displayName}</span>
                      {apartmentCode && ` đến căn hộ ${apartmentCode}`}.
                      {isGuestQR && usedEntries > 0
                        ? ` Đã quét ${usedEntries}/${maxEntries} lần.`
                        : pinVerified
                          ? ' Đã xác thực PIN thành công.'
                          : ' Lần quét đầu tiên.'}
                      Không có cảnh báo bảo mật.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <nav className='md:hidden fixed bottom-0 left-0 w-full flex justify-around items-end pb-6 px-4 bg-white/80 backdrop-blur-2xl z-50 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)] border-t border-slate-100'>
        <button
          onClick={() => {
            sessionStorage.removeItem('pendingScanData')
            sessionStorage.removeItem('pendingQrCode')
            navigate('/scanqr')
          }}
          className='flex flex-col items-center justify-center bg-blue-600 text-white rounded-full p-3 mb-2 shadow-lg shadow-blue-500/40 active:scale-90 duration-150'
        >
          <span className='material-symbols-outlined'>qr_code_2</span>
          <span className='text-[10px] uppercase tracking-widest font-bold mt-1'>Quét</span>
        </button>
        <button
          onClick={() => {
            sessionStorage.removeItem('pendingScanData')
            sessionStorage.removeItem('pendingQrCode')
            navigate('/qr-management')
          }}
          className='flex flex-col items-center justify-center text-slate-400 p-2 active:scale-90 duration-150'
        >
          <span className='material-symbols-outlined'>home</span>
          <span className='text-[10px] uppercase tracking-widest font-bold mt-1'>Trang chủ</span>
        </button>
      </nav>
    </div>
  )
}
