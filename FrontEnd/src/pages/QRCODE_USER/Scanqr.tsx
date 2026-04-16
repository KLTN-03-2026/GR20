// src/pages/ScanQr/ScanQr.tsx
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { qrApi } from 'src/apis/QRCODE/Qr.api'

export default function ScanQr() {
  // const { qrCode } = useParams<{ qrCode: string }>()
  const a: number = 9
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['scanQr'],
    queryFn: () => qrApi.scanQr(a),
    // enabled: !!qrCode,
    retry: false
  })

  const qrDetail = data?.data.data

  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const isExpired = qrDetail ? new Date() > new Date(qrDetail.validTo) : false
  const isUsedUp = qrDetail ? qrDetail.remainingEntries <= 0 : false
  const isValid = qrDetail?.status === 'ACTIVE' && !isExpired && !isUsedUp

  // Loading
  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4' />
          <p className='text-gray-500 font-medium'>Đang kiểm tra QR...</p>
        </div>
      </div>
    )
  }

  // Error
  if (isError) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
        <div className='bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center'>
          <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <span className='material-symbols-outlined text-red-500 text-3xl'>error</span>
          </div>
          <h2 className='text-xl font-bold text-gray-900 mb-2'>QR Không Hợp Lệ</h2>
          <p className='text-gray-500 text-sm'>
            {(error as any)?.response?.data?.message || 'Mã QR không tồn tại hoặc đã hết hạn'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
      <div className='bg-white rounded-2xl shadow-lg max-w-sm w-full overflow-hidden'>
        {/* Header Status */}
        <div className={`p-6 text-center ${isValid ? 'bg-green-500' : 'bg-red-500'}`}>
          <div className='w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3'>
            <span className='material-symbols-outlined text-white text-3xl'>{isValid ? 'check_circle' : 'cancel'}</span>
          </div>
          <h2 className='text-white font-bold text-xl'>{isValid ? 'QR Hợp Lệ' : 'QR Không Hợp Lệ'}</h2>
          <p className='text-white/80 text-sm mt-1'>
            {isExpired ? 'QR đã hết hạn' : isUsedUp ? 'QR đã dùng hết lượt' : 'Được phép vào'}
          </p>
        </div>

        {/* ✅ HIỂN THỊ QR IMAGE TỪ API */}
        {qrDetail?.qrImage && (
          <div className='flex justify-center py-6 border-b border-gray-100'>
            <img src={qrDetail.qrImage} alt='QR Code' className='w-48 h-48 object-contain' />
          </div>
        )}

        {/* Thông tin khách */}
        <div className='p-6 space-y-4'>
          {/* Tên khách */}
          <div className='flex items-center gap-3 p-4 bg-gray-50 rounded-xl'>
            <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0'>
              <span className='material-symbols-outlined text-blue-600 text-xl'>person</span>
            </div>
            <div>
              <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>Tên khách</p>
              <p className='font-semibold text-gray-900'>{qrDetail?.visitor.name}</p>
            </div>
          </div>

          {/* Số điện thoại */}
          <div className='flex items-center gap-3 p-4 bg-gray-50 rounded-xl'>
            <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0'>
              <span className='material-symbols-outlined text-blue-600 text-xl'>call</span>
            </div>
            <div>
              <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>Số điện thoại</p>
              <p className='font-semibold text-gray-900'>{qrDetail?.visitor.phone}</p>
            </div>
          </div>

          {/* Thăm căn hộ */}
          <div className='flex items-center gap-3 p-4 bg-gray-50 rounded-xl'>
            <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0'>
              <span className='material-symbols-outlined text-blue-600 text-xl'>apartment</span>
            </div>
            <div>
              <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>Thăm căn hộ</p>
              <p className='font-semibold text-gray-900'>{qrDetail?.apartmentCode}</p>
            </div>
          </div>

          {/* Chủ nhà */}
          <div className='flex items-center gap-3 p-4 bg-gray-50 rounded-xl'>
            <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0'>
              <span className='material-symbols-outlined text-blue-600 text-xl'>home</span>
            </div>
            <div>
              <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>Chủ nhà</p>
              <p className='font-semibold text-gray-900'>{qrDetail?.hostName}</p>
            </div>
          </div>

          {/* Hiệu lực */}
          <div className='flex items-center gap-3 p-4 bg-gray-50 rounded-xl'>
            <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0'>
              <span className='material-symbols-outlined text-blue-600 text-xl'>schedule</span>
            </div>
            <div>
              <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>Hiệu lực đến</p>
              <p className='font-semibold text-gray-900'>{qrDetail?.validTo ? formatDate(qrDetail.validTo) : '---'}</p>
            </div>
          </div>

          {/* Số lần còn lại */}
          <div className='flex items-center gap-3 p-4 bg-gray-50 rounded-xl'>
            <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0'>
              <span className='material-symbols-outlined text-blue-600 text-xl'>confirmation_number</span>
            </div>
            <div>
              <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>Số lần còn lại</p>
              <p className='font-semibold text-gray-900'>
                {qrDetail?.remainingEntries}/{qrDetail?.maxEntries} lần
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='px-6 pb-6'>
          <p className='text-center text-[10px] text-gray-400 font-medium tracking-widest uppercase'>
            Homelink AI — Hệ thống quản lý tòa nhà
          </p>
        </div>
      </div>
    </div>
  )
}
