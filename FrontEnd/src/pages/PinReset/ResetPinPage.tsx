// src/pages/ResetPinPage.tsx
import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { QRCodeApi } from 'src/apis/QrcodeApi/Qr.api'
import { toast } from 'react-toastify'

export default function ResetPinPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const token = searchParams.get('token')
  const qrCode = searchParams.get('qrCode')
  const type = searchParams.get('type')

  const [newPin, setNewPin] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      toast.error('Token không hợp lệ')
      navigate('/')
    }
  }, [token, navigate])

  const handleResetPin = async () => {
    if (!newPin || newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      toast.error('Vui lòng nhập mã PIN gồm 4 chữ số')
      return
    }

    setIsLoading(true)
    try {
      const response = await QRCodeApi.resetPin(token!, newPin)
      if (response.data?.code === 'OK') {
        setIsSuccess(true)
        toast.success('Đổi PIN thành công!')
        // setTimeout(() => {
        //   navigate('/qrcode-me')
        // }, 2000)
      } else {
        toast.error(response.data?.message || 'Đổi PIN thất bại')
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className='min-h-screen bg-surface flex items-center justify-center p-4'>
        <div className='bg-surface-container-lowest rounded-2xl p-8 max-w-md w-full text-center'>
          <span className='material-symbols-outlined text-6xl text-green-500 mb-4'>check_circle</span>
          <h2 className='text-2xl font-bold text-on-surface mb-2'>Đổi PIN thành công!</h2>
          <p className='text-on-surface-variant mb-2'>Mã PIN mới của bạn là:</p>
          <p className='text-3xl font-bold text-primary tracking-widest mb-6'>{newPin}</p>
          <button
            onClick={() => navigate('/viewQrcodeMe')}
            className='w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors'
          >
            Về trang cá nhân
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-surface flex items-center justify-center p-4'>
      <div className='bg-surface-container-lowest rounded-2xl p-8 max-w-md w-full shadow-lg'>
        <div className='text-center mb-6'>
          <div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4'>
            <span className='material-symbols-outlined text-3xl text-primary'>pin</span>
          </div>
          <h2 className='text-2xl font-bold text-on-surface'>Đặt lại mã PIN</h2>
          <p className='text-sm text-on-surface-variant mt-2'>
            Mã QR:{' '}
            <span className='font-mono text-xs bg-surface-container-high px-2 py-1 rounded'>{qrCode?.slice(-16)}</span>
          </p>
          <p className='text-xs text-on-surface-variant mt-1'>
            Loại: {type === 'personal' ? 'QR Cá nhân' : 'QR Khách'}
          </p>
        </div>

        <div className='space-y-5'>
          <div>
            <label className='block text-sm font-medium text-on-surface-variant mb-2'>Mã PIN mới (4 số)</label>
            <input
              type='text'
              value={newPin}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 4)
                setNewPin(val)
              }}
              placeholder='Nhập 4 số'
              maxLength={4}
              className='w-full px-4 py-3 text-center text-2xl tracking-[8px] font-mono border border-outline-variant/30 rounded-xl bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors'
              autoFocus
            />
          </div>

          <button
            onClick={handleResetPin}
            disabled={isLoading || newPin.length !== 4}
            className='w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
          >
            {isLoading ? (
              <div className='animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent'></div>
            ) : (
              <>
                <span className='material-symbols-outlined text-base'>check_circle</span>
                Xác nhận đặt lại PIN
              </>
            )}
          </button>
        </div>

        <p className='text-center text-xs text-on-surface-variant mt-6'>Mã PIN mới sẽ được cập nhật ngay lập tức</p>
      </div>
    </div>
  )
}
