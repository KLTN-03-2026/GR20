import React, { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { QRCodeApi } from 'src/apis/QrcodeApi/Qr.api'
import type { QrScanResult, ResultQrcode, ResultQrcode1 } from 'src/types/qrcode.type'
import { toast } from 'react-toastify'

export default function ResultQrcodePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { qrCode: qrCodeFromUrl } = useParams<{ qrCode: string }>()
  const qrCode = qrCodeFromUrl || location.state?.qrCode

  const [showHistory, setShowHistory] = useState(false)
  const [historyData, setHistoryData] = useState<any[]>([])

  // Phân biệt loại QR dựa vào prefix
  const isGuestQrType = qrCode?.startsWith('GUEST_')
  const isPersonalQrType = qrCode?.startsWith('PERSONAL_')

  // Lấy thông tin QR từ API dựa vào loại QR
  const {
    data: qrDetailData,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['qr-scan-result', qrCode, isGuestQrType],
    queryFn: async () => {
      if (isGuestQrType) {
        return QRCodeApi.scanGuestQr(qrCode!)
      } else if (isPersonalQrType) {
        return QRCodeApi.scanPersonalQr(qrCode!)
      }
      throw new Error('Invalid QR code type')
    },
    enabled: !!qrCode,
    retry: false
  })

  // Lấy lịch sử quét
  const { refetch: refetchHistory } = useQuery({
    queryKey: ['qr-history'],
    queryFn: () => QRCodeApi.getGuestQrHistory(),
    enabled: false
  })

  const revokeMutation = useMutation({
    mutationFn: (id: string) => QRCodeApi.deleteGuestQr(id),
    onSuccess: () => {
      toast.success('Đã thu hồi mã QR thành công')
      refetch()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Thu hồi thất bại')
    }
  })

  const scanResult = qrDetailData?.data?.data as QrScanResult | undefined
  const isSuccess = qrDetailData?.data?.code === 'OK'

  // Helper functions - đơn giản nhất, không cần type guard phức tạp
  const getDisplayName = () => {
    if (!scanResult) return 'Không có thông tin'
    return ('visitorName' in scanResult ? scanResult.visitorName : scanResult.userName) || 'Khách'
  }

  const getDisplayPhone = () => {
    if (!scanResult) return ''
    return ('visitorPhone' in scanResult ? scanResult.visitorPhone : scanResult.userPhone) || ''
  }

  const getApartmentCode = () => {
    if (!scanResult) return ''
    return scanResult.apartmentCode || ''
  }

  const getHostName = () => {
    if (!scanResult) return ''
    return ('hostName' in scanResult ? scanResult.hostName : 'Admin') || 'Admin'
  }

  const getRemainingEntries = () => {
    if (!scanResult) return 0
    return 'remainingEntries' in scanResult ? scanResult.remainingEntries || 0 : 0
  }

  const getUsedEntries = () => {
    if (!scanResult) return 0
    return 'usedEntries' in scanResult ? scanResult.usedEntries || 0 : 0
  }

  const getMaxEntries = () => {
    if (!scanResult) return 0
    return 'maxEntries' in scanResult ? scanResult.maxEntries || 0 : 0
  }

  const getValidFrom = () => {
    if (!scanResult) return ''
    return 'validFrom' in scanResult ? scanResult.validFrom || '' : ''
  }

  const getValidTo = () => {
    if (!scanResult) return ''
    if ('validTo' in scanResult) return scanResult.validTo
    if ('expiresAt' in scanResult) return scanResult.expiresAt
    return ''
  }

  const isGuestQR = () => {
    return scanResult?.qrType === 'guest'
  }

  const isPersonalQR = () => {
    return scanResult?.qrType === 'personal'
  }

  const getUsagePercent = () => {
    if (!isGuestQR()) return 0
    const max = getMaxEntries()
    if (max === 0) return 0
    return (getUsedEntries() / max) * 100
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
  }

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
  }

  const handleLoadHistory = async () => {
    setShowHistory(true)
    const result = await QRCodeApi.getGuestQrHistory()
    setHistoryData(result?.data?.data || [])
    refetchHistory()
  }

  const handleAllowEntry = async () => {
    if (!scanResult) return
    toast.success(`Đã mở cổng cho ${getDisplayName()}`)
    await refetch()
  }

  const handleRevokeQR = () => {
    if (!scanResult) return
    if (window.confirm(`Bạn có chắc muốn thu hồi mã QR của ${getDisplayName()}?`)) {
      revokeMutation.mutate(scanResult.id)
    }
  }

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
              onClick={() => navigate('/scan-qr')}
              className='px-6 py-2 border border-primary text-primary rounded-full'
            >
              Quét QR mới
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
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
            <h1 className='text-3xl font-bold tracking-tight text-on-surface mb-2'>Scan Verification</h1>
            <p className='text-on-surface-variant max-w-xl'>Real-time authentication and access control.</p>
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
                isSuccess && scanResult?.status === 'ACTIVE'
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
                      {isSuccess && scanResult?.status === 'ACTIVE' ? 'verified' : 'error'}
                    </span>
                    {isSuccess && scanResult?.status === 'ACTIVE' ? 'Authenticated' : 'Authentication Failed'}
                  </div>
                  <h2 className='text-4xl md:text-5xl font-black tracking-tighter mb-2'>
                    {isSuccess && scanResult?.status === 'ACTIVE' ? 'QR hợp lệ' : 'QR không hợp lệ'}
                  </h2>
                  <p className='text-blue-100 text-lg opacity-90'>
                    {isSuccess && scanResult?.status === 'ACTIVE'
                      ? `${isGuestQR() ? 'Guest' : 'Resident'} Verified • ${scanResult.status}`
                      : scanResult?.status === 'EXPIRED'
                        ? 'QR đã hết hạn'
                        : scanResult?.status === 'REVOKED'
                          ? 'QR đã bị thu hồi'
                          : 'QR không tồn tại trong hệ thống'}
                  </p>
                </div>
                {isSuccess && isGuestQR() && (
                  <div className='bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 text-center min-w-[160px]'>
                    <p className='text-[10px] uppercase tracking-[0.2em] font-bold text-blue-100 mb-2'>
                      Remaining Entries
                    </p>
                    <p className='text-5xl font-black'>{getRemainingEntries()}</p>
                    <p className='text-xs mt-2 text-blue-200'>
                      Used: {getUsedEntries()}/{getMaxEntries()}
                    </p>
                    <div className='mt-2 w-full h-1 bg-white/20 rounded-full overflow-hidden'>
                      <div
                        className='h-full bg-white rounded-full transition-all'
                        style={{ width: `${getUsagePercent()}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
              <div className='absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl'></div>
            </div>

            {/* Profile Info */}
            {isSuccess && scanResult && (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                <div className='bg-surface-container-lowest p-8 rounded-[2rem] border border-outline-variant/15'>
                  <div className='flex justify-between items-start mb-6'>
                    <p className='text-[10px] uppercase tracking-widest font-bold text-primary'>
                      {isGuestQR() ? 'Guest Profile' : 'Resident Profile'}
                    </p>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${
                        isGuestQR() ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {isGuestQR() ? 'QR Khách' : 'QR Cư dân'}
                    </span>
                  </div>
                  <div className='flex items-center gap-6 mb-8'>
                    <div className='w-20 h-20 rounded-2xl overflow-hidden bg-surface-container-low flex-shrink-0'>
                      <img
                        alt='Avatar'
                        className='w-full h-full object-cover'
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(getDisplayName())}&background=005ab7&color=fff`}
                      />
                    </div>
                    <div>
                      <h3 className='text-2xl font-bold text-on-surface'>{getDisplayName()}</h3>
                      <p className='text-on-surface-variant'>
                        {isGuestQR() ? 'Visitor • Resident Guest' : 'Resident • Home Owner'}
                      </p>
                      <span
                        className={`inline-flex items-center gap-1 text-xs mt-1 ${
                          scanResult.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        <span className='material-symbols-outlined text-xs'>
                          {scanResult.status === 'ACTIVE' ? 'check_circle' : 'cancel'}
                        </span>
                        {scanResult.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className='space-y-4'>
                    <div className='flex justify-between items-center py-3 border-b border-surface-container-low'>
                      <span className='text-sm text-on-surface-variant'>Phone</span>
                      <span className='font-mono font-medium'>{getDisplayPhone() || 'N/A'}</span>
                    </div>
                    <div className='flex justify-between items-center py-3'>
                      <span className='text-sm text-on-surface-variant'>QR Code</span>
                      <span className='font-mono text-xs'>{scanResult.qrCode?.slice(-12)}</span>
                    </div>
                  </div>
                </div>

                <div className='bg-surface-container-lowest p-8 rounded-[2rem] border border-outline-variant/15'>
                  <p className='text-[10px] uppercase tracking-widest font-bold text-primary mb-6'>
                    Destination Details
                  </p>
                  <div className='flex items-center gap-4 mb-8 p-4 bg-surface-container-low rounded-2xl'>
                    <div className='w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600'>
                      <span className='material-symbols-outlined'>apartment</span>
                    </div>
                    <div>
                      <p className='text-xs text-on-surface-variant font-bold uppercase tracking-tight'>Apartment</p>
                      <p className='text-xl font-bold text-on-surface'>{getApartmentCode()}</p>
                    </div>
                  </div>
                  <div className='space-y-4'>
                    <div>
                      <p className='text-[10px] uppercase tracking-widest font-bold text-on-surface-variant'>
                        {isGuestQR() ? 'Host' : 'Created By'}
                      </p>
                      <p className='text-lg font-bold text-on-surface'>{getHostName()}</p>
                      <div className='inline-flex items-center gap-2 text-xs text-on-surface-variant mt-2'>
                        <span className='material-symbols-outlined text-sm'>person</span>
                        {isGuestQR() ? 'Verified Resident' : 'System Admin'}
                      </div>
                    </div>
                    <div className='pt-4 border-t border-surface-container-low'>
                      <p className='text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-2'>
                        {isGuestQR() ? 'Valid Until' : 'Expires At'}
                      </p>
                      <p className='text-sm text-on-surface'>{formatDate(getValidTo())}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {!isSuccess && (
              <div className='bg-surface-container-lowest p-8 rounded-[2rem] border border-outline-variant/15 text-center'>
                <span className='material-symbols-outlined text-6xl text-error mb-4'>error_outline</span>
                <h3 className='text-xl font-bold text-on-surface mb-2'>Không thể xác thực</h3>
                <p className='text-on-surface-variant mb-6'>
                  {scanResult?.status === 'EXPIRED'
                    ? 'Mã QR này đã hết hạn. Vui lòng yêu cầu tạo mã mới.'
                    : scanResult?.status === 'REVOKED'
                      ? 'Mã QR này đã bị thu hồi. Vui lòng liên hệ chủ căn hộ hoặc admin.'
                      : 'Mã QR không tồn tại trong hệ thống hoặc đã bị vô hiệu hóa.'}
                </p>
                <button
                  onClick={() => navigate('/scan-qr')}
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
            {/* Validity Module */}
            {isSuccess && scanResult && (
              <div className='bg-white p-8 rounded-[2rem] border border-outline-variant/15'>
                <p className='text-[10px] uppercase tracking-widest font-bold text-primary mb-6'>Validity Window</p>
                <div className='space-y-6'>
                  {isGuestQR() && getValidFrom() && (
                    <div className='flex items-start gap-4'>
                      <div className='w-1 h-12 bg-blue-600 rounded-full mt-1'></div>
                      <div>
                        <p className='text-xs text-on-surface-variant font-bold'>Valid From</p>
                        <p className='text-lg font-bold'>{formatDate(getValidFrom())}</p>
                      </div>
                    </div>
                  )}
                  <div className='flex items-start gap-4'>
                    <div className='w-1 h-12 bg-slate-200 rounded-full mt-1'></div>
                    <div>
                      <p className='text-xs text-on-surface-variant font-bold'>
                        {isGuestQR() ? 'Valid Until' : 'Expires At'}
                      </p>
                      <p className='text-lg font-bold'>{formatDate(getValidTo())}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Primary Actions */}
            <div className='space-y-4'>
              {isSuccess && scanResult?.status === 'ACTIVE' && (
                <>
                  <button
                    onClick={handleAllowEntry}
                    className='w-full bg-gradient-to-r from-primary to-primary-container text-white py-6 rounded-full font-bold text-lg shadow-lg shadow-blue-500/20 active:scale-95 transition-transform flex items-center justify-center gap-3'
                  >
                    <span className='material-symbols-outlined'>login</span>
                    Allow Entry
                  </button>
                  <button
                    onClick={handleRevokeQR}
                    className='w-full bg-error/10 text-error py-4 rounded-full font-bold text-base border border-error/20 active:scale-95 transition-transform flex items-center justify-center gap-2'
                  >
                    <span className='material-symbols-outlined'>block</span>
                    Thu hồi mã QR
                  </button>
                </>
              )}
              <button
                onClick={() => navigate('/qr-management')}
                className='w-full bg-surface-container-lowest text-on-surface py-6 rounded-full font-bold text-lg border border-outline-variant/15 active:scale-95 transition-transform flex items-center justify-center gap-3'
              >
                <span className='material-symbols-outlined'>home</span>
                Về trang chủ
              </button>
              <button
                onClick={() => navigate('/scan-qr')}
                className='w-full bg-surface-container-low text-on-surface py-4 rounded-full font-medium text-base border border-outline-variant/15 active:scale-95 transition-transform flex items-center justify-center gap-2'
              >
                <span className='material-symbols-outlined'>qr_code_scanner</span>
                Quét QR khác
              </button>
            </div>

            {/* Intelligence Chip */}
            {isSuccess && scanResult && (
              <div className='bg-secondary-fixed p-6 rounded-[2rem] border-0'>
                <div className='flex items-start gap-4'>
                  <span
                    className='material-symbols-outlined text-on-secondary-fixed-variant'
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    info
                  </span>
                  <div>
                    <p className='text-sm font-bold text-on-secondary-fixed leading-tight mb-1'>Gate Guard Insight</p>
                    <p className='text-xs text-on-secondary-fixed-variant leading-relaxed'>
                      {isGuestQR() ? 'Khách' : 'Cư dân'} <span className='font-bold'>{getDisplayName()}</span> đến căn
                      hộ <span className='font-bold'>{getApartmentCode()}</span>.
                      {isGuestQR() && getUsedEntries() > 0
                        ? ` Đã quét ${getUsedEntries()}/${getMaxEntries()} lần.`
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

      {/* History Modal - Giữ nguyên */}
      {showHistory && (
        <div className='fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4'>
          <div className='bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden'>
            <div className='p-6 border-b border-gray-100 flex justify-between items-center'>
              <h2 className='text-2xl font-bold'>Lịch sử quét QR</h2>
              <button onClick={() => setShowHistory(false)} className='p-2 hover:bg-gray-100 rounded-full'>
                <span className='material-symbols-outlined'>close</span>
              </button>
            </div>
            <div className='p-6 overflow-y-auto max-h-[calc(80vh-80px)]'>
              {historyData.length === 0 ? (
                <p className='text-center text-gray-500 py-8'>Chưa có lịch sử quét</p>
              ) : (
                <table className='w-full'>
                  <thead>
                    <tr className='border-b'>
                      <th className='text-left py-3'>Khách</th>
                      <th className='text-left py-3'>Căn hộ</th>
                      <th className='text-left py-3'>Thời gian</th>
                      <th className='text-left py-3'>Kết quả</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyData.map((item, index) => (
                      <tr key={index} className='border-b'>
                        <td className='py-3'>{item.visitor?.name || item.userName || 'N/A'}</td>
                        <td className='py-3'>{item.apartmentCode}</td>
                        <td className='py-3'>{item.scanTime ? formatDateTime(item.scanTime) : 'Chưa quét'}</td>
                        <td className='py-3'>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              item.result === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {item.result || 'PENDING'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className='md:hidden fixed bottom-0 left-0 w-full flex justify-around items-end pb-6 px-4 bg-white/80 backdrop-blur-2xl z-50 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)] border-t border-slate-100'>
        <button
          onClick={() => navigate('/scan-qr')}
          className='flex flex-col items-center justify-center bg-blue-600 text-white rounded-full p-3 mb-2 shadow-lg shadow-blue-500/40 active:scale-90 duration-150'
        >
          <span className='material-symbols-outlined'>qr_code_2</span>
          <span className='text-[10px] uppercase tracking-widest font-bold mt-1'>Scan</span>
        </button>
        <button
          onClick={handleLoadHistory}
          className='flex flex-col items-center justify-center text-slate-400 p-2 active:scale-90 duration-150'
        >
          <span className='material-symbols-outlined'>receipt_long</span>
          <span className='text-[10px] uppercase tracking-widest font-bold mt-1'>History</span>
        </button>
        <button
          onClick={() => navigate('/qr-management')}
          className='flex flex-col items-center justify-center text-slate-400 p-2 active:scale-90 duration-150'
        >
          <span className='material-symbols-outlined'>home</span>
          <span className='text-[10px] uppercase tracking-widest font-bold mt-1'>Home</span>
        </button>
      </nav>
    </div>
  )
}
