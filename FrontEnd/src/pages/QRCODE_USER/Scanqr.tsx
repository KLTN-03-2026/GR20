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
    if (isProcessingRef.current) {
      console.log('⚠️ Already processing, skipping duplicate call')
      return
    }

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
      console.log('🔍 Scan result:', result)

      // REQUIRE_PIN
      if (result?.code === 'REQUIRE_PIN') {
        setPendingQrCode(qrCode)
        setPendingScanData(result.data)
        setShowPinDialog(true)
        setPinCode('')
        setPinError('')
        isProcessingRef.current = false
        return
      }

      // 👉 KIỂM TRA NẾU VỪA HẾT LƯỢT SAU KHI QUÉT (ĐÃ SỬA)
      const isOutOfEntries =
        result?.data?.qrType === 'guest' &&
        result?.data?.usedEntries !== undefined &&
        result?.data?.maxEntries !== undefined &&
        result?.data?.usedEntries >= result?.data?.maxEntries &&
        result?.data?.maxEntries > 0

      // Thành công
      if (result?.code === 'OK') {
        if (isOutOfEntries) {
          // Vẫn navigate nhưng đánh dấu là đã hết lượt
          toast.warning(`⚠️ Đã quét thành công! Đây là lượt cuối cùng. QR sẽ hết hiệu lực.`)
          // Lưu thông báo để result page không polling
          sessionStorage.setItem(
            'qrOutOfEntries', // 👈 DÙNG KEY NÀY ĐỂ ResultPage ĐỌC
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

      // Xử lý các trường hợp lỗi
      const errorMessage = result?.message || ''
      let errorType = 'unknown'

      if (errorMessage.includes('hết hạn') || result?.data?.status === 'EXPIRED') {
        errorType = 'expired'
        toast.error('❌ QR đã hết hạn! Vui lòng yêu cầu cấp mã mới.')
      } else if (errorMessage.includes('thu hồi') || result?.data?.status === 'REVOKED') {
        errorType = 'revoked'
        toast.error('❌ QR đã bị thu hồi! Vui lòng liên hệ chủ căn hộ.')
      } else if (errorMessage.includes('hết số lần') || errorMessage.includes('hết lượt')) {
        errorType = 'out_of_entries'
        toast.error('❌ QR đã hết lượt sử dụng! Vui lòng yêu cầu cấp mã mới hoặc gia hạn.')
      } else if (errorMessage) {
        toast.error(errorMessage)
      } else {
        toast.error('QR không hợp lệ')
      }

      // Lưu thông tin lỗi
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
      console.error('Scan error:', error)

      const errorMessage = error?.response?.data?.message || error?.message || 'Lỗi khi quét QR'

      if (errorMessage.includes('hết hạn')) {
        toast.error('❌ QR đã hết hạn!')
      } else if (errorMessage.includes('thu hồi')) {
        toast.error('❌ QR đã bị thu hồi!')
      } else if (errorMessage.includes('hết số lần')) {
        toast.error('❌ QR đã hết lượt sử dụng!')
      } else {
        toast.error(errorMessage)
      }

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

  // const handleVerifyPin = async () => {
  //   if (!pendingQrCode) return
  //   if (!pinCode || pinCode.length !== 4) {
  //     setPinError('Vui lòng nhập mã PIN 4 số')
  //     return
  //   }

  //   setPinLoading(true)
  //   try {
  //     const response = await QRCodeApi.scanVerifyPin(pendingQrCode, pinCode, {
  //       scanMetadata: {
  //         direction: direction,
  //         gate: 'Cổng chính',
  //         buildingId: pendingScanData?.buildingId || null
  //       }
  //     })

  //     if (response?.data?.code === 'OK') {
  //       toast.success('Xác thực PIN thành công! Mở cửa...')

  //       if (pendingScanData) {
  //         sessionStorage.setItem('pendingScanData', JSON.stringify(pendingScanData))
  //         sessionStorage.setItem('pendingQrCode', pendingQrCode)
  //       }

  //       setShowPinDialog(false)
  //       navigate(`/result/${encodeURIComponent(pendingQrCode)}?direction=${direction}&pinVerified=true`)
  //     } else {
  //       setPinError(response?.data?.message || 'Mã PIN không đúng')
  //       setPinCode('')
  //     }
  //   } catch (error: any) {
  //     setPinError(error?.response?.data?.message || 'Lỗi xác thực PIN')
  //     setPinCode('')
  //   } finally {
  //     setPinLoading(false)
  //   }
  // }

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
        toast.success('Xác thực PIN thành công! Mở cửa...')

        // 👉 LẤY DỮ LIỆU MỚI TỪ RESPONSE
        const newQrData = response.data.data?.qrData

        if (newQrData) {
          // 👉 CẬP NHẬT pendingScanData VỚI DỮ LIỆU MỚI (đã tăng used_entries)
          const updatedScanData = {
            ...pendingScanData,
            usedEntries: newQrData.usedEntries,
            maxEntries: newQrData.maxEntries,
            remainingEntries: newQrData.remainingEntries
            // Các field khác giữ nguyên
          }
          sessionStorage.setItem('pendingScanData', JSON.stringify(updatedScanData))
          sessionStorage.setItem('pendingQrCode', pendingQrCode)
        } else {
          // Fallback: giữ nguyên dữ liệu cũ
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

  return (
    <>
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

          .btn-direction {
            transition: all 0.3s ease;
          }

          .btn-in {
            background: linear-gradient(135deg, #059669 0%, #10b981 100%);
            color: white;
          }

          .btn-in-active {
            background: linear-gradient(135deg, #047857 0%, #059669 100%);
            box-shadow: 0 4px 15px rgba(5, 150, 105, 0.3);
            transform: scale(1.02);
          }

          .btn-out {
            background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
            color: white;
          }

          .btn-out-active {
            background: linear-gradient(135deg, #c2410c 0%, #ea580c 100%);
            box-shadow: 0 4px 15px rgba(234, 88, 12, 0.3);
            transform: scale(1.02);
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
          <main className='flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-8'>
            {/* Direction Selection */}
            <div className='flex gap-4 mb-8 justify-center'>
              <button
                onClick={() => setDirection('IN')}
                className={`px-8 py-3 rounded-full font-bold text-lg transition-all flex items-center gap-2 ${
                  direction === 'IN'
                    ? 'btn-in btn-in-active'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-green-50'
                }`}
              >
                <span className='material-symbols-outlined'>login</span>
                VÀO
              </button>
              <button
                onClick={() => setDirection('OUT')}
                className={`px-8 py-3 rounded-full font-bold text-lg transition-all flex items-center gap-2 ${
                  direction === 'OUT'
                    ? 'btn-out btn-out-active'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-orange-50'
                }`}
              >
                <span className='material-symbols-outlined'>logout</span>
                RA
              </button>
            </div>

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

                  {!cameraActive && !qrCodeRef.current && (
                    <div className='floating-card rounded-2xl overflow-hidden shadow-md'>
                      <div className='w-full aspect-square flex flex-col items-center justify-center space-y-6 bg-surface-container-low p-8'>
                        <span className='material-symbols-outlined text-7xl text-outline-variant'>videocam_off</span>
                        <p className='text-on-surface text-lg font-semibold'>Camera chưa được bật</p>
                        <button
                          onClick={startCamera}
                          className='btn-primary px-8 py-3 rounded-full font-bold shadow-md'
                        >
                          Bật camera ngay
                        </button>
                      </div>
                    </div>
                  )}

                  <div
                    className={`floating-card rounded-2xl overflow-hidden shadow-md scanner-overlay relative ${
                      cameraActive ? 'block' : 'hidden'
                    }`}
                    style={{ display: cameraActive ? 'block' : 'none' }}
                  >
                    <div id='qr-reader' className='w-full aspect-square'></div>
                  </div>

                  {cameraActive && (
                    <div className='floating-card rounded-xl p-4 text-center'>
                      <p className='text-on-surface text-sm'>
                        ✨ Hướng camera vào mã QR để quét{' '}
                        <span className='font-bold text-primary'>{direction === 'IN' ? 'VÀO' : 'RA'}</span>
                      </p>
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
                      <span className='material-symbols-outlined text-primary text-2xl flex-shrink-0'>
                        check_circle
                      </span>
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

          <div className='border-t border-outline/20 bg-surface-container-low mt-12'>
            <div className='max-w-7xl mx-auto px-4 md:px-6 py-6'>
              <div className='floating-card rounded-xl p-4 flex items-start gap-3'>
                <span className='material-symbols-outlined text-2xl text-primary flex-shrink-0'>smart_toy</span>
                <div>
                  <p className='font-bold text-on-surface text-sm'>AI Smart Link</p>
                  <p className='text-outline text-xs mt-1'>
                    Homelink AI đang chờ nhận diện tín hiệu. Quét mã QR sẽ tự động ghi nhận{' '}
                    <span className='font-bold'>{direction === 'IN' ? 'VÀO' : 'RA'}</span>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 👉 PIN DIALOG MODAL */}
      {showPinDialog && (
        <div className='fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4'>
          <div className='bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl'>
            <div className='bg-gradient-to-r from-primary to-primary-container p-6 text-white'>
              <div className='flex items-center gap-3'>
                <span className='material-symbols-outlined text-3xl'>lock</span>
                <div>
                  <h2 className='text-xl font-bold'>Xác thực mã PIN</h2>
                  <p className='text-white/80 text-sm mt-1'>
                    {pendingScanData?.qrType === 'guest'
                      ? `Khách: ${pendingScanData?.visitorName || 'Không xác định'}`
                      : `Cư dân: ${pendingScanData?.userName || 'Không xác định'}`}
                    {' - '}
                    Căn {pendingScanData?.apartmentCode || 'N/A'}
                  </p>
                  {pendingScanData?.pinFailedCount !== undefined && (
                    <p className='text-white/70 text-xs mt-1'>
                      Còn {pendingScanData.maxPinAttempts - pendingScanData.pinFailedCount} lần thử
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className='p-6'>
              <p className='text-on-surface-variant text-sm mb-4'>
                Vui lòng yêu cầu cư dân cung cấp mã PIN 4 số để xác thực
              </p>

              <div className='mb-6'>
                <div className='flex justify-center gap-3 mb-2'>
                  {[...Array(4)].map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-bold font-mono
                        ${
                          pinCode[idx]
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-outline-variant/30 text-outline'
                        }`}
                    >
                      {pinCode[idx] || '•'}
                    </div>
                  ))}
                </div>

                {/* PinPad số */}
                <div className='grid grid-cols-3 gap-3 mt-6'>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                      key={num}
                      onClick={() => setPinCode((prev) => (prev.length < 4 ? prev + num : prev))}
                      className='bg-surface-container-low py-4 rounded-xl text-2xl font-bold text-on-surface hover:bg-surface-container transition-colors'
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    onClick={() => setPinCode((prev) => prev.slice(0, -1))}
                    className='bg-surface-container-low py-4 rounded-xl text-xl text-on-surface hover:bg-surface-container flex items-center justify-center'
                  >
                    <span className='material-symbols-outlined'>backspace</span>
                  </button>
                  <button
                    onClick={() => setPinCode((prev) => (prev.length < 4 ? prev + '0' : prev))}
                    className='bg-surface-container-low py-4 rounded-xl text-2xl font-bold text-on-surface hover:bg-surface-container'
                  >
                    0
                  </button>
                  <button
                    onClick={() => setPinCode('')}
                    className='bg-surface-container-low py-4 rounded-xl text-sm text-error hover:bg-surface-container'
                  >
                    Xóa
                  </button>
                </div>
              </div>

              {pinError && (
                <div className='mb-4 p-3 bg-red-50 rounded-xl text-error text-sm text-center flex items-center justify-center gap-2'>
                  <span className='material-symbols-outlined text-sm'>error</span>
                  {pinError}
                </div>
              )}

              <div className='flex gap-3'>
                <button
                  onClick={() => {
                    setShowPinDialog(false)
                    setPendingQrCode(null)
                    setPinCode('')
                    setPinError('')
                    hasScannedRef.current = false
                    startCamera()
                  }}
                  className='flex-1 py-3 rounded-xl border border-outline-variant text-on-surface-variant font-medium hover:bg-surface-container-low transition-colors'
                >
                  Hủy
                </button>
                <button
                  onClick={handleVerifyPin}
                  disabled={pinLoading || pinCode.length !== 4}
                  className='flex-1 btn-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {pinLoading ? (
                    <>
                      <span className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent'></span>
                      Đang xác thực...
                    </>
                  ) : (
                    <>
                      <span className='material-symbols-outlined'>check_circle</span>
                      Xác nhận
                    </>
                  )}
                </button>
              </div>

              <p className='text-center text-outline text-xs mt-4'>
                * Mã PIN là mã bí mật của cư dân, không chia sẻ cho người khác
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
