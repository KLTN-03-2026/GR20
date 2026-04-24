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
    <div className="bg-surface text-on-surface min-h-screen font-['Inter',sans-serif]">
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
          border: 3px solid #000666;
          border-radius: 20px;
          box-shadow: inset 0 0 30px rgba(0, 6, 102, 0.15), 0 0 20px rgba(0, 6, 102, 0.2);
          animation: scanPulse 2s ease-in-out infinite;
        }
        
        @keyframes scanPulse {
          0%, 100% { box-shadow: inset 0 0 30px rgba(0, 6, 102, 0.15), 0 0 20px rgba(0, 6, 102, 0.2); }
          50% { box-shadow: inset 0 0 50px rgba(0, 6, 102, 0.3), 0 0 40px rgba(0, 6, 102, 0.4); }
        }

        .fade-in {
          animation: fadeIn 0.5s ease-in;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .floating-card {
          background: #ffffff;
          border: 1px solid rgba(26, 35, 126, 0.1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .btn-primary {
          background: linear-gradient(135deg, #000666 0%, #1a237e 100%);
          color: white;
          transition: all 0.3s ease;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0, 6, 102, 0.2);
        }

        .btn-danger {
          background: linear-gradient(135deg, #ba1a1a 0%, #a01010 100%);
          color: white;
          transition: all 0.3s ease;
        }

        .btn-danger:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(186, 26, 26, 0.2);
        }

        .tab-active {
          color: #000666;
          border-bottom: 3px solid #000666;
        }

        .tab-inactive {
          color: #767683;
        }
      `}</style>

      <div className='flex flex-col min-h-screen'>
        {/* Main Content */}
        <main className='flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-8'>
          {/* Tab Navigation */}
          <div className='flex gap-2 mb-8 bg-surface-container-low p-1 rounded-full w-fit border border-outline/15'>
            {[
              { id: 'scan', label: 'Quét QR', icon: 'qr_code_scanner' },
              { id: 'upload', label: 'Tải ảnh', icon: 'cloud_upload' },
              { id: 'manual', label: 'Nhập mã', icon: 'keyboard' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 md:px-6 py-3 rounded-full font-semibold transition-all flex items-center gap-2 text-sm md:text-base ${
                  activeTab === tab.id ? 'btn-primary text-white shadow-md' : 'text-outline hover:text-on-surface'
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
                {/* Control Buttons */}
                {cameraActive && (
                  <div className='flex gap-3 justify-center sticky top-0 z-10 bg-gradient-to-b from-surface to-transparent py-4'>
                    <button
                      onClick={stopCamera}
                      className='btn-danger px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-md'
                    >
                      <span className='material-symbols-outlined'>stop_circle</span>
                      Dừng camera
                    </button>
                    <button
                      onClick={startCamera}
                      className='btn-primary px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-md'
                    >
                      <span className='material-symbols-outlined'>refresh</span>
                      Thử lại
                    </button>
                  </div>
                )}

                {/* Camera View - Offline */}
                {!cameraActive && !qrCodeRef.current && (
                  <div className='floating-card rounded-2xl overflow-hidden shadow-md'>
                    <div className='w-full aspect-square flex flex-col items-center justify-center space-y-6 bg-surface-container-low p-8'>
                      <span className='material-symbols-outlined text-7xl text-outline-variant'>videocam_off</span>
                      <p className='text-on-surface text-lg font-semibold'>Camera chưa được bật</p>
                      <button onClick={startCamera} className='btn-primary px-8 py-3 rounded-full font-bold shadow-md'>
                        Bật camera ngay
                      </button>
                    </div>
                  </div>
                )}

                {/* Camera View - Active */}
                <div
                  className={`floating-card rounded-2xl overflow-hidden shadow-md scanner-overlay relative ${
                    cameraActive ? 'block' : 'hidden'
                  }`}
                  style={{ display: cameraActive ? 'block' : 'none' }}
                >
                  <div id='qr-reader' className='w-full aspect-square'></div>
                </div>

                {/* Instructions */}
                {cameraActive && (
                  <div className='floating-card rounded-xl p-4 text-center'>
                    <p className='text-on-surface text-sm'>✨ Hướng camera vào mã QR để quét</p>
                  </div>
                )}
              </div>
            )}

            {/* Upload Section */}
            {activeTab === 'upload' && (
              <div className='space-y-6'>
                <div className='floating-card rounded-2xl p-12 border-2 border-dashed border-primary/30 hover:border-primary/60 transition-all hover:bg-surface-container-lowest'>
                  <label className='block cursor-pointer'>
                    <div className='flex flex-col items-center justify-center space-y-6'>
                      <div className='relative'>
                        <div className='absolute inset-0 bg-primary/10 blur-xl rounded-full animate-pulse'></div>
                        <span className='material-symbols-outlined text-8xl text-primary relative'>image</span>
                      </div>
                      <div className='text-center'>
                        <p className='text-2xl font-bold text-on-surface mb-2'>Tải ảnh QR Code</p>
                        <p className='text-on-surface text-base mb-4'>Chọn ảnh chứa mã QR từ máy tính của bạn</p>
                        <div className='flex flex-wrap gap-2 justify-center text-outline text-sm'>
                          <span className='px-3 py-1 bg-surface-container-low rounded-full'>PNG</span>
                          <span className='px-3 py-1 bg-surface-container-low rounded-full'>JPG</span>
                          <span className='px-3 py-1 bg-surface-container-low rounded-full'>JPEG</span>
                          <span className='px-3 py-1 bg-surface-container-low rounded-full'>WebP</span>
                        </div>
                      </div>
                      <div className='flex items-center gap-3'>
                        <button
                          type='button'
                          onClick={() => fileInputRef.current?.click()}
                          className='btn-primary px-8 py-4 rounded-full font-bold shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
                          disabled={uploading}
                        >
                          <span className='material-symbols-outlined'>upload_file</span>
                          {uploading ? 'Đang quét...' : 'Chọn ảnh từ máy tính'}
                        </button>
                      </div>
                      <p className='text-outline text-xs'>hoặc kéo thả ảnh vào đây</p>
                    </div>
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

                {/* Upload Tips */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='floating-card rounded-xl p-4 flex gap-3'>
                    <span className='material-symbols-outlined text-primary text-2xl flex-shrink-0'>info</span>
                    <div>
                      <p className='font-bold text-on-surface text-sm'>Ảnh rõ ràng</p>
                      <p className='text-outline text-xs mt-1'>Đảm bảo mã QR không bị mờ hoặc bị che khuất</p>
                    </div>
                  </div>
                  <div className='floating-card rounded-xl p-4 flex gap-3'>
                    <span className='material-symbols-outlined text-primary text-2xl flex-shrink-0'>
                      brightness_high
                    </span>
                    <div>
                      <p className='font-bold text-on-surface text-sm'>Ánh sáng tốt</p>
                      <p className='text-outline text-xs mt-1'>Chụp trong điều kiện ánh sáng đủ để quét tốt</p>
                    </div>
                  </div>
                  <div className='floating-card rounded-xl p-4 flex gap-3'>
                    <span className='material-symbols-outlined text-primary text-2xl flex-shrink-0'>
                      center_focus_strong
                    </span>
                    <div>
                      <p className='font-bold text-on-surface text-sm'>Căn chỉnh mã</p>
                      <p className='text-outline text-xs mt-1'>Mã QR nên là đối tượng chính trong ảnh</p>
                    </div>
                  </div>
                  <div className='floating-card rounded-xl p-4 flex gap-3'>
                    <span className='material-symbols-outlined text-primary text-2xl flex-shrink-0'>check_circle</span>
                    <div>
                      <p className='font-bold text-on-surface text-sm'>Định dạng hỗ trợ</p>
                      <p className='text-outline text-xs mt-1'>PNG, JPG, JPEG, WebP - tối đa 10MB</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Manual Entry */}
            {activeTab === 'manual' && (
              <div className='floating-card rounded-2xl p-8 md:p-12 shadow-md max-w-md mx-auto'>
                <div className='space-y-6'>
                  <div className='text-center'>
                    <span className='material-symbols-outlined text-7xl text-primary block mb-2'>keyboard</span>
                    <h2 className='text-xl font-bold text-on-surface'>Nhập mã thủ công</h2>
                    <p className='text-outline text-sm mt-2'>Sử dụng mã định danh in dưới QR</p>
                  </div>
                  <form onSubmit={handleManualInput} className='space-y-4'>
                    <input
                      name='qrCode'
                      type='text'
                      placeholder='HL-XXXX-XXXX'
                      className='w-full bg-surface-container-low border border-outline/20 rounded-xl px-4 py-3 text-on-surface placeholder-outline/50 focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono'
                    />
                    <button
                      type='submit'
                      className='w-full btn-primary py-3 rounded-full font-bold shadow-md flex items-center justify-center gap-2'
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
                  className='floating-card rounded-xl p-6 space-y-3 hover:border-primary/30 hover:shadow-md transition-all'
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className='flex items-center justify-between'>
                    <span className='material-symbols-outlined text-3xl text-primary'>{step.icon}</span>
                    <span className='text-primary font-bold text-lg'>{step.number}</span>
                  </div>
                  <div>
                    <h3 className='font-bold text-on-surface'>{step.title}</h3>
                    <p className='text-outline text-sm'>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Footer AI Info */}
        <div className='border-t border-outline/20 bg-surface-container-low mt-12'>
          <div className='max-w-7xl mx-auto px-4 md:px-6 py-6'>
            <div className='floating-card rounded-xl p-4 flex items-start gap-3'>
              <span className='material-symbols-outlined text-2xl text-primary flex-shrink-0'>smart_toy</span>
              <div>
                <p className='font-bold text-on-surface text-sm'>AI Smart Link</p>
                <p className='text-outline text-xs mt-1'>
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
