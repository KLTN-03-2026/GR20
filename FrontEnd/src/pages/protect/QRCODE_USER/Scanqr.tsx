// // pages/QRCODE_USER/Scanqr.tsx
// import React, { useState, useRef, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode'
// import { toast } from 'react-toastify'

// export default function ScanQrPage() {
//   const navigate = useNavigate()
//   const [scanning, setScanning] = useState(true)
//   const [uploading, setUploading] = useState(false)
//   const scannerRef = useRef<Html5QrcodeScanner | null>(null)
//   const fileInputRef = useRef<HTMLInputElement>(null)

//   useEffect(() => {
//     const element = document.getElementById('qr-reader')
//     if (!element) return

//     element.innerHTML = ''

//     const scanner = new Html5QrcodeScanner(
//       'qr-reader',
//       {
//         qrbox: { width: 300, height: 300 },
//         fps: 10,
//         aspectRatio: 1.0,
//         showTorchButtonIfSupported: true
//       },
//       false
//     )

//     scannerRef.current = scanner

//     const onScanSuccess = (decodedText: string) => {
//       if (scanning) {
//         setScanning(false)
//         toast.success('Đã quét mã QR thành công!')
//         scanner.clear()
//         navigate(`/result/${encodeURIComponent(decodedText)}`)
//       }
//     }

//     scanner.render(onScanSuccess, undefined)
//     return () => {
//       if (scannerRef.current) scannerRef.current.clear()
//     }
//   }, [navigate, scanning])

//   // Upload ảnh và quét QR
//   const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0]
//     if (!file) return

//     setUploading(true)
//     const html5QrCode = new Html5Qrcode('reader')

//     try {
//       const result = await html5QrCode.scanFile(file, true)
//       toast.success('Đọc mã QR từ ảnh thành công!')
//       navigate(`/result/${encodeURIComponent(result)}`)
//     } catch (err) {
//       toast.error('Không tìm thấy mã QR trong ảnh. Vui lòng thử ảnh khác.')
//     } finally {
//       setUploading(false)
//       if (fileInputRef.current) fileInputRef.current.value = ''
//     }
//   }

//   const requestCameraPermission = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true })
//       stream.getTracks().forEach((track) => track.stop())
//       window.location.reload()
//     } catch (err) {
//       toast.error('Vui lòng cho phép truy cập camera')
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
//       <div className='bg-gradient-to-r from-primary to-primary-container text-white pt-12 pb-8 px-6'>
//         <button onClick={() => navigate(-1)} className='mb-4 p-2 hover:bg-white/20 rounded-full transition-colors'>
//           <span className='material-symbols-outlined'>arrow_back</span>
//         </button>
//         <h1 className='text-3xl font-bold tracking-tight'>Quét mã QR</h1>
//         <p className='text-blue-100 mt-2'>Đưa mã QR vào khung hình để quét</p>
//       </div>

//       <div className='px-6 py-8'>
//         {/* Camera Section */}
//         <div className='bg-black rounded-3xl overflow-hidden shadow-2xl'>
//           <div id='qr-reader' className='w-full'></div>
//         </div>

//         {/* Nút yêu cầu camera */}
//         <button
//           onClick={requestCameraPermission}
//           className='mt-4 w-full py-3 bg-primary/10 text-primary rounded-xl font-semibold flex items-center justify-center gap-2'
//         >
//           <span className='material-symbols-outlined'>videocam</span>
//           Yêu cầu quyền truy cập camera
//         </button>

//         {/* Upload ảnh */}
//         <div className='mt-6'>
//           <div className='relative'>
//             <div className='absolute inset-0 flex items-center'>
//               <div className='w-full border-t border-outline-variant'></div>
//             </div>
//             <div className='relative flex justify-center text-sm'>
//               <span className='px-4 bg-surface text-on-surface-variant'>Hoặc tải ảnh chứa QR</span>
//             </div>
//           </div>

//           <label className='mt-6 w-full flex items-center justify-center gap-3 py-4 bg-primary/10 text-primary rounded-xl font-semibold cursor-pointer hover:bg-primary/20 transition-colors'>
//             <span className='material-symbols-outlined'>upload_file</span>
//             {uploading ? 'Đang xử lý...' : 'Chọn ảnh từ máy tính'}
//             <input
//               ref={fileInputRef}
//               type='file'
//               accept='image/*'
//               onChange={handleFileUpload}
//               className='hidden'
//               disabled={uploading}
//             />
//           </label>
//           <p className='text-xs text-on-surface-variant text-center mt-2'>Hỗ trợ định dạng: PNG, JPG, JPEG</p>
//         </div>

//         {/* Nhập thủ công */}
//         <div className='mt-8'>
//           <div className='relative'>
//             <div className='absolute inset-0 flex items-center'>
//               <div className='w-full border-t border-outline-variant'></div>
//             </div>
//             <div className='relative flex justify-center text-sm'>
//               <span className='px-4 bg-surface text-on-surface-variant'>Hoặc nhập thủ công</span>
//             </div>
//           </div>

//           <form onSubmit={handleManualInput} className='mt-6 flex gap-3'>
//             <input
//               name='qrCode'
//               type='text'
//               placeholder='Nhập mã QR code'
//               className='flex-1 px-4 py-3 bg-surface-container-low rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary focus:outline-none'
//             />
//             <button type='submit' className='px-6 py-3 bg-primary text-white rounded-xl font-semibold'>
//               Kiểm tra
//             </button>
//           </form>
//         </div>

//         {/* Hướng dẫn */}
//         <div className='mt-8 p-6 bg-surface-container-low rounded-2xl'>
//           <div className='flex items-center gap-3 mb-4'>
//             <span className='material-symbols-outlined text-primary'>info</span>
//             <h3 className='font-bold'>Hướng dẫn</h3>
//           </div>
//           <ul className='space-y-2 text-sm text-on-surface-variant'>
//             <li className='flex items-center gap-2'>
//               <span className='w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xs'>
//                 1
//               </span>
//               Cho phép truy cập camera
//             </li>
//             <li className='flex items-center gap-2'>
//               <span className='w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xs'>
//                 2
//               </span>
//               Đưa mã QR vào khung hình
//             </li>
//             <li className='flex items-center gap-2'>
//               <span className='w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xs'>
//                 3
//               </span>
//               Hoặc tải ảnh có chứa QR code
//             </li>
//           </ul>
//         </div>
//       </div>

//       <style>{`
//         #qr-reader {
//           border: none !important;
//           border-radius: 24px;
//           overflow: hidden;
//         }
//         #qr-reader video {
//           width: 100% !important;
//           height: auto !important;
//           min-height: 400px;
//           object-fit: cover;
//         }
//         #qr-reader button {
//           background: #005ab7 !important;
//           color: white !important;
//           border-radius: 9999px !important;
//           padding: 8px 16px !important;
//           border: none !important;
//         }
//       `}</style>
//     </div>
//   )
// }

// pages/QRCODE_USER/Scanqr.tsx
// import React, { useState, useRef, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode'
// import { toast } from 'react-toastify'

// export default function ScanQrPage() {
//   const navigate = useNavigate()
//   const [scanning, setScanning] = useState(true)
//   const [uploading, setUploading] = useState(false)
//   const scannerRef = useRef<Html5QrcodeScanner | null>(null)
//   const fileInputRef = useRef<HTMLInputElement>(null)

//   useEffect(() => {
//     const element = document.getElementById('qr-reader')
//     if (!element) return

//     element.innerHTML = ''

//     const scanner = new Html5QrcodeScanner(
//       'qr-reader',
//       {
//         qrbox: { width: 300, height: 300 },
//         fps: 10,
//         aspectRatio: 1.0,
//         showTorchButtonIfSupported: true
//       },
//       false
//     )

//     scannerRef.current = scanner

//     const onScanSuccess = (decodedText: string) => {
//       if (scanning) {
//         setScanning(false)
//         toast.success('Đã quét mã QR thành công!')
//         scanner.clear()
//         navigate(`/result/${encodeURIComponent(decodedText)}`)
//       }
//     }

//     scanner.render(onScanSuccess, undefined)
//     return () => {
//       if (scannerRef.current) scannerRef.current.clear()
//     }
//   }, [navigate, scanning])

//   // ✅ Sửa lại upload ảnh
//   const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0]
//     if (!file) return

//     setUploading(true)

//     // Tạo element tạm để scan
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
//       toast.error('Không tìm thấy mã QR trong ảnh. Vui lòng thử ảnh khác.')
//     } finally {
//       setUploading(false)
//       await html5QrCode.clear()
//       document.body.removeChild(tempDiv)
//       if (fileInputRef.current) fileInputRef.current.value = ''
//     }
//   }

//   const requestCameraPermission = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true })
//       stream.getTracks().forEach((track) => track.stop())
//       window.location.reload()
//     } catch (err) {
//       toast.error('Vui lòng cho phép truy cập camera')
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
//       <div className='bg-gradient-to-r from-primary to-primary-container text-white pt-12 pb-8 px-6'>
//         <button onClick={() => navigate(-1)} className='mb-4 p-2 hover:bg-white/20 rounded-full transition-colors'>
//           <span className='material-symbols-outlined'>arrow_back</span>
//         </button>
//         <h1 className='text-3xl font-bold tracking-tight'>Quét mã QR</h1>
//         <p className='text-blue-100 mt-2'>Đưa mã QR vào khung hình để quét</p>
//       </div>

//       <div className='px-6 py-8'>
//         {/* Camera Section */}
//         <div className='bg-black rounded-3xl overflow-hidden shadow-2xl'>
//           <div id='qr-reader' className='w-full'></div>
//         </div>

//         {/* Nút yêu cầu camera */}
//         <button
//           onClick={requestCameraPermission}
//           className='mt-4 w-full py-3 bg-primary/10 text-primary rounded-xl font-semibold flex items-center justify-center gap-2'
//         >
//           <span className='material-symbols-outlined'>videocam</span>
//           Yêu cầu quyền truy cập camera
//         </button>

//         {/* Upload ảnh */}
//         <div className='mt-6'>
//           <div className='relative'>
//             <div className='absolute inset-0 flex items-center'>
//               <div className='w-full border-t border-outline-variant'></div>
//             </div>
//             <div className='relative flex justify-center text-sm'>
//               <span className='px-4 bg-surface text-on-surface-variant'>Hoặc tải ảnh chứa QR</span>
//             </div>
//           </div>

//           <label className='mt-6 w-full flex items-center justify-center gap-3 py-4 bg-primary/10 text-primary rounded-xl font-semibold cursor-pointer hover:bg-primary/20 transition-colors'>
//             <span className='material-symbols-outlined'>upload_file</span>
//             {uploading ? 'Đang xử lý...' : 'Chọn ảnh từ máy tính'}
//             <input
//               ref={fileInputRef}
//               type='file'
//               accept='image/*'
//               onChange={handleFileUpload}
//               className='hidden'
//               disabled={uploading}
//             />
//           </label>
//           <p className='text-xs text-on-surface-variant text-center mt-2'>Hỗ trợ định dạng: PNG, JPG, JPEG</p>
//         </div>

//         {/* Nhập thủ công */}
//         <div className='mt-8'>
//           <div className='relative'>
//             <div className='absolute inset-0 flex items-center'>
//               <div className='w-full border-t border-outline-variant'></div>
//             </div>
//             <div className='relative flex justify-center text-sm'>
//               <span className='px-4 bg-surface text-on-surface-variant'>Hoặc nhập thủ công</span>
//             </div>
//           </div>

//           <form onSubmit={handleManualInput} className='mt-6 flex gap-3'>
//             <input
//               name='qrCode'
//               type='text'
//               placeholder='Nhập mã QR code'
//               className='flex-1 px-4 py-3 bg-surface-container-low rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary focus:outline-none'
//             />
//             <button type='submit' className='px-6 py-3 bg-primary text-white rounded-xl font-semibold'>
//               Kiểm tra
//             </button>
//           </form>
//         </div>

//         {/* Hướng dẫn */}
//         <div className='mt-8 p-6 bg-surface-container-low rounded-2xl'>
//           <div className='flex items-center gap-3 mb-4'>
//             <span className='material-symbols-outlined text-primary'>info</span>
//             <h3 className='font-bold'>Hướng dẫn</h3>
//           </div>
//           <ul className='space-y-2 text-sm text-on-surface-variant'>
//             <li className='flex items-center gap-2'>
//               <span className='w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xs'>
//                 1
//               </span>
//               Cho phép truy cập camera
//             </li>
//             <li className='flex items-center gap-2'>
//               <span className='w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xs'>
//                 2
//               </span>
//               Đưa mã QR vào khung hình
//             </li>
//             <li className='flex items-center gap-2'>
//               <span className='w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xs'>
//                 3
//               </span>
//               Hoặc tải ảnh có chứa QR code
//             </li>
//           </ul>
//         </div>
//       </div>

//       <style>{`
//         #qr-reader {
//           border: none !important;
//           border-radius: 24px;
//           overflow: hidden;
//         }
//         #qr-reader video {
//           width: 100% !important;
//           height: auto !important;
//           min-height: 400px;
//           object-fit: cover;
//         }
//         #qr-reader button {
//           background: #005ab7 !important;
//           color: white !important;
//           border-radius: 9999px !important;
//           padding: 8px 16px !important;
//           border: none !important;
//         }
//       `}</style>
//     </div>
//   )
// }

import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode'
import { toast } from 'react-toastify'

export default function ScanQrPage() {
  const navigate = useNavigate()
  const [scanning, setScanning] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState<'scan' | 'upload' | 'manual'>('scan')
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (activeTab === 'scan') {
      const element = document.getElementById('qr-reader')
      if (!element) return

      element.innerHTML = ''

      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        {
          qrbox: { width: 300, height: 300 },
          fps: 10,
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true
        },
        false
      )

      scannerRef.current = scanner

      const onScanSuccess = (decodedText: string) => {
        if (scanning) {
          setScanning(false)
          toast.success('Đã quét mã QR thành công!')
          scanner.clear()
          navigate(`/result/${encodeURIComponent(decodedText)}`)
        }
      }

      scanner.render(onScanSuccess, undefined)

      return () => {
        if (scannerRef.current) {
          scannerRef.current.clear()
        }
      }
    }
  }, [navigate, scanning, activeTab])

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

  // const requestCameraPermission = async () => {
  //   try {
  //     const stream = await navigator.mediaDevices.getUserMedia({ video: true })
  //     stream.getTracks().forEach((track) => track.stop())
  //     window.location.reload()
  //   } catch (err) {
  //     toast.error('Vui lòng cho phép truy cập camera')
  //   }
  // }

  return (
    <div className="bg-surface text-on-surface min-h-screen font-['Manrope',sans-serif]">
      <div className='flex h-screen w-full'>
        {/* Sidebar */}
        <aside className='hidden lg:flex h-screen w-64 flex-col py-6 px-4 space-y-8 bg-slate-50 border-r-0 font-manrope text-sm uppercase tracking-widest'>
          <div className='flex items-center space-x-3 px-2'>
            <div className='w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white'>
              <span className='material-symbols-outlined' style={{ fontVariationSettings: "'FILL' 1" }}>
                qr_code_2
              </span>
            </div>
            <div>
              <h1 className='font-bold text-on-surface tracking-tight normal-case text-base'>QR Terminal</h1>
              <p className='text-[10px] text-on-surface-variant opacity-60'>Property Auth Node</p>
            </div>
          </div>

          <nav className='flex-1 space-y-2'>
            <button
              onClick={() => setActiveTab('scan')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'scan' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-500 hover:bg-slate-200'
              }`}
            >
              <span
                className='material-symbols-outlined'
                style={activeTab === 'scan' ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                qr_code_scanner
              </span>
              <span className={activeTab === 'scan' ? 'font-bold' : 'font-medium'}>Live Scan</span>
            </button>

            <button
              onClick={() => setActiveTab('upload')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'upload' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-500 hover:bg-slate-200'
              }`}
            >
              <span className='material-symbols-outlined'>cloud_upload</span>
              <span className={activeTab === 'upload' ? 'font-bold' : 'font-medium'}>Upload Gallery</span>
            </button>

            <button
              onClick={() => setActiveTab('manual')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'manual' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-500 hover:bg-slate-200'
              }`}
            >
              <span className='material-symbols-outlined'>keyboard</span>
              <span className={activeTab === 'manual' ? 'font-bold' : 'font-medium'}>Manual Entry</span>
            </button>
          </nav>

          <div className='pt-4 border-t border-surface-container'>
            <button className='mt-4 w-full bg-surface-container-high py-3 rounded-full text-primary font-bold text-xs hover:bg-primary hover:text-white transition-all'>
              Request Support
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className='flex-1 flex flex-col min-w-0 bg-surface overflow-hidden'>
          {/* Header */}
          {/* <header className='bg-slate-50/70 backdrop-blur-xl shadow-xl shadow-blue-900/5 flex justify-between items-center h-16 px-8'>
            <div className='flex items-center space-x-8 w-full'>
              <span className='text-xl font-bold tracking-tighter text-slate-900'>Homelink AI</span>
              <div className='flex-1 max-w-md'>
                <div className='relative group'>
                  <span className='material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'>
                    search
                  </span>
                  <input
                    className='w-full bg-slate-100/50 border-none rounded-full pl-10 pr-4 py-1.5 text-sm focus:ring-2 focus:ring-primary/20 transition-all'
                    placeholder='Search properties...'
                    type='text'
                  />
                </div>
              </div>
              <div className='flex items-center space-x-4'>
                <button className='material-symbols-outlined text-slate-500 hover:bg-slate-100/50 p-2 rounded-full'>
                  notifications
                </button>
                <button className='bg-gradient-to-r from-primary to-primary-container text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg shadow-primary/20'>
                  Create New
                </button>
              </div>
            </div>
          </header> */}

          <header className='bg-slate-50/70 backdrop-blur-xl shadow-xl shadow-blue-900/5 flex justify-between items-center h-16 px-8'>
            <div className='flex items-center space-x-8 w-full'>
              {/* Logo */}
              <div className='flex items-center space-x-2'>
                <div className='w-8 h-8 bg-primary rounded-lg flex items-center justify-center'>
                  <span
                    className='material-symbols-outlined text-white text-sm'
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    home
                  </span>
                </div>
                <span className='text-xl font-bold tracking-tighter bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent'>
                  Homelink AI
                </span>
              </div>

              {/* Search Bar - Ẩn trên mobile */}
              <div className='hidden md:block flex-1 max-w-md'>
                <div className='relative group'>
                  <span className='material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg'>
                    search
                  </span>
                  <input
                    className='w-full bg-slate-100/80 border-none rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all placeholder:text-slate-400'
                    placeholder='Tìm kiếm bất động sản...'
                    type='text'
                  />
                </div>
              </div>

              {/* Right Actions */}
              <div className='flex items-center space-x-3'>
                <button className='material-symbols-outlined text-slate-500 hover:bg-slate-100/80 p-2 rounded-full transition-all text-xl'>
                  notifications
                </button>
                <button className='hidden md:flex bg-gradient-to-r from-primary to-primary-container text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg shadow-primary/20 hover:brightness-110 transition-all'>
                  + Tạo mới
                </button>
                <div className='w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary-container flex items-center justify-center text-white text-sm font-bold'>
                  H
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className='flex-1 overflow-y-auto p-8 space-y-8 max-w-[1440px] mx-auto w-full'>
            <div className='grid grid-cols-1 xl:grid-cols-12 gap-8 items-start'>
              {/* Left Column - Camera/Upload/Manual */}
              <div className='xl:col-span-8 space-y-6'>
                {/* Camera Scanner */}
                {/* {activeTab === 'scan' && (
                  <div className='relative bg-surface-container-low rounded-[24px] overflow-hidden aspect-video border-[6px] border-surface-container-lowest shadow-2xl'>
                    <div id='qr-reader' className='w-full h-full'></div>
                    <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
                      <div className='relative w-64 h-64'>
                        <div className='absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-primary rounded-tl-2xl'></div>
                        <div className='absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-primary rounded-tr-2xl'></div>
                        <div className='absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-primary rounded-bl-2xl'></div>
                        <div className='absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-primary rounded-br-2xl'></div>
                        <div className='absolute top-0 left-0 w-full h-1 bg-primary shadow-[0_0_15px_rgba(0,114,229,0.8)] animate-pulse'></div>
                      </div>
                    </div>
                  </div>
                )} */}

                {activeTab === 'scan' && (
                  <div className='bg-black rounded-2xl overflow-hidden'>
                    <div id='qr-reader'></div>
                  </div>
                )}
                {/* Upload Section */}
                {activeTab === 'upload' && (
                  <div className='bg-surface-container-lowest p-12 rounded-[24px] border-2 border-dashed border-outline-variant/40 text-center hover:border-primary/40 transition-all'>
                    <div className='flex flex-col items-center justify-center space-y-6'>
                      <div className='w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center'>
                        <span className='material-symbols-outlined text-primary text-4xl'>upload_file</span>
                      </div>
                      <div>
                        <p className='text-lg font-bold text-on-surface'>Tải ảnh từ máy tính</p>
                        <p className='text-sm text-on-surface-variant mt-1'>Hỗ trợ định dạng PNG, JPG, JPEG, WebP</p>
                      </div>
                      <label className='px-8 py-3 bg-primary text-white rounded-full font-semibold cursor-pointer hover:bg-primary/90 transition-all'>
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
                  <div className='bg-surface-container-lowest p-8 rounded-[24px] shadow-xl'>
                    <div className='space-y-6'>
                      <div>
                        <h2 className='text-xl font-bold tracking-tight text-on-surface'>Nhập mã thủ công</h2>
                        <p className='text-sm text-on-surface-variant'>Sử dụng mã định danh in dưới QR</p>
                      </div>
                      <form onSubmit={handleManualInput} className='space-y-4'>
                        <input
                          name='qrCode'
                          type='text'
                          placeholder='HL-XXXX-XXXX'
                          className='w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 font-mono'
                        />
                        <button
                          type='submit'
                          className='w-full bg-gradient-to-r from-primary to-primary-container text-white py-4 rounded-full font-bold shadow-lg shadow-primary/10 hover:brightness-110 transition-all'
                        >
                          Kiểm tra
                        </button>
                      </form>
                    </div>
                  </div>
                )}
                {/* Instruction Steps */}
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                  <div className='bg-surface-container-low p-6 rounded-xl space-y-3'>
                    <div className='w-8 h-8 rounded-lg bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed'>
                      <span className='text-xs font-black'>01</span>
                    </div>
                    <h3 className='font-bold text-on-surface'>Align Frame</h3>
                    <p className='text-xs text-on-surface-variant'>Đưa mã QR vào khung hình trung tâm</p>
                  </div>
                  <div className='bg-surface-container-low p-6 rounded-xl space-y-3'>
                    <div className='w-8 h-8 rounded-lg bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed'>
                      <span className='text-xs font-black'>02</span>
                    </div>
                    <h3 className='font-bold text-on-surface'>Verify Identity</h3>
                    <p className='text-xs text-on-surface-variant'>Hệ thống xác thực thông tin</p>
                  </div>
                  <div className='bg-surface-container-low p-6 rounded-xl space-y-3'>
                    <div className='w-8 h-8 rounded-lg bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed'>
                      <span className='text-xs font-black'>03</span>
                    </div>
                    <h3 className='font-bold text-on-surface'>Access Node</h3>
                    <p className='text-xs text-on-surface-variant'>Nhận thông tin chi tiết ngay lập tức</p>
                  </div>
                </div>
              </div>

              {/* Right Column - AI Insight */}
              <div className='xl:col-span-4 space-y-6'>
                <div className='bg-surface-bright/60 backdrop-blur-md p-6 rounded-[24px] border border-primary/10 shadow-2xl shadow-primary/5'>
                  <div className='flex items-center space-x-3 mb-4'>
                    <div className='w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center'>
                      <span
                        className='material-symbols-outlined text-on-secondary-fixed-variant'
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        psychology
                      </span>
                    </div>
                    <div>
                      <h4 className='text-sm font-extrabold text-on-surface'>AI Smart Link</h4>
                      <p className='text-[10px] text-on-surface-variant uppercase tracking-widest'>
                        Prediction Engine Active
                      </p>
                    </div>
                  </div>
                  <div className='bg-on-secondary-container/5 rounded-xl p-4'>
                    <p className='text-xs text-on-secondary-fixed-variant leading-relaxed'>
                      Homelink AI đang chờ nhận diện tín hiệu. Quét mã QR sẽ tự động liên kết dữ liệu thiết bị với hồ sơ
                      bất động sản kỹ thuật số của bạn.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <style>{`
  #qr-reader {
    border: none !important;
    border-radius: 24px;
    overflow: hidden;
  }
  #qr-reader video {
    width: 100% !important;
    height: auto !important;
    min-height: 450px;
    object-fit: cover !important;
  }
  #qr-reader__dashboard_section {
    padding: 8px !important;
  }
  #qr-reader button {
    background: #005ab7 !important;
    color: white !important;
    border-radius: 9999px !important;
    padding: 6px 12px !important;
    font-size: 11px !important;
  }
`}</style>
      {/* <style>{`
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
          object-fit: cover;
        }
        #qr-reader__dashboard_section {
          padding: 12px !important;
          background: #f2f4f6 !important;
        }
        #qr-reader button {
          background: #005ab7 !important;
          color: white !important;
          border-radius: 9999px !important;
          padding: 8px 16px !important;
          font-size: 12px !important;
          border: none !important;
        }
        #qr-reader select {
          background: #e6e8ea !important;
          border: none !important;
          border-radius: 8px !important;
          padding: 6px 12px !important;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.7; top: 0; }
          50% { opacity: 1; top: 100%; }
        }
        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style> */}
    </div>
  )
}
