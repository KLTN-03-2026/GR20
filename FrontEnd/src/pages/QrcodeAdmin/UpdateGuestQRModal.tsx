import { useState } from 'react'
import type { ListQRGuest } from 'src/types/qrcode.type'

interface UpdateGuestQRModalProps {
  guestQR: ListQRGuest
  onClose: () => void
  onSubmit: (data: { validTo: string; status: string }) => void
  isLoading: boolean
}

export function UpdateGuestQRModal({ guestQR, onClose, onSubmit, isLoading }: UpdateGuestQRModalProps) {
  const [validTo, setValidTo] = useState(guestQR.valid_to.slice(0, 16))
  const [status, setStatus] = useState(guestQR.status)

  return (
    <div className='fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4'>
      <div className='bg-white rounded-2xl max-w-md w-full'>
        <div className='p-5 border-b'>
          <h2 className='text-xl font-bold'>Cập nhật mã QR khách</h2>
          <p className='text-sm mt-1 text-gray-500'>
            Khách: {guestQR.visitor_name || 'Chưa có tên'} - {guestQR.apartment_code}
          </p>
        </div>
        <div className='p-5 space-y-4'>
          <div>
            <label className='block text-sm font-bold mb-2'>Ngày hết hạn</label>
            <input
              type='datetime-local'
              value={validTo}
              onChange={(e) => setValidTo(e.target.value)}
              className='w-full px-4 py-2 border rounded-lg'
            />
          </div>
          <div>
            <label className='block text-sm font-bold mb-2'>Trạng thái</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className='w-full px-4 py-2 border rounded-lg'
            >
              <option value='ACTIVE'>Hoạt động</option>
              <option value='EXPIRED'>Hết hạn</option>
              <option value='REVOKED'>Đã thu hồi</option>
            </select>
          </div>
        </div>
        <div className='p-5 border-t flex justify-end gap-3'>
          <button onClick={onClose} className='px-4 py-2 bg-gray-200 rounded-lg'>
            Hủy
          </button>
          <button
            onClick={() => onSubmit({ validTo: new Date(validTo).toISOString(), status })}
            className='px-4 py-2 bg-primary text-white rounded-lg'
            disabled={isLoading}
          >
            {isLoading ? 'Đang...' : 'Cập nhật'}
          </button>
        </div>
      </div>
    </div>
  )
}
