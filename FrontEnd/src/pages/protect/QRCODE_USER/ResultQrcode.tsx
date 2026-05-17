// import React from 'react'
// import { useLocation, useNavigate } from 'react-router-dom'
// import { useQuery } from '@tanstack/react-query'
// import { QRCodeApi } from 'src/apis/QrcodeApi/Qr.api'
// import type { Qrcodes } from 'src/types/qrcode.type'

// export default function ResultQrcode() {
//   const location = useLocation()
//   const navigate = useNavigate()
//   const qrCode = location.state?.qrCode

//   // Lấy thông tin QR từ API nếu có qrCode
//   const { data: qrDetailData, isLoading } = useQuery({
//     queryKey: ['qr-scan-result', qrCode],
//     queryFn: () => QRCodeApi.scanQr(qrCode),
//     enabled: !!qrCode,
//     retry: false
//   })

//   const scanResult = qrDetailData?.data?.data as Qrcodes | undefined
//   const isSuccess = qrDetailData?.data?.code === 'OK'

//   if (!qrCode) {
//     return (
//       <div className="bg-surface text-on-surface min-h-screen font-['Manrope',sans-serif] flex items-center justify-center">
//         <div className='text-center'>
//           <p className='text-on-surface-variant'>Không có dữ liệu QR</p>
//           <button
//             onClick={() => navigate('/qr-management')}
//             className='mt-4 px-6 py-2 bg-primary text-white rounded-full'
//           >
//             Quay lại
//           </button>
//         </div>
//       </div>
//     )
//   }

//   if (isLoading) {
//     return (
//       <div className="bg-surface text-on-surface min-h-screen font-['Manrope',sans-serif] flex items-center justify-center">
//         <div className='text-center'>
//           <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
//           <p className='mt-4 text-on-surface-variant'>Đang xác thực QR...</p>
//         </div>
//       </div>
//     )
//   }

//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString)
//     return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
//   }

//   const getRemainingEntries = () => {
//     if (!scanResult) return 0
//     return scanResult.maxEntries - scanResult.usedEntries
//   }

//   return (
//     <div className="bg-surface text-on-surface min-h-screen font-['Manrope',sans-serif]">
//       {/* TopNavBar */}
//       <nav className='fixed top-0 w-full z-50 bg-slate-50/70 backdrop-blur-xl shadow-sm shadow-blue-900/5 flex justify-between items-center px-6 py-3 max-w-full mx-auto font-manrope antialiased tracking-tight'>
//         <div className='flex items-center gap-8'>
//           <span className='text-xl font-bold tracking-tighter text-slate-900'>SentryGuard</span>
//           <div className='hidden md:flex items-center gap-6'>
//             <button
//               onClick={() => navigate('/scan-qr')}
//               className='text-blue-600 font-semibold border-b-2 border-blue-600 transition-all duration-300 ease-in-out'
//             >
//               Scanner
//             </button>
//             <button className='text-slate-500 hover:text-slate-900 transition-all duration-300 ease-in-out'>
//               History
//             </button>
//             <button className='text-slate-500 hover:text-slate-900 transition-all duration-300 ease-in-out'>
//               Reports
//             </button>
//           </div>
//         </div>
//         <div className='flex items-center gap-4'>
//           <button className='p-2 text-slate-500 hover:bg-slate-100/50 rounded-full active:scale-95 transition-transform'>
//             <span className='material-symbols-outlined'>notifications</span>
//           </button>
//           <button className='p-2 text-slate-500 hover:bg-slate-100/50 rounded-full active:scale-95 transition-transform'>
//             <span className='material-symbols-outlined'>settings</span>
//           </button>
//           <div className='w-8 h-8 rounded-full overflow-hidden border border-slate-200'>
//             <img
//               alt='Security Guard Avatar'
//               className='w-full h-full object-cover'
//               src='https://lh3.googleusercontent.com/aida-public/AB6AXuBtsmyf5zp-Lifg9prOawAFTBFL6wAt9J0KBbsB88Giy3onxiB-bNtdaBZRY2ptm2iIiieymtiuhfv3zxaNIGCSeusT4EWjflQNO8Yq3Wusa3_uhoBo8UcxEtb3wkoD5Zt7-39g794VguKvZxqkrvF3A3hbEb80GcBMOdRuGNqAcU0ZAtNpmwoRhUMDLDxdFK_9aPxjTOHWWJL-y1jAx4U-DsaR7c8BaxFqPsuoLRERzFM1quPZo0VmieG_yNP33BD6K3Ph-lLUEmef'
//             />
//           </div>
//         </div>
//       </nav>

//       {/* Main Content */}
//       <main className='pt-24 pb-24 lg:pl-72 px-4 md:px-8 max-w-7xl mx-auto'>
//         <header className='mb-12'>
//           <h1 className='text-3xl font-bold tracking-tight text-on-surface mb-2'>Scan Verification</h1>
//           <p className='text-on-surface-variant max-w-xl'>
//             Real-time authentication and access control for Resident Guests.
//           </p>
//         </header>

//         {/* Result Canvas */}
//         <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
//           {/* Result Header & Status */}
//           <div className='lg:col-span-8 space-y-8'>
//             {/* Status Card */}
//             <div
//               className={`relative overflow-hidden rounded-[2rem] p-8 text-white shadow-2xl shadow-blue-900/20 ${
//                 isSuccess
//                   ? 'bg-gradient-to-br from-primary to-primary-container'
//                   : 'bg-gradient-to-br from-error to-red-700'
//               }`}
//             >
//               <div className='relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6'>
//                 <div>
//                   <div className='inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4'>
//                     <span
//                       className='material-symbols-outlined text-[14px]'
//                       style={{ fontVariationSettings: "'FILL' 1" }}
//                     >
//                       {isSuccess ? 'verified' : 'error'}
//                     </span>
//                     {isSuccess ? 'Authenticated' : 'Authentication Failed'}
//                   </div>
//                   <h2 className='text-4xl md:text-5xl font-black tracking-tighter mb-2'>
//                     {isSuccess ? 'QR hợp lệ' : 'QR không hợp lệ'}
//                   </h2>
//                   <p className='text-blue-100 text-lg opacity-90'>
//                     {isSuccess
//                       ? `Status: ${scanResult?.status} • Guest Verified`
//                       : scanResult?.isExpired
//                         ? 'QR đã hết hạn'
//                         : 'QR không tồn tại hoặc đã bị thu hồi'}
//                   </p>
//                 </div>
//                 {isSuccess && (
//                   <div className='bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 text-center min-w-[160px]'>
//                     <p className='text-[10px] uppercase tracking-[0.2em] font-bold text-blue-100 mb-2'>
//                       Remaining Entries
//                     </p>
//                     <p className='text-5xl font-black'>{getRemainingEntries()}</p>
//                     <p className='text-xs mt-2 text-blue-200'>
//                       Used: {scanResult?.usedEntries}/{scanResult?.maxEntries}
//                     </p>
//                   </div>
//                 )}
//               </div>
//               <div className='absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl'></div>
//             </div>

//             {/* Profile Info */}
//             {isSuccess && scanResult && (
//               <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
//                 {/* Guest Details */}
//                 <div className='bg-surface-container-lowest p-8 rounded-[2rem] border border-outline-variant/15 flex flex-col justify-between'>
//                   <div>
//                     <p className='text-[10px] uppercase tracking-widest font-bold text-primary mb-6'>Guest Profile</p>
//                     <div className='flex items-center gap-6 mb-8'>
//                       <div className='w-20 h-20 rounded-2xl overflow-hidden bg-surface-container-low flex-shrink-0'>
//                         <img
//                           alt='Guest Avatar'
//                           className='w-full h-full object-cover'
//                           src={`https://ui-avatars.com/api/?name=${encodeURIComponent(scanResult.visitor.name)}&background=005ab7&color=fff`}
//                         />
//                       </div>
//                       <div>
//                         <h3 className='text-2xl font-bold text-on-surface'>{scanResult.visitor.name}</h3>
//                         <p className='text-on-surface-variant'>Visitor • Resident Guest</p>
//                       </div>
//                     </div>
//                     <div className='space-y-4'>
//                       <div className='flex justify-between items-center py-3 border-b border-surface-container-low'>
//                         <span className='text-sm text-on-surface-variant'>ID Card</span>
//                         <span className='font-mono font-medium'>{scanResult.visitor.idCard || 'N/A'}</span>
//                       </div>
//                       <div className='flex justify-between items-center py-3'>
//                         <span className='text-sm text-on-surface-variant'>Phone</span>
//                         <span className='font-mono font-medium'>{scanResult.visitor.phone}</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Host & Location */}
//                 <div className='bg-surface-container-lowest p-8 rounded-[2rem] border border-outline-variant/15'>
//                   <p className='text-[10px] uppercase tracking-widest font-bold text-primary mb-6'>
//                     Destination Details
//                   </p>
//                   <div className='flex items-center gap-4 mb-8 p-4 bg-surface-container-low rounded-2xl'>
//                     <div className='w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600'>
//                       <span className='material-symbols-outlined'>apartment</span>
//                     </div>
//                     <div>
//                       <p className='text-xs text-on-surface-variant font-bold uppercase tracking-tight'>Apartment</p>
//                       <p className='text-xl font-bold text-on-surface'>{scanResult.apartmentCode}</p>
//                     </div>
//                   </div>
//                   <div className='space-y-2'>
//                     <p className='text-[10px] uppercase tracking-widest font-bold text-on-surface-variant'>Host</p>
//                     <p className='text-lg font-bold text-on-surface'>{scanResult.hostName}</p>
//                     <div className='inline-flex items-center gap-2 text-xs text-on-surface-variant mt-2'>
//                       <span className='material-symbols-outlined text-sm'>person</span>
//                       Verified Resident
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Error Message when not success */}
//             {!isSuccess && (
//               <div className='bg-surface-container-lowest p-8 rounded-[2rem] border border-outline-variant/15 text-center'>
//                 <span className='material-symbols-outlined text-6xl text-error mb-4'>error_outline</span>
//                 <h3 className='text-xl font-bold text-on-surface mb-2'>Không thể xác thực</h3>
//                 <p className='text-on-surface-variant'>
//                   {scanResult?.isExpired
//                     ? 'Mã QR này đã hết hạn. Vui lòng yêu cầu khách tạo mã mới.'
//                     : scanResult?.isRevoked
//                       ? 'Mã QR này đã bị thu hồi. Vui lòng liên hệ chủ căn hộ.'
//                       : 'Mã QR không tồn tại trong hệ thống.'}
//                 </p>
//               </div>
//             )}
//           </div>

//           {/* Action Panel (Sidebar Column) */}
//           <div className='lg:col-span-4 space-y-8'>
//             {/* Validity Module */}
//             {isSuccess && scanResult && (
//               <div className='bg-white p-8 rounded-[2rem] border border-outline-variant/15'>
//                 <p className='text-[10px] uppercase tracking-widest font-bold text-primary mb-6'>Validity Window</p>
//                 <div className='space-y-6'>
//                   <div className='flex items-start gap-4'>
//                     <div className='w-1 h-12 bg-blue-600 rounded-full mt-1'></div>
//                     <div>
//                       <p className='text-xs text-on-surface-variant font-bold'>Valid From</p>
//                       <p className='text-lg font-bold'>{formatDate(scanResult.validFrom)}</p>
//                     </div>
//                   </div>
//                   <div className='flex items-start gap-4'>
//                     <div className='w-1 h-12 bg-slate-200 rounded-full mt-1'></div>
//                     <div>
//                       <p className='text-xs text-on-surface-variant font-bold'>Valid Until</p>
//                       <p className='text-lg font-bold'>{formatDate(scanResult.validTo)}</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Primary Actions */}
//             <div className='space-y-4'>
//               {isSuccess && (
//                 <button className='w-full bg-gradient-to-r from-primary to-primary-container text-white py-6 rounded-full font-bold text-lg shadow-lg shadow-blue-500/20 active:scale-95 transition-transform flex items-center justify-center gap-3'>
//                   <span className='material-symbols-outlined'>login</span>
//                   Allow Entry
//                 </button>
//               )}
//               <button
//                 onClick={() => navigate('/qr-management')}
//                 className='w-full bg-surface-container-lowest text-on-surface py-6 rounded-full font-bold text-lg border border-outline-variant/15 active:scale-95 transition-transform flex items-center justify-center gap-3'
//               >
//                 <span className='material-symbols-outlined'>home</span>
//                 Về trang chủ
//               </button>
//             </div>

//             {/* Intelligence Chip */}
//             {isSuccess && (
//               <div className='bg-secondary-fixed p-6 rounded-[2rem] border-0'>
//                 <div className='flex items-start gap-4'>
//                   <span
//                     className='material-symbols-outlined text-on-secondary-fixed-variant'
//                     style={{ fontVariationSettings: "'FILL' 1" }}
//                   >
//                     info
//                   </span>
//                   <div>
//                     <p className='text-sm font-bold text-on-secondary-fixed leading-tight mb-1'>Gate Guard Insight</p>
//                     <p className='text-xs text-on-secondary-fixed-variant leading-relaxed'>
//                       Khách đến căn hộ {scanResult?.apartmentCode}. Không có cảnh báo bảo mật trong 12 tháng qua.
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </main>

//       {/* BottomNavBar (Mobile Only) */}
//       <nav className='md:hidden fixed bottom-0 left-0 w-full flex justify-around items-end pb-6 px-4 bg-white/80 backdrop-blur-2xl z-50 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)] border-t border-slate-100'>
//         <button
//           onClick={() => navigate('/scan-qr')}
//           className='flex flex-col items-center justify-center bg-blue-600 text-white rounded-full p-3 mb-2 shadow-lg shadow-blue-500/40 active:scale-90 duration-150'
//         >
//           <span className='material-symbols-outlined'>qr_code_2</span>
//           <span className='text-[10px] uppercase tracking-widest font-bold mt-1'>Scan</span>
//         </button>
//         <button className='flex flex-col items-center justify-center text-slate-400 p-2 active:scale-90 duration-150'>
//           <span className='material-symbols-outlined'>receipt_long</span>
//           <span className='text-[10px] uppercase tracking-widest font-bold mt-1'>History</span>
//         </button>
//         <button className='flex flex-col items-center justify-center text-slate-400 p-2 active:scale-90 duration-150'>
//           <span className='material-symbols-outlined'>warning</span>
//           <span className='text-[10px] uppercase tracking-widest font-bold mt-1'>Alerts</span>
//         </button>
//       </nav>
//     </div>
//   )
// }

import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { QRCodeApi } from 'src/apis/QrcodeApi/Qr.api'
import type { Qrcodes } from 'src/types/qrcode.type'
import { toast } from 'react-toastify'

export default function ResultQrcode() {
  const location = useLocation()
  const navigate = useNavigate()
  const { qrCode: qrCodeFromUrl } = useParams<{ qrCode: string }>()

  // Lấy QR code từ URL params hoặc từ state
  const qrCode = qrCodeFromUrl || location.state?.qrCode

  // State cho lịch sử quét
  const [showHistory, setShowHistory] = useState(false)
  const [historyData, setHistoryData] = useState<any[]>([])

  // Lấy thông tin QR từ API nếu có qrCode
  const {
    data: qrDetailData,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['qr-scan-result', qrCode],
    queryFn: () => QRCodeApi.scanQr(qrCode!),
    enabled: !!qrCode,
    retry: false
  })

  // Lấy lịch sử quét
  const { data: historyResponse, refetch: refetchHistory } = useQuery({
    queryKey: ['qr-history'],
    queryFn: () => QRCodeApi.getGuestQrHistory(),
    enabled: false
  })

  // Mutation cập nhật trạng thái QR (revoke)
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

  const scanResult = qrDetailData?.data?.data as Qrcodes | undefined
  const isSuccess = qrDetailData?.data?.code === 'OK'

  // Khi có kết quả, tự động ghi nhận log
  useEffect(() => {
    if (isSuccess && scanResult) {
      // Có thể gọi API ghi log quét ở đây
      console.log('QR scanned successfully:', scanResult.qrCode)
    }
  }, [isSuccess, scanResult])

  const handleLoadHistory = async () => {
    setShowHistory(true)
    const result = await QRCodeApi.getGuestQrHistory()
    setHistoryData(result?.data?.data || [])
    refetchHistory()
  }

  const handleAllowEntry = async () => {
    if (!scanResult) return

    toast.success(`Đã mở cổng cho khách ${scanResult.visitor.name}`)
    // Gọi API mở cổng vật lý ở đây
    // await openGateApi(scanResult.apartmentCode)

    // Refresh lại dữ liệu
    await refetch()
  }

  const handleRevokeQR = () => {
    if (!scanResult) return
    if (window.confirm(`Bạn có chắc muốn thu hồi mã QR của khách ${scanResult.visitor.name}?`)) {
      revokeMutation.mutate(scanResult.id)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
  }

  const getRemainingEntries = () => {
    if (!scanResult) return 0
    return scanResult.maxEntries - scanResult.usedEntries
  }

  const getUsagePercent = () => {
    if (!scanResult || scanResult.maxEntries === 0) return 0
    return (scanResult.usedEntries / scanResult.maxEntries) * 100
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
      {/* TopNavBar */}
      <nav className='fixed top-0 w-full z-50 bg-slate-50/70 backdrop-blur-xl shadow-sm shadow-blue-900/5 flex justify-between items-center px-6 py-3 max-w-full mx-auto font-manrope antialiased tracking-tight'>
        <div className='flex items-center gap-8'>
          <span className='text-xl font-bold tracking-tighter text-slate-900'>SentryGuard</span>
          <div className='hidden md:flex items-center gap-6'>
            <button
              onClick={() => navigate('/scan-qr')}
              className='text-blue-600 font-semibold border-b-2 border-blue-600 transition-all duration-300 ease-in-out'
            >
              Scanner
            </button>
            <button
              onClick={handleLoadHistory}
              className='text-slate-500 hover:text-slate-900 transition-all duration-300 ease-in-out'
            >
              History
            </button>
            <button className='text-slate-500 hover:text-slate-900 transition-all duration-300 ease-in-out'>
              Reports
            </button>
          </div>
        </div>
        <div className='flex items-center gap-4'>
          <button className='p-2 text-slate-500 hover:bg-slate-100/50 rounded-full active:scale-95 transition-transform'>
            <span className='material-symbols-outlined'>notifications</span>
          </button>
          <button
            onClick={() => navigate('/profile')}
            className='p-2 text-slate-500 hover:bg-slate-100/50 rounded-full active:scale-95 transition-transform'
          >
            <span className='material-symbols-outlined'>settings</span>
          </button>
          <div className='w-8 h-8 rounded-full overflow-hidden border border-slate-200'>
            <img
              alt='Security Guard Avatar'
              className='w-full h-full object-cover'
              src='https://lh3.googleusercontent.com/aida-public/AB6AXuBtsmyf5zp-Lifg9prOawAFTBFL6wAt9J0KBbsB88Giy3onxiB-bNtdaBZRY2ptm2iIiieymtiuhfv3zxaNIGCSeusT4EWjflQNO8Yq3Wusa3_uhoBo8UcxEtb3wkoD5Zt7-39g794VguKvZxqkrvF3A3hbEb80GcBMOdRuGNqAcU0ZAtNpmwoRhUMDLDxdFK_9aPxjTOHWWJL-y1jAx4U-DsaR7c8BaxFqPsuoLRERzFM1quPZo0VmieG_yNP33BD6K3Ph-lLUEmef'
            />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className='pt-24 pb-24 lg:pl-72 px-4 md:px-8 max-w-7xl mx-auto'>
        <header className='mb-12 flex justify-between items-center'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight text-on-surface mb-2'>Scan Verification</h1>
            <p className='text-on-surface-variant max-w-xl'>
              Real-time authentication and access control for Resident Guests.
            </p>
          </div>
          <div className='text-right'>
            <p className='text-xs text-on-surface-variant'>Mã QR</p>
            <p className='font-mono text-sm font-bold'>{qrCode.slice(-16)}</p>
          </div>
        </header>

        {/* Result Canvas */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
          {/* Result Header & Status */}
          <div className='lg:col-span-8 space-y-8'>
            {/* Status Card */}
            <div
              className={`relative overflow-hidden rounded-[2rem] p-8 text-white shadow-2xl shadow-blue-900/20 ${
                isSuccess
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
                      {isSuccess ? 'verified' : 'error'}
                    </span>
                    {isSuccess ? 'Authenticated' : 'Authentication Failed'}
                  </div>
                  <h2 className='text-4xl md:text-5xl font-black tracking-tighter mb-2'>
                    {isSuccess ? 'QR hợp lệ' : 'QR không hợp lệ'}
                  </h2>
                  <p className='text-blue-100 text-lg opacity-90'>
                    {isSuccess
                      ? `Status: ${scanResult?.status} • Guest Verified`
                      : scanResult?.isExpired
                        ? 'QR đã hết hạn'
                        : scanResult?.isRevoked
                          ? 'QR đã bị thu hồi'
                          : 'QR không tồn tại trong hệ thống'}
                  </p>
                </div>
                {isSuccess && (
                  <div className='bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 text-center min-w-[160px]'>
                    <p className='text-[10px] uppercase tracking-[0.2em] font-bold text-blue-100 mb-2'>
                      Remaining Entries
                    </p>
                    <p className='text-5xl font-black'>{getRemainingEntries()}</p>
                    <p className='text-xs mt-2 text-blue-200'>
                      Used: {scanResult?.usedEntries}/{scanResult?.maxEntries}
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
                {/* Guest Details */}
                <div className='bg-surface-container-lowest p-8 rounded-[2rem] border border-outline-variant/15 flex flex-col justify-between'>
                  <div>
                    <p className='text-[10px] uppercase tracking-widest font-bold text-primary mb-6'>Guest Profile</p>
                    <div className='flex items-center gap-6 mb-8'>
                      <div className='w-20 h-20 rounded-2xl overflow-hidden bg-surface-container-low flex-shrink-0'>
                        <img
                          alt='Guest Avatar'
                          className='w-full h-full object-cover'
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(scanResult.visitor.name)}&background=005ab7&color=fff`}
                        />
                      </div>
                      <div>
                        <h3 className='text-2xl font-bold text-on-surface'>{scanResult.visitor.name}</h3>
                        <p className='text-on-surface-variant'>Visitor • Resident Guest</p>
                        <span
                          className={`inline-flex items-center gap-1 text-xs mt-1 ${
                            scanResult.isActive ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          <span className='material-symbols-outlined text-xs'>
                            {scanResult.isActive ? 'check_circle' : 'cancel'}
                          </span>
                          {scanResult.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className='space-y-4'>
                      <div className='flex justify-between items-center py-3 border-b border-surface-container-low'>
                        <span className='text-sm text-on-surface-variant'>ID Card</span>
                        <span className='font-mono font-medium'>{scanResult.visitor.idCard || 'N/A'}</span>
                      </div>
                      <div className='flex justify-between items-center py-3'>
                        <span className='text-sm text-on-surface-variant'>Phone</span>
                        <span className='font-mono font-medium'>{scanResult.visitor.phone}</span>
                      </div>
                      <div className='flex justify-between items-center py-3'>
                        <span className='text-sm text-on-surface-variant'>QR Code</span>
                        <span className='font-mono text-xs'>{scanResult.qrCode.slice(-12)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Host & Location */}
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
                      <p className='text-xl font-bold text-on-surface'>{scanResult.apartmentCode}</p>
                    </div>
                  </div>
                  <div className='space-y-4'>
                    <div>
                      <p className='text-[10px] uppercase tracking-widest font-bold text-on-surface-variant'>Host</p>
                      <p className='text-lg font-bold text-on-surface'>{scanResult.hostName}</p>
                      <div className='inline-flex items-center gap-2 text-xs text-on-surface-variant mt-2'>
                        <span className='material-symbols-outlined text-sm'>person</span>
                        Verified Resident
                      </div>
                    </div>
                    <div className='pt-4 border-t border-surface-container-low'>
                      <p className='text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-2'>
                        Created At
                      </p>
                      <p className='text-sm text-on-surface'>{formatDateTime(scanResult.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message when not success */}
            {!isSuccess && (
              <div className='bg-surface-container-lowest p-8 rounded-[2rem] border border-outline-variant/15 text-center'>
                <span className='material-symbols-outlined text-6xl text-error mb-4'>error_outline</span>
                <h3 className='text-xl font-bold text-on-surface mb-2'>Không thể xác thực</h3>
                <p className='text-on-surface-variant mb-6'>
                  {scanResult?.isExpired
                    ? 'Mã QR này đã hết hạn. Vui lòng yêu cầu khách tạo mã mới.'
                    : scanResult?.isRevoked
                      ? 'Mã QR này đã bị thu hồi. Vui lòng liên hệ chủ căn hộ.'
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

          {/* Action Panel (Sidebar Column) */}
          <div className='lg:col-span-4 space-y-8'>
            {/* Validity Module */}
            {isSuccess && scanResult && (
              <div className='bg-white p-8 rounded-[2rem] border border-outline-variant/15'>
                <p className='text-[10px] uppercase tracking-widest font-bold text-primary mb-6'>Validity Window</p>
                <div className='space-y-6'>
                  <div className='flex items-start gap-4'>
                    <div className='w-1 h-12 bg-blue-600 rounded-full mt-1'></div>
                    <div>
                      <p className='text-xs text-on-surface-variant font-bold'>Valid From</p>
                      <p className='text-lg font-bold'>{formatDate(scanResult.validFrom)}</p>
                    </div>
                  </div>
                  <div className='flex items-start gap-4'>
                    <div className='w-1 h-12 bg-slate-200 rounded-full mt-1'></div>
                    <div>
                      <p className='text-xs text-on-surface-variant font-bold'>Valid Until</p>
                      <p className='text-lg font-bold'>{formatDate(scanResult.validTo)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Primary Actions */}
            <div className='space-y-4'>
              {isSuccess && (
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
            {isSuccess && (
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
                      Khách <span className='font-bold'>{scanResult?.visitor.name}</span> đến căn hộ{' '}
                      <span className='font-bold'>{scanResult?.apartmentCode}</span>.
                      {scanResult?.usedEntries > 0
                        ? ` Đã quét ${scanResult.usedEntries}/${scanResult.maxEntries} lần.`
                        : ' Lần quét đầu tiên.'}
                      Không có cảnh báo bảo mật.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* QR Code Info */}
            {isSuccess && scanResult && (
              <div className='bg-surface-container-lowest p-6 rounded-[2rem] border border-outline-variant/15'>
                <div className='flex items-center gap-3 mb-4'>
                  <span className='material-symbols-outlined text-primary'>info</span>
                  <p className='text-xs font-bold uppercase tracking-widest text-primary'>Thông tin bổ sung</p>
                </div>
                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-on-surface-variant'>ID QR:</span>
                    <span className='font-mono'>{scanResult.id}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-on-surface-variant'>Host ID:</span>
                    <span className='font-mono'>{scanResult.hostUserId}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-on-surface-variant'>Tạo lúc:</span>
                    <span>{formatDateTime(scanResult.createdAt)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* History Modal */}
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
                        <td className='py-3'>{item.visitor?.name}</td>
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

      {/* BottomNavBar (Mobile Only) */}
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
