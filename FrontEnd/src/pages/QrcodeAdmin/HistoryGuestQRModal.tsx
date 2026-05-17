// // src/pages/Admin/QrcodeManagement/HistoryGuestQRModal.tsx
// import { useQuery, keepPreviousData } from '@tanstack/react-query'
// import { useState } from 'react'
// import { toast } from 'react-toastify'
// import { qrApiAdmin } from 'src/apis/QrcodeAdmin/QrcodeAdmin.api'
// import { useDebounce } from 'src/hooks/useDebounce'
// import type { ListQRGuest, historyListQrGuest } from 'src/types/qrcode.type'

// interface HistoryGuestQRModalProps {
//   guestQR: ListQRGuest
//   onClose: () => void
// }

// export function HistoryGuestQRModal({ guestQR, onClose }: HistoryGuestQRModalProps) {
//   // Filter states
//   const [page, setPage] = useState(1)
//   const [limit] = useState(10)
//   const [searchInput, setSearchInput] = useState('')
//   const [fromDate, setFromDate] = useState('')
//   const [toDate, setToDate] = useState('')
//   const debouncedSearch = useDebounce(searchInput, 500)

//   // Query lịch sử quét
//   const { data, isLoading, isFetching } = useQuery({
//     queryKey: ['guest-history', guestQR.id, page, limit, debouncedSearch, fromDate, toDate],
//     queryFn: () =>
//       qrApiAdmin.getHistoryListGuest(guestQR.id.toString(), {
//         page,
//         limit,
//         search: debouncedSearch || undefined,
//         fromDate: fromDate || undefined,
//         toDate: toDate || undefined
//       }),
//     placeholderData: keepPreviousData,
//     staleTime: 3000 * 60
//   })

//   const historyList: historyListQrGuest[] = data?.data?.data || []
//   const totalElements = data?.data?.totalElements || 0
//   const totalPages = data?.data?.totalPages || 1
//   const currentPage = data?.data?.page || page

//   // Format datetime
//   const formatDateTime = (dateString: string) => {
//     const date = new Date(dateString)
//     const hours = date.getHours()
//     const ampm = hours >= 12 ? 'CH' : 'SA'
//     const displayHours = hours % 12 || 12
//     return {
//       date: `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`,
//       time: `${displayHours}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')} ${ampm}`
//     }
//   }

//   // Get result badge
//   const getResultBadge = (result: string) => {
//     if (result === 'SUCCESS') {
//       return {
//         text: 'THÀNH CÔNG',
//         bgColor: '#d1fae5',
//         textColor: '#047857',
//         dotColor: '#10b981'
//       }
//     }
//     return {
//       text: 'TỪ CHỐI',
//       bgColor: '#fee2e2',
//       textColor: '#b91c1c',
//       dotColor: '#ef4444'
//     }
//   }

//   // Get direction icon
//   const getDirectionIcon = (direction: string) => {
//     if (direction === 'IN') {
//       return { icon: 'login', color: '#3b82f6', text: 'VÀO' }
//     }
//     return { icon: 'logout', color: '#f97316', text: 'RA' }
//   }

//   // Reset filters
//   const handleResetFilters = () => {
//     setSearchInput('')
//     setFromDate('')
//     setToDate('')
//     setPage(1)
//   }

//   // Copy QR code
//   const handleCopyCode = (code: string) => {
//     navigator.clipboard.writeText(code)
//     toast.success('Đã sao chép mã QR')
//   }

//   return (
//     <div className='fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4'>
//       <div className='bg-white rounded-2xl max-w-5xl w-full max-h-[85vh] overflow-hidden shadow-2xl'>
//         {/* Header */}
//         <div className='p-6 border-b flex justify-between bg-gradient-to-r from-blue-50 to-white'>
//           <div>
//             <h2 className='text-2xl font-bold'>Lịch sử quét QR khách</h2>
//             <p className='text-sm mt-1 text-gray-500'>
//               Khách: <span className='font-semibold text-primary'>{guestQR.visitor_name || 'Chưa có tên'}</span> | Căn
//               hộ: <span className='font-semibold'>{guestQR.apartment_code}</span> | Cư dân:{' '}
//               <span className='font-semibold'>{guestQR.host_name}</span>
//             </p>
//             <div className='flex items-center gap-4 mt-2'>
//               <code className='text-xs bg-gray-100 px-2 py-1 rounded'>{guestQR.qr_code}</code>
//               <button onClick={() => handleCopyCode(guestQR.qr_code)} className='text-xs text-primary hover:underline'>
//                 Sao chép
//               </button>
//             </div>
//           </div>
//           <button onClick={onClose} className='p-2 hover:bg-gray-100 rounded-full transition-colors'>
//             <span className='material-symbols-outlined'>close</span>
//           </button>
//         </div>

//         {/* Filter Bar */}
//         <div className='p-4 border-b bg-gray-50'>
//           <div className='flex flex-wrap gap-3 items-center'>
//             <div className='flex-1 min-w-[200px]'>
//               <div className='relative'>
//                 <span className='material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm'>
//                   search
//                 </span>
//                 <input
//                   type='text'
//                   placeholder='Tìm theo tên khách, số điện thoại, bảo vệ...'
//                   className='w-full pl-9 pr-3 py-2 border rounded-lg text-sm'
//                   value={searchInput}
//                   onChange={(e) => setSearchInput(e.target.value)}
//                 />
//               </div>
//             </div>
//             <input
//               type='date'
//               className='px-3 py-2 border rounded-lg text-sm'
//               value={fromDate}
//               onChange={(e) => setFromDate(e.target.value)}
//               placeholder='Từ ngày'
//             />
//             <span className='text-gray-400'>→</span>
//             <input
//               type='date'
//               className='px-3 py-2 border rounded-lg text-sm'
//               value={toDate}
//               onChange={(e) => setToDate(e.target.value)}
//               placeholder='Đến ngày'
//             />
//             <button
//               onClick={handleResetFilters}
//               className='px-3 py-2 text-gray-500 hover:text-primary transition-colors'
//               title='Xóa bộ lọc'
//             >
//               <span className='material-symbols-outlined text-sm'>refresh</span>
//             </button>
//           </div>
//         </div>

//         {/* Table */}
//         <div className='p-6 overflow-y-auto max-h-[calc(60vh-180px)]'>
//           {isLoading || isFetching ? (
//             <div className='flex justify-center py-12'>
//               <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
//             </div>
//           ) : historyList.length === 0 ? (
//             <div className='text-center py-12'>
//               <span className='material-symbols-outlined text-5xl text-gray-300'>history</span>
//               <p className='mt-3 text-gray-500'>Chưa có lịch sử quét</p>
//             </div>
//           ) : (
//             <>
//               <table className='w-full text-left border-collapse'>
//                 <thead>
//                   <tr className='border-b bg-gray-50'>
//                     <th className='px-4 py-3 text-xs font-bold uppercase tracking-wider'>STT</th>
//                     <th className='px-4 py-3 text-xs font-bold uppercase tracking-wider'>Thời gian</th>
//                     <th className='px-4 py-3 text-xs font-bold uppercase tracking-wider'>Hướng</th>
//                     <th className='px-4 py-3 text-xs font-bold uppercase tracking-wider'>Căn hộ</th>
//                     <th className='px-4 py-3 text-xs font-bold uppercase tracking-wider'>Kết quả</th>
//                     <th className='px-4 py-3 text-xs font-bold uppercase tracking-wider'>Người quét</th>
//                     <th className='px-4 py-3 text-xs font-bold uppercase tracking-wider'>Tòa nhà</th>
//                     <th className='px-4 py-3 text-xs font-bold uppercase tracking-wider'>Thông tin khách</th>
//                     <th className='px-4 py-3 text-xs font-bold uppercase tracking-wider'>Tên khách</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {historyList.map((item, index) => {
//                     const dateTime = formatDateTime(item.scan_time)
//                     const resultBadge = getResultBadge(item.result)
//                     const directionIcon = getDirectionIcon(item.direction)
//                     const rowNumber = (currentPage - 1) * limit + index + 1

//                     return (
//                       <tr key={item.id} className='border-b hover:bg-gray-50 transition-colors'>
//                         <td className='px-4 py-3 text-sm'>{rowNumber}</td>
//                         <td className='px-4 py-3'>
//                           <div className='font-medium'>{dateTime.date}</div>
//                           <div className='text-xs text-gray-500'>{dateTime.time}</div>
//                         </td>
//                         <td className='px-4 py-3'>
//                           <span className={`material-symbols-outlined text-sm`} style={{ color: directionIcon.color }}>
//                             {directionIcon.icon}
//                           </span>{' '}
//                           <span className='text-sm'>{directionIcon.text}</span>
//                         </td>
//                         <td className='px-4 py-3 text-sm'>{item.apartment_code || '---'}</td>
//                         <td className='px-4 py-3'>
//                           <span
//                             className='inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold'
//                             style={{ backgroundColor: resultBadge.bgColor, color: resultBadge.textColor }}
//                           >
//                             <span
//                               className={`w-1.5 h-1.5 rounded-full`}
//                               style={{ backgroundColor: resultBadge.dotColor }}
//                             ></span>
//                             {resultBadge.text}
//                           </span>
//                         </td>
//                         <td className='px-4 py-3 text-sm'>{item.scanned_by_name || '---'}</td>
//                         <td className='px-4 py-3 text-sm'>{item.building_name || '---'}</td>
//                       </tr>
//                     )
//                   })}
//                 </tbody>
//               </table>

//               {/* Pagination */}
//               {totalElements > 0 && (
//                 <div className='mt-4 flex items-center justify-between'>
//                   <p className='text-xs text-gray-500'>
//                     Hiển thị {(currentPage - 1) * limit + 1} - {Math.min(currentPage * limit, totalElements)} trên{' '}
//                     {totalElements}
//                   </p>
//                   <div className='flex gap-2'>
//                     <button
//                       onClick={() => setPage((p) => Math.max(1, p - 1))}
//                       disabled={currentPage === 1}
//                       className='px-3 py-1 border rounded-md disabled:opacity-50 hover:bg-gray-50 transition-colors'
//                     >
//                       Trước
//                     </button>
//                     <span className='px-3 py-1 text-sm'>
//                       {currentPage} / {totalPages}
//                     </span>
//                     <button
//                       onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//                       disabled={currentPage === totalPages}
//                       className='px-3 py-1 border rounded-md disabled:opacity-50 hover:bg-gray-50 transition-colors'
//                     >
//                       Sau
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </>
//           )}
//         </div>

//         {/* Footer */}
//         <div className='p-4 border-t bg-gray-50 flex justify-end'>
//           <button onClick={onClose} className='px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors'>
//             Đóng
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }

// src/pages/Admin/QrcodeManagement/HistoryGuestQRModal.tsx
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { qrApiAdmin } from 'src/apis/QrcodeAdmin/QrcodeAdmin.api'
import { useDebounce } from 'src/hooks/useDebounce'
import type { ListQRGuest, historyListQrGuest } from 'src/types/qrcode.type'

interface HistoryGuestQRModalProps {
  guestQR: ListQRGuest
  onClose: () => void
}

export function HistoryGuestQRModal({ guestQR, onClose }: HistoryGuestQRModalProps) {
  // Filter states
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [searchInput, setSearchInput] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [resultFilter, setResultFilter] = useState('')
  const debouncedSearch = useDebounce(searchInput, 500)
  const debouncedResult = useDebounce(resultFilter, 300)

  // Query lịch sử quét
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['guest-history', guestQR.id, page, limit, debouncedSearch, fromDate, toDate, debouncedResult],
    queryFn: () =>
      qrApiAdmin.getHistoryListGuest(guestQR.id.toString(), {
        page,
        limit,
        search: debouncedSearch || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined
      }),
    placeholderData: keepPreviousData,
    staleTime: 3000 * 60
  })

  const historyList: historyListQrGuest[] = data?.data?.data || []
  const totalElements = data?.data?.totalElements || 0
  const totalPages = data?.data?.totalPages || 1
  const currentPage = data?.data?.page || page

  // Format datetime
  const formatDateTime = (dateString: string) => {
    if (!dateString) return { date: '---', time: '---' }
    const date = new Date(dateString)
    const vnDate = new Date(date.getTime() + 7 * 60 * 60 * 1000) // Cộng thêm 7 tiếng
    const hours = vnDate.getHours().toString().padStart(2, '0')
    const minutes = vnDate.getMinutes().toString().padStart(2, '0')
    const seconds = vnDate.getSeconds().toString().padStart(2, '0')
    const day = vnDate.getDate().toString().padStart(2, '0')
    const month = (vnDate.getMonth() + 1).toString().padStart(2, '0')
    const year = vnDate.getFullYear()
    return {
      date: `${day}/${month}/${year}`,
      time: `${hours}:${minutes}:${seconds}`
    }
  }

  // Get result badge
  const getResultBadge = (result: string) => {
    if (result === 'SUCCESS') {
      return {
        text: 'THÀNH CÔNG',
        bgColor: '#d1fae5',
        textColor: '#047857',
        dotColor: '#10b981'
      }
    }
    if (result === 'PIN_FAILED') {
      return {
        text: 'PIN SAI',
        bgColor: '#fed7aa',
        textColor: '#c2410c',
        dotColor: '#f97316'
      }
    }
    if (result === 'PENDING_PIN') {
      return {
        text: 'CHỜ PIN',
        bgColor: '#fef3c7',
        textColor: '#b45309',
        dotColor: '#f59e0b'
      }
    }
    return {
      text: 'TỪ CHỐI',
      bgColor: '#fee2e2',
      textColor: '#b91c1c',
      dotColor: '#ef4444'
    }
  }

  // Get direction icon
  const getDirectionIcon = (direction: string) => {
    if (direction === 'IN') {
      return { icon: 'login', color: '#3b82f6', text: 'VÀO' }
    }
    return { icon: 'logout', color: '#f97316', text: 'RA' }
  }

  // Reset filters
  const handleResetFilters = () => {
    setSearchInput('')
    setFromDate('')
    setToDate('')
    setResultFilter('')
    setPage(1)
  }

  // Copy QR code
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Đã sao chép mã QR')
  }

  return (
    <div className='fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4'>
      <div className='bg-white rounded-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col'>
        {/* Header */}
        <div className='p-6 border-b flex justify-between bg-gradient-to-r from-blue-50 to-white flex-shrink-0'>
          <div>
            <h2 className='text-2xl font-bold'>Lịch sử quét QR khách</h2>
            <p className='text-sm mt-1 text-gray-500'>
              <span className='font-semibold'>{guestQR.visitor_phone || '---'}</span> | Căn hộ:{' '}
              <span className='font-semibold'>{guestQR.apartment_code}</span> | Cư dân:{' '}
              <span className='font-semibold'>{guestQR.host_name}</span>
            </p>
            <div className='flex items-center gap-4 mt-2'>
              <code className='text-xs bg-gray-100 px-2 py-1 rounded'>{guestQR.qr_code}</code>
              <button onClick={() => handleCopyCode(guestQR.qr_code)} className='text-xs text-primary hover:underline'>
                Sao chép
              </button>
            </div>
          </div>
          <button onClick={onClose} className='p-2 hover:bg-gray-100 rounded-full transition-colors'>
            <span className='material-symbols-outlined'>close</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className='p-4 border-b bg-gray-50 flex-shrink-0'>
          <div className='flex flex-wrap gap-3 items-center'>
            <div className='flex-1 min-w-[200px]'>
              <div className='relative'>
                <span className='material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm'>
                  search
                </span>
                <input
                  type='text'
                  placeholder='Tìm theo tên khách, số điện thoại, bảo vệ, căn hộ...'
                  className='w-full pl-9 pr-3 py-2 border rounded-lg text-sm'
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
            </div>

            <input
              type='date'
              className='px-3 py-2 border rounded-lg text-sm'
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
            <span className='text-gray-400'>→</span>
            <input
              type='date'
              className='px-3 py-2 border rounded-lg text-sm'
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
            <button
              onClick={handleResetFilters}
              className='px-3 py-2 text-gray-500 hover:text-primary transition-colors'
            >
              <span className='material-symbols-outlined text-sm'>refresh</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className='p-4 overflow-y-auto flex-1 min-h-0'>
          {isLoading || isFetching ? (
            <div className='flex justify-center py-12'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
            </div>
          ) : historyList.length === 0 ? (
            <div className='text-center py-12'>
              <span className='material-symbols-outlined text-5xl text-gray-300'>history</span>
              <p className='mt-3 text-gray-500'>Chưa có lịch sử quét</p>
            </div>
          ) : (
            <>
              <div className='overflow-x-auto'>
                <table className='w-full text-left border-collapse min-w-[1200px]'>
                  <thead>
                    <tr className='border-b bg-gray-50 sticky top-0'>
                      <th className='px-3 py-3 text-xs font-bold uppercase tracking-wider'>STT</th>
                      <th className='px-3 py-3 text-xs font-bold uppercase tracking-wider'>Thời gian</th>
                      <th className='px-3 py-3 text-xs font-bold uppercase tracking-wider'>Hướng</th>

                      <th className='px-3 py-3 text-xs font-bold uppercase tracking-wider'>Tên khách</th>
                      <th className='px-3 py-3 text-xs font-bold uppercase tracking-wider'>SĐT khách</th>
                      <th className='px-3 py-3 text-xs font-bold uppercase tracking-wider'>CCCD</th>
                      <th className='px-3 py-3 text-xs font-bold uppercase tracking-wider'>Chủ nhà</th>
                      <th className='px-3 py-3 text-xs font-bold uppercase tracking-wider'>Căn hộ</th>
                      <th className='px-3 py-3 text-xs font-bold uppercase tracking-wider'>Tòa nhà</th>
                      <th className='px-3 py-3 text-xs font-bold uppercase tracking-wider'>Người quét</th>
                      <th className='px-3 py-3 text-xs font-bold uppercase tracking-wider'>Kết quả</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyList.map((item, index) => {
                      const dateTime = formatDateTime(item.scan_time)
                      const resultBadge = getResultBadge(item.result)
                      const directionIcon = getDirectionIcon(item.direction)
                      const rowNumber = (currentPage - 1) * limit + index + 1

                      return (
                        <tr key={item.id} className='border-b hover:bg-gray-50 transition-colors'>
                          <td className='px-3 py-3 text-sm'>{rowNumber}</td>
                          <td className='px-3 py-3'>
                            <div className='font-medium'>{dateTime.date}</div>
                            <div className='text-xs text-gray-500'>{dateTime.time}</div>
                          </td>
                          <td className='px-3 py-3'>
                            <span
                              className={`material-symbols-outlined text-sm`}
                              style={{ color: directionIcon.color }}
                            >
                              {directionIcon.icon}
                            </span>
                            <span className='text-sm ml-1'>{directionIcon.text}</span>
                          </td>

                          <td className='px-3 py-3 text-sm font-medium'>{item.visitor_name || '---'}</td>
                          <td className='px-3 py-3 text-sm'>{item.visitor_phone || '---'}</td>
                          <td className='px-3 py-3 text-sm font-mono'>{item.visitor_id_card || '---'}</td>
                          <td className='px-3 py-3 text-sm'>{item.host_name || '---'}</td>
                          <td className='px-3 py-3 text-sm'>
                            <span className='px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-semibold'>
                              {item.apartment_code || '---'}
                            </span>
                          </td>
                          <td className='px-3 py-3 text-sm'>{item.building_name || '---'}</td>
                          <td className='px-3 py-3 text-sm'>{item.scanned_by_name || '---'}</td>
                          <td className='px-3 py-3'>
                            <span
                              className='inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold'
                              style={{ backgroundColor: resultBadge.bgColor, color: resultBadge.textColor }}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full`}
                                style={{ backgroundColor: resultBadge.dotColor }}
                              ></span>
                              {resultBadge.text}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalElements > 0 && (
                <div className='mt-4 flex flex-col sm:flex-row items-center justify-between gap-3'>
                  <p className='text-xs text-gray-500'>
                    Hiển thị {(currentPage - 1) * limit + 1} - {Math.min(currentPage * limit, totalElements)} trên{' '}
                    {totalElements}
                  </p>
                  <div className='flex gap-2'>
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className='px-3 py-1 border rounded-md disabled:opacity-50 hover:bg-gray-50 transition-colors'
                    >
                      Trước
                    </button>
                    <div className='flex gap-1'>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum
                        if (totalPages <= 5) {
                          pageNum = i + 1
                        } else if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = currentPage - 2 + i
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`w-8 h-8 rounded-md text-sm transition-colors ${
                              currentPage === pageNum ? 'bg-primary text-white' : 'border hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                    </div>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className='px-3 py-1 border rounded-md disabled:opacity-50 hover:bg-gray-50 transition-colors'
                    >
                      Sau
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className='p-4 border-t bg-gray-50 flex justify-end gap-3 flex-shrink-0'>
          <button
            onClick={handleResetFilters}
            className='px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2'
          >
            <span className='material-symbols-outlined text-sm'>refresh</span>
            Xóa bộ lọc
          </button>
          <button onClick={onClose} className='px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors'>
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
