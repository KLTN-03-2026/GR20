import { useState, useEffect } from 'react'

interface CreateGuestQRModalProps {
  onClose: () => void
  onSubmit: (data: {
    hostUserId: string
    apartmentId: string
    validTo: string
    visitorName: string
    visitorPhone: string
    pinCode?: string
  }) => void
  isLoading: boolean
  defaultHostUserId?: string
  defaultApartmentId?: string
}

export function CreateGuestQRModal({
  onClose,
  onSubmit,
  isLoading,
  defaultHostUserId,
  defaultApartmentId
}: CreateGuestQRModalProps) {
  const [hostUserId, setHostUserId] = useState(defaultHostUserId || '')
  const [apartmentId, setApartmentId] = useState(defaultApartmentId || '')
  const [validTo, setValidTo] = useState('')
  const [visitorName, setVisitorName] = useState('')
  const [visitorPhone, setVisitorPhone] = useState('')
  const [pinCode, setPinCode] = useState('') // 👈 THÊM STATE PIN

  useEffect(() => {
    if (defaultHostUserId) setHostUserId(defaultHostUserId)
    if (defaultApartmentId) setApartmentId(defaultApartmentId)
  }, [defaultHostUserId, defaultApartmentId])

  useEffect(() => {
    if (!validTo) {
      const defaultDate = new Date()
      defaultDate.setDate(defaultDate.getDate() + 30)
      setValidTo(defaultDate.toISOString().slice(0, 16))
    }
  }, [])

  const handleSubmit = () => {
    if (!hostUserId || !apartmentId || !validTo) {
      alert('Vui lòng nhập đầy đủ thông tin')
      return
    }
    if (!visitorName) {
      alert('Vui lòng nhập tên khách')
      return
    }

    onSubmit({
      hostUserId,
      apartmentId,
      validTo: new Date(validTo).toISOString(),
      visitorName,
      visitorPhone,
      pinCode: pinCode || undefined // 👈 THÊM PIN
    })
  }

  return (
    <div className='fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4'>
      <div className='bg-white rounded-2xl max-w-md w-full'>
        <div className='p-5 border-b'>
          <h2 className='text-xl font-bold'>Tạo mã QR khách</h2>
          <p className='text-sm text-gray-500 mt-1'>
            {defaultHostUserId && defaultApartmentId
              ? `Tạo QR cho cư dân ID: ${defaultHostUserId} - Căn hộ: ${defaultApartmentId}`
              : 'Nhập thông tin cư dân'}
          </p>
        </div>
        <div className='p-5 space-y-4'>
          <div>
            <label className='block text-sm font-bold mb-2'>ID cư dân (hostUserId)</label>
            <input
              type='text'
              value={hostUserId}
              onChange={(e) => setHostUserId(e.target.value)}
              className='w-full px-4 py-2 border rounded-lg'
              placeholder='Nhập ID cư dân'
              readOnly={!!defaultHostUserId}
            />
          </div>
          <div>
            <label className='block text-sm font-bold mb-2'>ID căn hộ (apartmentId)</label>
            <input
              type='text'
              value={apartmentId}
              onChange={(e) => setApartmentId(e.target.value)}
              className='w-full px-4 py-2 border rounded-lg'
              placeholder='Nhập ID căn hộ'
              readOnly={!!defaultApartmentId}
            />
          </div>
          <div>
            <label className='block text-sm font-bold mb-2'>Tên khách</label>
            <input
              type='text'
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
              className='w-full px-4 py-2 border rounded-lg'
              placeholder='Nhập tên khách'
            />
          </div>
          <div>
            <label className='block text-sm font-bold mb-2'>Số điện thoại khách</label>
            <input
              type='text'
              value={visitorPhone}
              onChange={(e) => setVisitorPhone(e.target.value)}
              className='w-full px-4 py-2 border rounded-lg'
              placeholder='Nhập số điện thoại'
            />
          </div>
          <div>
            <label className='block text-sm font-bold mb-2'>Ngày hết hạn</label>
            <input
              type='datetime-local'
              value={validTo}
              onChange={(e) => setValidTo(e.target.value)}
              className='w-full px-4 py-2 border rounded-lg'
            />
          </div>
          {/* 👉 THÊM Ô NHẬP PIN */}
          <div>
            <label className='block text-sm font-bold mb-2'>Mã PIN (4 số - tùy chọn)</label>
            <input
              type='text'
              maxLength={4}
              pattern='[0-9]{4}'
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value.replace(/[^0-9]/g, ''))}
              className='w-full px-4 py-2 border rounded-lg'
              placeholder='Nhập 4 số (để trống nếu không dùng PIN)'
            />
            <p className='text-xs text-gray-500 mt-1'>* Nếu để trống, QR sẽ không yêu cầu PIN</p>
          </div>
        </div>
        <div className='p-5 border-t flex justify-end gap-3'>
          <button onClick={onClose} className='px-4 py-2 bg-gray-200 rounded-lg'>
            Hủy
          </button>
          <button onClick={handleSubmit} className='px-4 py-2 bg-primary text-white rounded-lg' disabled={isLoading}>
            {isLoading ? 'Đang...' : 'Tạo QR'}
          </button>
        </div>
      </div>
    </div>
  )
}
