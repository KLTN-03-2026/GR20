// import { useQuery } from '@tanstack/react-query'
// import { qrApiAdmin } from 'src/apis/QrcodeAdmin/QrcodeAdmin.api'

// export default function ViewAllHistoryQrcode() {
//   // Lấy dữ liệu lịch sử quét
//   const {
//     data: historyData,
//     isLoading,
//     refetch
//   } = useQuery({
//     queryKey: ['all-history-qrcode'],
//     queryFn: () => qrApiAdmin.getAllHistoryQrcode()
//   })

//   const historyList = historyData?.data?.data || []
//   console.log('Lịch sử quét:', historyList)

//   // Tính toán thống kê
//   const totalScans = historyList.length
//   const successCount = historyList.filter((item) => item.result === 'SUCCESS').length
//   const deniedCount = historyList.filter((item) => item.result === 'DENIED').length
//   const successRate = totalScans > 0 ? ((successCount / totalScans) * 100).toFixed(1) : '0'

//   // Format ngày giờ
//   const formatDateTime = (dateString: string) => {
//     const date = new Date(dateString)
//     return {
//       date: `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`,
//       time: `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')} ${date.getHours() >= 12 ? 'CH' : 'SA'}`
//     }
//   }

//   // Lấy badge kết quả
//   const getResultBadge = (result: string) => {
//     if (result === 'SUCCESS') {
//       return {
//         text: 'THÀNH CÔNG',
//         bgColor: 'bg-emerald-50',
//         textColor: 'text-emerald-700',
//         dotColor: 'bg-emerald-500'
//       }
//     }
//     return {
//       text: 'TỪ CHỐI',
//       bgColor: 'bg-red-50',
//       textColor: 'text-red-700',
//       dotColor: 'bg-red-500'
//     }
//   }

//   // Lấy icon hướng
//   const getDirectionIcon = (direction: string) => {
//     if (direction === 'IN') {
//       return { icon: 'login', color: 'text-blue-500', text: 'VÀO' }
//     }
//     return { icon: 'logout', color: 'text-orange-500', text: 'RA' }
//   }

//   if (isLoading) {
//     return (
//       <div className='bg-surface text-on-surface min-h-screen flex items-center justify-center'>
//         <div className='text-center'>
//           <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
//           <p className='mt-4 text-on-surface-variant'>Đang tải dữ liệu...</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className='bg-surface text-on-surface'>
//       {/* Thanh điều hướng bên trái */}

//       {/* Nội dung chính */}
//       <main className='px-8 pb-12 min-h-screen'>
//         <div className='max-w-7xl mx-auto'>
//           {/* Phần tiêu đề */}
//           <div className='flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10'>
//             <div className='space-y-1'>
//               <span className='text-[10px] font-bold tracking-[0.15em] text-primary uppercase'>Kiểm tra hoạt động</span>
//               <h1 className='text-4xl font-extrabold text-on-surface tracking-tight'>Lịch sử quét QR</h1>
//               <p className='text-on-surface-variant text-lg'>Nhật ký chi tiết của tất cả các sự kiện quét ra vào.</p>
//             </div>
//           </div>

//           {/* Thanh bộ lọc */}
//           <div className='bg-surface-container-low rounded-2xl p-6 mb-8 flex flex-col lg:flex-row gap-6 items-center'>
//             <div className='w-full lg:flex-1 relative'>
//               <span className='material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60'>
//                 search
//               </span>
//               <input
//                 className='w-full pl-12 pr-4 py-3 bg-surface-container-lowest border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-sm placeholder:text-on-surface-variant/50'
//                 placeholder='Tìm kiếm theo tên cư dân hoặc mã căn hộ...'
//                 type='text'
//               />
//             </div>
//             <div className='flex flex-wrap items-center gap-4 w-full lg:w-auto'>
//               <div className='flex items-center gap-2 bg-surface-container-highest/50 px-4 py-2 rounded-lg'>
//                 <span className='material-symbols-outlined text-on-surface-variant text-lg'>calendar_month</span>
//                 <select className='bg-transparent border-none text-xs font-bold focus:ring-0 cursor-pointer'>
//                   <option>Hôm nay</option>
//                   <option>Hôm qua</option>
//                   <option>7 ngày qua</option>
//                 </select>
//               </div>
//               <div className='flex items-center gap-2 bg-surface-container-highest/50 px-4 py-2 rounded-lg'>
//                 <span className='material-symbols-outlined text-on-surface-variant text-lg'>filter_list</span>
//                 <select className='bg-transparent border-none text-xs font-bold focus:ring-0 cursor-pointer'>
//                   <option>Tất cả kết quả</option>
//                   <option>Thành công</option>
//                   <option>Từ chối</option>
//                 </select>
//               </div>
//               <div className='flex items-center gap-2 bg-surface-container-highest/50 px-4 py-2 rounded-lg'>
//                 <span className='material-symbols-outlined text-on-surface-variant text-lg'>swap_vert</span>
//                 <select className='bg-transparent border-none text-xs font-bold focus:ring-0 cursor-pointer'>
//                   <option>Tất cả hướng</option>
//                   <option>VÀO</option>
//                   <option>RA</option>
//                 </select>
//               </div>
//             </div>
//           </div>

//           {/* Thống kê nổi bật */}
//           <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
//             <div className='md:col-span-1 bg-surface-container-lowest p-6 rounded-2xl shadow-sm space-y-2'>
//               <p className='text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60'>
//                 Tổng số lượt quét
//               </p>
//               <div className='flex items-baseline gap-2'>
//                 <span className='text-3xl font-extrabold text-on-surface'>{totalScans}</span>
//               </div>
//             </div>
//             <div className='md:col-span-1 bg-secondary-fixed p-6 rounded-2xl space-y-2'>
//               <p className='text-[10px] font-black uppercase tracking-widest text-on-secondary-fixed-variant'>
//                 Tỷ lệ thành công
//               </p>
//               <div className='flex items-baseline gap-2'>
//                 <span className='text-3xl font-extrabold text-on-secondary-fixed'>{successRate}%</span>
//               </div>
//             </div>
//             <div className='md:col-span-2 bg-primary/5 p-6 rounded-2xl border border-primary/10 flex items-center justify-between'>
//               <div>
//                 <p className='text-[10px] font-black uppercase tracking-widest text-primary'>Giờ cao điểm</p>
//                 <span className='text-2xl font-extrabold text-on-surface'>08:00 - 09:15 SA</span>
//               </div>
//               <div className='h-12 w-24 flex items-end gap-1'>
//                 <div className='w-2 h-[40%] bg-primary/20 rounded-t-sm'></div>
//                 <div className='w-2 h-[60%] bg-primary/20 rounded-t-sm'></div>
//                 <div className='w-2 h-[100%] bg-primary rounded-t-sm'></div>
//                 <div className='w-2 h-[70%] bg-primary/20 rounded-t-sm'></div>
//                 <div className='w-2 h-[30%] bg-primary/20 rounded-t-sm'></div>
//               </div>
//             </div>
//           </div>

//           {/* Bảng dữ liệu */}
//           <div className='bg-surface-container-lowest rounded-3xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(68,93,128,0.06)] border border-surface-container'>
//             <div className='overflow-x-auto'>
//               <table className='w-full text-left border-collapse'>
//                 <thead>
//                   <tr className='bg-surface-container-low/50'>
//                     <th className='px-6 py-5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/70'>
//                       ID
//                     </th>
//                     <th className='px-6 py-5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/70'>
//                       Thời gian
//                     </th>
//                     <th className='px-6 py-5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/70'>
//                       Cư dân
//                     </th>
//                     <th className='px-6 py-5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/70'>
//                       Căn hộ
//                     </th>
//                     {/* <th className='px-6 py-5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/70'>
//                       Hướng
//                     </th> */}
//                     <th className='px-6 py-5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/70'>
//                       Kết quả
//                     </th>
//                     <th className='px-6 py-5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/70'>
//                       Người quét
//                     </th>
//                     <th className='px-6 py-5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/70 '>
//                       Mã QR
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className='divide-y divide-surface-container'>
//                   {historyList.map((item, index) => {
//                     const dateTime = formatDateTime(item.scan_time)
//                     const resultBadge = getResultBadge(item.result)
//                     // const directionIcon = getDirectionIcon(item.direction)

//                     return (
//                       <tr key={item.id} className='hover:bg-surface-container-low/30 transition-colors group'>
//                         <td className='px-6 py-5 font-mono text-xs text-on-surface-variant'>#{index + 1}</td>
//                         <td className='px-6 py-5'>
//                           <div className='text-sm font-semibold text-on-surface'>{dateTime.date}</div>
//                           <div className='text-[11px] text-on-surface-variant'>{dateTime.time}</div>
//                         </td>
//                         <td className='px-6 py-5'>
//                           <div className='flex items-center gap-3'>
//                             {/* <div className='h-10 w-10 rounded-xl bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-bold text-xs'>
//                               {item.resident_name?.charAt(0) || '?'}
//                             </div> */}
//                             <div>
//                               <div className='text-sm font-bold text-on-surface'>{item.resident_name}</div>
//                               <div className='text-[11px] text-on-surface-variant flex items-center gap-1'>
//                                 <span className='material-symbols-outlined text-[12px]'>mail</span>{' '}
//                                 {item.resident_email}
//                               </div>
//                             </div>
//                           </div>
//                         </td>
//                         <td className='px-6 py-5'>
//                           <span className='px-2.5 py-1 rounded bg-surface-container-highest text-on-surface text-[11px] font-black'>
//                             {item.apartment_code}
//                           </span>
//                         </td>
//                         {/* <td className='px-6 py-5'>
//                           <div className='flex flex-col items-center'>
//                             <span className={`material-symbols-outlined ${directionIcon.color}`}>
//                               {directionIcon.icon}
//                             </span>
//                             <span className={`text-[9px] font-black ${directionIcon.color} tracking-tighter`}>
//                               {directionIcon.text}
//                             </span>
//                           </div>
//                         </td> */}
//                         <td className='px-6 py-5'>
//                           <span
//                             className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${resultBadge.bgColor} ${resultBadge.textColor} text-[10px] font-black`}
//                           >
//                             <span className={`w-1.5 h-1.5 rounded-full ${resultBadge.dotColor}`}></span>
//                             {resultBadge.text}
//                           </span>
//                         </td>
//                         <td className='px-6 py-5'>
//                           <div className='text-sm font-medium text-on-surface'>{item.scanned_by_name}</div>
//                           <div className='text-[10px] font-bold text-primary/70'>Bảo vệ</div>
//                         </td>
//                         <td className='px-6 py-5'>
//                           <code className='text-[10px] font-bold text-primary/70'>{item.qr_code?.slice(0, 20)}...</code>
//                         </td>
//                       </tr>
//                     )
//                   })}
//                 </tbody>
//               </table>
//             </div>

//             {/* Phân trang */}
//             <div className='px-8 py-6 flex items-center justify-between bg-surface-container-low/30'>
//               <span className='text-xs font-bold text-on-surface-variant'>
//                 Hiển thị {historyList.length} trên {totalScans} sự kiện
//               </span>
//               <div className='flex items-center gap-2'>
//                 <button className='p-2 rounded-lg bg-white border border-outline-variant/20 hover:bg-slate-50 transition-all'>
//                   <span className='material-symbols-outlined text-sm'>chevron_left</span>
//                 </button>
//                 <button className='w-8 h-8 rounded-lg bg-primary text-white font-bold text-xs shadow-sm'>1</button>
//                 <button className='w-8 h-8 rounded-lg bg-white border border-outline-variant/20 hover:bg-slate-50 text-on-surface-variant font-bold text-xs transition-all'>
//                   2
//                 </button>
//                 <button className='w-8 h-8 rounded-lg bg-white border border-outline-variant/20 hover:bg-slate-50 text-on-surface-variant font-bold text-xs transition-all'>
//                   3
//                 </button>
//                 <button className='p-2 rounded-lg bg-white border border-outline-variant/20 hover:bg-slate-50 transition-all'>
//                   <span className='material-symbols-outlined text-sm'>chevron_right</span>
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Thẻ thông minh cuối trang */}
//           <div className='mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8'>
//             <div className='lg:col-span-2 relative overflow-hidden bg-white rounded-3xl p-8 shadow-sm'>
//               <div className='absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20'></div>
//               <div className='relative z-10 flex flex-col md:flex-row gap-8 items-center'>
//                 <div className='flex-1 space-y-4'>
//                   <h3 className='text-2xl font-bold text-on-surface'>Kiểm tra bảo mật thông minh</h3>
//                   <p className='text-on-surface-variant leading-relaxed'>
//                     Homelink AI đã phát hiện một mô hình hoạt động cao bất thường tại Tòa nhà Alpha. Chúng tôi đề xuất
//                     theo dõi thêm.
//                   </p>
//                   <button className='text-primary font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all'>
//                     Xem báo cáo đầy đủ <span className='material-symbols-outlined'>arrow_forward</span>
//                   </button>
//                 </div>
//                 <div className='flex-shrink-0 bg-surface rounded-2xl p-4 border border-outline-variant/10'>
//                   <div className='w-32 h-32 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center'>
//                     <span className='material-symbols-outlined text-5xl text-primary'>security</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//             <div className='lg:col-span-1 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white flex flex-col justify-between'>
//               <div className='space-y-2'>
//                 <span className='material-symbols-outlined text-primary-fixed-dim text-3xl'>verified_user</span>
//                 <h4 className='text-xl font-bold'>Tính toàn vẹn mã hóa</h4>
//                 <p className='text-slate-400 text-sm'>
//                   Tất cả các sự kiện quét QR đều được băm mật mã và lưu trữ với mã hóa 256-bit.
//                 </p>
//               </div>
//               <div className='pt-6'>
//                 <span className='text-[10px] font-black uppercase tracking-[0.2em] text-slate-500'>
//                   Tiêu chuẩn bảo mật
//                 </span>
//                 <p className='font-bold text-sm'>Tuân thủ ISO/IEC 27001</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>

//       {/* Thanh điều hướng dưới cùng (Mobile) */}
//       <nav className='md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 flex justify-around items-center h-16 z-50'>
//         <a className='flex flex-col items-center gap-1 text-slate-400' href='#'>
//           <span className='material-symbols-outlined'>dashboard</span>
//           <span className='text-[10px] font-bold'>Trang chủ</span>
//         </a>
//         <a className='flex flex-col items-center gap-1 text-blue-600' href='#'>
//           <span className='material-symbols-outlined' style={{ fontVariationSettings: "'FILL' 1" }}>
//             qr_code_scanner
//           </span>
//           <span className='text-[10px] font-bold'>Lịch sử</span>
//         </a>
//         <a className='flex flex-col items-center gap-1 text-slate-400' href='#'>
//           <span className='material-symbols-outlined'>group</span>
//           <span className='text-[10px] font-bold'>Cư dân</span>
//         </a>
//         <a className='flex flex-col items-center gap-1 text-slate-400' href='#'>
//           <span className='material-symbols-outlined'>settings</span>
//           <span className='text-[10px] font-bold'>Cài đặt</span>
//         </a>
//       </nav>
//     </div>
//   )
// }

// src/pages/Admin/ViewAllHistoryQrcode.tsx
import { useState, useEffect, useRef } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { qrApiAdmin } from 'src/apis/QrcodeAdmin/QrcodeAdmin.api'
import { useNavigate, createSearchParams, useLocation } from 'react-router-dom'
import { useDebounce } from 'src/hooks/useDebounce'
import Paginate from 'src/components/Paginate/Paginate'
import useQueryConfigQR from 'src/hooks/useQueryConfig'

export default function ViewAllHistoryQrcode() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryConfig = useQueryConfigQR()

  // Lấy params từ URL
  const searchParams = new URLSearchParams(location.search)
  const pageFromUrl = searchParams.get('page') || '1'
  const limitFromUrl = searchParams.get('limit') || '10'
  const searchFromUrl = searchParams.get('search') || ''
  const resultFromUrl = searchParams.get('result') || ''
  const fromDateFromUrl = searchParams.get('fromDate') || ''
  const toDateFromUrl = searchParams.get('toDate') || ''

  const [searchInput, setSearchInput] = useState(searchFromUrl)
  const [resultFilter, setResultFilter] = useState(resultFromUrl)
  const [fromDate, setFromDate] = useState(fromDateFromUrl)
  const [toDate, setToDate] = useState(toDateFromUrl)

  const debouncedSearch = useDebounce(searchInput, 500)
  const debouncedFromDate = useDebounce(fromDate, 500)
  const debouncedToDate = useDebounce(toDate, 500)
  const debouncedResult = useDebounce(resultFilter, 300)

  // Lưu page/limit cũ
  const savedPageRef = useRef(pageFromUrl)
  const savedLimitRef = useRef(limitFromUrl)

  // Update URL khi filter thay đổi
  useEffect(() => {
    const newParams: Record<string, string> = {
      page: '1',
      limit: limitFromUrl || '10'
    }

    if (debouncedSearch) newParams.search = debouncedSearch
    if (debouncedResult) newParams.result = debouncedResult
    if (debouncedFromDate) newParams.fromDate = debouncedFromDate
    if (debouncedToDate) newParams.toDate = debouncedToDate

    navigate(
      {
        pathname: location.pathname,
        search: createSearchParams(newParams).toString()
      },
      { replace: true }
    )
  }, [debouncedSearch, debouncedResult, debouncedFromDate, debouncedToDate])

  // Fetch dữ liệu
  const { data: historyData, isLoading } = useQuery({
    queryKey: [
      'all-history-qrcode',
      pageFromUrl,
      limitFromUrl,
      searchFromUrl,
      resultFromUrl,
      fromDateFromUrl,
      toDateFromUrl
    ],
    queryFn: () =>
      qrApiAdmin.getAllHistoryQrcode({
        page: Number(pageFromUrl),
        limit: Number(limitFromUrl),
        search: searchFromUrl || undefined,
        result: resultFromUrl || undefined,
        fromDate: fromDateFromUrl || undefined,
        toDate: toDateFromUrl || undefined
      }),
    placeholderData: keepPreviousData,
    staleTime: 3000 * 60
  })

  const historyList = historyData?.data?.data || []
  const totalElements = historyData?.data?.totalElements || 0
  const totalPages = historyData?.data?.totalPages || 1
  const currentPage = historyData?.data?.page || Number(pageFromUrl)
  const currentPageSize = historyData?.data?.pageSize || Number(limitFromUrl)

  // Thống kê (dựa trên data hiện tại hoặc có thể gọi API riêng)
  const totalScans = totalElements
  const successCount = historyList.filter((item) => item.result === 'SUCCESS').length
  // const deniedCount = historyList.filter((item) => item.result === 'DENIED').length
  const successRate = totalScans > 0 ? ((successCount / totalScans) * 100).toFixed(1) : '0'
  // console.log(deniedCount)

  // Format ngày giờ
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`,
      time: `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')} ${date.getHours() >= 12 ? 'CH' : 'SA'}`
    }
  }

  // Lấy badge kết quả
  const getResultBadge = (result: string) => {
    if (result === 'SUCCESS') {
      return {
        text: 'THÀNH CÔNG',
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-700',
        dotColor: 'bg-emerald-500'
      }
    }
    return {
      text: 'TỪ CHỐI',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      dotColor: 'bg-red-500'
    }
  }

  // Reset filters
  const handleResetFilters = () => {
    setSearchInput('')
    setResultFilter('')
    setFromDate('')
    setToDate('')
    navigate({
      pathname: location.pathname,
      search: createSearchParams({ page: '1', limit: limitFromUrl || '10' }).toString()
    })
  }

  if (isLoading && !historyData) {
    return (
      <div className='bg-surface text-on-surface min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
          <p className='mt-4 text-on-surface-variant'>Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='bg-surface text-on-surface min-h-screen'>
      <div className='px-8 pb-12 min-h-screen'>
        <div className='max-w-7xl mx-auto'>
          {/* Header */}
          <div className='flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10'>
            <div className='space-y-1'>
              <span className='text-[10px] font-bold tracking-[0.15em] text-primary uppercase'>Kiểm tra hoạt động</span>
              <h1 className='text-4xl font-extrabold text-on-surface tracking-tight'>Lịch sử quét QR</h1>
              <p className='text-on-surface-variant text-lg'>Nhật ký chi tiết của tất cả các sự kiện quét ra vào.</p>
            </div>
            <button
              onClick={handleResetFilters}
              className='px-4 py-2 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2'
            >
              <span className='material-symbols-outlined text-base'>refresh</span>
              Xóa bộ lọc
            </button>
          </div>

          {/* Filter Bar */}
          <div className='bg-surface-container-low rounded-2xl p-6 mb-8 flex flex-col lg:flex-row gap-6 items-center'>
            <div className='w-full lg:flex-1 relative'>
              <span className='material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60'>
                search
              </span>
              <input
                className='w-full pl-12 pr-4 py-3 bg-surface-container-lowest border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-sm placeholder:text-on-surface-variant/50'
                placeholder='Tìm kiếm theo tên cư dân hoặc mã căn hộ...'
                type='text'
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <div className='flex flex-wrap items-center gap-4 w-full lg:w-auto'>
              <div className='relative'>
                <input
                  type='date'
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className='px-4 py-2 bg-surface-container-highest/50 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20'
                />
              </div>
              <span className='text-on-surface-variant'>→</span>
              <div className='relative'>
                <input
                  type='date'
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className='px-4 py-2 bg-surface-container-highest/50 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20'
                />
              </div>
              <select
                value={resultFilter}
                onChange={(e) => setResultFilter(e.target.value)}
                className='px-4 py-2 bg-surface-container-highest/50 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 cursor-pointer'
              >
                <option value=''>Tất cả kết quả</option>
                <option value='SUCCESS'>Thành công</option>
                <option value='DENIED'>Từ chối</option>
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
            <div className='md:col-span-1 bg-surface-container-lowest p-6 rounded-2xl shadow-sm space-y-2'>
              <p className='text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60'>
                Tổng số lượt quét
              </p>
              <div className='flex items-baseline gap-2'>
                <span className='text-3xl font-extrabold text-on-surface'>{totalElements}</span>
              </div>
            </div>
            <div className='md:col-span-1 bg-secondary-fixed p-6 rounded-2xl space-y-2'>
              <p className='text-[10px] font-black uppercase tracking-widest text-on-secondary-fixed-variant'>
                Tỷ lệ thành công
              </p>
              <div className='flex items-baseline gap-2'>
                <span className='text-3xl font-extrabold text-on-secondary-fixed'>{successRate}%</span>
              </div>
            </div>
            <div className='md:col-span-2 bg-primary/5 p-6 rounded-2xl border border-primary/10 flex items-center justify-between'>
              <div>
                <p className='text-[10px] font-black uppercase tracking-widest text-primary'>Hôm nay</p>
                <span className='text-2xl font-extrabold text-on-surface'>
                  {
                    historyList.filter((item) => {
                      const today = new Date().toDateString()
                      return new Date(item.scan_time).toDateString() === today
                    }).length
                  }{' '}
                  lượt
                </span>
              </div>
              <div className='h-12 w-24 flex items-end gap-1'>
                <div className='w-2 h-[40%] bg-primary/20 rounded-t-sm'></div>
                <div className='w-2 h-[60%] bg-primary/20 rounded-t-sm'></div>
                <div className='w-2 h-[100%] bg-primary rounded-t-sm'></div>
                <div className='w-2 h-[70%] bg-primary/20 rounded-t-sm'></div>
                <div className='w-2 h-[30%] bg-primary/20 rounded-t-sm'></div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className='bg-surface-container-lowest rounded-3xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(68,93,128,0.06)] border border-surface-container'>
            <div className='overflow-x-auto'>
              <table className='w-full text-left border-collapse'>
                <thead>
                  <tr className='bg-surface-container-low/50'>
                    <th className='px-6 py-5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/70'>
                      STT
                    </th>
                    <th className='px-6 py-5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/70'>
                      Thời gian
                    </th>
                    <th className='px-6 py-5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/70'>
                      Cư dân
                    </th>
                    <th className='px-6 py-5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/70'>
                      Căn hộ
                    </th>
                    <th className='px-6 py-5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/70'>
                      Kết quả
                    </th>
                    <th className='px-6 py-5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/70'>
                      Người quét
                    </th>
                    <th className='px-6 py-5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/70'>
                      Mã QR
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-surface-container'>
                  {historyList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className='px-6 py-12 text-center text-on-surface-variant'>
                        {searchInput || resultFilter || fromDate || toDate
                          ? 'Không tìm thấy kết quả nào phù hợp'
                          : 'Chưa có dữ liệu lịch sử quét'}
                      </td>
                    </tr>
                  ) : (
                    historyList.map((item, index) => {
                      const dateTime = formatDateTime(item.scan_time)
                      const resultBadge = getResultBadge(item.result)
                      const rowNumber = (currentPage - 1) * currentPageSize + index + 1

                      return (
                        <tr key={item.id} className='hover:bg-surface-container-low/30 transition-colors group'>
                          <td className='px-6 py-5 font-mono text-xs text-on-surface-variant'>{rowNumber}</td>
                          <td className='px-6 py-5'>
                            <div className='text-sm font-semibold text-on-surface'>{dateTime.date}</div>
                            <div className='text-[11px] text-on-surface-variant'>{dateTime.time}</div>
                          </td>
                          <td className='px-6 py-5'>
                            <div>
                              <div className='text-sm font-bold text-on-surface'>{item.resident_name || '---'}</div>
                              <div className='text-[11px] text-on-surface-variant flex items-center gap-1'>
                                <span className='material-symbols-outlined text-[12px]'>mail</span>
                                {item.resident_email || '---'}
                              </div>
                            </div>
                          </td>
                          <td className='px-6 py-5'>
                            <span className='px-2.5 py-1 rounded bg-surface-container-highest text-on-surface text-[11px] font-black'>
                              {item.apartment_code || '---'}
                            </span>
                          </td>
                          <td className='px-6 py-5'>
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${resultBadge.bgColor} ${resultBadge.textColor} text-[10px] font-black`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${resultBadge.dotColor}`}></span>
                              {resultBadge.text}
                            </span>
                          </td>
                          <td className='px-6 py-5'>
                            <div className='text-sm font-medium text-on-surface'>{item.scanned_by_name || '---'}</div>
                            <div className='text-[10px] font-bold text-primary/70'>Bảo vệ</div>
                          </td>
                          <td className='px-6 py-5'>
                            <code className='text-[10px] font-bold text-primary/70'>
                              {item.qr_code?.slice(-8) || '---'}
                            </code>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalElements > 0 && (
              <div className='px-8 py-6 flex items-center justify-between bg-surface-container-low/30'>
                <span className='text-xs font-bold text-on-surface-variant'>
                  Hiển thị {(currentPage - 1) * currentPageSize + 1} -{' '}
                  {Math.min(currentPage * currentPageSize, totalElements)} trên {totalElements} sự kiện
                </span>
                <Paginate
                  queryConfig={{
                    page: currentPage.toString(),
                    limit: currentPageSize.toString()
                  }}
                  pageSize={totalPages}
                  search={searchFromUrl || undefined}
                  result={resultFromUrl || undefined}
                  fromDate={fromDateFromUrl || undefined}
                  toDate={toDateFromUrl || undefined}
                />
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className='mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8'>
            <div className='lg:col-span-2 relative overflow-hidden bg-white rounded-3xl p-8 shadow-sm'>
              <div className='absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20'></div>
              <div className='relative z-10 flex flex-col md:flex-row gap-8 items-center'>
                <div className='flex-1 space-y-4'>
                  <h3 className='text-2xl font-bold text-on-surface'>Kiểm tra bảo mật thông minh</h3>
                  <p className='text-on-surface-variant leading-relaxed'>
                    Homelink AI đã phát hiện một mô hình hoạt động cao bất thường tại Tòa nhà Alpha. Chúng tôi đề xuất
                    theo dõi thêm.
                  </p>
                  <button className='text-primary font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all'>
                    Xem báo cáo đầy đủ <span className='material-symbols-outlined'>arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
            <div className='lg:col-span-1 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white flex flex-col justify-between'>
              <div className='space-y-2'>
                <span className='material-symbols-outlined text-primary-fixed-dim text-3xl'>verified_user</span>
                <h4 className='text-xl font-bold'>Tính toàn vẹn mã hóa</h4>
                <p className='text-slate-400 text-sm'>
                  Tất cả các sự kiện quét QR đều được băm mật mã và lưu trữ với mã hóa 256-bit.
                </p>
              </div>
              <div className='pt-6'>
                <span className='text-[10px] font-black uppercase tracking-[0.2em] text-slate-500'>
                  Tiêu chuẩn bảo mật
                </span>
                <p className='font-bold text-sm'>Tuân thủ ISO/IEC 27001</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
