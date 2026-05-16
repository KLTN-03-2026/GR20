import { useState } from 'react'
import { toast } from 'react-toastify'
import { QRCodeApi } from 'src/apis/QrcodeApi/Qr.api'

interface ChangePinModalProps {
  onClose: () => void
  qrCode: string
  qrType: 'guest' | 'personal'
  onSuccess: () => void
}

export function ChangePinModal({ onClose, qrCode, qrType, onSuccess }: ChangePinModalProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)

  // Gửi yêu cầu reset PIN qua email
  const handleRequestReset = async () => {
    if (!email) {
      toast.error('Vui lòng nhập email đăng ký')
      return
    }

    setIsLoading(true)
    try {
      const response = await QRCodeApi.requestPinReset(email, qrCode)
      if (response.data?.code === 'OK') {
        setIsEmailSent(true)
        toast.success('Email đặt lại PIN đã được gửi!')
      } else {
        toast.error(response.data?.message || 'Gửi email thất bại')
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className='fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4'
      onClick={onClose}
    >
      <div className='bg-surface rounded-2xl max-w-md w-full shadow-2xl' onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className='p-6 border-b border-outline-variant/10 flex justify-between items-center'>
          <div className='flex items-center gap-2'>
            <span className='material-symbols-outlined text-primary text-2xl'>pin</span>
            <h2 className='text-xl font-bold text-on-surface'>Đổi mã PIN</h2>
          </div>
          <button
            onClick={onClose}
            className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors'
          >
            <span className='material-symbols-outlined text-on-surface-variant text-xl'>close</span>
          </button>
        </div>

        {/* Body */}
        <div className='p-6 space-y-5'>
          {!isEmailSent ? (
            <>
              <div className='text-center mb-2'>
                <div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3'>
                  <span className='material-symbols-outlined text-3xl text-primary'>mail</span>
                </div>
                <p className='text-sm text-on-surface-variant'>
                  Nhập email đăng ký của bạn. Chúng tôi sẽ gửi link để đặt lại PIN.
                </p>
              </div>
              <div>
                <label className='block text-sm font-medium text-on-surface-variant mb-1'>Email đăng ký</label>
                <input
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder='example@homelink.com'
                  className='w-full px-4 py-2.5 border border-outline-variant/30 rounded-xl bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors'
                  autoFocus
                />
              </div>
              <div className='bg-blue-50 rounded-xl p-3 text-xs text-blue-700 flex items-start gap-2'>
                <span className='material-symbols-outlined text-sm flex-shrink-0'>info</span>
                <span>Email phải trùng với tài khoản đã đăng ký trong hệ thống</span>
              </div>
            </>
          ) : (
            <>
              <div className='text-center'>
                <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                  <span className='material-symbols-outlined text-3xl text-green-600'>mail</span>
                </div>
                <h3 className='text-lg font-bold text-on-surface mb-2'>Kiểm tra email của bạn</h3>
                <p className='text-sm text-on-surface-variant'>Chúng tôi đã gửi link đặt lại PIN đến</p>
                <p className='text-sm font-semibold text-primary mt-1 break-all'>{email}</p>
                <div className='bg-yellow-50 rounded-xl p-3 mt-4 text-xs text-yellow-700 flex items-start gap-2'>
                  <span className='material-symbols-outlined text-sm flex-shrink-0'>mail</span>
                  <span>Vui lòng kiểm tra email (cả thư mục Spam) và click vào link trong email để đặt lại PIN.</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className='p-6 pt-0 flex gap-3'>
          {!isEmailSent ? (
            <>
              <button
                onClick={onClose}
                className='flex-1 py-2.5 rounded-xl border border-outline-variant/30 text-on-surface-variant font-medium hover:bg-surface-container transition-colors'
              >
                Hủy
              </button>
              <button
                onClick={handleRequestReset}
                disabled={isLoading || !email}
                className='flex-1 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
              >
                {isLoading ? (
                  <div className='animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent'></div>
                ) : (
                  <>
                    <span className='material-symbols-outlined text-lg'>send</span>
                    Gửi email
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setIsEmailSent(false)
                  setEmail('')
                }}
                className='flex-1 py-2.5 rounded-xl border border-outline-variant/30 text-on-surface-variant font-medium hover:bg-surface-container transition-colors'
              >
                Gửi lại email
              </button>
              <button
                onClick={() => {
                  // Mở Gmail trong tab mới
                  window.open('https://mail.google.com', '_blank')
                }}
                className='flex-1 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2'
              >
                <span className='material-symbols-outlined text-lg'>open_in_new</span>
                Mở Gmail
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
