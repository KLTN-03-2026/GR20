// import React, { useState, useRef, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { Html5Qrcode } from 'html5-qrcode'
// import { toast } from 'react-toastify'

// export default function ScanQrPage() {
//   const navigate = useNavigate()
//   const [uploading, setUploading] = useState(false)
//   const [activeTab, setActiveTab] = useState<'scan' | 'upload' | 'manual'>('scan')
//   const [cameraActive, setCameraActive] = useState(false)
//   const qrCodeRef = useRef<Html5Qrcode | null>(null)
//   const fileInputRef = useRef<HTMLInputElement>(null)
//   const hasScannedRef = useRef(false)

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

//       const onScanSuccess = (decodedText: string) => {
//         if (!hasScannedRef.current) {
//           hasScannedRef.current = true
//           toast.success('Đã quét mã QR thành công!')
//           stopCamera()
//           navigate(`/result/${encodeURIComponent(decodedText)}`)
//         }
//       }

//       const onScanError = (errorMessage: string) => {
//         // Bỏ qua lỗi IndexSizeError
//         if (errorMessage.includes('IndexSizeError') || errorMessage.includes('source width is 0')) {
//           return
//         }
//         console.warn(errorMessage)
//       }

//       await html5QrCode.start(
//         { facingMode: 'environment' },
//         { fps: 10, qrbox: { width: 600, height: 500 }, aspectRatio: 1.0 },
//         onScanSuccess,
//         onScanError
//       )

//       setCameraActive(true)
//     } catch (err: any) {
//       console.error('Camera error:', err)
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
//         console.log('Camera stopped')
//       } catch (err) {
//         console.warn('Error stopping camera:', err)
//       }
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
//       const result = await html5QrCode.scanFile(file, true)
//       toast.success('Đọc mã QR từ ảnh thành công!')
//       navigate(`/result/${encodeURIComponent(result)}`)
//     } catch (err) {
//       toast.error('Không tìm thấy mã QR trong ảnh')
//     } finally {
//       setUploading(false)
//       await html5QrCode.clear()
//       document.body.removeChild(tempDiv)
//       if (fileInputRef.current) fileInputRef.current.value = ''
//     }
//   }

//   const handleManualInput = (e: React.FormEvent) => {
//     e.preventDefault()
//     const form = e.target as HTMLFormElement
//     const input = form.qrCode as HTMLInputElement
//     if (input.value) {
//       navigate(`/result/${encodeURIComponent(input.value)}`)
//     }
//   }

//   return (
//     <div className="bg-surface text-on-surface min-h-screen font-['Manrope',sans-serif]">
//       <div className='flex flex-col min-h-screen w-full'>
//         <main className='flex-1 flex flex-col min-w-0 bg-surface'>
//           <div className='flex-1 overflow-y-auto p-6 md:p-8 space-y-6 md:space-y-8 max-w-[1440px] mx-auto w-full'>
//             {/* Tab Navigation */}
//             <div className='flex gap-2 md:gap-3 border-b border-outline-variant/20 pb-4'>
//               <button
//                 onClick={() => setActiveTab('scan')}
//                 className={`px-3 md:px-4 py-2 font-semibold transition-all border-b-2 ${
//                   activeTab === 'scan'
//                     ? 'text-primary border-primary'
//                     : 'text-on-surface-variant border-transparent hover:text-on-surface'
//                 }`}
//               >
//                 <span className='inline-flex items-center gap-1 md:gap-2'>
//                   <span className='material-symbols-outlined text-base md:text-lg'>qr_code_scanner</span>
//                   <span className='text-sm md:text-base'>Quét QR</span>
//                 </span>
//               </button>
//               <button
//                 onClick={() => setActiveTab('upload')}
//                 className={`px-3 md:px-4 py-2 font-semibold transition-all border-b-2 ${
//                   activeTab === 'upload'
//                     ? 'text-primary border-primary'
//                     : 'text-on-surface-variant border-transparent hover:text-on-surface'
//                 }`}
//               >
//                 <span className='inline-flex items-center gap-1 md:gap-2'>
//                   <span className='material-symbols-outlined text-base md:text-lg'>cloud_upload</span>
//                   <span className='text-sm md:text-base'>Tải ảnh</span>
//                 </span>
//               </button>
//               <button
//                 onClick={() => setActiveTab('manual')}
//                 className={`px-3 md:px-4 py-2 font-semibold transition-all border-b-2 ${
//                   activeTab === 'manual'
//                     ? 'text-primary border-primary'
//                     : 'text-on-surface-variant border-transparent hover:text-on-surface'
//                 }`}
//               >
//                 <span className='inline-flex items-center gap-1 md:gap-2'>
//                   <span className='material-symbols-outlined text-base md:text-lg'>keyboard</span>
//                   <span className='text-sm md:text-base'>Nhập mã</span>
//                 </span>
//               </button>
//             </div>

//             {/* Camera Scanner */}
//             {activeTab === 'scan' && (
//               <div>
//                 {/* Nút điều khiển camera */}
//                 {cameraActive && (
//                   <div className='flex gap-3 mb-4 justify-end'>
//                     <button
//                       onClick={stopCamera}
//                       className='px-4 py-2 bg-red-500 text-white rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-red-600 transition-all'
//                     >
//                       <span className='material-symbols-outlined text-base'>videocam_off</span>
//                       Dừng camera
//                     </button>
//                     <button
//                       onClick={startCamera}
//                       className='px-4 py-2 bg-primary text-white rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-all'
//                     >
//                       <span className='material-symbols-outlined text-base'>refresh</span>
//                       Bật lại
//                     </button>
//                   </div>
//                 )}

//                 {!cameraActive && !qrCodeRef.current && (
//                   <div className='bg-gray-900 rounded-2xl overflow-hidden shadow-xl'>
//                     <div className='w-full h-[400px] flex flex-col items-center justify-center space-y-4'>
//                       <span className='material-symbols-outlined text-5xl text-gray-500'>videocam_off</span>
//                       <p className='text-gray-400 text-sm'>Camera chưa được bật</p>
//                       <button
//                         onClick={startCamera}
//                         className='px-6 py-2 bg-primary text-white rounded-full text-sm font-semibold hover:bg-primary/90'
//                       >
//                         Bật camera
//                       </button>
//                     </div>
//                   </div>
//                 )}

//                 <div
//                   className='bg-slate-700  rounded-2xl overflow-hidden shadow-xl'
//                   style={{ display: cameraActive ? 'block' : 'none' }}
//                 >
//                   <div id='qr-reader' className='w-full'></div>
//                 </div>
//               </div>
//             )}

//             {/* Upload Section */}
//             {activeTab === 'upload' && (
//               <div className='bg-surface-container-lowest p-8 md:p-12 rounded-[24px] border-2 border-dashed border-outline-variant/40 text-center hover:border-primary/40 transition-all'>
//                 <div className='flex flex-col items-center justify-center space-y-6'>
//                   <div className='w-16 h-16 md:w-20 md:h-20 rounded-full bg-surface-container-high flex items-center justify-center'>
//                     <span className='material-symbols-outlined text-primary text-3xl md:text-4xl'>upload_file</span>
//                   </div>
//                   <div>
//                     <p className='text-base md:text-lg font-bold text-on-surface'>Tải ảnh từ máy tính</p>
//                     <p className='text-xs md:text-sm text-on-surface-variant mt-1'>Hỗ trợ PNG, JPG, JPEG, WebP</p>
//                   </div>
//                   <label className='px-6 md:px-8 py-2 md:py-3 bg-primary text-white rounded-full font-semibold cursor-pointer hover:bg-primary/90 transition-all'>
//                     {uploading ? 'Đang xử lý...' : 'Chọn ảnh'}
//                     <input
//                       ref={fileInputRef}
//                       type='file'
//                       accept='image/*'
//                       onChange={handleFileUpload}
//                       className='hidden'
//                       disabled={uploading}
//                     />
//                   </label>
//                 </div>
//               </div>
//             )}

//             {/* Manual Entry */}
//             {activeTab === 'manual' && (
//               <div className='bg-surface-container-lowest p-6 md:p-8 rounded-[24px] shadow-xl'>
//                 <div className='space-y-6'>
//                   <div>
//                     <h2 className='text-lg md:text-xl font-bold tracking-tight text-on-surface'>Nhập mã thủ công</h2>
//                     <p className='text-xs md:text-sm text-on-surface-variant'>Sử dụng mã định danh in dưới QR</p>
//                   </div>
//                   <form onSubmit={handleManualInput} className='space-y-4'>
//                     <input
//                       name='qrCode'
//                       type='text'
//                       placeholder='HL-XXXX-XXXX'
//                       className='w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 font-mono'
//                     />
//                     <button
//                       type='submit'
//                       className='w-full bg-gradient-to-r from-primary to-primary-container text-white py-3 md:py-4 rounded-full font-bold shadow-lg shadow-primary/10 hover:brightness-110 transition-all'
//                     >
//                       Kiểm tra
//                     </button>
//                   </form>
//                 </div>
//               </div>
//             )}

//             {/* Instruction Steps */}
//             <div className='grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6'>
//               <div className='bg-surface-container-low p-4 md:p-6 rounded-xl space-y-2 md:space-y-3'>
//                 <div className='w-8 h-8 rounded-lg bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed'>
//                   <span className='text-xs font-black'>01</span>
//                 </div>
//                 <h3 className='font-bold text-on-surface text-sm md:text-base'>Align Frame</h3>
//                 <p className='text-xs text-on-surface-variant'>Đưa mã QR vào khung hình</p>
//               </div>
//               <div className='bg-surface-container-low p-4 md:p-6 rounded-xl space-y-2 md:space-y-3'>
//                 <div className='w-8 h-8 rounded-lg bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed'>
//                   <span className='text-xs font-black'>02</span>
//                 </div>
//                 <h3 className='font-bold text-on-surface text-sm md:text-base'>Verify Identity</h3>
//                 <p className='text-xs text-on-surface-variant'>Hệ thống xác thực</p>
//               </div>
//               <div className='bg-surface-container-low p-4 md:p-6 rounded-xl space-y-2 md:space-y-3'>
//                 <div className='w-8 h-8 rounded-lg bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed'>
//                   <span className='text-xs font-black'>03</span>
//                 </div>
//                 <h3 className='font-bold text-on-surface text-sm md:text-base'>Access Node</h3>
//                 <p className='text-xs text-on-surface-variant'>Nhận thông tin chi tiết</p>
//               </div>
//             </div>

//             {/* AI Insight Section */}
//             <div className='bg-surface-bright/60 backdrop-blur-md p-6 rounded-[24px] border border-primary/10 shadow-xl'>
//               <div className='flex items-center space-x-3 mb-4'>
//                 <div className='w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center'>
//                   <span
//                     className='material-symbols-outlined text-on-secondary-fixed-variant'
//                     style={{ fontVariationSettings: "'FILL' 1" }}
//                   >
//                     psychology
//                   </span>
//                 </div>
//                 <div>
//                   <h4 className='text-sm font-extrabold text-on-surface'>AI Smart Link</h4>
//                   <p className='text-[10px] text-on-surface-variant uppercase tracking-widest'>Active</p>
//                 </div>
//               </div>
//               <div className='bg-on-secondary-container/5 rounded-xl p-4'>
//                 <p className='text-xs text-on-secondary-fixed-variant leading-relaxed'>
//                   Homelink AI đang chờ nhận diện tín hiệu. Quét mã QR sẽ tự động liên kết dữ liệu.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </main>
//       </div>

//       <style>{`
//         #qr-reader {
//   border: none !important;
//   border-radius: 24px;
//   overflow: hidden;
//   width: 100%;
// }
// #qr-reader video {
//   width: 100% !important;
//   height: auto !important;
//   object-fit: cover !important;
// }
//         #qr-reader__dashboard_section {
//           display: none !important;
//         }
//       `}</style>
//     </div>
//   )
// }

// import React, { useState, useRef, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { Html5Qrcode } from 'html5-qrcode'
// import { toast } from 'react-toastify'

// export default function ScanQrPage() {
//   const navigate = useNavigate()
//   const [uploading, setUploading] = useState(false)
//   const [activeTab, setActiveTab] = useState<'scan' | 'upload' | 'manual'>('scan')
//   const [cameraActive, setCameraActive] = useState(false)
//   const qrCodeRef = useRef<Html5Qrcode | null>(null)
//   const fileInputRef = useRef<HTMLInputElement>(null)
//   const hasScannedRef = useRef(false)

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

//       const onScanSuccess = (decodedText: string) => {
//         if (!hasScannedRef.current) {
//           hasScannedRef.current = true
//           toast.success('Đã quét mã QR thành công!')
//           stopCamera()
//           navigate(`/result/${encodeURIComponent(decodedText)}`)
//         }
//       }

//       const onScanError = (errorMessage: string) => {
//         if (errorMessage.includes('IndexSizeError') || errorMessage.includes('source width is 0')) {
//           return
//         }
//         // console.warn(errorMessage)
//       }

//       // Dùng function để tính qrbox theo kích thước video
//       await html5QrCode.start(
//         { facingMode: 'environment' },
//         {
//           fps: 10,
//           qrbox: function (viewfinderWidth, viewfinderHeight) {
//             // Lấy cạnh nhỏ hơn giữa width và height
//             const minSize = Math.min(viewfinderWidth, viewfinderHeight)
//             // Vùng quét chiếm 70% kích thước video, tối đa 400px
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
//       // console.error('Camera error:', err)
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
//         // console.log('Camera stopped')
//       } catch (err) {
//         // console.warn('Error stopping camera:', err)
//       }
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
//       const result = await html5QrCode.scanFile(file, true)
//       toast.success('Đọc mã QR từ ảnh thành công!')
//       navigate(`/result/${encodeURIComponent(result)}`)
//     } catch (err) {
//       toast.error('Không tìm thấy mã QR trong ảnh')
//     } finally {
//       setUploading(false)
//       await html5QrCode.clear()
//       document.body.removeChild(tempDiv)
//       if (fileInputRef.current) fileInputRef.current.value = ''
//     }
//   }

//   const handleManualInput = (e: React.FormEvent) => {
//     e.preventDefault()
//     const form = e.target as HTMLFormElement
//     const input = form.qrCode as HTMLInputElement
//     if (input.value) {
//       navigate(`/result/${encodeURIComponent(input.value)}`)
//     }
//   }

//   return (
//     <div className="bg-surface text-on-surface min-h-screen font-['Manrope',sans-serif]">
//       <div className='flex flex-col min-h-screen w-full'>
//         <main className='flex-1 flex flex-col min-w-0 bg-surface'>
//           <div className='flex-1 overflow-y-auto p-6 md:p-8 space-y-6 md:space-y-8 max-w-[1440px] mx-auto w-full'>
//             {/* Tab Navigation */}
//             <div className='flex gap-2 md:gap-3 border-b border-outline-variant/20 pb-4'>
//               <button
//                 onClick={() => setActiveTab('scan')}
//                 className={`px-3 md:px-4 py-2 font-semibold transition-all border-b-2 ${
//                   activeTab === 'scan'
//                     ? 'text-primary border-primary'
//                     : 'text-on-surface-variant border-transparent hover:text-on-surface'
//                 }`}
//               >
//                 <span className='inline-flex items-center gap-1 md:gap-2'>
//                   <span className='material-symbols-outlined text-base md:text-lg'>qr_code_scanner</span>
//                   <span className='text-sm md:text-base'>Quét QR</span>
//                 </span>
//               </button>
//               <button
//                 onClick={() => setActiveTab('upload')}
//                 className={`px-3 md:px-4 py-2 font-semibold transition-all border-b-2 ${
//                   activeTab === 'upload'
//                     ? 'text-primary border-primary'
//                     : 'text-on-surface-variant border-transparent hover:text-on-surface'
//                 }`}
//               >
//                 <span className='inline-flex items-center gap-1 md:gap-2'>
//                   <span className='material-symbols-outlined text-base md:text-lg'>cloud_upload</span>
//                   <span className='text-sm md:text-base'>Tải ảnh</span>
//                 </span>
//               </button>
//               <button
//                 onClick={() => setActiveTab('manual')}
//                 className={`px-3 md:px-4 py-2 font-semibold transition-all border-b-2 ${
//                   activeTab === 'manual'
//                     ? 'text-primary border-primary'
//                     : 'text-on-surface-variant border-transparent hover:text-on-surface'
//                 }`}
//               >
//                 <span className='inline-flex items-center gap-1 md:gap-2'>
//                   <span className='material-symbols-outlined text-base md:text-lg'>keyboard</span>
//                   <span className='text-sm md:text-base'>Nhập mã</span>
//                 </span>
//               </button>
//             </div>

//             {/* Camera Scanner */}
//             {activeTab === 'scan' && (
//               <div>
//                 {/* Nút điều khiển camera */}
//                 {cameraActive && (
//                   <div className='flex gap-3 mb-4 justify-end'>
//                     <button
//                       onClick={stopCamera}
//                       className='px-4 py-2 bg-red-500 text-white rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-red-600 transition-all'
//                     >
//                       <span className='material-symbols-outlined text-base'>videocam_off</span>
//                       Dừng camera
//                     </button>
//                     <button
//                       onClick={startCamera}
//                       className='px-4 py-2 bg-primary text-white rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-all'
//                     >
//                       <span className='material-symbols-outlined text-base'>refresh</span>
//                       Bật lại
//                     </button>
//                   </div>
//                 )}

//                 {!cameraActive && !qrCodeRef.current && (
//                   <div className='bg-gray-900 rounded-2xl overflow-hidden shadow-xl'>
//                     <div className='w-full h-[400px] flex flex-col items-center justify-center space-y-4'>
//                       <span className='material-symbols-outlined text-5xl text-gray-500'>videocam_off</span>
//                       <p className='text-gray-400 text-sm'>Camera chưa được bật</p>
//                       <button
//                         onClick={startCamera}
//                         className='px-6 py-2 bg-primary text-white rounded-full text-sm font-semibold hover:bg-primary/90'
//                       >
//                         Bật camera
//                       </button>
//                     </div>
//                   </div>
//                 )}

//                 <div
//                   className='bg-black rounded-2xl overflow-hidden shadow-xl'
//                   style={{ display: cameraActive ? 'block' : 'none' }}
//                 >
//                   <div id='qr-reader' className='w-full'></div>
//                 </div>
//               </div>
//             )}

//             {/* Upload Section */}
//             {activeTab === 'upload' && (
//               <div className='bg-surface-container-lowest p-8 md:p-12 rounded-[24px] border-2 border-dashed border-outline-variant/40 text-center hover:border-primary/40 transition-all'>
//                 <div className='flex flex-col items-center justify-center space-y-6'>
//                   <div className='w-16 h-16 md:w-20 md:h-20 rounded-full bg-surface-container-high flex items-center justify-center'>
//                     <span className='material-symbols-outlined text-primary text-3xl md:text-4xl'>upload_file</span>
//                   </div>
//                   <div>
//                     <p className='text-base md:text-lg font-bold text-on-surface'>Tải ảnh từ máy tính</p>
//                     <p className='text-xs md:text-sm text-on-surface-variant mt-1'>Hỗ trợ PNG, JPG, JPEG, WebP</p>
//                   </div>
//                   <label className='px-6 md:px-8 py-2 md:py-3 bg-primary text-white rounded-full font-semibold cursor-pointer hover:bg-primary/90 transition-all'>
//                     {uploading ? 'Đang xử lý...' : 'Chọn ảnh'}
//                     <input
//                       ref={fileInputRef}
//                       type='file'
//                       accept='image/*'
//                       onChange={handleFileUpload}
//                       className='hidden'
//                       disabled={uploading}
//                     />
//                   </label>
//                 </div>
//               </div>
//             )}

//             {/* Manual Entry */}
//             {activeTab === 'manual' && (
//               <div className='bg-surface-container-lowest p-6 md:p-8 rounded-[24px] shadow-xl'>
//                 <div className='space-y-6'>
//                   <div>
//                     <h2 className='text-lg md:text-xl font-bold tracking-tight text-on-surface'>Nhập mã thủ công</h2>
//                     <p className='text-xs md:text-sm text-on-surface-variant'>Sử dụng mã định danh in dưới QR</p>
//                   </div>
//                   <form onSubmit={handleManualInput} className='space-y-4'>
//                     <input
//                       name='qrCode'
//                       type='text'
//                       placeholder='HL-XXXX-XXXX'
//                       className='w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 font-mono'
//                     />
//                     <button
//                       type='submit'
//                       className='w-full bg-gradient-to-r from-primary to-primary-container text-white py-3 md:py-4 rounded-full font-bold shadow-lg shadow-primary/10 hover:brightness-110 transition-all'
//                     >
//                       Kiểm tra
//                     </button>
//                   </form>
//                 </div>
//               </div>
//             )}

//             {/* Instruction Steps */}
//             <div className='grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6'>
//               <div className='bg-surface-container-low p-4 md:p-6 rounded-xl space-y-2 md:space-y-3'>
//                 <div className='w-8 h-8 rounded-lg bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed'>
//                   <span className='text-xs font-black'>01</span>
//                 </div>
//                 <h3 className='font-bold text-on-surface text-sm md:text-base'>Align Frame</h3>
//                 <p className='text-xs text-on-surface-variant'>Đưa mã QR vào khung hình</p>
//               </div>
//               <div className='bg-surface-container-low p-4 md:p-6 rounded-xl space-y-2 md:space-y-3'>
//                 <div className='w-8 h-8 rounded-lg bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed'>
//                   <span className='text-xs font-black'>02</span>
//                 </div>
//                 <h3 className='font-bold text-on-surface text-sm md:text-base'>Verify Identity</h3>
//                 <p className='text-xs text-on-surface-variant'>Hệ thống xác thực</p>
//               </div>
//               <div className='bg-surface-container-low p-4 md:p-6 rounded-xl space-y-2 md:space-y-3'>
//                 <div className='w-8 h-8 rounded-lg bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed'>
//                   <span className='text-xs font-black'>03</span>
//                 </div>
//                 <h3 className='font-bold text-on-surface text-sm md:text-base'>Access Node</h3>
//                 <p className='text-xs text-on-surface-variant'>Nhận thông tin chi tiết</p>
//               </div>
//             </div>

//             {/* AI Insight Section */}
//             <div className='bg-surface-bright/60 backdrop-blur-md p-6 rounded-[24px] border border-primary/10 shadow-xl'>
//               <div className='flex items-center space-x-3 mb-4'>
//                 <div className='w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center'>
//                   <span
//                     className='material-symbols-outlined text-on-secondary-fixed-variant'
//                     style={{ fontVariationSettings: "'FILL' 1" }}
//                   >
//                     psychology
//                   </span>
//                 </div>
//                 <div>
//                   <h4 className='text-sm font-extrabold text-on-surface'>AI Smart Link</h4>
//                   <p className='text-[10px] text-on-surface-variant uppercase tracking-widest'>Active</p>
//                 </div>
//               </div>
//               <div className='bg-on-secondary-container/5 rounded-xl p-4'>
//                 <p className='text-xs text-on-secondary-fixed-variant leading-relaxed'>
//                   Homelink AI đang chờ nhận diện tín hiệu. Quét mã QR sẽ tự động liên kết dữ liệu.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </main>
//       </div>

//       <style>{`
//         #qr-reader {
//           border: none !important;
//           border-radius: 24px;
//           overflow: hidden;
//           width: 100%;
//           min-height: 400px;
//         }
//         #qr-reader video {
//           width: 100% !important;
//           height: auto !important;
//           min-height: 400px;
//           object-fit: cover !important;
//         }
//         #qr-reader__dashboard_section {
//           display: none !important;
//         }
//         #qr-reader__scan_region {
//           min-height: 400px !important;
//         }
//       `}</style>
//     </div>
//   )
// }
import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'
import { toast } from 'react-toastify'

export default function ScanQrPage() {
  const navigate = useNavigate()
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState<'scan' | 'upload' | 'manual'>('scan')
  const [cameraActive, setCameraActive] = useState(false)
  const qrCodeRef = useRef<Html5Qrcode | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const hasScannedRef = useRef(false)

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

      const onScanSuccess = (decodedText: string) => {
        if (!hasScannedRef.current) {
          hasScannedRef.current = true
          toast.success('Đã quét mã QR thành công!')
          stopCamera()
          navigate(`/result/${encodeURIComponent(decodedText)}`)
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
      const result = await html5QrCode.scanFile(file, true)
      toast.success('Đọc mã QR từ ảnh thành công!')
      navigate(`/result/${encodeURIComponent(result)}`)
    } catch (err) {
      toast.error('Không tìm thấy mã QR trong ảnh')
    } finally {
      setUploading(false)
      await html5QrCode.clear()
      document.body.removeChild(tempDiv)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleManualInput = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const input = form.qrCode as HTMLInputElement
    if (input.value) {
      navigate(`/result/${encodeURIComponent(input.value)}`)
    }
  }

  return (
    <div className="bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white min-h-screen font-['Inter',sans-serif]">
      <style>{`
        #qr-reader {
          border: none !important;
          border-radius: 20px;
          overflow: hidden;
          width: 100%;
        }
        #qr-reader video {
          width: 100% !important;
          height: auto !important;
          object-fit: cover !important;
        }
        #qr-reader__dashboard_section {
          display: none !important;
        }
        #qr-reader__scan_region {
          border-radius: 20px !important;
        }
        
        .scanner-overlay::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 250px;
          height: 250px;
          border: 3px solid #10b981;
          border-radius: 20px;
          box-shadow: inset 0 0 30px rgba(16, 185, 129, 0.2), 0 0 20px rgba(16, 185, 129, 0.3);
          animation: scanPulse 2s ease-in-out infinite;
        }
        
        @keyframes scanPulse {
          0%, 100% { box-shadow: inset 0 0 30px rgba(16, 185, 129, 0.2), 0 0 20px rgba(16, 185, 129, 0.3); }
          50% { box-shadow: inset 0 0 50px rgba(16, 185, 129, 0.4), 0 0 40px rgba(16, 185, 129, 0.5); }
        }

        .tab-btn-active {
          color: #06b6d4;
          border-bottom: 3px solid #06b6d4;
        }

        .fade-in {
          animation: fadeIn 0.5s ease-in;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .floating-card {
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(148, 163, 184, 0.2);
        }

        .btn-primary {
          background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
          transition: all 0.3s ease;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(6, 182, 212, 0.3);
        }

        .btn-danger {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          transition: all 0.3s ease;
        }

        .btn-danger:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(239, 68, 68, 0.3);
        }
      `}</style>

      <div className='flex flex-col min-h-screen'>
        {/* Header */}
        <div className='border-b border-slate-700/50 bg-slate-900/30 backdrop-blur-sm'>
          <div className='max-w-7xl mx-auto px-4 md:px-6 py-6'>
            <div className='flex items-center gap-3'>
              <div className='w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg'>
                <span className='material-symbols-outlined text-2xl text-white'>qr_code</span>
              </div>
              <div>
                <h1 className='text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent'>
                  Quét QR
                </h1>
                <p className='text-slate-400 text-sm'>Homelink Scanner</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className='flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-8'>
          {/* Tab Navigation */}
          <div className='flex gap-2 mb-8 bg-slate-800/30 p-1 rounded-full w-fit backdrop-blur-sm border border-slate-700/30'>
            {[
              { id: 'scan', label: 'Quét QR', icon: 'qr_code_scanner' },
              { id: 'upload', label: 'Tải ảnh', icon: 'cloud_upload' },
              { id: 'manual', label: 'Nhập mã', icon: 'keyboard' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 md:px-6 py-3 rounded-full font-semibold transition-all flex items-center gap-2 text-sm md:text-base ${
                  activeTab === tab.id ? 'btn-primary text-white shadow-lg' : 'text-slate-300 hover:text-white'
                }`}
              >
                <span className='material-symbols-outlined text-xl'>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className='fade-in'>
            {/* Camera Scanner */}
            {activeTab === 'scan' && (
              <div className='space-y-4'>
                {/* Control Buttons - Compact & Visible */}
                {cameraActive && (
                  <div className='flex gap-3 justify-center sticky top-0 z-10 bg-gradient-to-b from-slate-950 to-transparent py-4'>
                    <button
                      onClick={stopCamera}
                      className='btn-danger text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg'
                    >
                      <span className='material-symbols-outlined'>stop_circle</span>
                      Dừng camera
                    </button>
                    <button
                      onClick={startCamera}
                      className='btn-primary text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg'
                    >
                      <span className='material-symbols-outlined'>refresh</span>
                      Thử lại
                    </button>
                  </div>
                )}

                {/* Camera View */}
                {!cameraActive && !qrCodeRef.current && (
                  <div className='floating-card rounded-2xl overflow-hidden shadow-2xl'>
                    <div className='w-full aspect-square flex flex-col items-center justify-center space-y-6 bg-gradient-to-br from-slate-800 to-slate-900 p-8'>
                      <span className='material-symbols-outlined text-7xl text-slate-500'>videocam_off</span>
                      <p className='text-slate-300 text-lg font-semibold'>Camera chưa được bật</p>
                      <button
                        onClick={startCamera}
                        className='btn-primary text-white px-8 py-3 rounded-full font-bold shadow-lg'
                      >
                        Bật camera ngay
                      </button>
                    </div>
                  </div>
                )}

                <div
                  className={`floating-card rounded-2xl overflow-hidden shadow-2xl scanner-overlay relative ${
                    cameraActive ? 'block' : 'hidden'
                  }`}
                  style={{ display: cameraActive ? 'block' : 'none' }}
                >
                  <div id='qr-reader' className='w-full aspect-square'></div>
                </div>

                {/* Instructions */}
                {cameraActive && (
                  <div className='floating-card rounded-xl p-4 text-center'>
                    <p className='text-slate-300 text-sm'>✨ Hướng camera vào mã QR để quét</p>
                  </div>
                )}
              </div>
            )}

            {/* Upload Section */}
            {activeTab === 'upload' && (
              <div className='floating-card rounded-2xl p-8 md:p-12 border-2 border-dashed border-cyan-500/30 hover:border-cyan-500/60 transition-all'>
                <div className='flex flex-col items-center justify-center space-y-6'>
                  <span className='material-symbols-outlined text-7xl text-cyan-400'>upload_file</span>
                  <div className='text-center'>
                    <p className='text-xl font-bold text-white'>Tải ảnh từ máy tính</p>
                    <p className='text-slate-400 text-sm mt-2'>Hỗ trợ PNG, JPG, JPEG, WebP</p>
                  </div>
                  <label className='btn-primary text-white px-8 py-3 rounded-full font-bold cursor-pointer shadow-lg flex items-center gap-2'>
                    <span className='material-symbols-outlined'>folder_open</span>
                    {uploading ? 'Đang xử lý...' : 'Chọn ảnh'}
                    <input
                      ref={fileInputRef}
                      type='file'
                      accept='image/*'
                      onChange={handleFileUpload}
                      className='hidden'
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Manual Entry */}
            {activeTab === 'manual' && (
              <div className='floating-card rounded-2xl p-8 md:p-12 shadow-2xl max-w-md mx-auto'>
                <div className='space-y-6'>
                  <div className='text-center'>
                    <span className='material-symbols-outlined text-7xl text-cyan-400 block mb-2'>keyboard</span>
                    <h2 className='text-xl font-bold text-white'>Nhập mã thủ công</h2>
                    <p className='text-slate-400 text-sm mt-2'>Sử dụng mã định danh in dưới QR</p>
                  </div>
                  <form onSubmit={handleManualInput} className='space-y-4'>
                    <input
                      name='qrCode'
                      type='text'
                      placeholder='HL-XXXX-XXXX'
                      className='w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 font-mono'
                    />
                    <button
                      type='submit'
                      className='w-full btn-primary text-white py-3 rounded-full font-bold shadow-lg flex items-center justify-center gap-2'
                    >
                      <span className='material-symbols-outlined'>check_circle</span>
                      Kiểm tra
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* Info Cards */}
          {activeTab === 'scan' && (
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-12'>
              {[
                { number: '01', title: 'Align Frame', desc: 'Đưa mã QR vào khung hình', icon: 'center_focus_weak' },
                { number: '02', title: 'Verify', desc: 'Hệ thống xác thực tự động', icon: 'verified' },
                { number: '03', title: 'Access', desc: 'Nhận thông tin chi tiết', icon: 'analytics' }
              ].map((step, i) => (
                <div
                  key={i}
                  className='floating-card rounded-xl p-6 space-y-3 hover:border-cyan-400/50 transition-all'
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className='flex items-center justify-between'>
                    <span className='material-symbols-outlined text-3xl text-cyan-400'>{step.icon}</span>
                    <span className='text-cyan-400 font-bold text-lg'>{step.number}</span>
                  </div>
                  <div>
                    <h3 className='font-bold text-white'>{step.title}</h3>
                    <p className='text-slate-400 text-sm'>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Footer AI Info */}
        <div className='border-t border-slate-700/50 bg-slate-900/30 backdrop-blur-sm mt-12'>
          <div className='max-w-7xl mx-auto px-4 md:px-6 py-6'>
            <div className='floating-card rounded-xl p-4 flex items-start gap-3'>
              <span className='material-symbols-outlined text-2xl text-cyan-400 flex-shrink-0'>smart_toy</span>
              <div>
                <p className='font-bold text-white text-sm'>AI Smart Link</p>
                <p className='text-slate-400 text-xs mt-1'>
                  Homelink AI đang chờ nhận diện tín hiệu. Quét mã QR sẽ tự động liên kết dữ liệu.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
