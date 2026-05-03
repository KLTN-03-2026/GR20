// import { useState } from 'react'

// interface CreateGuestQRModalProps {
//   onClose: () => void
//   onSubmit: (data: { hostUserId: string; apartmentId: string; validTo: string }) => void
//   isLoading: boolean
// }

// export function CreateGuestQRModal({ onClose, onSubmit, isLoading }: CreateGuestQRModalProps) {
//   const [hostUserId, setHostUserId] = useState('')
//   const [apartmentId, setApartmentId] = useState('')
//   const [validTo, setValidTo] = useState('')

//   const handleSubmit = () => {
//     if (!hostUserId || !apartmentId || !validTo) {
//       alert('Vui lòng nhập đầy đủ thông tin')
//       return
//     }
//     onSubmit({ hostUserId, apartmentId, validTo: new Date(validTo).toISOString() })
//   }

//   return (
//     <div className='fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4'>
//       <div className='bg-white rounded-2xl max-w-md w-full'>
//         <div className='p-5 border-b'>
//           <h2 className='text-xl font-bold'>Tạo mã QR khách</h2>
//         </div>
//         <div className='p-5 space-y-4'>
//           <div>
//             <label className='block text-sm font-bold mb-2'>ID cư dân (hostUserId)</label>
//             <input
//               type='text'
//               value={hostUserId}
//               onChange={(e) => setHostUserId(e.target.value)}
//               className='w-full px-4 py-2 border rounded-lg'
//               placeholder='Nhập ID cư dân'
//             />
//           </div>
//           <div>
//             <label className='block text-sm font-bold mb-2'>ID căn hộ (apartmentId)</label>
//             <input
//               type='text'
//               value={apartmentId}
//               onChange={(e) => setApartmentId(e.target.value)}
//               className='w-full px-4 py-2 border rounded-lg'
//               placeholder='Nhập ID căn hộ'
//             />
//           </div>
//           <div>
//             <label className='block text-sm font-bold mb-2'>Ngày hết hạn</label>
//             <input
//               type='datetime-local'
//               value={validTo}
//               onChange={(e) => setValidTo(e.target.value)}
//               className='w-full px-4 py-2 border rounded-lg'
//             />
//           </div>
//         </div>
//         <div className='p-5 border-t flex justify-end gap-3'>
//           <button onClick={onClose} className='px-4 py-2 bg-gray-200 rounded-lg'>
//             Hủy
//           </button>
//           <button onClick={handleSubmit} className='px-4 py-2 bg-primary text-white rounded-lg' disabled={isLoading}>
//             {isLoading ? 'Đang...' : 'Tạo QR'}
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }

import { useState, useEffect } from 'react'

interface CreateGuestQRModalProps {
  onClose: () => void
  onSubmit: (data: { hostUserId: string; apartmentId: string; validTo: string }) => void
  isLoading: boolean
  defaultHostUserId?: string // 👈 Thêm prop
  defaultApartmentId?: string // 👈 Thêm prop
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

  // 👈 Cập nhật state khi props thay đổi (mỗi lần mở modal với dữ liệu khác)
  useEffect(() => {
    if (defaultHostUserId) setHostUserId(defaultHostUserId)
    if (defaultApartmentId) setApartmentId(defaultApartmentId)
  }, [defaultHostUserId, defaultApartmentId])

  const handleSubmit = () => {
    if (!hostUserId || !apartmentId || !validTo) {
      alert('Vui lòng nhập đầy đủ thông tin')
      return
    }
    onSubmit({ hostUserId, apartmentId, validTo: new Date(validTo).toISOString() })
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
              readOnly={!!defaultHostUserId} // 👈 Nếu có giá trị mặc định thì readonly
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
              readOnly={!!defaultApartmentId} // 👈 Nếu có giá trị mặc định thì readonly
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
