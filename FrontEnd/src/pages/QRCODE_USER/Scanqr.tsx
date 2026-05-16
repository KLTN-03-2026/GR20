// import React, { useState, useRef, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { Html5Qrcode } from 'html5-qrcode'
// import { toast } from 'react-toastify'
// import { QRCodeApi } from 'src/apis/QrcodeApi/Qr.api'

// export default function ScanQrPage() {
//   const navigate = useNavigate()
//   const [uploading, setUploading] = useState(false)
//   const [activeTab, setActiveTab] = useState<'scan' | 'upload' | 'manual'>('scan')
//   const [cameraActive, setCameraActive] = useState(false)
//   const [direction, setDirection] = useState<'IN' | 'OUT'>('IN')
//   const [showPinDialog, setShowPinDialog] = useState(false)
//   const [pendingQrCode, setPendingQrCode] = useState<string | null>(null)
//   const [pendingScanData, setPendingScanData] = useState<any>(null)
//   const [pinCode, setPinCode] = useState('')
//   const [pinError, setPinError] = useState('')
//   const [pinLoading, setPinLoading] = useState(false)

//   const qrCodeRef = useRef<Html5Qrcode | null>(null)
//   const fileInputRef = useRef<HTMLInputElement>(null)
//   const hasScannedRef = useRef(false)
//   const isProcessingRef = useRef(false)
//   useEffect(() => {
//     if (activeTab === 'scan') {
//       startCamera()
//     } else {
//       stopCamera()
//     }

//     return () => {
//       stopCamera()
//     }
//   }, [activeTab])

//   const startCamera = async () => {
//     const element = document.getElementById('qr-reader')
//     if (!element) {
//       setTimeout(() => startCamera(), 200)
//       return
//     }

//     if (qrCodeRef.current) return

//     try {
//       element.innerHTML = ''
//       const html5QrCode = new Html5Qrcode('qr-reader')
//       qrCodeRef.current = html5QrCode
//       hasScannedRef.current = false

//       const onScanSuccess = async (decodedText: string) => {
//         if (!hasScannedRef.current) {
//           hasScannedRef.current = true
//           await handleScanResult(decodedText)
//         }
//       }

//       const onScanError = (errorMessage: string) => {
//         if (errorMessage.includes('IndexSizeError') || errorMessage.includes('source width is 0')) {
//           return
//         }
//       }

//       await html5QrCode.start(
//         { facingMode: 'environment' },
//         {
//           fps: 10,
//           qrbox: function (viewfinderWidth, viewfinderHeight) {
//             const minSize = Math.min(viewfinderWidth, viewfinderHeight)
//             const qrboxSize = Math.min(Math.floor(minSize * 0.7), 400)
//             return { width: qrboxSize, height: qrboxSize }
//           },
//           aspectRatio: 1.0
//         },
//         onScanSuccess,
//         onScanError
//       )

//       setCameraActive(true)
//     } catch (err: any) {
//       if (err?.message?.includes('NotAllowedError')) {
//         toast.error('Vui lòng cấp quyền truy cập camera')
//       } else if (err?.message?.includes('NotFoundError')) {
//         toast.error('Không tìm thấy camera')
//       } else {
//         toast.error('Không thể khởi tạo camera')
//       }
//     }
//   }

//   const stopCamera = async () => {
//     if (qrCodeRef.current) {
//       try {
//         await qrCodeRef.current.stop()
//         await qrCodeRef.current.clear()
//         qrCodeRef.current = null
//         setCameraActive(false)
//       } catch (err) {
//         // Silent error
//       }
//     }
//   }

//   const handleScanResult = async (qrCode: string) => {
//     if (isProcessingRef.current) {
//       console.log('⚠️ Already processing, skipping duplicate call')
//       return
//     }

//     isProcessingRef.current = true

//     try {
//       await stopCamera()

//       let response
//       if (qrCode.startsWith('GUEST_')) {
//         response = await QRCodeApi.scanGuestQr(qrCode, {
//           direction: direction,
//           gate: 'Cổng chính'
//         })
//       } else {
//         response = await QRCodeApi.scanPersonalQr(qrCode, {
//           direction: direction,
//           gate: 'Cổng chính'
//         })
//       }

//       const result = response?.data
//       console.log('🔍 Scan result:', result)

//       // REQUIRE_PIN
//       if (result?.code === 'REQUIRE_PIN') {
//         setPendingQrCode(qrCode)
//         setPendingScanData(result.data)
//         setShowPinDialog(true)
//         setPinCode('')
//         setPinError('')
//         isProcessingRef.current = false
//         return
//       }

//       // 👉 KIỂM TRA NẾU VỪA HẾT LƯỢT SAU KHI QUÉT (ĐÃ SỬA)
//       const isOutOfEntries =
//         result?.data?.qrType === 'guest' &&
//         result?.data?.usedEntries !== undefined &&
//         result?.data?.maxEntries !== undefined &&
//         result?.data?.usedEntries >= result?.data?.maxEntries &&
//         result?.data?.maxEntries > 0

//       // Thành công
//       if (result?.code === 'OK') {
//         if (isOutOfEntries) {
//           // Vẫn navigate nhưng đánh dấu là đã hết lượt
//           toast.warning(`⚠️ Đã quét thành công! Đây là lượt cuối cùng. QR sẽ hết hiệu lực.`)
//           // Lưu thông báo để result page không polling
//           sessionStorage.setItem(
//             'qrOutOfEntries', // 👈 DÙNG KEY NÀY ĐỂ ResultPage ĐỌC
//             JSON.stringify({
//               qrCode: qrCode,
//               isOutOfEntries: true,
//               usedEntries: result.data.usedEntries,
//               maxEntries: result.data.maxEntries
//             })
//           )
//         } else {
//           toast.success(`Đã quét thành công! Hướng: ${direction === 'IN' ? 'VÀO' : 'RA'}`)
//         }
//         navigate(`/result/${encodeURIComponent(qrCode)}?direction=${direction}`)
//         isProcessingRef.current = false
//         return
//       }

//       // Xử lý các trường hợp lỗi
//       const errorMessage = result?.message || ''
//       let errorType = 'unknown'

//       if (errorMessage.includes('hết hạn') || result?.data?.status === 'EXPIRED') {
//         errorType = 'expired'
//         toast.error('❌ QR đã hết hạn! Vui lòng yêu cầu cấp mã mới.')
//       } else if (errorMessage.includes('thu hồi') || result?.data?.status === 'REVOKED') {
//         errorType = 'revoked'
//         toast.error('❌ QR đã bị thu hồi! Vui lòng liên hệ chủ căn hộ.')
//       } else if (errorMessage.includes('hết số lần') || errorMessage.includes('hết lượt')) {
//         errorType = 'out_of_entries'
//         toast.error('❌ QR đã hết lượt sử dụng! Vui lòng yêu cầu cấp mã mới hoặc gia hạn.')
//       } else if (errorMessage) {
//         toast.error(errorMessage)
//       } else {
//         toast.error('QR không hợp lệ')
//       }

//       // Lưu thông tin lỗi
//       const scanData = {
//         qrCode: qrCode,
//         scanTime: new Date().toISOString(),
//         direction: direction,
//         apiResponse: {
//           code: result?.code,
//           message: errorMessage,
//           data: result?.data
//         },
//         isError: true,
//         errorType: errorType,
//         errorMessage: errorMessage
//       }

//       sessionStorage.setItem('lastScanResult', JSON.stringify(scanData))
//       navigate(`/result/${encodeURIComponent(qrCode)}?direction=${direction}&error=true&errorType=${errorType}`)
//       isProcessingRef.current = false
//     } catch (error: any) {
//       console.error('Scan error:', error)

//       const errorMessage = error?.response?.data?.message || error?.message || 'Lỗi khi quét QR'

//       if (errorMessage.includes('hết hạn')) {
//         toast.error('❌ QR đã hết hạn!')
//       } else if (errorMessage.includes('thu hồi')) {
//         toast.error('❌ QR đã bị thu hồi!')
//       } else if (errorMessage.includes('hết số lần')) {
//         toast.error('❌ QR đã hết lượt sử dụng!')
//       } else {
//         toast.error(errorMessage)
//       }

//       const errorData = {
//         qrCode: qrCode,
//         scanTime: new Date().toISOString(),
//         direction: direction,
//         isError: true,
//         errorMessage: errorMessage
//       }
//       sessionStorage.setItem('lastScanResult', JSON.stringify(errorData))

//       navigate(`/result/${encodeURIComponent(qrCode)}?direction=${direction}&error=true`)
//       isProcessingRef.current = false
//     }
//   }

//   // const handleVerifyPin = async () => {
//   //   if (!pendingQrCode) return
//   //   if (!pinCode || pinCode.length !== 4) {
//   //     setPinError('Vui lòng nhập mã PIN 4 số')
//   //     return
//   //   }

//   //   setPinLoading(true)
//   //   try {
//   //     const response = await QRCodeApi.scanVerifyPin(pendingQrCode, pinCode, {
//   //       scanMetadata: {
//   //         direction: direction,
//   //         gate: 'Cổng chính',
//   //         buildingId: pendingScanData?.buildingId || null
//   //       }
//   //     })

//   //     if (response?.data?.code === 'OK') {
//   //       toast.success('Xác thực PIN thành công! Mở cửa...')

//   //       if (pendingScanData) {
//   //         sessionStorage.setItem('pendingScanData', JSON.stringify(pendingScanData))
//   //         sessionStorage.setItem('pendingQrCode', pendingQrCode)
//   //       }

//   //       setShowPinDialog(false)
//   //       navigate(`/result/${encodeURIComponent(pendingQrCode)}?direction=${direction}&pinVerified=true`)
//   //     } else {
//   //       setPinError(response?.data?.message || 'Mã PIN không đúng')
//   //       setPinCode('')
//   //     }
//   //   } catch (error: any) {
//   //     setPinError(error?.response?.data?.message || 'Lỗi xác thực PIN')
//   //     setPinCode('')
//   //   } finally {
//   //     setPinLoading(false)
//   //   }
//   // }

//   const handleVerifyPin = async () => {
//     if (!pendingQrCode) return
//     if (!pinCode || pinCode.length !== 4) {
//       setPinError('Vui lòng nhập mã PIN 4 số')
//       return
//     }

//     setPinLoading(true)
//     try {
//       const response = await QRCodeApi.scanVerifyPin(pendingQrCode, pinCode, {
//         scanMetadata: {
//           direction: direction,
//           gate: 'Cổng chính',
//           buildingId: pendingScanData?.buildingId || null
//         }
//       })

//       if (response?.data?.code === 'OK') {
//         toast.success('Xác thực PIN thành công! Mở cửa...')

//         // 👉 LẤY DỮ LIỆU MỚI TỪ RESPONSE
//         const newQrData = response.data.data?.qrData

//         if (newQrData) {
//           // 👉 CẬP NHẬT pendingScanData VỚI DỮ LIỆU MỚI (đã tăng used_entries)
//           const updatedScanData = {
//             ...pendingScanData,
//             usedEntries: newQrData.usedEntries,
//             maxEntries: newQrData.maxEntries,
//             remainingEntries: newQrData.remainingEntries
//             // Các field khác giữ nguyên
//           }
//           sessionStorage.setItem('pendingScanData', JSON.stringify(updatedScanData))
//           sessionStorage.setItem('pendingQrCode', pendingQrCode)
//         } else {
//           // Fallback: giữ nguyên dữ liệu cũ
//           sessionStorage.setItem('pendingScanData', JSON.stringify(pendingScanData))
//           sessionStorage.setItem('pendingQrCode', pendingQrCode)
//         }

//         setShowPinDialog(false)
//         navigate(`/result/${encodeURIComponent(pendingQrCode)}?direction=${direction}&pinVerified=true`)
//       } else {
//         setPinError(response?.data?.message || 'Mã PIN không đúng')
//         setPinCode('')
//       }
//     } catch (error: any) {
//       setPinError(error?.response?.data?.message || 'Lỗi xác thực PIN')
//       setPinCode('')
//     } finally {
//       setPinLoading(false)
//     }
//   }

//   const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0]
//     if (!file) return

//     setUploading(true)
//     const tempDiv = document.createElement('div')
//     tempDiv.id = 'temp-qr-reader'
//     tempDiv.style.display = 'none'
//     document.body.appendChild(tempDiv)

//     const html5QrCode = new Html5Qrcode('temp-qr-reader')

//     try {
//       const qrCode = await html5QrCode.scanFile(file, true)
//       await handleScanResult(qrCode)
//     } catch (err) {
//       toast.error('Không tìm thấy mã QR trong ảnh')
//     } finally {
//       setUploading(false)
//       await html5QrCode.clear()
//       document.body.removeChild(tempDiv)
//       if (fileInputRef.current) fileInputRef.current.value = ''
//     }
//   }

//   const handleManualInput = async (e: React.FormEvent) => {
//     e.preventDefault()
//     const form = e.target as HTMLFormElement
//     const input = form.qrCode as HTMLInputElement
//     if (input.value) {
//       await handleScanResult(input.value)
//     }
//   }

//   return (
//     <>
//       <div className="bg-surface text-on-surface min-h-screen font-['Inter',sans-serif]">
//         <style>{`
//           #qr-reader {
//             border: none !important;
//             border-radius: 20px;
//             overflow: hidden;
//             width: 100%;
//           }
//           #qr-reader video {
//             width: 100% !important;
//             height: auto !important;
//             object-fit: cover !important;
//           }
//           #qr-reader__dashboard_section {
//             display: none !important;
//           }
//           #qr-reader__scan_region {
//             border-radius: 20px !important;
//           }

//           .scanner-overlay::after {
//             content: '';
//             position: absolute;
//             top: 50%;
//             left: 50%;
//             transform: translate(-50%, -50%);
//             width: 250px;
//             height: 250px;
//             border: 3px solid #000666;
//             border-radius: 20px;
//             box-shadow: inset 0 0 30px rgba(0, 6, 102, 0.15), 0 0 20px rgba(0, 6, 102, 0.2);
//             animation: scanPulse 2s ease-in-out infinite;
//           }

//           @keyframes scanPulse {
//             0%, 100% { box-shadow: inset 0 0 30px rgba(0, 6, 102, 0.15), 0 0 20px rgba(0, 6, 102, 0.2); }
//             50% { box-shadow: inset 0 0 50px rgba(0, 6, 102, 0.3), 0 0 40px rgba(0, 6, 102, 0.4); }
//           }

//           .fade-in {
//             animation: fadeIn 0.5s ease-in;
//           }

//           @keyframes fadeIn {
//             from { opacity: 0; transform: translateY(10px); }
//             to { opacity: 1; transform: translateY(0); }
//           }

//           .floating-card {
//             background: #ffffff;
//             border: 1px solid rgba(26, 35, 126, 0.1);
//             box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
//           }

//           .btn-primary {
//             background: linear-gradient(135deg, #000666 0%, #1a237e 100%);
//             color: white;
//             transition: all 0.3s ease;
//           }

//           .btn-primary:hover:not(:disabled) {
//             transform: translateY(-2px);
//             box-shadow: 0 10px 30px rgba(0, 6, 102, 0.2);
//           }

//           .btn-direction {
//             transition: all 0.3s ease;
//           }

//           .btn-in {
//             background: linear-gradient(135deg, #059669 0%, #10b981 100%);
//             color: white;
//           }

//           .btn-in-active {
//             background: linear-gradient(135deg, #047857 0%, #059669 100%);
//             box-shadow: 0 4px 15px rgba(5, 150, 105, 0.3);
//             transform: scale(1.02);
//           }

//           .btn-out {
//             background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
//             color: white;
//           }

//           .btn-out-active {
//             background: linear-gradient(135deg, #c2410c 0%, #ea580c 100%);
//             box-shadow: 0 4px 15px rgba(234, 88, 12, 0.3);
//             transform: scale(1.02);
//           }

//           .btn-danger {
//             background: linear-gradient(135deg, #ba1a1a 0%, #a01010 100%);
//             color: white;
//             transition: all 0.3s ease;
//           }

//           .btn-danger:hover {
//             transform: translateY(-2px);
//             box-shadow: 0 10px 30px rgba(186, 26, 26, 0.2);
//           }

//           .tab-active {
//             color: #000666;
//             border-bottom: 3px solid #000666;
//           }

//           .tab-inactive {
//             color: #767683;
//           }
//         `}</style>

//         <div className='flex flex-col min-h-screen'>
//           <main className='flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-8'>
//             {/* Direction Selection */}
//             <div className='flex gap-4 mb-8 justify-center'>
//               <button
//                 onClick={() => setDirection('IN')}
//                 className={`px-8 py-3 rounded-full font-bold text-lg transition-all flex items-center gap-2 ${
//                   direction === 'IN'
//                     ? 'btn-in btn-in-active'
//                     : 'bg-surface-container-low text-on-surface-variant hover:bg-green-50'
//                 }`}
//               >
//                 <span className='material-symbols-outlined'>login</span>
//                 VÀO
//               </button>
//               <button
//                 onClick={() => setDirection('OUT')}
//                 className={`px-8 py-3 rounded-full font-bold text-lg transition-all flex items-center gap-2 ${
//                   direction === 'OUT'
//                     ? 'btn-out btn-out-active'
//                     : 'bg-surface-container-low text-on-surface-variant hover:bg-orange-50'
//                 }`}
//               >
//                 <span className='material-symbols-outlined'>logout</span>
//                 RA
//               </button>
//             </div>

//             {/* Tab Navigation */}
//             <div className='flex gap-2 mb-8 bg-surface-container-low p-1 rounded-full w-fit border border-outline/15'>
//               {[
//                 { id: 'scan', label: 'Quét QR', icon: 'qr_code_scanner' },
//                 { id: 'upload', label: 'Tải ảnh', icon: 'cloud_upload' },
//                 { id: 'manual', label: 'Nhập mã', icon: 'keyboard' }
//               ].map((tab) => (
//                 <button
//                   key={tab.id}
//                   onClick={() => setActiveTab(tab.id as any)}
//                   className={`px-4 md:px-6 py-3 rounded-full font-semibold transition-all flex items-center gap-2 text-sm md:text-base ${
//                     activeTab === tab.id ? 'btn-primary text-white shadow-md' : 'text-outline hover:text-on-surface'
//                   }`}
//                 >
//                   <span className='material-symbols-outlined text-xl'>{tab.icon}</span>
//                   {tab.label}
//                 </button>
//               ))}
//             </div>

//             {/* Content Area */}
//             <div className='fade-in'>
//               {/* Camera Scanner */}
//               {activeTab === 'scan' && (
//                 <div className='space-y-4'>
//                   {cameraActive && (
//                     <div className='flex gap-3 justify-center sticky top-0 z-10 bg-gradient-to-b from-surface to-transparent py-4'>
//                       <button
//                         onClick={stopCamera}
//                         className='btn-danger px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-md'
//                       >
//                         <span className='material-symbols-outlined'>stop_circle</span>
//                         Dừng camera
//                       </button>
//                       <button
//                         onClick={startCamera}
//                         className='btn-primary px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-md'
//                       >
//                         <span className='material-symbols-outlined'>refresh</span>
//                         Thử lại
//                       </button>
//                     </div>
//                   )}

//                   {!cameraActive && !qrCodeRef.current && (
//                     <div className='floating-card rounded-2xl overflow-hidden shadow-md'>
//                       <div className='w-full aspect-square flex flex-col items-center justify-center space-y-6 bg-surface-container-low p-8'>
//                         <span className='material-symbols-outlined text-7xl text-outline-variant'>videocam_off</span>
//                         <p className='text-on-surface text-lg font-semibold'>Camera chưa được bật</p>
//                         <button
//                           onClick={startCamera}
//                           className='btn-primary px-8 py-3 rounded-full font-bold shadow-md'
//                         >
//                           Bật camera ngay
//                         </button>
//                       </div>
//                     </div>
//                   )}

//                   <div
//                     className={`floating-card rounded-2xl overflow-hidden shadow-md scanner-overlay relative ${
//                       cameraActive ? 'block' : 'hidden'
//                     }`}
//                     style={{ display: cameraActive ? 'block' : 'none' }}
//                   >
//                     <div id='qr-reader' className='w-full aspect-square'></div>
//                   </div>

//                   {cameraActive && (
//                     <div className='floating-card rounded-xl p-4 text-center'>
//                       <p className='text-on-surface text-sm'>
//                         ✨ Hướng camera vào mã QR để quét{' '}
//                         <span className='font-bold text-primary'>{direction === 'IN' ? 'VÀO' : 'RA'}</span>
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {/* Upload Section */}
//               {activeTab === 'upload' && (
//                 <div className='space-y-6'>
//                   <div className='floating-card rounded-2xl p-12 border-2 border-dashed border-primary/30 hover:border-primary/60 transition-all hover:bg-surface-container-lowest'>
//                     <label className='block cursor-pointer'>
//                       <div className='flex flex-col items-center justify-center space-y-6'>
//                         <div className='relative'>
//                           <div className='absolute inset-0 bg-primary/10 blur-xl rounded-full animate-pulse'></div>
//                           <span className='material-symbols-outlined text-8xl text-primary relative'>image</span>
//                         </div>
//                         <div className='text-center'>
//                           <p className='text-2xl font-bold text-on-surface mb-2'>Tải ảnh QR Code</p>
//                           <p className='text-on-surface text-base mb-4'>Chọn ảnh chứa mã QR từ máy tính của bạn</p>
//                           <div className='flex flex-wrap gap-2 justify-center text-outline text-sm'>
//                             <span className='px-3 py-1 bg-surface-container-low rounded-full'>PNG</span>
//                             <span className='px-3 py-1 bg-surface-container-low rounded-full'>JPG</span>
//                             <span className='px-3 py-1 bg-surface-container-low rounded-full'>JPEG</span>
//                             <span className='px-3 py-1 bg-surface-container-low rounded-full'>WebP</span>
//                           </div>
//                         </div>
//                         <div className='flex items-center gap-3'>
//                           <button
//                             type='button'
//                             onClick={() => fileInputRef.current?.click()}
//                             className='btn-primary px-8 py-4 rounded-full font-bold shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
//                             disabled={uploading}
//                           >
//                             <span className='material-symbols-outlined'>upload_file</span>
//                             {uploading ? 'Đang quét...' : 'Chọn ảnh từ máy tính'}
//                           </button>
//                         </div>
//                         <p className='text-outline text-xs'>hoặc kéo thả ảnh vào đây</p>
//                       </div>
//                       <input
//                         ref={fileInputRef}
//                         type='file'
//                         accept='image/*'
//                         onChange={handleFileUpload}
//                         className='hidden'
//                         disabled={uploading}
//                       />
//                     </label>
//                   </div>

//                   <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
//                     <div className='floating-card rounded-xl p-4 flex gap-3'>
//                       <span className='material-symbols-outlined text-primary text-2xl flex-shrink-0'>info</span>
//                       <div>
//                         <p className='font-bold text-on-surface text-sm'>Ảnh rõ ràng</p>
//                         <p className='text-outline text-xs mt-1'>Đảm bảo mã QR không bị mờ hoặc bị che khuất</p>
//                       </div>
//                     </div>
//                     <div className='floating-card rounded-xl p-4 flex gap-3'>
//                       <span className='material-symbols-outlined text-primary text-2xl flex-shrink-0'>
//                         brightness_high
//                       </span>
//                       <div>
//                         <p className='font-bold text-on-surface text-sm'>Ánh sáng tốt</p>
//                         <p className='text-outline text-xs mt-1'>Chụp trong điều kiện ánh sáng đủ để quét tốt</p>
//                       </div>
//                     </div>
//                     <div className='floating-card rounded-xl p-4 flex gap-3'>
//                       <span className='material-symbols-outlined text-primary text-2xl flex-shrink-0'>
//                         center_focus_strong
//                       </span>
//                       <div>
//                         <p className='font-bold text-on-surface text-sm'>Căn chỉnh mã</p>
//                         <p className='text-outline text-xs mt-1'>Mã QR nên là đối tượng chính trong ảnh</p>
//                       </div>
//                     </div>
//                     <div className='floating-card rounded-xl p-4 flex gap-3'>
//                       <span className='material-symbols-outlined text-primary text-2xl flex-shrink-0'>
//                         check_circle
//                       </span>
//                       <div>
//                         <p className='font-bold text-on-surface text-sm'>Định dạng hỗ trợ</p>
//                         <p className='text-outline text-xs mt-1'>PNG, JPG, JPEG, WebP - tối đa 10MB</p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Manual Entry */}
//               {activeTab === 'manual' && (
//                 <div className='floating-card rounded-2xl p-8 md:p-12 shadow-md max-w-md mx-auto'>
//                   <div className='space-y-6'>
//                     <div className='text-center'>
//                       <span className='material-symbols-outlined text-7xl text-primary block mb-2'>keyboard</span>
//                       <h2 className='text-xl font-bold text-on-surface'>Nhập mã thủ công</h2>
//                       <p className='text-outline text-sm mt-2'>Sử dụng mã định danh in dưới QR</p>
//                     </div>
//                     <form onSubmit={handleManualInput} className='space-y-4'>
//                       <input
//                         name='qrCode'
//                         type='text'
//                         placeholder='HL-XXXX-XXXX'
//                         className='w-full bg-surface-container-low border border-outline/20 rounded-xl px-4 py-3 text-on-surface placeholder-outline/50 focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono'
//                       />
//                       <button
//                         type='submit'
//                         className='w-full btn-primary py-3 rounded-full font-bold shadow-md flex items-center justify-center gap-2'
//                       >
//                         <span className='material-symbols-outlined'>check_circle</span>
//                         Kiểm tra
//                       </button>
//                     </form>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Info Cards */}
//             {activeTab === 'scan' && (
//               <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-12'>
//                 {[
//                   { number: '01', title: 'Align Frame', desc: 'Đưa mã QR vào khung hình', icon: 'center_focus_weak' },
//                   { number: '02', title: 'Verify', desc: 'Hệ thống xác thực tự động', icon: 'verified' },
//                   { number: '03', title: 'Access', desc: 'Nhận thông tin chi tiết', icon: 'analytics' }
//                 ].map((step, i) => (
//                   <div
//                     key={i}
//                     className='floating-card rounded-xl p-6 space-y-3 hover:border-primary/30 hover:shadow-md transition-all'
//                     style={{ animationDelay: `${i * 0.1}s` }}
//                   >
//                     <div className='flex items-center justify-between'>
//                       <span className='material-symbols-outlined text-3xl text-primary'>{step.icon}</span>
//                       <span className='text-primary font-bold text-lg'>{step.number}</span>
//                     </div>
//                     <div>
//                       <h3 className='font-bold text-on-surface'>{step.title}</h3>
//                       <p className='text-outline text-sm'>{step.desc}</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </main>

//           <div className='border-t border-outline/20 bg-surface-container-low mt-12'>
//             <div className='max-w-7xl mx-auto px-4 md:px-6 py-6'>
//               <div className='floating-card rounded-xl p-4 flex items-start gap-3'>
//                 <span className='material-symbols-outlined text-2xl text-primary flex-shrink-0'>smart_toy</span>
//                 <div>
//                   <p className='font-bold text-on-surface text-sm'>AI Smart Link</p>
//                   <p className='text-outline text-xs mt-1'>
//                     Homelink AI đang chờ nhận diện tín hiệu. Quét mã QR sẽ tự động ghi nhận{' '}
//                     <span className='font-bold'>{direction === 'IN' ? 'VÀO' : 'RA'}</span>.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* 👉 PIN DIALOG MODAL */}
//       {showPinDialog && (
//         <div className='fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4'>
//           <div className='bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl'>
//             <div className='bg-gradient-to-r from-primary to-primary-container p-6 text-white'>
//               <div className='flex items-center gap-3'>
//                 <span className='material-symbols-outlined text-3xl'>lock</span>
//                 <div>
//                   <h2 className='text-xl font-bold'>Xác thực mã PIN</h2>
//                   <p className='text-white/80 text-sm mt-1'>
//                     {pendingScanData?.qrType === 'guest'
//                       ? `Khách: ${pendingScanData?.visitorName || 'Không xác định'}`
//                       : `Cư dân: ${pendingScanData?.userName || 'Không xác định'}`}
//                     {' - '}
//                     Căn {pendingScanData?.apartmentCode || 'N/A'}
//                   </p>
//                   {pendingScanData?.pinFailedCount !== undefined && (
//                     <p className='text-white/70 text-xs mt-1'>
//                       Còn {pendingScanData.maxPinAttempts - pendingScanData.pinFailedCount} lần thử
//                     </p>
//                   )}
//                 </div>
//               </div>
//             </div>

//             <div className='p-6'>
//               <p className='text-on-surface-variant text-sm mb-4'>
//                 Vui lòng yêu cầu cư dân cung cấp mã PIN 4 số để xác thực
//               </p>

//               <div className='mb-6'>
//                 <div className='flex justify-center gap-3 mb-2'>
//                   {[...Array(4)].map((_, idx) => (
//                     <div
//                       key={idx}
//                       className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-bold font-mono
//                         ${
//                           pinCode[idx]
//                             ? 'border-primary bg-primary/5 text-primary'
//                             : 'border-outline-variant/30 text-outline'
//                         }`}
//                     >
//                       {pinCode[idx] || '•'}
//                     </div>
//                   ))}
//                 </div>

//                 {/* PinPad số */}
//                 <div className='grid grid-cols-3 gap-3 mt-6'>
//                   {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
//                     <button
//                       key={num}
//                       onClick={() => setPinCode((prev) => (prev.length < 4 ? prev + num : prev))}
//                       className='bg-surface-container-low py-4 rounded-xl text-2xl font-bold text-on-surface hover:bg-surface-container transition-colors'
//                     >
//                       {num}
//                     </button>
//                   ))}
//                   <button
//                     onClick={() => setPinCode((prev) => prev.slice(0, -1))}
//                     className='bg-surface-container-low py-4 rounded-xl text-xl text-on-surface hover:bg-surface-container flex items-center justify-center'
//                   >
//                     <span className='material-symbols-outlined'>backspace</span>
//                   </button>
//                   <button
//                     onClick={() => setPinCode((prev) => (prev.length < 4 ? prev + '0' : prev))}
//                     className='bg-surface-container-low py-4 rounded-xl text-2xl font-bold text-on-surface hover:bg-surface-container'
//                   >
//                     0
//                   </button>
//                   <button
//                     onClick={() => setPinCode('')}
//                     className='bg-surface-container-low py-4 rounded-xl text-sm text-error hover:bg-surface-container'
//                   >
//                     Xóa
//                   </button>
//                 </div>
//               </div>

//               {pinError && (
//                 <div className='mb-4 p-3 bg-red-50 rounded-xl text-error text-sm text-center flex items-center justify-center gap-2'>
//                   <span className='material-symbols-outlined text-sm'>error</span>
//                   {pinError}
//                 </div>
//               )}

//               <div className='flex gap-3'>
//                 <button
//                   onClick={() => {
//                     setShowPinDialog(false)
//                     setPendingQrCode(null)
//                     setPinCode('')
//                     setPinError('')
//                     hasScannedRef.current = false
//                     startCamera()
//                   }}
//                   className='flex-1 py-3 rounded-xl border border-outline-variant text-on-surface-variant font-medium hover:bg-surface-container-low transition-colors'
//                 >
//                   Hủy
//                 </button>
//                 <button
//                   onClick={handleVerifyPin}
//                   disabled={pinLoading || pinCode.length !== 4}
//                   className='flex-1 btn-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
//                 >
//                   {pinLoading ? (
//                     <>
//                       <span className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent'></span>
//                       Đang xác thực...
//                     </>
//                   ) : (
//                     <>
//                       <span className='material-symbols-outlined'>check_circle</span>
//                       Xác nhận
//                     </>
//                   )}
//                 </button>
//               </div>

//               <p className='text-center text-outline text-xs mt-4'>
//                 * Mã PIN là mã bí mật của cư dân, không chia sẻ cho người khác
//               </p>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   )
// }

// import React, { useState, useRef, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { Html5Qrcode } from 'html5-qrcode'
// import { toast } from 'react-toastify'
// import { QRCodeApi } from 'src/apis/QrcodeApi/Qr.api'

// export default function ScanQrPage() {
//   const navigate = useNavigate()
//   const [uploading, setUploading] = useState(false)
//   const [activeTab, setActiveTab] = useState<'scan' | 'upload' | 'manual'>('scan')
//   const [cameraActive, setCameraActive] = useState(false)
//   const [direction, setDirection] = useState<'IN' | 'OUT'>('IN')
//   const [showPinDialog, setShowPinDialog] = useState(false)
//   const [pendingQrCode, setPendingQrCode] = useState<string | null>(null)
//   const [pendingScanData, setPendingScanData] = useState<any>(null)
//   const [pinCode, setPinCode] = useState('')
//   const [pinError, setPinError] = useState('')
//   const [pinLoading, setPinLoading] = useState(false)

//   const qrCodeRef = useRef<Html5Qrcode | null>(null)
//   const fileInputRef = useRef<HTMLInputElement>(null)
//   const hasScannedRef = useRef(false)
//   const isProcessingRef = useRef(false)

//   useEffect(() => {
//     if (activeTab === 'scan') {
//       startCamera()
//     } else {
//       stopCamera()
//     }

//     return () => {
//       stopCamera()
//     }
//   }, [activeTab])

//   const startCamera = async () => {
//     const element = document.getElementById('qr-reader')
//     if (!element) {
//       setTimeout(() => startCamera(), 200)
//       return
//     }

//     if (qrCodeRef.current) return

//     try {
//       element.innerHTML = ''
//       const html5QrCode = new Html5Qrcode('qr-reader')
//       qrCodeRef.current = html5QrCode
//       hasScannedRef.current = false

//       const onScanSuccess = async (decodedText: string) => {
//         if (!hasScannedRef.current) {
//           hasScannedRef.current = true
//           await handleScanResult(decodedText)
//         }
//       }

//       const onScanError = (errorMessage: string) => {
//         if (errorMessage.includes('IndexSizeError') || errorMessage.includes('source width is 0')) {
//           return
//         }
//       }

//       await html5QrCode.start(
//         { facingMode: 'environment' },
//         {
//           fps: 10,
//           qrbox: function (viewfinderWidth, viewfinderHeight) {
//             const minSize = Math.min(viewfinderWidth, viewfinderHeight)
//             const qrboxSize = Math.min(Math.floor(minSize * 0.7), 400)
//             return { width: qrboxSize, height: qrboxSize }
//           },
//           aspectRatio: 1.0
//         },
//         onScanSuccess,
//         onScanError
//       )

//       setCameraActive(true)
//     } catch (err: any) {
//       if (err?.message?.includes('NotAllowedError')) {
//         toast.error('Vui lòng cấp quyền truy cập camera')
//       } else if (err?.message?.includes('NotFoundError')) {
//         toast.error('Không tìm thấy camera')
//       } else {
//         toast.error('Không thể khởi tạo camera')
//       }
//     }
//   }

//   const stopCamera = async () => {
//     if (qrCodeRef.current) {
//       try {
//         await qrCodeRef.current.stop()
//         await qrCodeRef.current.clear()
//         qrCodeRef.current = null
//         setCameraActive(false)
//       } catch (err) {
//         // Silent error
//       }
//     }
//   }

//   const handleScanResult = async (qrCode: string) => {
//     if (isProcessingRef.current) return
//     isProcessingRef.current = true

//     try {
//       await stopCamera()

//       let response
//       if (qrCode.startsWith('GUEST_')) {
//         response = await QRCodeApi.scanGuestQr(qrCode, {
//           direction: direction,
//           gate: 'Cổng chính'
//         })
//       } else {
//         response = await QRCodeApi.scanPersonalQr(qrCode, {
//           direction: direction,
//           gate: 'Cổng chính'
//         })
//       }

//       const result = response?.data

//       if (result?.code === 'REQUIRE_PIN') {
//         setPendingQrCode(qrCode)
//         setPendingScanData(result.data)
//         setShowPinDialog(true)
//         setPinCode('')
//         setPinError('')
//         isProcessingRef.current = false
//         return
//       }

//       const isOutOfEntries =
//         result?.data?.qrType === 'guest' &&
//         result?.data?.usedEntries !== undefined &&
//         result?.data?.maxEntries !== undefined &&
//         result?.data?.usedEntries >= result?.data?.maxEntries &&
//         result?.data?.maxEntries > 0

//       if (result?.code === 'OK') {
//         if (isOutOfEntries) {
//           toast.warning(`Đã quét thành công! Đây là lượt cuối cùng.`)
//           sessionStorage.setItem(
//             'qrOutOfEntries',
//             JSON.stringify({
//               qrCode: qrCode,
//               isOutOfEntries: true,
//               usedEntries: result.data.usedEntries,
//               maxEntries: result.data.maxEntries
//             })
//           )
//         } else {
//           toast.success(`Đã quét thành công! Hướng: ${direction === 'IN' ? 'VÀO' : 'RA'}`)
//         }
//         navigate(`/result/${encodeURIComponent(qrCode)}?direction=${direction}`)
//         isProcessingRef.current = false
//         return
//       }

//       const errorMessage = result?.message || ''
//       let errorType = 'unknown'

//       if (errorMessage.includes('hết hạn') || result?.data?.status === 'EXPIRED') {
//         errorType = 'expired'
//         toast.error('QR đã hết hạn!')
//       } else if (errorMessage.includes('thu hồi') || result?.data?.status === 'REVOKED') {
//         errorType = 'revoked'
//         toast.error('QR đã bị thu hồi!')
//       } else if (errorMessage.includes('hết số lần')) {
//         errorType = 'out_of_entries'
//         toast.error('QR đã hết lượt sử dụng!')
//       } else if (errorMessage) {
//         toast.error(errorMessage)
//       } else {
//         toast.error('QR không hợp lệ')
//       }

//       const scanData = {
//         qrCode: qrCode,
//         scanTime: new Date().toISOString(),
//         direction: direction,
//         apiResponse: {
//           code: result?.code,
//           message: errorMessage,
//           data: result?.data
//         },
//         isError: true,
//         errorType: errorType,
//         errorMessage: errorMessage
//       }

//       sessionStorage.setItem('lastScanResult', JSON.stringify(scanData))
//       navigate(`/result/${encodeURIComponent(qrCode)}?direction=${direction}&error=true&errorType=${errorType}`)
//       isProcessingRef.current = false
//     } catch (error: any) {
//       const errorMessage = error?.response?.data?.message || error?.message || 'Lỗi khi quét QR'
//       toast.error(errorMessage)

//       const errorData = {
//         qrCode: qrCode,
//         scanTime: new Date().toISOString(),
//         direction: direction,
//         isError: true,
//         errorMessage: errorMessage
//       }
//       sessionStorage.setItem('lastScanResult', JSON.stringify(errorData))
//       navigate(`/result/${encodeURIComponent(qrCode)}?direction=${direction}&error=true`)
//       isProcessingRef.current = false
//     }
//   }

//   const handleVerifyPin = async () => {
//     if (!pendingQrCode) return
//     if (!pinCode || pinCode.length !== 4) {
//       setPinError('Vui lòng nhập mã PIN 4 số')
//       return
//     }

//     setPinLoading(true)
//     try {
//       const response = await QRCodeApi.scanVerifyPin(pendingQrCode, pinCode, {
//         scanMetadata: {
//           direction: direction,
//           gate: 'Cổng chính',
//           buildingId: pendingScanData?.buildingId || null
//         }
//       })

//       if (response?.data?.code === 'OK') {
//         toast.success('Xác thực PIN thành công!')

//         const newQrData = response.data.data?.qrData

//         if (newQrData) {
//           const updatedScanData = {
//             ...pendingScanData,
//             usedEntries: newQrData.usedEntries,
//             maxEntries: newQrData.maxEntries,
//             remainingEntries: newQrData.remainingEntries
//           }
//           sessionStorage.setItem('pendingScanData', JSON.stringify(updatedScanData))
//           sessionStorage.setItem('pendingQrCode', pendingQrCode)
//         } else {
//           sessionStorage.setItem('pendingScanData', JSON.stringify(pendingScanData))
//           sessionStorage.setItem('pendingQrCode', pendingQrCode)
//         }

//         setShowPinDialog(false)
//         navigate(`/result/${encodeURIComponent(pendingQrCode)}?direction=${direction}&pinVerified=true`)
//       } else {
//         setPinError(response?.data?.message || 'Mã PIN không đúng')
//         setPinCode('')
//       }
//     } catch (error: any) {
//       setPinError(error?.response?.data?.message || 'Lỗi xác thực PIN')
//       setPinCode('')
//     } finally {
//       setPinLoading(false)
//     }
//   }

//   const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0]
//     if (!file) return

//     setUploading(true)
//     const tempDiv = document.createElement('div')
//     tempDiv.id = 'temp-qr-reader'
//     tempDiv.style.display = 'none'
//     document.body.appendChild(tempDiv)

//     const html5QrCode = new Html5Qrcode('temp-qr-reader')

//     try {
//       const qrCode = await html5QrCode.scanFile(file, true)
//       await handleScanResult(qrCode)
//     } catch (err) {
//       toast.error('Không tìm thấy mã QR trong ảnh')
//     } finally {
//       setUploading(false)
//       await html5QrCode.clear()
//       document.body.removeChild(tempDiv)
//       if (fileInputRef.current) fileInputRef.current.value = ''
//     }
//   }

//   const handleManualInput = async (e: React.FormEvent) => {
//     e.preventDefault()
//     const form = e.target as HTMLFormElement
//     const input = form.qrCode as HTMLInputElement
//     if (input.value) {
//       await handleScanResult(input.value)
//     }
//   }

//   return (
//     <>
//       <style>{`
//         * {
//           box-sizing: border-box;
//         }

//         html, body, #root {
//           height: 100%;
//           margin: 0;
//           padding: 0;
//         }

//         .material-symbols-outlined {
//           font-variation-settings:
//             'FILL' 0,
//             'wght' 400,
//             'GRAD' 0,
//             'opsz' 24
//         }

//         #qr-reader {
//           border: none !important;
//           border-radius: 12px;
//           overflow: hidden;
//           width: 100%;
//           height: 100%;
//         }
//         #qr-reader video {
//           width: 100% !important;
//           height: 100% !important;
//           object-fit: cover !important;
//         }
//         #qr-reader__dashboard_section {
//           display: none !important;
//         }
//         #qr-reader__scan_region {
//           border-radius: 12px !important;
//         }

//         .scanner-overlay::after {
//           content: '';
//           position: absolute;
//           top: 50%;
//           left: 50%;
//           transform: translate(-50%, -50%);
//           width: 200px;
//           height: 200px;
//           border: 3px solid #000666;
//           border-radius: 12px;
//           box-shadow: inset 0 0 30px rgba(0, 6, 102, 0.15), 0 0 20px rgba(0, 6, 102, 0.2);
//           animation: scanPulse 2s ease-in-out infinite;
//         }

//         @keyframes scanPulse {
//           0%, 100% { box-shadow: inset 0 0 30px rgba(0, 6, 102, 0.15), 0 0 20px rgba(0, 6, 102, 0.2); }
//           50% { box-shadow: inset 0 0 50px rgba(0, 6, 102, 0.3), 0 0 40px rgba(0, 6, 102, 0.4); }
//         }

//         .card-glass {
//           background: white;
//           border: 1px solid rgba(0, 0, 0, 0.06);
//           box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
//         }

//         .btn-primary {
//           background: linear-gradient(135deg, #000666 0%, #1a237e 100%);
//           color: white;
//           border: none;
//           cursor: pointer;
//           font-weight: 600;
//           transition: all 0.2s ease;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           gap: 8px;
//         }

//         .btn-primary:hover:not(:disabled) {
//           transform: translateY(-1px);
//           box-shadow: 0 6px 20px rgba(0, 6, 102, 0.25);
//         }

//         .btn-primary:active:not(:disabled) {
//           transform: translateY(0);
//         }

//         .btn-primary:disabled {
//           opacity: 0.5;
//           cursor: not-allowed;
//         }

//         .btn-danger {
//           background: #dc2626;
//           color: white;
//           border: none;
//           cursor: pointer;
//           font-weight: 600;
//           transition: all 0.2s ease;
//         }

//         .btn-danger:hover {
//           background: #b91c1c;
//         }

//         .btn-secondary {
//           background: #e5e7eb;
//           color: #374151;
//           border: none;
//           cursor: pointer;
//           font-weight: 600;
//           transition: all 0.2s ease;
//         }

//         .btn-secondary:hover {
//           background: #d1d5db;
//         }

//         .btn-in {
//           background: #10b981;
//           color: white;
//         }

//         .btn-in-active {
//           background: #047857;
//           box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
//         }

//         .btn-out {
//           background: #f97316;
//           color: white;
//         }

//         .btn-out-active {
//           background: #c2410c;
//           box-shadow: 0 4px 12px rgba(234, 88, 12, 0.3);
//         }

//         .tab-active {
//           background: linear-gradient(135deg, #000666 0%, #1a237e 100%);
//           color: white;
//           box-shadow: 0 2px 8px rgba(0, 6, 102, 0.15);
//         }

//         .tab-inactive {
//           background: white;
//           color: #6b7280;
//           border: 1px solid #e5e7eb;
//         }

//         .pin-display {
//           display: grid;
//           grid-template-columns: repeat(4, 56px);
//           gap: 8px;
//           justify-content: center;
//         }

//         .pin-box {
//           width: 56px;
//           height: 56px;
//           border-radius: 8px;
//           border: 2px solid #e5e7eb;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           font-size: 24px;
//           font-weight: bold;
//           transition: all 0.2s ease;
//           background: white;
//           color: #9ca3af;
//         }

//         .pin-box.filled {
//           border-color: #000666;
//           background: #f0f4ff;
//           color: #000666;
//         }

//         .pin-pad {
//           display: grid;
//           grid-template-columns: repeat(3, 1fr);
//           gap: 8px;
//         }

//         .pin-btn {
//           padding: 12px;
//           border-radius: 8px;
//           border: none;
//           background: #f3f4f6;
//           color: #374151;
//           cursor: pointer;
//           font-weight: 600;
//           transition: all 0.2s ease;
//           font-size: 16px;
//         }

//         .pin-btn:hover {
//           background: #e5e7eb;
//         }

//         .pin-btn:active {
//           transform: scale(0.95);
//         }

//         .scrollbar-hide::-webkit-scrollbar {
//           display: none;
//         }
//         .scrollbar-hide {
//           -ms-overflow-style: none;
//           scrollbar-width: none;
//         }

//         .scrollbar-thin::-webkit-scrollbar {
//           width: 4px;
//         }
//         .scrollbar-thin::-webkit-scrollbar-track {
//           background: transparent;
//         }
//         .scrollbar-thin::-webkit-scrollbar-thumb {
//           background: #d1d5db;
//           border-radius: 2px;
//         }
//       `}</style>

//       <div className="bg-gradient-to-br from-slate-50 to-slate-100 text-gray-900 h-screen flex flex-col font-['Inter',sans-serif] overflow-hidden">
//         {/* Header - Compact */}
//         <header className='border-b border-gray-200 bg-white shrink-0'>
//           <div className='px-4 py-3 flex items-center justify-between'>
//             <div className='flex items-center gap-2'>
//               <span className='material-symbols-outlined text-2xl'>lock</span>
//               <span className='text-lg font-bold text-blue-900'>Homelink AI</span>
//             </div>
//             <div className='flex gap-2 justify-center'>
//               <button
//                 onClick={() => setDirection('IN')}
//                 className={`px-6 py-2 rounded-full font-semibold text-sm transition-all flex items-center gap-1.5 ${
//                   direction === 'IN' ? 'btn-primary btn-in-active' : 'btn-secondary'
//                 }`}
//               >
//                 <span className='material-symbols-outlined text-lg'>login</span>
//                 VÀO
//               </button>
//               <button
//                 onClick={() => setDirection('OUT')}
//                 className={`px-6 py-2 rounded-full font-semibold text-sm transition-all flex items-center gap-1.5 ${
//                   direction === 'OUT' ? 'btn-primary btn-out-active' : 'btn-secondary'
//                 }`}
//               >
//                 <span className='material-symbols-outlined text-lg'>logout</span>
//                 RA
//               </button>
//             </div>
//           </div>
//         </header>

//         {/* Main Content */}
//         <main className='flex-1 overflow-hidden px-4 py-4'>
//           <div className='h-full flex flex-col'>
//             {/* Direction & Tabs - Compact */}
//             <div className='mb-3 space-y-2'>
//               {/* Direction Buttons */}

//               {/* Tab Buttons */}
//               <div className='flex gap-2 justify-center'>
//                 <button
//                   onClick={() => setActiveTab('scan')}
//                   className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-1.5 ${
//                     activeTab === 'scan' ? 'tab-active' : 'tab-inactive'
//                   }`}
//                 >
//                   <span className='material-symbols-outlined'>qr_code_scanner</span>
//                   Quét QR
//                 </button>
//                 <button
//                   onClick={() => setActiveTab('upload')}
//                   className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-1.5 ${
//                     activeTab === 'upload' ? 'tab-active' : 'tab-inactive'
//                   }`}
//                 >
//                   <span className='material-symbols-outlined'>cloud_upload</span>
//                   Tải ảnh
//                 </button>
//                 <button
//                   onClick={() => setActiveTab('manual')}
//                   className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-1.5 ${
//                     activeTab === 'manual' ? 'tab-active' : 'tab-inactive'
//                   }`}
//                 >
//                   <span className='material-symbols-outlined'>keyboard</span>
//                   Nhập mã
//                 </button>
//               </div>
//             </div>

//             {/* Content Container */}
//             <div className='flex-1 overflow-hidden'>
//               {/* Scanner Tab */}
//               {activeTab === 'scan' && (
//                 <div className='h-full flex gap-4'>
//                   {/* Scanner Area - Left 60% */}
//                   <div className='flex-[2] flex flex-col gap-3'>
//                     {/* Camera Display */}
//                     {!cameraActive && !qrCodeRef.current && (
//                       <div className='card-glass rounded-lg overflow-hidden flex-1 flex items-center justify-center'>
//                         <div className='text-center'>
//                           <span className='material-symbols-outlined text-7xl text-gray-300 block mb-3'>
//                             videocam_off
//                           </span>
//                           <p className='font-semibold text-gray-700 mb-3'>Camera chưa được bật</p>
//                           <button onClick={startCamera} className='btn-primary px-6 py-2 rounded-lg text-sm'>
//                             <span className='material-symbols-outlined'>videocam</span>
//                             Bật camera
//                           </button>
//                         </div>
//                       </div>
//                     )}

//                     <div
//                       className={`card-glass rounded-lg overflow-hidden scanner-overlay flex-1 ${
//                         cameraActive ? 'block' : 'hidden'
//                       }`}
//                       style={{ display: cameraActive ? 'flex' : 'none' }}
//                     >
//                       <div id='qr-reader' className='w-full h-full'></div>
//                     </div>

//                     {/* Camera Controls */}
//                     {cameraActive && (
//                       <div className='flex gap-2'>
//                         <button
//                           onClick={stopCamera}
//                           className='flex-1 btn-danger px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-1.5'
//                         >
//                           <span className='material-symbols-outlined'>stop_circle</span>
//                           Dừng
//                         </button>
//                         <button onClick={startCamera} className='flex-1 btn-primary px-4 py-2 rounded-lg text-sm'>
//                           <span className='material-symbols-outlined'>refresh</span>
//                           Thử lại
//                         </button>
//                       </div>
//                     )}
//                   </div>

//                   {/* Info Panel - Right 40% */}
//                   <div className='flex-1 flex flex-col gap-3 overflow-y-auto scrollbar-thin pr-2'>
//                     {/* Instructions Card */}
//                     <div className='card-glass rounded-lg p-4 shrink-0'>
//                       <div className='flex items-center gap-2 mb-3 pb-3 border-b border-gray-200'>
//                         <span className='material-symbols-outlined text-xl text-yellow-500'>info</span>
//                         <h3 className='font-bold text-sm text-gray-900'>Hướng dẫn</h3>
//                       </div>
//                       <div className='space-y-3'>
//                         <div className='flex gap-2 text-xs'>
//                           <span className='font-bold text-blue-600 text-center w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center shrink-0'>
//                             1
//                           </span>
//                           <div>
//                             <p className='font-semibold text-gray-900'>Căn chỉnh khung hình</p>
//                             <p className='text-gray-600'>Đưa mã QR vào khung</p>
//                           </div>
//                         </div>
//                         <div className='flex gap-2 text-xs'>
//                           <span className='font-bold text-blue-600 text-center w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center shrink-0'>
//                             2
//                           </span>
//                           <div>
//                             <p className='font-semibold text-gray-900'>Quét tự động</p>
//                             <p className='text-gray-600'>Hệ thống sẽ quét</p>
//                           </div>
//                         </div>
//                         <div className='flex gap-2 text-xs'>
//                           <span className='font-bold text-blue-600 text-center w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center shrink-0'>
//                             3
//                           </span>
//                           <div>
//                             <p className='font-semibold text-gray-900'>Xem kết quả</p>
//                             <p className='text-gray-600'>Chuyển trang kết quả</p>
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Tips Card */}
//                     <div className='card-glass rounded-lg p-4 shrink-0'>
//                       <div className='flex items-center gap-2 mb-3'>
//                         <span className='material-symbols-outlined text-lg text-yellow-500'>lightbulb</span>
//                         <p className='font-bold text-xs text-gray-900'>Lưu ý</p>
//                       </div>
//                       <ul className='text-xs text-gray-600 space-y-2'>
//                         <li className='flex gap-2'>
//                           <span className='material-symbols-outlined text-sm text-green-600 shrink-0'>
//                             check_circle
//                           </span>
//                           <span>Ánh sáng đủ</span>
//                         </li>
//                         <li className='flex gap-2'>
//                           <span className='material-symbols-outlined text-sm text-green-600 shrink-0'>
//                             check_circle
//                           </span>
//                           <span>Mã QR rõ ràng</span>
//                         </li>
//                         <li className='flex gap-2'>
//                           <span className='material-symbols-outlined text-sm text-green-600 shrink-0'>
//                             check_circle
//                           </span>
//                           <span>Cách camera 15-30cm</span>
//                         </li>
//                       </ul>
//                     </div>

//                     {cameraActive && (
//                       <div className='card-glass rounded-lg p-3 shrink-0 bg-blue-50 border border-blue-200'>
//                         <p className='text-xs text-blue-900 flex gap-2'>
//                           <span className='material-symbols-outlined text-sm'>auto_awesome</span>
//                           <span>Camera đang hoạt động</span>
//                         </p>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}

//               {/* Upload Tab */}
//               {activeTab === 'upload' && (
//                 <div className='h-full flex items-center justify-center'>
//                   <div className='w-full max-w-md card-glass rounded-lg p-8 border-2 border-dashed border-blue-300'>
//                     <label className='block cursor-pointer'>
//                       <div className='flex flex-col items-center justify-center space-y-4'>
//                         <span className='material-symbols-outlined text-7xl text-blue-500'>image</span>
//                         <div className='text-center'>
//                           <p className='font-bold text-gray-900 text-sm mb-1'>Tải ảnh QR Code</p>
//                           <p className='text-xs text-gray-600 mb-3'>Chọn ảnh từ máy tính</p>
//                           <div className='flex flex-wrap gap-1 justify-center text-xs'>
//                             {['PNG', 'JPG', 'JPEG', 'WebP'].map((fmt) => (
//                               <span key={fmt} className='px-2 py-0.5 bg-gray-100 text-gray-700 rounded'>
//                                 {fmt}
//                               </span>
//                             ))}
//                           </div>
//                         </div>
//                         <button
//                           type='button'
//                           onClick={() => fileInputRef.current?.click()}
//                           className='btn-primary px-6 py-2 rounded-lg text-sm'
//                           disabled={uploading}
//                         >
//                           <span className='material-symbols-outlined'>upload_file</span>
//                           {uploading ? 'Đang quét...' : 'Chọn ảnh'}
//                         </button>
//                       </div>
//                       <input
//                         ref={fileInputRef}
//                         type='file'
//                         accept='image/*'
//                         onChange={handleFileUpload}
//                         className='hidden'
//                         disabled={uploading}
//                       />
//                     </label>
//                   </div>
//                 </div>
//               )}

//               {/* Manual Entry Tab */}
//               {activeTab === 'manual' && (
//                 <div className='h-full flex items-center justify-center'>
//                   <div className='w-full max-w-sm card-glass rounded-lg p-8'>
//                     <div className='text-center mb-6'>
//                       <span className='material-symbols-outlined text-6xl text-blue-900 block mb-3'>keyboard</span>
//                       <h2 className='font-bold text-gray-900 text-sm'>Nhập mã thủ công</h2>
//                       <p className='text-xs text-gray-600 mt-1'>Sử dụng mã in dưới QR</p>
//                     </div>
//                     <form onSubmit={handleManualInput} className='space-y-3'>
//                       <input
//                         name='qrCode'
//                         type='text'
//                         placeholder='HL-XXXX-XXXX'
//                         className='w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-900 font-mono'
//                       />
//                       <button type='submit' className='w-full btn-primary py-2 rounded-lg text-sm'>
//                         <span className='material-symbols-outlined'>check_circle</span>
//                         Kiểm tra
//                       </button>
//                     </form>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </main>
//       </div>

//       {/* PIN Dialog */}
//       {showPinDialog && (
//         <div className='fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4'>
//           <div className='bg-white rounded-xl max-w-sm w-full overflow-hidden shadow-2xl'>
//             {/* Header */}
//             <div className='bg-gradient-to-r from-blue-900 to-indigo-900 p-4 text-white'>
//               <div className='flex items-center gap-3'>
//                 <span className='material-symbols-outlined text-3xl'>lock</span>
//                 <div>
//                   <h2 className='font-bold text-sm'>Xác thực mã PIN</h2>
//                   <p className='text-blue-100 text-xs mt-0.5'>
//                     {pendingScanData?.qrType === 'guest'
//                       ? `Khách: ${pendingScanData?.visitorName}`
//                       : `Cư dân: ${pendingScanData?.userName}`}
//                     {' - Căn '} {pendingScanData?.apartmentCode}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Content */}
//             <div className='p-6 space-y-4'>
//               <p className='text-xs text-gray-700'>Nhập mã PIN 4 số:</p>

//               {/* PIN Display */}
//               <div className='pin-display'>
//                 {[...Array(4)].map((_, idx) => (
//                   <div key={idx} className={`pin-box ${pinCode[idx] ? 'filled' : ''}`}>
//                     {pinCode[idx] ? '●' : ''}
//                   </div>
//                 ))}
//               </div>

//               {/* PIN Pad */}
//               <div className='pin-pad'>
//                 {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
//                   <button
//                     key={num}
//                     onClick={() => setPinCode((prev) => (prev.length < 4 ? prev + num : prev))}
//                     className='pin-btn text-sm'
//                   >
//                     {num}
//                   </button>
//                 ))}
//                 <button onClick={() => setPinCode((prev) => prev.slice(0, -1))} className='pin-btn text-sm'>
//                   <span className='material-symbols-outlined text-lg'>backspace</span>
//                 </button>
//                 <button
//                   onClick={() => setPinCode((prev) => (prev.length < 4 ? prev + '0' : prev))}
//                   className='pin-btn text-sm'
//                 >
//                   0
//                 </button>
//                 <button onClick={() => setPinCode('')} className='pin-btn text-sm text-red-600'>
//                   Xóa
//                 </button>
//               </div>

//               {pinError && (
//                 <div className='p-2.5 bg-red-50 rounded-lg text-red-700 text-xs text-center border border-red-200 flex items-center justify-center gap-1'>
//                   <span className='material-symbols-outlined text-sm'>error</span>
//                   {pinError}
//                 </div>
//               )}

//               {/* Buttons */}
//               <div className='flex gap-2 pt-2'>
//                 <button
//                   onClick={() => {
//                     setShowPinDialog(false)
//                     setPendingQrCode(null)
//                     setPinCode('')
//                     setPinError('')
//                     hasScannedRef.current = false
//                     startCamera()
//                   }}
//                   className='flex-1 btn-secondary px-3 py-2 rounded-lg text-xs font-semibold'
//                 >
//                   Hủy
//                 </button>
//                 <button
//                   onClick={handleVerifyPin}
//                   disabled={pinLoading || pinCode.length !== 4}
//                   className='flex-1 btn-primary px-3 py-2 rounded-lg text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1'
//                 >
//                   <span className='material-symbols-outlined'>{pinLoading ? 'hourglass_empty' : 'check_circle'}</span>
//                   {pinLoading ? 'Xác thực...' : 'Xác nhận'}
//                 </button>
//               </div>

//               <p className='text-center text-gray-500 text-xs'>* Mã PIN là mã bí mật</p>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   )
// }

import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'
import { toast } from 'react-toastify'
import { QRCodeApi } from 'src/apis/QrcodeApi/Qr.api'

export default function ScanQrPage() {
  const navigate = useNavigate()
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState<'scan' | 'upload' | 'manual'>('scan')
  const [cameraActive, setCameraActive] = useState(false)
  const [direction, setDirection] = useState<'IN' | 'OUT'>('IN')
  const [showPinDialog, setShowPinDialog] = useState(false)
  const [pendingQrCode, setPendingQrCode] = useState<string | null>(null)
  const [pendingScanData, setPendingScanData] = useState<any>(null)
  const [pinCode, setPinCode] = useState('')
  const [pinError, setPinError] = useState('')
  const [pinLoading, setPinLoading] = useState(false)

  const qrCodeRef = useRef<Html5Qrcode | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const hasScannedRef = useRef(false)
  const isProcessingRef = useRef(false)

  useEffect(() => {
    if (activeTab === 'scan') {
      startCamera()
    } else {
      stopCamera()
    }

    return () => {
      stopCamera()
    }
  }, [activeTab])

  const startCamera = async () => {
    const element = document.getElementById('qr-reader')
    if (!element) {
      setTimeout(() => startCamera(), 200)
      return
    }

    if (qrCodeRef.current) return

    try {
      element.innerHTML = ''
      const html5QrCode = new Html5Qrcode('qr-reader')
      qrCodeRef.current = html5QrCode
      hasScannedRef.current = false

      const onScanSuccess = async (decodedText: string) => {
        if (!hasScannedRef.current) {
          hasScannedRef.current = true
          await handleScanResult(decodedText)
        }
      }

      const onScanError = (errorMessage: string) => {
        if (errorMessage.includes('IndexSizeError') || errorMessage.includes('source width is 0')) {
          return
        }
      }

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: function (viewfinderWidth, viewfinderHeight) {
            const minSize = Math.min(viewfinderWidth, viewfinderHeight)
            const qrboxSize = Math.min(Math.floor(minSize * 0.7), 400)
            return { width: qrboxSize, height: qrboxSize }
          },
          aspectRatio: 1.0
        },
        onScanSuccess,
        onScanError
      )

      setCameraActive(true)
    } catch (err: any) {
      if (err?.message?.includes('NotAllowedError')) {
        toast.error('Vui lòng cấp quyền truy cập camera')
      } else if (err?.message?.includes('NotFoundError')) {
        toast.error('Không tìm thấy camera')
      } else {
        toast.error('Không thể khởi tạo camera')
      }
    }
  }

  const stopCamera = async () => {
    if (qrCodeRef.current) {
      try {
        await qrCodeRef.current.stop()
        await qrCodeRef.current.clear()
        qrCodeRef.current = null
        setCameraActive(false)
      } catch (err) {
        // Silent error
      }
    }
  }

  const handleScanResult = async (qrCode: string) => {
    if (isProcessingRef.current) return
    isProcessingRef.current = true

    try {
      await stopCamera()

      let response
      if (qrCode.startsWith('GUEST_')) {
        response = await QRCodeApi.scanGuestQr(qrCode, {
          direction: direction,
          gate: 'Cổng chính'
        })
      } else {
        response = await QRCodeApi.scanPersonalQr(qrCode, {
          direction: direction,
          gate: 'Cổng chính'
        })
      }

      const result = response?.data

      if (result?.code === 'REQUIRE_PIN') {
        setPendingQrCode(qrCode)
        setPendingScanData(result.data)
        setShowPinDialog(true)
        setPinCode('')
        setPinError('')
        isProcessingRef.current = false
        return
      }

      const isOutOfEntries =
        result?.data?.qrType === 'guest' &&
        result?.data?.usedEntries !== undefined &&
        result?.data?.maxEntries !== undefined &&
        result?.data?.usedEntries >= result?.data?.maxEntries &&
        result?.data?.maxEntries > 0

      if (result?.code === 'OK') {
        if (isOutOfEntries) {
          toast.warning(`Đã quét thành công! Đây là lượt cuối cùng.`)
          sessionStorage.setItem(
            'qrOutOfEntries',
            JSON.stringify({
              qrCode: qrCode,
              isOutOfEntries: true,
              usedEntries: result.data.usedEntries,
              maxEntries: result.data.maxEntries
            })
          )
        } else {
          toast.success(`Đã quét thành công! Hướng: ${direction === 'IN' ? 'VÀO' : 'RA'}`)
        }
        navigate(`/result/${encodeURIComponent(qrCode)}?direction=${direction}`)
        isProcessingRef.current = false
        return
      }

      const errorMessage = result?.message || ''
      let errorType = 'unknown'

      if (errorMessage.includes('hết hạn') || result?.data?.status === 'EXPIRED') {
        errorType = 'expired'
        toast.error('QR đã hết hạn!')
      } else if (errorMessage.includes('thu hồi') || result?.data?.status === 'REVOKED') {
        errorType = 'revoked'
        toast.error('QR đã bị thu hồi!')
      } else if (errorMessage.includes('hết số lần')) {
        errorType = 'out_of_entries'
        toast.error('QR đã hết lượt sử dụng!')
      } else if (errorMessage) {
        toast.error(errorMessage)
      } else {
        toast.error('QR không hợp lệ')
      }

      const scanData = {
        qrCode: qrCode,
        scanTime: new Date().toISOString(),
        direction: direction,
        apiResponse: {
          code: result?.code,
          message: errorMessage,
          data: result?.data
        },
        isError: true,
        errorType: errorType,
        errorMessage: errorMessage
      }

      sessionStorage.setItem('lastScanResult', JSON.stringify(scanData))
      navigate(`/result/${encodeURIComponent(qrCode)}?direction=${direction}&error=true&errorType=${errorType}`)
      isProcessingRef.current = false
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Lỗi khi quét QR'
      toast.error(errorMessage)

      const errorData = {
        qrCode: qrCode,
        scanTime: new Date().toISOString(),
        direction: direction,
        isError: true,
        errorMessage: errorMessage
      }
      sessionStorage.setItem('lastScanResult', JSON.stringify(errorData))
      navigate(`/result/${encodeURIComponent(qrCode)}?direction=${direction}&error=true`)
      isProcessingRef.current = false
    }
  }

  const handleVerifyPin = async () => {
    if (!pendingQrCode) return
    if (!pinCode || pinCode.length !== 4) {
      setPinError('Vui lòng nhập mã PIN 4 số')
      return
    }

    setPinLoading(true)
    try {
      const response = await QRCodeApi.scanVerifyPin(pendingQrCode, pinCode, {
        scanMetadata: {
          direction: direction,
          gate: 'Cổng chính',
          buildingId: pendingScanData?.buildingId || null
        }
      })

      if (response?.data?.code === 'OK') {
        toast.success('Xác thực PIN thành công!')

        const newQrData = response.data.data?.qrData

        if (newQrData) {
          const updatedScanData = {
            ...pendingScanData,
            usedEntries: newQrData.usedEntries,
            maxEntries: newQrData.maxEntries,
            remainingEntries: newQrData.remainingEntries
          }
          sessionStorage.setItem('pendingScanData', JSON.stringify(updatedScanData))
          sessionStorage.setItem('pendingQrCode', pendingQrCode)
        } else {
          sessionStorage.setItem('pendingScanData', JSON.stringify(pendingScanData))
          sessionStorage.setItem('pendingQrCode', pendingQrCode)
        }

        setShowPinDialog(false)
        navigate(`/result/${encodeURIComponent(pendingQrCode)}?direction=${direction}&pinVerified=true`)
      } else {
        setPinError(response?.data?.message || 'Mã PIN không đúng')
        setPinCode('')
      }
    } catch (error: any) {
      setPinError(error?.response?.data?.message || 'Lỗi xác thực PIN')
      setPinCode('')
    } finally {
      setPinLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const tempDiv = document.createElement('div')
    tempDiv.id = 'temp-qr-reader'
    tempDiv.style.display = 'none'
    document.body.appendChild(tempDiv)

    const html5QrCode = new Html5Qrcode('temp-qr-reader')

    try {
      const qrCode = await html5QrCode.scanFile(file, true)
      await handleScanResult(qrCode)
    } catch (err) {
      toast.error('Không tìm thấy mã QR trong ảnh')
    } finally {
      setUploading(false)
      await html5QrCode.clear()
      document.body.removeChild(tempDiv)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleManualInput = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const input = form.qrCode as HTMLInputElement
    if (input.value) {
      await handleScanResult(input.value)
    }
  }

  // Thay thế phần return của component ScanQrPage
  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        html, body, #root { height: 100%; margin: 0; padding: 0; }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        #qr-reader {
          border: none !important;
          border-radius: 24px;
          overflow: hidden;
          width: 100%;
          height: 100%;
        }
        #qr-reader video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
        }
        #qr-reader__dashboard_section {
          display: none !important;
        }
        #qr-reader__scan_region {
          border-radius: 24px !important;
        }
        .scanner-overlay::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 280px;
          height: 280px;
          border: 3px solid #3b82f6;
          border-radius: 28px;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3), inset 0 0 0 3px rgba(59, 130, 246, 0.2);
          animation: scanPulse 2s ease-in-out infinite;
        }
        @keyframes scanPulse {
          0%, 100% { 
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3), inset 0 0 0 3px rgba(59, 130, 246, 0.2);
          }
          50% { 
            box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.5), inset 0 0 0 6px rgba(59, 130, 246, 0.3);
          }
        }
        .card-glass {
          background: white;
          border-radius: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(0, 0, 0, 0.05);
        }
        .btn-primary {
          background: #3b82f6;
          color: white;
          border: none;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .btn-primary:hover:not(:disabled) {
          background: #2563eb;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        .btn-primary:active:not(:disabled) { transform: translateY(0); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-danger {
          background: #ef4444;
          color: white;
          border: none;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }
        .btn-danger:hover { background: #dc2626; }
        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
          border: none;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }
        .btn-secondary:hover { background: #e5e7eb; }
        .tab-active {
          background: #3b82f6;
          color: white;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }
        .tab-inactive {
          background: #f3f4f6;
          color: #6b7280;
          border: none;
        }
        .pin-display {
          display: grid;
          grid-template-columns: repeat(4, 56px);
          gap: 8px;
          justify-content: center;
        }
        .pin-box {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          border: 2px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: bold;
          transition: all 0.2s ease;
          background: white;
          color: #9ca3af;
        }
        .pin-box.filled {
          border-color: #3b82f6;
          background: #eff6ff;
          color: #3b82f6;
        }
        .pin-pad {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        .pin-btn {
          padding: 14px;
          border-radius: 12px;
          border: none;
          background: #f3f4f6;
          color: #374151;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
          font-size: 18px;
        }
        .pin-btn:hover { background: #e5e7eb; }
        .pin-btn:active { transform: scale(0.96); }
      `}</style>

      <div className='bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen flex flex-col'>
        {/* Header */}
        <header className='bg-white border-b border-gray-200 sticky top-0 z-10 shrink-0'>
          <div className='px-4 py-3 flex items-center justify-between max-w-7xl mx-auto'>
            <div className='flex items-center gap-2'>
              <div className='w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center'>
                <span className='material-symbols-outlined text-white text-sm'>lock</span>
              </div>
              <span className='font-bold text-gray-800'>Homelink AI</span>
            </div>
            <div className='flex items-center gap-2'>
              <button
                onClick={() => setDirection('IN')}
                className={`px-5 py-1.5 rounded-full font-semibold text-sm transition-all flex items-center gap-1.5 ${
                  direction === 'IN'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className='material-symbols-outlined text-base'>login</span>
                VÀO
              </button>
              <button
                onClick={() => setDirection('OUT')}
                className={`px-5 py-1.5 rounded-full font-semibold text-sm transition-all flex items-center gap-1.5 ${
                  direction === 'OUT'
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className='material-symbols-outlined text-base'>logout</span>
                RA
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className='flex-1 flex items-center justify-center p-4'>
          <div className='w-full max-w-6xl'>
            {/* Tabs */}
            <div className='flex gap-3 justify-center mb-6'>
              <button
                onClick={() => setActiveTab('scan')}
                className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
                  activeTab === 'scan' ? 'tab-active' : 'tab-inactive'
                }`}
              >
                <span className='material-symbols-outlined text-base'>qr_code_scanner</span>
                Quét QR
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
                  activeTab === 'upload' ? 'tab-active' : 'tab-inactive'
                }`}
              >
                <span className='material-symbols-outlined text-base'>cloud_upload</span>
                Tải ảnh
              </button>
              <button
                onClick={() => setActiveTab('manual')}
                className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
                  activeTab === 'manual' ? 'tab-active' : 'tab-inactive'
                }`}
              >
                <span className='material-symbols-outlined text-base'>keyboard</span>
                Nhập mã
              </button>
            </div>

            {/* Scanner Area */}
            {activeTab === 'scan' && (
              <div className='grid grid-cols-1 lg:grid-cols-12 gap-5'>
                <div className='lg:col-span-8 space-y-3'>
                  {!cameraActive && !qrCodeRef.current && (
                    <div className='card-glass h-[500px] flex items-center justify-center bg-gray-50'>
                      <div className='text-center p-6'>
                        <span className='material-symbols-outlined text-6xl text-gray-300 block mb-4'>
                          videocam_off
                        </span>
                        <p className='font-semibold text-gray-600 mb-4'>Camera chưa được bật</p>
                        <button onClick={startCamera} className='btn-primary px-6 py-2.5 rounded-xl text-sm'>
                          <span className='material-symbols-outlined text-base'>videocam</span>
                          Bật camera
                        </button>
                      </div>
                    </div>
                  )}
                  <div className={`card-glass h-[500px] overflow-hidden relative ${cameraActive ? 'block' : 'hidden'}`}>
                    <div id='qr-reader' className='w-full h-full'></div>
                    {cameraActive && <div className='scanner-overlay absolute inset-0 pointer-events-none'></div>}
                  </div>
                  {cameraActive && (
                    <div className='flex gap-3'>
                      <button
                        onClick={stopCamera}
                        className='flex-1 btn-danger px-4 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2'
                      >
                        <span className='material-symbols-outlined text-base'>stop_circle</span>
                        Dừng camera
                      </button>
                      <button onClick={startCamera} className='flex-1 btn-primary px-4 py-2.5 rounded-xl text-sm'>
                        <span className='material-symbols-outlined text-base'>refresh</span>
                        Thử lại
                      </button>
                    </div>
                  )}
                </div>
                <div className='lg:col-span-4 flex flex-col gap-4'>
                  <div className='card-glass p-5'>
                    <div className='flex items-center gap-2 mb-4 pb-3 border-b border-gray-100'>
                      <span className='material-symbols-outlined text-xl text-blue-500'>info</span>
                      <h3 className='font-bold text-gray-800'>Hướng dẫn quét</h3>
                    </div>
                    <div className='space-y-4'>
                      {[
                        { step: '01', title: 'Căn chỉnh khung hình', desc: 'Đưa mã QR vào vùng quét' },
                        { step: '02', title: 'Quét tự động', desc: 'Hệ thống sẽ tự động nhận diện' },
                        { step: '03', title: 'Xem kết quả', desc: 'Chuyển đến trang kết quả chi tiết' }
                      ].map((item, i) => (
                        <div key={i} className='flex gap-3'>
                          <div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0'>
                            <span className='font-bold text-blue-600 text-sm'>{item.step}</span>
                          </div>
                          <div>
                            <p className='font-semibold text-gray-800 text-sm'>{item.title}</p>
                            <p className='text-gray-500 text-xs'>{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className='card-glass p-4'>
                    <div className='flex items-center gap-2 mb-3'>
                      <span className='material-symbols-outlined text-base text-amber-500'>lightbulb</span>
                      <p className='font-semibold text-gray-800 text-sm'>Mẹo quét nhanh</p>
                    </div>
                    <ul className='space-y-2'>
                      {['Đảm bảo đủ ánh sáng', 'Mã QR không bị mờ', 'Cách camera 15-30cm'].map((tip, i) => (
                        <li key={i} className='flex items-center gap-2 text-xs text-gray-600'>
                          <span className='material-symbols-outlined text-sm text-blue-500'>check_circle</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {cameraActive && (
                    <div className='bg-blue-50 rounded-xl p-3 border border-blue-200'>
                      <p className='text-xs text-blue-700 flex items-center gap-2'>
                        <span className='material-symbols-outlined text-sm'>auto_awesome</span>
                        <span className='font-medium'>Camera đang hoạt động - Sẵn sàng quét</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Upload Tab */}
            {activeTab === 'upload' && (
              <div className='flex items-center justify-center'>
                <div className='card-glass max-w-md w-full p-8 text-center border-2 border-dashed border-blue-300'>
                  <span className='material-symbols-outlined text-7xl text-blue-500 mb-4'>image</span>
                  <p className='font-semibold text-gray-800 mb-2'>Tải ảnh QR Code</p>
                  <p className='text-sm text-gray-500 mb-4'>Chọn ảnh từ máy tính</p>
                  <div className='flex flex-wrap gap-2 justify-center mb-6'>
                    {['PNG', 'JPG', 'JPEG', 'WebP'].map((fmt) => (
                      <span key={fmt} className='px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs'>
                        {fmt}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className='btn-primary px-6 py-2.5 rounded-xl text-sm mx-auto'
                    disabled={uploading}
                  >
                    <span className='material-symbols-outlined text-base'>upload_file</span>
                    {uploading ? 'Đang quét...' : 'Chọn ảnh'}
                  </button>
                  <input
                    ref={fileInputRef}
                    type='file'
                    accept='image/*'
                    onChange={handleFileUpload}
                    className='hidden'
                    disabled={uploading}
                  />
                </div>
              </div>
            )}

            {/* Manual Tab */}
            {activeTab === 'manual' && (
              <div className='flex items-center justify-center'>
                <div className='card-glass max-w-sm w-full p-8'>
                  <div className='text-center mb-6'>
                    <span className='material-symbols-outlined text-6xl text-blue-500 mb-3'>keyboard</span>
                    <h3 className='font-bold text-gray-800'>Nhập mã thủ công</h3>
                    <p className='text-sm text-gray-500'>Sử dụng mã in dưới QR</p>
                  </div>
                  <form onSubmit={handleManualInput} className='space-y-4'>
                    <input
                      name='qrCode'
                      type='text'
                      placeholder='HL-XXXX-XXXX'
                      className='w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    />
                    <button type='submit' className='w-full btn-primary py-3 rounded-xl text-sm'>
                      <span className='material-symbols-outlined text-base'>check_circle</span>
                      Kiểm tra
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* PIN Dialog */}
        {showPinDialog && (
          <div className='fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4'>
            <div className='bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl'>
              <div className='bg-gradient-to-r from-blue-600 to-blue-500 p-5 text-white'>
                <div className='flex items-center gap-3'>
                  <span className='material-symbols-outlined text-3xl'>lock</span>
                  <div>
                    <h2 className='font-bold text-base'>Xác thực mã PIN</h2>
                    <p className='text-blue-100 text-xs mt-0.5'>
                      {pendingScanData?.qrType === 'guest'
                        ? `Khách: ${pendingScanData?.visitorName}`
                        : `Cư dân: ${pendingScanData?.userName}`}
                      {' - Căn '}
                      {pendingScanData?.apartmentCode}
                    </p>
                  </div>
                </div>
              </div>
              <div className='p-6 space-y-5'>
                <p className='text-sm text-gray-700'>Nhập mã PIN 4 số:</p>
                <div className='pin-display'>
                  {[...Array(4)].map((_, idx) => (
                    <div key={idx} className={`pin-box ${pinCode[idx] ? 'filled' : ''}`}>
                      {pinCode[idx] ? '●' : ''}
                    </div>
                  ))}
                </div>
                <div className='pin-pad'>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                      key={num}
                      onClick={() => setPinCode((prev) => (prev.length < 4 ? prev + num : prev))}
                      className='pin-btn'
                    >
                      {num}
                    </button>
                  ))}
                  <button onClick={() => setPinCode((prev) => prev.slice(0, -1))} className='pin-btn'>
                    <span className='material-symbols-outlined text-xl'>backspace</span>
                  </button>
                  <button
                    onClick={() => setPinCode((prev) => (prev.length < 4 ? prev + '0' : prev))}
                    className='pin-btn'
                  >
                    0
                  </button>
                  <button onClick={() => setPinCode('')} className='pin-btn text-red-500'>
                    Xóa
                  </button>
                </div>
                {pinError && (
                  <div className='p-3 bg-red-50 rounded-xl text-red-600 text-xs flex items-center justify-center gap-2'>
                    <span className='material-symbols-outlined text-sm'>error</span>
                    {pinError}
                  </div>
                )}
                <div className='flex gap-3 pt-2'>
                  <button
                    onClick={() => {
                      setShowPinDialog(false)
                      setPendingQrCode(null)
                      setPinCode('')
                      setPinError('')
                      hasScannedRef.current = false
                      startCamera()
                    }}
                    className='flex-1 btn-secondary py-2.5 rounded-xl text-sm font-semibold'
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleVerifyPin}
                    disabled={pinLoading || pinCode.length !== 4}
                    className='flex-1 btn-primary py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50'
                  >
                    <span className='material-symbols-outlined text-base'>
                      {pinLoading ? 'hourglass_empty' : 'check_circle'}
                    </span>
                    {pinLoading ? 'Xác thực...' : 'Xác nhận'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
