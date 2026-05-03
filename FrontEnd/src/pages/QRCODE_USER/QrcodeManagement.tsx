// import { useContext, useState, useEffect, useRef } from 'react'
// import { useQuery, useMutation, keepPreviousData } from '@tanstack/react-query'
// import { toast } from 'react-toastify'
// import { QRCodeApi } from 'src/apis/QrcodeApi/Qr.api'
// import type { Qrcodes, BodyCreateQrcode } from 'src/types/qrcode.type'
// import { useNavigate, createSearchParams } from 'react-router-dom'
// import { AppContext } from 'src/contexts/app.context'
// import { useForm, type Resolver } from 'react-hook-form'
// import { yupResolver } from '@hookform/resolvers/yup'
// import Input from 'src/components/Input'
// import { useDebounce } from 'src/hooks/useDebounce'
// import Paginate from 'src/components/Paginate/Paginate'
// import useQueryParams from 'src/hooks/useQueryParams'
// import { createQrSchema, updateQrSchema, type CreateQrFormData, type UpdateQrFormData } from 'src/utils/rules'

// export default function QrcodeManagement() {
//   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
//   const [isMultipleEntries, setIsMultipleEntries] = useState(false)
//   const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
//   const [selectedQr, setSelectedQr] = useState<Qrcodes | null>(null)
//   const { user } = useContext(AppContext)
//   const navigate = useNavigate()

//   const queryParams = useQueryParams()
//   const pageFromUrl = queryParams.page || '1'
//   const limitFromUrl = queryParams.limit || '10'
//   const searchFromUrl = queryParams.search || ''
//   const onlyValidFromUrl = queryParams.onlyValid || ''
//   const fromDateFromUrl = queryParams.fromDate || ''
//   const toDateFromUrl = queryParams.toDate || ''

//   const [searchInput, setSearchInput] = useState(searchFromUrl)
//   const [fromDate, setFromDate] = useState(fromDateFromUrl)
//   const [toDate, setToDate] = useState(toDateFromUrl)
//   const [onlyValidFilter, setOnlyValidFilter] = useState(onlyValidFromUrl === 'true')

//   const debouncedSearch = useDebounce(searchInput, 500)
//   const debouncedFromDate = useDebounce(fromDate, 500)
//   const debouncedToDate = useDebounce(toDate, 500)

//   const pageRef = useRef(pageFromUrl)
//   const limitRef = useRef(limitFromUrl)
//   const searchRef = useRef(searchFromUrl)
//   const onlyValidRef = useRef(onlyValidFromUrl)
//   const fromDateRef = useRef(fromDateFromUrl)
//   const toDateRef = useRef(toDateFromUrl)

//   useEffect(() => {
//     pageRef.current = pageFromUrl
//     limitRef.current = limitFromUrl
//     searchRef.current = searchFromUrl
//     onlyValidRef.current = onlyValidFromUrl
//     fromDateRef.current = fromDateFromUrl
//     toDateRef.current = toDateFromUrl
//   }, [pageFromUrl, limitFromUrl, searchFromUrl, onlyValidFromUrl, fromDateFromUrl, toDateFromUrl])

//   useEffect(() => {
//     const newParams: Record<string, string> = {
//       page: '1',
//       limit: limitRef.current
//     }
//     if (debouncedSearch) newParams.search = debouncedSearch
//     if (onlyValidFilter) newParams.onlyValid = 'true'
//     if (debouncedFromDate) newParams.fromDate = debouncedFromDate
//     if (debouncedToDate) newParams.toDate = debouncedToDate

//     navigate(
//       {
//         pathname: '/qrcode',
//         search: createSearchParams(newParams).toString()
//       },
//       { replace: true }
//     )
//   }, [debouncedSearch, onlyValidFilter, debouncedFromDate, debouncedToDate, navigate])

//   const {
//     register,
//     handleSubmit,
//     reset,
//     setValue,
//     watch,
//     formState: { errors }
//   } = useForm({
//     resolver: yupResolver(createQrSchema),
//     defaultValues: {
//       visitorName: '',
//       visitorPhone: '',
//       validFrom: new Date().toISOString().slice(0, 16),
//       validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
//       maxEntries: 1
//     }
//   })

//   // ✅ FIX: Thêm watchUpdate để theo dõi thay đổi status
//   const {
//     register: registerUpdate,
//     handleSubmit: handleSubmitUpdate,
//     formState: { errors: updateErrors },
//     reset: resetUpdate,
//     watch: watchUpdate
//   } = useForm<UpdateQrFormData>({
//     resolver: yupResolver(updateQrSchema) as Resolver<UpdateQrFormData>
//   })

//   const statusWatch = watchUpdate('status')

//   const maxEntries = watch('maxEntries')

//   const {
//     data: qrListData,
//     refetch,
//     isLoading
//   } = useQuery({
//     queryKey: [
//       'guest-qr-list',
//       pageFromUrl,
//       limitFromUrl,
//       searchFromUrl,
//       onlyValidFromUrl,
//       fromDateFromUrl,
//       toDateFromUrl
//     ],
//     queryFn: () =>
//       QRCodeApi.getGuestQrList({
//         page: Number(pageFromUrl),
//         limit: Number(limitFromUrl),
//         search: searchFromUrl || undefined,
//         onlyValid: onlyValidFromUrl === 'true',
//         fromDate: fromDateFromUrl || undefined,
//         toDate: toDateFromUrl || undefined
//       }),
//     placeholderData: keepPreviousData,
//     staleTime: 3000 * 60
//   })

//   const displayData = qrListData?.data?.data || []
//   const totalElements = qrListData?.data?.totalElements || 0
//   const totalPages = qrListData?.data?.totalPages || 1

//   const activeCount = displayData.filter((qr: Qrcodes) => qr.isActive && qr.maxEntries !== qr.usedEntries).length
//   const expiredToday = displayData.filter((qr: Qrcodes) => {
//     const daynow = new Date()
//     const day = new Date(qr.validTo)
//     return daynow >= day
//   }).length

//   const updateQrMutation = useMutation({
//     mutationFn: ({ id, body }: { id: string; body: BodyCreateQrcode }) => QRCodeApi.updateGuestQr(id, body),
//     onSuccess: () => {
//       toast.success('Cập nhật mã QR thành công!')
//       setIsUpdateModalOpen(false)
//       setSelectedQr(null)
//       refetch()
//     },
//     onError: () => {
//       toast.error('Cập nhật mã QR thất bại')
//     }
//   })

//   const createQrMutation = useMutation({
//     mutationFn: (body: BodyCreateQrcode) => QRCodeApi.createGuestQr(body),
//     onSuccess: () => {
//       toast.success('Tạo mã QR thành công!')
//       setIsCreateModalOpen(false)
//       reset()
//       refetch()
//     },
//     onError: () => {
//       toast.error('Tạo mã QR thất bại')
//     }
//   })

//   const revokeMutation = useMutation({
//     mutationFn: (id: string) => QRCodeApi.deleteGuestQr(id),
//     onSuccess: () => {
//       toast.success('Đã thu hồi mã QR thành công')
//       refetch()
//     },
//     onError: () => {
//       toast.error('Thu hồi thất bại')
//     }
//   })

//   const handleRevoke = (id: string) => {
//     if (window.confirm('Bạn có chắc chắn muốn thu hồi mã QR này?')) {
//       revokeMutation.mutate(id)
//     }
//   }

//   const handleViewDetail = (id: string) => {
//     navigate(`/qrcodeDetail/${id}`)
//   }

//   const handleOpenUpdateModal = (qr: Qrcodes) => {
//     setSelectedQr(qr)
//     setIsUpdateModalOpen(true)
//     resetUpdate({
//       visitorName: qr.visitor.name,
//       visitorPhone: qr.visitor.phone,
//       visitorIdCard: qr.visitor.idCard || '',
//       validFrom: formatDateTimeLocal(qr.validFrom),
//       validTo: formatDateTimeLocal(qr.validTo),
//       maxEntries: qr.maxEntries,
//       status: qr.status
//     })
//   }

//   const formatDateTimeLocal = (dateString: string) => {
//     const date = new Date(dateString)
//     return date.toISOString().slice(0, 16)
//   }

//   // ✅ FIX: Cập nhật onSubmitUpdate - xử lý status REVOKED
//   const onSubmitUpdate = (data: UpdateQrFormData) => {
//     if (!selectedQr) return

//     const updateData = {
//       visitorName: data.visitorName,
//       visitorPhone: data.visitorPhone,
//       visitorIdCard: data.visitorIdCard || '',
//       validFrom: new Date(data.validFrom).toISOString(),
//       validTo: new Date(data.validTo).toISOString(),
//       maxEntries: data.maxEntries,
//       status: data.status,
//       // ✅ Gửi flag revoke nếu backend hỗ trợ
//       isRevoked: data.status === 'REVOKED'
//     }
//     updateQrMutation.mutate({ id: selectedQr.id, body: updateData })
//   }

//   const handleEntryTypeChange = (multiple: boolean) => {
//     setIsMultipleEntries(multiple)
//     setValue('maxEntries', multiple ? 5 : 1)
//   }

//   const handleMaxEntriesChange = (increment: boolean) => {
//     const newValue = increment ? maxEntries + 1 : Math.max(1, maxEntries - 1)
//     setValue('maxEntries', newValue)
//   }

//   const onSubmit = (data: CreateQrFormData) => {
//     const submitData: BodyCreateQrcode = {
//       visitorName: data.visitorName,
//       visitorPhone: data.visitorPhone,
//       visitorIdCard: data.visitorIdCard || '',
//       apartmentId: 1,
//       validFrom: new Date(data.validFrom),
//       validTo: new Date(data.validTo),
//       maxEntries: data.maxEntries || 1
//     }
//     createQrMutation.mutate(submitData)
//   }

//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString)
//     return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} - ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
//   }

//   // ✅ FIX: Cập nhật getStatusBadge - kiểm tra đúng thứ tự
//   const getStatusBadge = (qr: Qrcodes) => {
//     const currentDate = new Date()
//     const validToDate = new Date(qr.validTo)

//     // ✅ Kiểm tra REVOKED trước
//     if (qr.isRevoked) {
//       return (
//         <span className='px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-100 text-red-700 flex items-center gap-1'>
//           <span className='material-symbols-outlined text-xs'>block</span>
//           REVOKED
//         </span>
//       )
//     }

//     // ✅ Kiểm tra hết hạn
//     if (currentDate > validToDate) {
//       return (
//         <span className='px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-orange-100 text-orange-700 flex items-center gap-1'>
//           <span className='material-symbols-outlined text-xs'>schedule</span>
//           EXPIRED
//         </span>
//       )
//     }

//     // ✅ Kiểm tra lượt vào hết
//     if (qr.usedEntries >= qr.maxEntries) {
//       return (
//         <span className='px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-200 text-slate-600 flex items-center gap-1'>
//           <span className='material-symbols-outlined text-xs'>done_all</span>
//           FULL
//         </span>
//       )
//     }

//     // ✅ ACTIVE
//     return (
//       <span className='px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-100 text-green-700 flex items-center gap-1'>
//         <span className='material-symbols-outlined text-xs'>check_circle</span>
//         ACTIVE
//       </span>
//     )
//   }

//   const getUsagePercent = (qr: Qrcodes) => {
//     if (qr.maxEntries === 0) return 0
//     return (qr.usedEntries / qr.maxEntries) * 100
//   }

//   const handleResetFilters = () => {
//     setSearchInput('')
//     setOnlyValidFilter(false)
//     setFromDate('')
//     setToDate('')
//     navigate({ pathname: '/qrcode', search: createSearchParams({ page: '1', limit: '10' }).toString() })
//   }

//   return (
//     <div className="bg-surface text-on-surface min-h-screen font-['Manrope',sans-serif]">
//       <div className='pb-20 px-6 lg:px-12 w-full max-w-7xl mx-auto'>
//         {/* Welcome Header */}
//         <div className='mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6'>
//           <div>
//             <h2 className='text-4xl font-extrabold text-on-surface tracking-tight'>Xin chào, {user?.name || 'User'}</h2>
//             <p className='text-on-surface-variant mt-2 max-w-md'>
//               Quản lý mã QR truy cập cho khách ghé thăm tại căn hộ của bạn.
//             </p>
//           </div>
//           <div className='flex gap-3'>
//             <button
//               onClick={() => setIsCreateModalOpen(true)}
//               className='px-8 py-4 bg-gradient-to-br from-primary to-primary-container text-white rounded-full font-bold flex items-center gap-3 shadow-lg shadow-primary/20 active:scale-95 transition-all'
//             >
//               <span className='material-symbols-outlined'>qr_code_2_add</span>
//               Tạo mã QR mới
//             </button>
//           </div>
//         </div>

//         {/* Bento Stats Grid */}
//         <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-12'>
//           <div className='col-span-1 md:col-span-2 bg-surface-container-lowest p-6 rounded-3xl flex items-center justify-between shadow-sm border-0'>
//             <div>
//               <p className='text-on-surface-variant text-sm font-medium'>Mã QR đang hoạt động</p>
//               <p className='text-5xl font-black text-on-surface mt-2'>{activeCount}</p>
//             </div>
//             <div className='h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary'>
//               <span className='material-symbols-outlined text-4xl'>sensors</span>
//             </div>
//           </div>
//           <div className='bg-surface-container-low p-6 rounded-3xl shadow-sm'>
//             <p className='text-on-surface-variant text-sm font-medium'>QR Hết hạn</p>
//             <p className='text-3xl font-bold text-on-surface mt-2'>{expiredToday}</p>
//             <div className='mt-4 flex items-center gap-1 text-error text-xs font-bold uppercase tracking-tighter'>
//               <span className='material-symbols-outlined text-sm'>schedule</span>
//               Cần gia hạn
//             </div>
//           </div>
//           <div className='bg-surface-container-low p-6 rounded-3xl shadow-sm'>
//             <p className='text-on-surface-variant text-sm font-medium'>Tổng lượt vào tuần này</p>
//             <p className='text-3xl font-bold text-on-surface mt-2'>
//               {displayData.reduce((sum: number, qr: Qrcodes) => sum + qr.usedEntries, 0)}
//             </p>
//             <div className='mt-4 flex items-center gap-1 text-primary text-xs font-bold uppercase tracking-tighter'>
//               <span className='material-symbols-outlined text-sm'>trending_up</span>
//               Lượt truy cập
//             </div>
//           </div>
//         </div>

//         {/* QR List Section */}
//         <section className='bg-surface-container-lowest rounded-[2rem] overflow-hidden shadow-sm'>
//           <div className='p-6 border-b border-surface-container'>
//             <div className='flex flex-wrap items-center justify-between gap-4 mb-4'>
//               <h3 className='text-xl font-bold text-on-surface'>Danh sách mã QR khách</h3>
//               <button
//                 onClick={handleResetFilters}
//                 className='px-4 py-2 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2 bg-surface-container-low rounded-full hover:bg-primary/10'
//               >
//                 <span className='material-symbols-outlined text-base'>refresh</span>
//                 Xóa bộ lọc
//               </button>
//             </div>

//             <div className='flex flex-wrap items-center gap-3'>
//               <div className='flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-full flex-1 min-w-[200px]'>
//                 <span className='material-symbols-outlined text-slate-400 text-lg'>search</span>
//                 <input
//                   className='bg-transparent border-none outline-none text-sm text-on-surface w-full'
//                   placeholder='Tìm kiếm theo tên khách...'
//                   type='text'
//                   value={searchInput}
//                   onChange={(e) => setSearchInput(e.target.value)}
//                 />
//                 {searchInput && (
//                   <button onClick={() => setSearchInput('')} className='text-slate-400 hover:text-slate-600'>
//                     <span className='material-symbols-outlined text-sm'>close</span>
//                   </button>
//                 )}
//               </div>

//               <label className='flex items-center gap-2 cursor-pointer px-3 py-2 bg-surface-container-low rounded-full'>
//                 <input
//                   type='checkbox'
//                   checked={onlyValidFilter}
//                   onChange={(e) => setOnlyValidFilter(e.target.checked)}
//                   className='w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary'
//                 />
//                 <span className='text-sm text-on-surface-variant'>Còn hiệu lực</span>
//               </label>

//               <input
//                 type='date'
//                 value={fromDate}
//                 onChange={(e) => setFromDate(e.target.value)}
//                 className='px-3 py-2 bg-surface-container-low border-none rounded-full text-sm'
//                 placeholder='Từ ngày'
//               />
//               <span className='material-symbols-outlined text-on-surface-variant/60 text-base self-center'>east</span>
//               <input
//                 type='date'
//                 value={toDate}
//                 onChange={(e) => setToDate(e.target.value)}
//                 className='px-3 py-2 bg-surface-container-low border-none rounded-full text-sm'
//                 placeholder='Đến ngày'
//               />
//             </div>
//           </div>

//           {isLoading && (
//             <div className='flex justify-center py-12'>
//               <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
//             </div>
//           )}

//           {!isLoading && (
//             <>
//               <div className='overflow-x-auto'>
//                 <table className='w-full text-left border-collapse'>
//                   <thead>
//                     <tr className='bg-surface-container-low/50'>
//                       <th className='px-8 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-wider'>
//                         Tên khách / SĐT
//                       </th>
//                       <th className='px-8 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-wider'>
//                         Mã QR
//                       </th>
//                       <th className='px-8 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-center'>
//                         Số lượt vào
//                       </th>
//                       <th className='px-8 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-wider'>
//                         Thời gian hiệu lực
//                       </th>
//                       <th className='px-8 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-wider'>
//                         Trạng thái
//                       </th>
//                       <th className='px-8 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-right'>
//                         Thao tác
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className='divide-y divide-surface-container'>
//                     {displayData.length === 0 ? (
//                       <tr>
//                         <td colSpan={6} className='px-8 py-12 text-center text-on-surface-variant'>
//                           {searchInput || onlyValidFilter || fromDate || toDate
//                             ? 'Không tìm thấy mã QR nào phù hợp'
//                             : 'Chưa có mã QR nào. Hãy tạo mã QR đầu tiên!'}
//                         </td>
//                       </tr>
//                     ) : (
//                       displayData.map((qr: Qrcodes) => (
//                         <tr key={qr.id} className='hover:bg-slate-50 transition-colors group'>
//                           <td className='px-8 py-6'>
//                             <div className='font-bold text-on-surface'>{qr.visitor.name}</div>
//                             <div className='text-xs text-on-surface-variant opacity-70'>{qr.visitor.phone}</div>
//                           </td>
//                           <td className='px-8 py-6'>
//                             <div className='flex items-center gap-2 text-primary font-mono text-sm bg-primary/5 px-3 py-1 rounded-lg w-fit'>
//                               <span className='material-symbols-outlined text-sm'>qr_code_2</span>
//                               {qr.qrCode.slice(-8)}
//                             </div>
//                           </td>
//                           <td className='px-8 py-6 text-center'>
//                             <div className='text-sm font-bold text-on-surface'>
//                               {qr.usedEntries}/{qr.maxEntries}
//                             </div>
//                             <div className='w-16 h-1.5 bg-surface-container rounded-full mx-auto mt-2'>
//                               <div
//                                 className='h-full bg-primary rounded-full transition-all'
//                                 style={{ width: `${getUsagePercent(qr)}%` }}
//                               />
//                             </div>
//                           </td>
//                           <td className='px-8 py-6 text-sm text-on-surface-variant'>{formatDate(qr.validTo)}</td>
//                           <td className='px-8 py-6'>{getStatusBadge(qr)}</td>
//                           <td className='px-8 py-6 text-right'>
//                             <div className='flex justify-end gap-2'>
//                               <button
//                                 onClick={() => handleViewDetail(qr.id)}
//                                 className='p-2 text-primary hover:bg-primary/10 rounded-xl transition-all'
//                                 title='Xem chi tiết'
//                               >
//                                 <span className='material-symbols-outlined'>visibility</span>
//                               </button>
//                               <button
//                                 onClick={() => handleOpenUpdateModal(qr)}
//                                 className='p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-all'
//                                 title='Chỉnh sửa'
//                               >
//                                 <span className='material-symbols-outlined'>edit</span>
//                               </button>
//                               <button
//                                 onClick={() => handleRevoke(qr.id)}
//                                 className='p-2 text-error hover:bg-error/10 rounded-xl transition-all'
//                                 title='Thu hồi'
//                               >
//                                 <span className='material-symbols-outlined'>block</span>
//                               </button>
//                             </div>
//                           </td>
//                         </tr>
//                       ))
//                     )}
//                   </tbody>
//                 </table>
//               </div>

//               {totalElements > 0 && (
//                 <div className='px-8 py-6 border-t border-surface-container'>
//                   <Paginate
//                     queryConfig={{
//                       page: pageFromUrl,
//                       limit: limitFromUrl
//                     }}
//                     pageSize={totalPages}
//                     search={searchFromUrl || undefined}
//                     onlyValid={onlyValidFromUrl || undefined}
//                     fromDate={fromDateFromUrl || undefined}
//                     toDate={toDateFromUrl || undefined}
//                   />
//                 </div>
//               )}
//             </>
//           )}
//         </section>
//       </div>

//       {/* FAB for Mobile */}
//       <button
//         onClick={() => setIsCreateModalOpen(true)}
//         className='lg:hidden fixed bottom-24 right-6 h-16 w-16 bg-primary text-white rounded-full shadow-2xl shadow-primary/40 flex items-center justify-center z-50 active:scale-90 transition-transform'
//       >
//         <span className='material-symbols-outlined text-3xl'>qr_code_2_add</span>
//       </button>

//       {isCreateModalOpen && (
//         <div className='fixed inset-0 bg-on-secondary-container/10 backdrop-blur-sm z-[60] flex items-center justify-center p-4'>
//           <div className='w-full max-w-2xl bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_32px_64px_0_rgba(68,93,128,0.08)] relative'>
//             <div className='px-8 pt-8 pb-6 border-b border-outline-variant/10'>
//               <div className='flex justify-between items-start'>
//                 <div>
//                   <span className='text-[10px] font-bold tracking-[0.15em] text-primary uppercase mb-1 block'>
//                     Homelink AI • Bảo mật truy cập
//                   </span>
//                   <h3 className='text-2xl font-extrabold text-on-surface tracking-tight'>Tạo mã QR cho khách</h3>
//                 </div>
//                 <button
//                   onClick={() => setIsCreateModalOpen(false)}
//                   className='w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high transition-colors'
//                 >
//                   <span className='material-symbols-outlined'>close</span>
//                 </button>
//               </div>
//             </div>

//             <form onSubmit={handleSubmit(onSubmit)}>
//               <div className='px-8 py-6 space-y-8'>
//                 <div className='grid grid-cols-2 gap-x-8 gap-y-6'>
//                   <div className='col-span-2 sm:col-span-1'>
//                     <label className='block text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-2'>
//                       Tên khách
//                     </label>
//                     <Input
//                       register={register}
//                       name='visitorName'
//                       errorMassage={errors.visitorName?.message}
//                       classNameInput='w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:bg-surface-container-lowest transition-all placeholder:text-outline/50'
//                       placeholder='VD: Nguyễn Văn A'
//                       type='text'
//                     />
//                   </div>

//                   <div className='col-span-2 sm:col-span-1'>
//                     <label className='block text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-2'>
//                       Số điện thoại
//                     </label>
//                     <Input
//                       register={register}
//                       name='visitorPhone'
//                       errorMassage={errors.visitorPhone?.message}
//                       classNameInput='w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:bg-surface-container-lowest transition-all placeholder:text-outline/50'
//                       placeholder='+84 000 000 000'
//                       type='tel'
//                     />
//                   </div>

//                   <div className='col-span-2'>
//                     <label className='block text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-2'>
//                       CMND / CCCD
//                     </label>
//                     <Input
//                       register={register}
//                       name='visitorIdCard'
//                       errorMassage={errors.visitorIdCard?.message}
//                       classNameInput='w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:bg-surface-container-lowest transition-all placeholder:text-outline/50'
//                       placeholder='Số CMND hoặc CCCD (không bắt buộc)'
//                       type='text'
//                     />
//                   </div>

//                   <div className='col-span-2 grid grid-cols-2 gap-4 p-5 bg-surface-container-low rounded-xl border border-outline-variant/5'>
//                     <div className='col-span-2 mb-2'>
//                       <label className='text-[10px] font-bold tracking-widest text-on-surface-variant uppercase'>
//                         Thời gian hiệu lực
//                       </label>
//                     </div>
//                     <div>
//                       <span className='block text-[9px] font-medium text-outline mb-1'>Bắt đầu</span>
//                       <Input
//                         register={register}
//                         name='validFrom'
//                         errorMassage={errors.validFrom?.message}
//                         classNameInput='w-full bg-surface-container-lowest border-none rounded-md px-3 py-2 text-xs focus:ring-1 focus:ring-primary'
//                         type='datetime-local'
//                       />
//                     </div>
//                     <div>
//                       <span className='block text-[9px] font-medium text-outline mb-1'>Kết thúc</span>
//                       <Input
//                         register={register}
//                         name='validTo'
//                         errorMassage={errors.validTo?.message}
//                         classNameInput='w-full bg-surface-container-lowest border-none rounded-md px-3 py-2 text-xs focus:ring-1 focus:ring-primary'
//                         type='datetime-local'
//                       />
//                     </div>
//                   </div>

//                   <div className='col-span-2'>
//                     <label className='block text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-3'>
//                       Số lượt truy cập
//                     </label>
//                     <div className='flex items-center gap-6'>
//                       <label className='flex items-center gap-3 cursor-pointer group'>
//                         <div
//                           onClick={() => handleEntryTypeChange(false)}
//                           className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
//                             !isMultipleEntries ? 'border-primary bg-primary' : 'border-outline-variant'
//                           }`}
//                         >
//                           {!isMultipleEntries && <div className='w-1.5 h-1.5 rounded-full bg-white' />}
//                         </div>
//                         <span
//                           className={`text-sm font-medium ${!isMultipleEntries ? 'text-on-surface' : 'text-on-surface-variant'}`}
//                         >
//                           Một lượt
//                         </span>
//                       </label>
//                       <label className='flex items-center gap-3 cursor-pointer group'>
//                         <div
//                           onClick={() => handleEntryTypeChange(true)}
//                           className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
//                             isMultipleEntries ? 'border-primary bg-primary' : 'border-outline-variant'
//                           }`}
//                         >
//                           {isMultipleEntries && <div className='w-1.5 h-1.5 rounded-full bg-white' />}
//                         </div>
//                         <span
//                           className={`text-sm font-medium ${isMultipleEntries ? 'text-on-surface' : 'text-on-surface-variant'}`}
//                         >
//                           Nhiều lượt
//                         </span>
//                       </label>
//                       {isMultipleEntries && (
//                         <div className='flex-1 flex justify-end'>
//                           <div className='flex items-center bg-surface-container-low rounded-lg px-2'>
//                             <button
//                               type='button'
//                               onClick={() => handleMaxEntriesChange(false)}
//                               className='w-8 h-8 flex items-center justify-center text-on-surface-variant'
//                             >
//                               <span className='material-symbols-outlined text-base'>remove</span>
//                             </button>
//                             <span className='px-4 text-sm font-bold text-on-surface'>{maxEntries}</span>
//                             <button
//                               type='button'
//                               onClick={() => handleMaxEntriesChange(true)}
//                               className='w-8 h-8 flex items-center justify-center text-primary'
//                             >
//                               <span className='material-symbols-outlined text-base'>add</span>
//                             </button>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className='px-8 pb-8 pt-4 flex items-center justify-end gap-4'>
//                 <button
//                   type='button'
//                   onClick={() => setIsCreateModalOpen(false)}
//                   className='px-8 py-3 text-sm font-bold text-primary hover:bg-primary/5 rounded-full transition-all active:scale-95'
//                 >
//                   Hủy bỏ
//                 </button>
//                 <button
//                   type='submit'
//                   disabled={createQrMutation.isPending}
//                   className='px-10 py-3 bg-gradient-to-br from-primary to-primary-container text-white text-sm font-bold rounded-full shadow-lg shadow-primary/20 hover:brightness-110 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50'
//                 >
//                   <span className='material-symbols-outlined text-lg'>qr_code_scanner</span>
//                   {createQrMutation.isPending ? 'Đang tạo...' : 'Tạo mã QR'}
//                 </button>
//               </div>
//             </form>

//             <div className='absolute -top-24 -right-24 w-35 h-35 bg-primary/5 rounded-full blur-3xl pointer-events-none' />
//             <div className='absolute -bottom-24 -left-24 w-35 h-35 bg-secondary-fixed/10 rounded-full blur-3xl pointer-events-none' />
//           </div>
//         </div>
//       )}

//       {isUpdateModalOpen && selectedQr && (
//         <div className='fixed inset-0 bg-on-secondary-container/10 backdrop-blur-sm z-[60] flex items-center justify-center p-4'>
//           <div className='w-full max-w-lg bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_32px_64px_0_rgba(68,93,128,0.08)] relative'>
//             <div className='px-5 pt-4 pb-2 border-b border-outline-variant/10'>
//               <div className='flex justify-between items-center'>
//                 <h3 className='text-xl font-extrabold text-on-surface tracking-tight'>Cập nhật mã QR</h3>
//                 <button
//                   onClick={() => {
//                     setIsUpdateModalOpen(false)
//                     setSelectedQr(null)
//                   }}
//                   className='w-8 h-8 flex items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high transition-colors'
//                 >
//                   <span className='material-symbols-outlined text-base'>close</span>
//                 </button>
//               </div>
//             </div>

//             <form onSubmit={handleSubmitUpdate(onSubmitUpdate)}>
//               <div className='px-5 py-4 space-y-4'>
//                 <div className='grid grid-cols-2 gap-4'>
//                   <div className='col-span-2 sm:col-span-1'>
//                     <label className='block text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-1'>
//                       Tên khách *
//                     </label>
//                     <Input
//                       register={registerUpdate}
//                       name='visitorName'
//                       errorMassage={updateErrors.visitorName?.message}
//                       classNameInput='w-full bg-surface-container-low border-none rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary'
//                       placeholder='Nhập tên khách'
//                     />
//                   </div>

//                   <div className='col-span-2 sm:col-span-1'>
//                     <label className='block text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-1'>
//                       Số điện thoại *
//                     </label>
//                     <Input
//                       register={registerUpdate}
//                       name='visitorPhone'
//                       errorMassage={updateErrors.visitorPhone?.message}
//                       classNameInput='w-full bg-surface-container-low border-none rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary'
//                       placeholder='Nhập số điện thoại'
//                     />
//                   </div>

//                   <div className='col-span-2'>
//                     <label className='block text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-1'>
//                       CMND/CCCD
//                     </label>
//                     <Input
//                       register={registerUpdate}
//                       name='visitorIdCard'
//                       errorMassage={updateErrors.visitorIdCard?.message}
//                       classNameInput='w-full bg-surface-container-low border-none rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary'
//                       placeholder='Số CMND/CCCD (không bắt buộc)'
//                     />
//                   </div>

//                   <div className='col-span-2'>
//                     <div className='bg-surface-container-low rounded-xl p-3 border border-outline-variant/5'>
//                       <label className='block text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-2'>
//                         Thời gian hiệu lực
//                       </label>
//                       <div className='grid grid-cols-2 gap-3'>
//                         <div>
//                           <span className='block text-[9px] font-medium text-outline mb-1'>Từ ngày *</span>
//                           <Input
//                             register={registerUpdate}
//                             name='validFrom'
//                             type='datetime-local'
//                             errorMassage={updateErrors.validFrom?.message}
//                             classNameInput='w-full bg-surface-container-lowest border-none rounded-md px-2 py-1.5 text-xs focus:ring-1 focus:ring-primary'
//                           />
//                         </div>
//                         <div>
//                           <span className='block text-[9px] font-medium text-outline mb-1'>Đến ngày *</span>
//                           <Input
//                             register={registerUpdate}
//                             name='validTo'
//                             type='datetime-local'
//                             errorMassage={updateErrors.validTo?.message}
//                             classNameInput='w-full bg-surface-container-lowest border-none rounded-md px-2 py-1.5 text-xs focus:ring-1 focus:ring-primary'
//                           />
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   <div className='col-span-2'>
//                     <label className='block text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-1'>
//                       Số lượt tối đa *
//                     </label>
//                     <Input
//                       register={registerUpdate}
//                       name='maxEntries'
//                       type='number'
//                       errorMassage={updateErrors.maxEntries?.message}
//                       classNameInput='w-full bg-surface-container-low border-none rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary'
//                     />
//                   </div>

//                   {/* ✅ FIX: Status dropdown với warning/info messages */}
//                   <div className='col-span-2'>
//                     <label className='block text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-2'>
//                       Trạng thái
//                     </label>
//                     <div className='relative'>
//                       <select
//                         {...registerUpdate('status')}
//                         className='w-full bg-surface-container-low border-none rounded-lg px-3 py-3 text-sm focus:ring-1 focus:ring-primary appearance-none cursor-pointer'
//                       >
//                         <option value='ACTIVE'>✅ Đang hoạt động</option>
//                         <option value='EXPIRED'>⏰ Đã hết hạn</option>
//                         <option value='REVOKED'>🔒 Đã thu hồi</option>
//                       </select>
//                       <span className='material-symbols-outlined absolute right-3 top-3 text-on-surface-variant pointer-events-none text-lg'>
//                         arrow_drop_down
//                       </span>
//                     </div>

//                     {/* ✅ Warning khi chọn REVOKED */}
//                     {statusWatch === 'REVOKED' && (
//                       <div className='mt-2 p-3 bg-red-100/50 border border-red-200 rounded-lg flex items-start gap-2'>
//                         <span className='material-symbols-outlined text-red-600 text-base flex-shrink-0'>warning</span>
//                         <p className='text-xs text-red-700'>
//                           ⚠️ Sau khi thu hồi, mã QR này sẽ không còn hoạt động. Ảnh QR cũ sẽ bị từ chối khi quét.
//                         </p>
//                       </div>
//                     )}

//                     {/* ✅ Info khi chọn EXPIRED */}
//                     {statusWatch === 'EXPIRED' && (
//                       <div className='mt-2 p-3 bg-orange-100/50 border border-orange-200 rounded-lg flex items-start gap-2'>
//                         <span className='material-symbols-outlined text-orange-600 text-base flex-shrink-0'>info</span>
//                         <p className='text-xs text-orange-700'>
//                           ℹ️ Mã QR đã hết hạn. Khách không thể truy cập bằng mã này. Tạo mã QR mới để cấp quyền tiếp.
//                         </p>
//                       </div>
//                     )}

//                     {/* ✅ Info khi chọn ACTIVE */}
//                     {statusWatch === 'ACTIVE' && (
//                       <div className='mt-2 p-3 bg-green-100/50 border border-green-200 rounded-lg flex items-start gap-2'>
//                         <span className='material-symbols-outlined text-green-600 text-base flex-shrink-0'>
//                           check_circle
//                         </span>
//                         <p className='text-xs text-green-700'>
//                           ✓ Mã QR đang hoạt động bình thường. Khách có thể truy cập.
//                         </p>
//                       </div>
//                     )}

//                     {updateErrors.status && <p className='text-red-500 text-xs mt-2'>{updateErrors.status.message}</p>}
//                   </div>
//                 </div>
//               </div>

//               <div className='px-5 pb-5 pt-3 flex items-center justify-end gap-3 border-t border-outline-variant/10'>
//                 <button
//                   type='button'
//                   onClick={() => {
//                     setIsUpdateModalOpen(false)
//                     setSelectedQr(null)
//                   }}
//                   className='px-5 py-2 text-sm font-bold text-primary hover:bg-primary/5 rounded-full transition-all'
//                 >
//                   Hủy
//                 </button>
//                 <button
//                   type='submit'
//                   disabled={updateQrMutation.isPending}
//                   className='px-6 py-2 bg-gradient-to-br from-primary to-primary-container text-white text-sm font-bold rounded-full shadow-lg shadow-primary/20 hover:brightness-110 transition-all flex items-center gap-2 disabled:opacity-50'
//                 >
//                   <span className='material-symbols-outlined text-base'>save</span>
//                   {updateQrMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật'}
//                 </button>
//               </div>
//             </form>

//             <div className='absolute -top-20 -right-20 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none' />
//             <div className='absolute -bottom-20 -left-20 w-32 h-32 bg-secondary-fixed/10 rounded-full blur-3xl pointer-events-none' />
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// import React from 'react'

// export default function QrcodeManagement() {
//   return (
//     <div className='bg-surface text-on-surface min-h-screen'>
//       <main className='pt-24 pb-12 px-6 md:px-12 bg-surface'>
//         <div className='max-w-6xl mx-auto space-y-12'>
//           {/* Section: Mã QR Cá nhân */}
//           <section>
//             <div className='flex flex-col md:flex-row gap-10 items-center'>
//               <div className='w-full md:w-1/2 space-y-6'>
//                 <label className='text-[10px] font-bold tracking-[0.1em] text-primary uppercase'>Identity Secure</label>
//                 <h2 className='text-4xl font-extrabold tracking-tight text-on-surface leading-tight'>Mã QR Cá nhân</h2>
//                 <p className='text-on-surface-variant text-lg leading-relaxed max-w-md'>
//                   Sử dụng mã QR này để truy cập nhanh chóng vào các khu vực tiện ích và cửa chính của tòa nhà. Mã luôn
//                   được mã hóa để đảm bảo an ninh tuyệt đối.
//                 </p>
//                 <div className='flex gap-4 pt-4'>
//                   <button className='px-8 py-3 bg-gradient-to-br from-primary to-primary-container text-white rounded-full font-bold flex items-center gap-2 hover:brightness-105 transition-all'>
//                     <span className='material-symbols-outlined text-sm'>download</span>
//                     Tải xuống
//                   </button>
//                   <button className='px-8 py-3 bg-surface-container-lowest border border-outline-variant/15 text-primary rounded-full font-bold flex items-center gap-2 hover:bg-surface-container-low transition-all'>
//                     <span className='material-symbols-outlined text-sm'>share</span>
//                     Chia sẻ
//                   </button>
//                 </div>
//               </div>

//               <div className='w-full md:w-1/2 flex justify-center md:justify-end'>
//                 <div className='bg-surface-container-lowest p-8 rounded-[2rem] shadow-[0_32px_64px_rgba(68,93,128,0.06)] border border-white/40 relative overflow-hidden'>
//                   <div className='relative z-10 space-y-6 text-center'>
//                     <div className='bg-white p-4 rounded-3xl shadow-sm inline-block'>
//                       <div className='w-48 h-48 bg-surface-container flex items-center justify-center rounded-xl'>
//                         <span className='material-symbols-outlined text-primary/20 text-8xl'>qr_code_2</span>
//                       </div>
//                     </div>
//                     <div className='space-y-1'>
//                       <p className='text-xs font-bold tracking-widest text-primary uppercase'>PERSONAL_e88995f4</p>
//                       <div className='flex items-center justify-center gap-2'>
//                         <span className='w-2 h-2 rounded-full bg-green-500'></span>
//                         <span className='text-sm font-bold text-on-surface'>ACTIVE</span>
//                       </div>
//                       <p className='text-[11px] text-on-surface-variant pt-2'>Hết hạn: Dec 31, 2027</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* Section: Danh sách QR Khách */}
//           <section className='space-y-8'>
//             <div className='flex justify-between items-end'>
//               <div className='space-y-1'>
//                 <h3 className='text-2xl font-extrabold tracking-tight text-on-surface'>Danh sách QR Khách</h3>
//                 <p className='text-on-surface-variant text-sm'>
//                   Quản lý mã truy cập tạm thời cho khách thăm và giao hàng.
//                 </p>
//               </div>
//               <button className='text-primary font-bold text-sm flex items-center gap-1 hover:underline'>
//                 <span className='material-symbols-outlined text-lg'>add_circle</span>
//                 Tạo mã mới
//               </button>
//             </div>

//             {/* Guest QR Grid */}
//             <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
//               {/* Guest Card 1 */}
//               <div className='bg-surface-container-low p-6 rounded-[1.5rem] flex flex-col sm:flex-row gap-6 hover:bg-surface-container transition-all group'>
//                 <div className='w-24 h-24 bg-surface-container-lowest rounded-2xl flex items-center justify-center shrink-0 shadow-sm'>
//                   <span className='material-symbols-outlined text-primary/40 text-4xl'>qr_code</span>
//                 </div>
//                 <div className='flex-grow space-y-4'>
//                   <div className='flex justify-between items-start'>
//                     <div>
//                       <h4 className='font-bold text-on-surface'>Nguyễn Văn C</h4>
//                       <p className='text-xs text-on-surface-variant tracking-tighter'>GUEST_99539f2e... • Căn AS-201</p>
//                     </div>
//                     <label className='relative inline-flex items-center cursor-pointer'>
//                       <input type='checkbox' className='sr-only peer' defaultChecked />
//                       <div className="w-10 h-5 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
//                     </label>
//                   </div>
//                   <div className='flex items-center gap-4 text-xs text-on-surface-variant'>
//                     <span className='flex items-center gap-1'>
//                       <span className='material-symbols-outlined text-sm'>call</span>
//                       0987654321
//                     </span>
//                     <span className='flex items-center gap-1'>
//                       <span className='material-symbols-outlined text-sm'>calendar_today</span>
//                       24/05/2026
//                     </span>
//                   </div>
//                   <div className='flex gap-2 pt-2'>
//                     <button className='flex-1 py-2 bg-surface-container-lowest border border-outline-variant/15 rounded-lg text-[10px] font-bold text-on-surface-variant hover:bg-primary/5 hover:text-primary transition-all flex flex-col items-center justify-center gap-1'>
//                       <span className='material-symbols-outlined text-sm'>download</span>
//                       Tải xuống
//                     </button>
//                     <button className='flex-1 py-2 bg-surface-container-lowest border border-outline-variant/15 rounded-lg text-[10px] font-bold text-on-surface-variant hover:bg-primary/5 hover:text-primary transition-all flex flex-col items-center justify-center gap-1'>
//                       <span className='material-symbols-outlined text-sm'>share</span>
//                       Chia sẻ
//                     </button>
//                     <button className='flex-1 py-2 bg-surface-container-lowest border border-outline-variant/15 rounded-lg text-[10px] font-bold text-on-surface-variant hover:bg-primary/5 hover:text-primary transition-all flex flex-col items-center justify-center gap-1'>
//                       <span className='material-symbols-outlined text-sm'>edit</span>
//                       Sửa
//                     </button>
//                     <button className='flex-1 py-2 bg-surface-container-lowest border border-outline-variant/15 rounded-lg text-[10px] font-bold text-on-surface-variant hover:bg-primary/5 hover:text-primary transition-all flex flex-col items-center justify-center gap-1'>
//                       <span className='material-symbols-outlined text-sm'>history</span>
//                       Lịch sử
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               {/* Guest Card 2 */}
//               <div className='bg-surface-container-low p-6 rounded-[1.5rem] flex flex-col sm:flex-row gap-6 hover:bg-surface-container transition-all group'>
//                 <div className='w-24 h-24 bg-surface-container-lowest rounded-2xl flex items-center justify-center shrink-0 shadow-sm opacity-60'>
//                   <span className='material-symbols-outlined text-on-surface-variant/40 text-4xl'>qr_code</span>
//                 </div>
//                 <div className='flex-grow space-y-4'>
//                   <div className='flex justify-between items-start'>
//                     <div>
//                       <h4 className='font-bold text-on-surface'>Trần Thị B</h4>
//                       <p className='text-xs text-on-surface-variant tracking-tighter'>GUEST_44120a1b... • Căn AS-201</p>
//                     </div>
//                     <label className='relative inline-flex items-center cursor-pointer'>
//                       <input type='checkbox' className='sr-only peer' />
//                       <div className="w-10 h-5 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
//                     </label>
//                   </div>
//                   <div className='flex items-center gap-4 text-xs text-on-surface-variant'>
//                     <span className='flex items-center gap-1'>
//                       <span className='material-symbols-outlined text-sm'>call</span>
//                       0901234567
//                     </span>
//                     <span className='flex items-center gap-1'>
//                       <span className='material-symbols-outlined text-sm'>calendar_today</span>
//                       15/05/2026
//                     </span>
//                   </div>
//                   <div className='flex gap-2 pt-2'>
//                     <button className='flex-1 py-2 bg-surface-container-lowest border border-outline-variant/15 rounded-lg text-[10px] font-bold text-on-surface-variant hover:bg-primary/5 hover:text-primary transition-all flex flex-col items-center justify-center gap-1'>
//                       <span className='material-symbols-outlined text-sm'>download</span>
//                       Tải xuống
//                     </button>
//                     <button className='flex-1 py-2 bg-surface-container-lowest border border-outline-variant/15 rounded-lg text-[10px] font-bold text-on-surface-variant hover:bg-primary/5 hover:text-primary transition-all flex flex-col items-center justify-center gap-1'>
//                       <span className='material-symbols-outlined text-sm'>share</span>
//                       Chia sẻ
//                     </button>
//                     <button className='flex-1 py-2 bg-surface-container-lowest border border-outline-variant/15 rounded-lg text-[10px] font-bold text-on-surface-variant hover:bg-primary/5 hover:text-primary transition-all flex flex-col items-center justify-center gap-1'>
//                       <span className='material-symbols-outlined text-sm'>edit</span>
//                       Sửa
//                     </button>
//                     <button className='flex-1 py-2 bg-surface-container-lowest border border-outline-variant/15 rounded-lg text-[10px] font-bold text-on-surface-variant hover:bg-primary/5 hover:text-primary transition-all flex flex-col items-center justify-center gap-1'>
//                       <span className='material-symbols-outlined text-sm'>history</span>
//                       Lịch sử
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </section>
//         </div>
//       </main>
//     </div>
//   )
// }

// import { useState } from 'react'
// import { useQuery, useMutation } from '@tanstack/react-query'
// import { QRCodeApi } from 'src/apis/QrcodeApi/Qr.api'
// import { toast } from 'react-toastify'
// import type { QRGuestList } from 'src/types/qrcode.type'
// import { useNavigate } from 'react-router-dom'

// export default function QrcodeManagement() {
//   // const queryClient = useQueryClient()
//   const navigate = useNavigate()
//   const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null)
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false)
//   const [editForm, setEditForm] = useState({
//     valid_to: '',
//     max_entries: 1,
//     visitor_name: '',
//     visitor_phone: '',
//     visitor_id_card: ''
//   })

//   // Lấy personal QR
//   const { data: personalQrData, isLoading: isLoadingPersonal } = useQuery({
//     queryKey: ['personal-qr'],
//     queryFn: () => QRCodeApi.getQrcodeMe()
//   })

//   // Lấy danh sách guest QR
//   const {
//     data: guestQrsData,
//     isLoading: isLoadingGuest,
//     refetch
//   } = useQuery({
//     queryKey: ['guest-qrs'],
//     queryFn: () => QRCodeApi.getQrGuesrList()
//   })

//   // Lấy chi tiết guest QR (khi mở modal sửa)
//   const { data: guestDetailData, refetch: refetchDetail } = useQuery({
//     queryKey: ['guest-detail', selectedGuestId],
//     queryFn: () => QRCodeApi.getDetailQrList(selectedGuestId!),
//     enabled: !!selectedGuestId
//   })

//   // Cập nhật trạng thái (bật/tắt)
//   const updateStatusMutation = useMutation({
//     mutationFn: ({ id, status }: { id: string; status: 'ACTIVE' | 'REVOKED' }) => QRCodeApi.PutStatus(id, status),
//     onSuccess: () => {
//       toast.success('Cập nhật trạng thái thành công')
//       refetch()
//     },
//     onError: () => toast.error('Cập nhật thất bại')
//   })

//   // Cập nhật thông tin guest QR
//   // Sửa mutation - nhận đúng kiểu dữ liệu
//   const updateGuestMutation = useMutation({
//     mutationFn: ({
//       id,
//       valid_to,
//       max_entries,
//       visitor_name,
//       visitor_phone,
//       visitor_id_card
//     }: {
//       id: string
//       valid_to: string
//       max_entries: number
//       visitor_name: string
//       visitor_phone: string
//       visitor_id_card: string
//     }) =>
//       QRCodeApi.putBodyQRGuest(id, {
//         valid_to,
//         max_entries,
//         visitor_name,
//         visitor_phone,
//         visitor_id_card
//       }),
//     onSuccess: () => {
//       toast.success('Cập nhật thành công')
//       setIsEditModalOpen(false)
//       refetch()
//       setSelectedGuestId(null)
//     },
//     onError: (error: any) => {
//       toast.error(error?.response?.data?.message || 'Cập nhật thất bại')
//     }
//   })

//   const personalQr = personalQrData?.data?.data
//   const guestList = guestQrsData?.data?.data || []

//   const handleToggleStatus = (qr: QRGuestList) => {
//     const newStatus = qr.status === 'ACTIVE' ? 'REVOKED' : 'ACTIVE'
//     const action = newStatus === 'ACTIVE' ? 'bật' : 'tắt'

//     if (window.confirm(`Bạn có chắc muốn ${action} mã QR của khách "${qr.visitor_name || 'chưa có tên'}"?`)) {
//       updateStatusMutation.mutate({ id: qr.id, status: newStatus })
//     }
//   }

//   const handleOpenEditModal = (qr: QRGuestList) => {
//     setSelectedGuestId(qr.id)
//     setEditForm({
//       valid_to: qr.valid_to,
//       max_entries: qr.max_entries,
//       visitor_name: qr.visitor_name || '',
//       visitor_phone: qr.visitor_phone || '',
//       visitor_id_card: qr.visitor_id_card || ''
//     })
//     setIsEditModalOpen(true)
//   }

//   const handleSubmitEdit = () => {
//     if (!selectedGuestId) return

//     updateGuestMutation.mutate({
//       id: selectedGuestId,
//       valid_to: editForm.valid_to,
//       max_entries: editForm.max_entries,
//       visitor_name: editForm.visitor_name,
//       visitor_phone: editForm.visitor_phone,
//       visitor_id_card: editForm.visitor_id_card
//     })
//   }
//   // Thay vì dùng date-fns, viết hàm đơn giản:
//   const formatDate = (dateString: string) => {
//     if (!dateString) return '---'
//     const date = new Date(dateString)
//     const day = date.getDate().toString().padStart(2, '0')
//     const month = (date.getMonth() + 1).toString().padStart(2, '0')
//     const year = date.getFullYear()
//     return `${day}/${month}/${year}`
//   }

//   const formatDateForInput = (dateString: string) => {
//     if (!dateString) return ''
//     return new Date(dateString).toISOString().slice(0, 10)
//   }

//   const handleViewGuestDetail = (qr: QRGuestList) => {
//     navigate(`/guest-qr/${qr.id}`)
//   }

//   if (isLoadingPersonal || isLoadingGuest) {
//     return (
//       <div className='flex justify-center items-center min-h-screen'>
//         <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
//       </div>
//     )
//   }

//   return (
//     <div className='bg-surface text-on-surface min-h-screen'>
//       <main className='pt-24 pb-12 px-6 md:px-12 bg-surface'>
//         <div className='max-w-6xl mx-auto space-y-12'>
//           {/* Section: Mã QR Cá nhân */}
//           <section>
//             <div className='flex flex-col md:flex-row gap-10 items-center'>
//               {/* <div className='w-full md:w-1/2 space-y-6'>
//                 <label className='text-[10px] font-bold tracking-[0.1em] text-primary uppercase'>Identity Secure</label>
//                 <h2 className='text-4xl font-extrabold tracking-tight text-on-surface leading-tight'>Mã QR Cá nhân</h2>
//                 <p className='text-on-surface-variant text-lg leading-relaxed max-w-md'>
//                   Sử dụng mã QR này để truy cập nhanh chóng vào các khu vực tiện ích và cửa chính của tòa nhà.
//                 </p>
//                 <div className='flex gap-4 pt-4'>
//                   {personalQr?.qrImage && (
//                     <a
//                       href={personalQr.qrImage}
//                       download='personal-qr.png'
//                       className='px-8 py-3 bg-gradient-to-br from-primary to-primary-container text-white rounded-full font-bold flex items-center gap-2 hover:brightness-105 transition-all'
//                     >
//                       <span className='material-symbols-outlined text-sm'>download</span>
//                       Tải xuống
//                     </a>
//                   )}
//                 </div>
//               </div> */}
//               <div className='w-full md:w-1/2 space-y-6'>
//                 <label className='text-[10px] font-bold tracking-[0.1em] text-primary uppercase'>Identity Secure</label>
//                 <h2 className='text-4xl font-extrabold tracking-tight text-on-surface leading-tight'>Mã QR Cá nhân</h2>
//                 <p className='text-on-surface-variant text-lg leading-relaxed max-w-md'>
//                   Sử dụng mã QR này để truy cập nhanh chóng vào các khu vực tiện ích và cửa chính của tòa nhà.
//                 </p>
//                 <div className='flex gap-4 pt-4'>
//                   {personalQr?.qrImage && (
//                     <>
//                       <a
//                         href={personalQr.qrImage}
//                         download='personal-qr.png'
//                         className='px-8 py-3 bg-gradient-to-br from-primary to-primary-container text-white rounded-full font-bold flex items-center gap-2 hover:brightness-105 transition-all'
//                       >
//                         <span className='material-symbols-outlined text-sm'>download</span>
//                         Tải xuống
//                       </a>
//                       <button
//                         onClick={() => navigate('/viewQrcodeMe')}
//                         className='px-8 py-3 bg-surface-container-lowest border border-outline-variant/15 text-primary rounded-full font-bold flex items-center gap-2 hover:bg-surface-container-low transition-all'
//                       >
//                         <span className='material-symbols-outlined text-sm'>visibility</span>
//                         Xem chi tiết
//                       </button>
//                     </>
//                   )}
//                 </div>
//               </div>
//               <div className='w-full md:w-1/2 flex justify-center md:justify-end'>
//                 <div className='bg-surface-container-lowest p-8 rounded-[2rem] shadow-lg'>
//                   <div className='relative z-10 space-y-6 text-center'>
//                     <div className='bg-white p-4 rounded-3xl shadow-sm inline-block'>
//                       <div className='w-48 h-48 bg-surface-container flex items-center justify-center rounded-xl'>
//                         {personalQr?.qrImage ? (
//                           <img src={personalQr.qrImage} alt='QR Code' className='w-full h-full' />
//                         ) : (
//                           <span className='material-symbols-outlined text-primary/20 text-8xl'>qr_code_2</span>
//                         )}
//                       </div>
//                     </div>
//                     <div className='space-y-1'>
//                       <p className='text-xs font-bold tracking-widest text-primary uppercase'>
//                         {personalQr?.qr_code?.slice(0, 16)}...
//                       </p>
//                       <div className='flex items-center justify-center gap-2'>
//                         <span
//                           className={`w-2 h-2 rounded-full ${personalQr?.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`}
//                         ></span>
//                         <span className='text-sm font-bold text-on-surface'>{personalQr?.status || '---'}</span>
//                       </div>
//                       <p className='text-[11px] text-on-surface-variant pt-2'>
//                         {/* Hết hạn: {formatDate(personalQr?.expires_at)} */}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* Section: Danh sách QR Khách */}
//           <section className='space-y-8'>
//             <div className='flex justify-between items-end'>
//               <div className='space-y-1'>
//                 <h3 className='text-2xl font-extrabold tracking-tight text-on-surface'>Danh sách QR Khách</h3>
//                 <p className='text-on-surface-variant text-sm'>
//                   Quản lý mã truy cập tạm thời cho khách thăm và giao hàng.
//                 </p>
//               </div>
//             </div>

//             <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
//               {guestList.length === 0 ? (
//                 <div className='col-span-2 text-center py-12 text-on-surface-variant'>Bạn chưa có mã QR khách nào.</div>
//               ) : (
//                 guestList.map((qr) => (
//                   <div
//                     key={qr.id}
//                     className='bg-surface-container-low p-6 rounded-[1.5rem] flex flex-col sm:flex-row gap-6 hover:bg-surface-container transition-all group'
//                   >
//                     <div className='w-24 h-24 bg-surface-container-lowest rounded-2xl flex items-center justify-center shrink-0 shadow-sm'>
//                       <span className='material-symbols-outlined text-primary/40 text-4xl'>qr_code</span>
//                     </div>
//                     <div className='flex-grow space-y-4'>
//                       <div className='flex justify-between items-start'>
//                         <div>
//                           <h4 className='font-bold text-on-surface'>{qr.visitor_name || 'Chưa có tên'}</h4>
//                           <p className='text-xs text-on-surface-variant tracking-tighter'>
//                             {qr.qr_code?.slice(0, 12)}... • Căn {qr.apartment_code}
//                           </p>
//                         </div>
//                         <label className='relative inline-flex items-center cursor-pointer'>
//                           <input
//                             type='checkbox'
//                             className='sr-only peer'
//                             checked={qr.status === 'ACTIVE'}
//                             onChange={() => handleToggleStatus(qr)}
//                           />
//                           <div className='w-10 h-5 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary after:content-[""] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all'></div>
//                         </label>
//                       </div>
//                       {qr.visitor_phone && (
//                         <div className='flex items-center gap-4 text-xs text-on-surface-variant'>
//                           <span className='flex items-center gap-1'>
//                             <span className='material-symbols-outlined text-sm'>call</span>
//                             {qr.visitor_phone}
//                           </span>
//                           <span className='flex items-center gap-1'>
//                             <span className='material-symbols-outlined text-sm'>calendar_today</span>
//                             {formatDate(qr.valid_to)}
//                           </span>
//                           <span className='flex items-center gap-1'>
//                             <span className='material-symbols-outlined text-sm'>swap_vert</span>
//                             {qr.used_entries}/{qr.max_entries} lượt
//                           </span>
//                         </div>
//                       )}
//                       <div className='flex gap-2 pt-2'>
//                         <button
//                           onClick={() => handleViewGuestDetail(qr)}
//                           className='flex-1 py-2 bg-surface-container-lowest border border-outline-variant/15 rounded-lg text-[10px] font-bold text-on-surface-variant hover:bg-primary/5 hover:text-primary transition-all flex flex-col items-center justify-center gap-1'
//                         >
//                           <span className='material-symbols-outlined text-sm'>visibility</span>
//                           Chi tiết
//                         </button>
//                         {/* <button className='flex-1 py-2 bg-surface-container-lowest border border-outline-variant/15 rounded-lg text-[10px] font-bold text-on-surface-variant hover:bg-primary/5 hover:text-primary transition-all flex flex-col items-center justify-center gap-1'>
//                           <span className='material-symbols-outlined text-sm'>download</span>
//                           Tải xuống
//                         </button> */}
//                         {/* <button className='flex-1 py-2 bg-surface-container-lowest border border-outline-variant/15 rounded-lg text-[10px] font-bold text-on-surface-variant hover:bg-primary/5 hover:text-primary transition-all flex flex-col items-center justify-center gap-1'>
//                           <span className='material-symbols-outlined text-sm'>share</span>
//                           Chia sẻ
//                         </button> */}
//                         <button
//                           onClick={() => handleOpenEditModal(qr)}
//                           className='flex-1 py-2 bg-surface-container-lowest border border-outline-variant/15 rounded-lg text-[10px] font-bold text-on-surface-variant hover:bg-primary/5 hover:text-primary transition-all flex flex-col items-center justify-center gap-1'
//                         >
//                           <span className='material-symbols-outlined text-sm'>edit</span>
//                           Sửa
//                         </button>
//                         <button className='flex-1 py-2 bg-surface-container-lowest border border-outline-variant/15 rounded-lg text-[10px] font-bold text-on-surface-variant hover:bg-primary/5 hover:text-primary transition-all flex flex-col items-center justify-center gap-1'>
//                           <span className='material-symbols-outlined text-sm'>history</span>
//                           Lịch sử
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 ))
//               )}
//             </div>
//           </section>
//         </div>
//       </main>

//       {/* Edit Modal */}
//       {isEditModalOpen && guestDetailData?.data?.data && (
//         <div className='fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4'>
//           <div className='bg-white rounded-2xl max-w-md w-full'>
//             <div className='p-5 border-b'>
//               <h2 className='text-xl font-bold'>Cập nhật mã QR</h2>
//             </div>
//             <div className='p-5 space-y-4'>
//               <div>
//                 <label className='block text-sm font-bold mb-2'>Tên khách</label>
//                 <input
//                   type='text'
//                   value={editForm.visitor_name}
//                   onChange={(e) => setEditForm({ ...editForm, visitor_name: e.target.value })}
//                   className='w-full px-4 py-2 border rounded-lg'
//                 />
//               </div>
//               <div>
//                 <label className='block text-sm font-bold mb-2'>Số điện thoại</label>
//                 <input
//                   type='text'
//                   value={editForm.visitor_phone}
//                   onChange={(e) => setEditForm({ ...editForm, visitor_phone: e.target.value })}
//                   className='w-full px-4 py-2 border rounded-lg'
//                 />
//               </div>
//               <div>
//                 <label className='block text-sm font-bold mb-2'>Số lượt tối đa</label>
//                 <input
//                   type='number'
//                   value={editForm.max_entries}
//                   onChange={(e) => setEditForm({ ...editForm, max_entries: parseInt(e.target.value) })}
//                   className='w-full px-4 py-2 border rounded-lg'
//                   min={1}
//                 />
//               </div>
//               <div>
//                 <label className='block text-sm font-bold mb-2'>Thời hạn (ngày)</label>
//                 <input
//                   type='date'
//                   value={editForm.valid_to ? new Date(editForm.valid_to).toISOString().slice(0, 10) : ''}
//                   onChange={(e) => setEditForm({ ...editForm, valid_to: new Date(e.target.value).toISOString() })}
//                   className='w-full px-4 py-2 border rounded-lg'
//                 />
//               </div>
//             </div>
//             <div className='p-5 border-t flex justify-end gap-3'>
//               <button onClick={() => setIsEditModalOpen(false)} className='px-4 py-2 bg-gray-200 rounded-lg'>
//                 Hủy
//               </button>
//               <button onClick={handleSubmitEdit} className='px-4 py-2 bg-primary text-white rounded-lg'>
//                 Lưu
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { QRCodeApi } from 'src/apis/QrcodeApi/Qr.api'
import { toast } from 'react-toastify'
import type { QRGuestList } from 'src/types/qrcode.type'
import { useNavigate } from 'react-router-dom'

export default function QrcodeManagement() {
  const navigate = useNavigate()
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    valid_to: '',
    max_entries: 1,
    visitor_name: '',
    visitor_phone: '',
    visitor_id_card: ''
  })

  // Lấy personal QR
  const { data: personalQrData, isLoading: isLoadingPersonal } = useQuery({
    queryKey: ['personal-qr'],
    queryFn: () => QRCodeApi.getQrcodeMe()
  })

  // Lấy danh sách guest QR
  const {
    data: guestQrsData,
    isLoading: isLoadingGuest,
    refetch
  } = useQuery({
    queryKey: ['guest-qrs'],
    queryFn: () => QRCodeApi.getQrGuesrList()
  })

  // Lấy chi tiết guest QR (khi mở modal sửa)
  const { data: guestDetailData } = useQuery({
    queryKey: ['guest-detail', selectedGuestId],
    queryFn: () => QRCodeApi.getDetailQrList(selectedGuestId!),
    enabled: !!selectedGuestId
  })

  // Cập nhật trạng thái (bật/tắt)
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACTIVE' | 'REVOKED' }) => QRCodeApi.PutStatus(id, status),
    onSuccess: () => {
      toast.success('Cập nhật trạng thái thành công')
      refetch()
    },
    onError: () => toast.error('Cập nhật thất bại')
  })

  // Cập nhật thông tin guest QR
  const updateGuestMutation = useMutation({
    mutationFn: ({
      id,
      valid_to,
      max_entries,
      visitor_name,
      visitor_phone,
      visitor_id_card
    }: {
      id: string
      valid_to: string
      max_entries: number
      visitor_name: string
      visitor_phone: string
      visitor_id_card: string
    }) =>
      QRCodeApi.putBodyQRGuest(id, {
        valid_to,
        max_entries,
        visitor_name,
        visitor_phone,
        visitor_id_card
      }),
    onSuccess: () => {
      toast.success('Cập nhật thành công')
      setIsEditModalOpen(false)
      refetch()
      setSelectedGuestId(null)
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Cập nhật thất bại')
    }
  })

  const personalQr = personalQrData?.data?.data
  const guestList = guestQrsData?.data?.data || []

  const handleToggleStatus = (qr: QRGuestList) => {
    const newStatus = qr.status === 'ACTIVE' ? 'REVOKED' : 'ACTIVE'
    const action = newStatus === 'ACTIVE' ? 'bật' : 'tắt'

    if (window.confirm(`Bạn có chắc muốn ${action} mã QR của khách "${qr.visitor_name || 'chưa có tên'}"?`)) {
      updateStatusMutation.mutate({ id: qr.id, status: newStatus })
    }
  }

  const handleOpenEditModal = (qr: QRGuestList) => {
    setSelectedGuestId(qr.id)
    setEditForm({
      valid_to: qr.valid_to,
      max_entries: qr.max_entries,
      visitor_name: qr.visitor_name || '',
      visitor_phone: qr.visitor_phone || '',
      visitor_id_card: qr.visitor_id_card || ''
    })
    setIsEditModalOpen(true)
  }

  const handleSubmitEdit = () => {
    if (!selectedGuestId) return

    updateGuestMutation.mutate({
      id: selectedGuestId,
      valid_to: editForm.valid_to,
      max_entries: editForm.max_entries,
      visitor_name: editForm.visitor_name,
      visitor_phone: editForm.visitor_phone,
      visitor_id_card: editForm.visitor_id_card
    })
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '---'
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const handleViewGuestDetail = (qr: QRGuestList) => {
    navigate(`/guest-qr/${qr.id}`)
  }

  const handleViewHistory = (qr: QRGuestList) => {
    navigate(`/guest-qr/${qr.id}`)
  }

  if (isLoadingPersonal || isLoadingGuest) {
    return (
      <div className='flex justify-center items-center min-h-screen bg-surface'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
      </div>
    )
  }

  return (
    <div className='bg-gradient-to-br from-surface via-surface to-surface-container/30 min-h-screen'>
      <main className='max-w-7xl mx-auto px-6 py-12'>
        {/* Personal QR Section - Enhanced */}
        <div className='mb-16'>
          <div className='bg-gradient-to-br from-primary/5 via-surface-container-lowest to-surface-container-lowest rounded-3xl shadow-xl border border-primary/10 overflow-hidden'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 lg:p-12'>
              {/* Left Content */}
              <div className='space-y-6 flex flex-col justify-center'>
                <div>
                  <div className='inline-flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full mb-4'>
                    <span className='material-symbols-outlined text-primary text-sm'>verified</span>
                    <span className='text-[10px] font-bold text-primary uppercase tracking-wider'>Identity Secure</span>
                  </div>
                  <h2 className='text-3xl font-extrabold text-on-surface mb-3'>Mã QR Cá nhân</h2>
                  <p className='text-on-surface-variant leading-relaxed'>
                    Sử dụng mã QR này để truy cập nhanh chóng vào các khu vực tiện ích, cửa chính và thang máy của tòa
                    nhà. Mã QR này được bảo mật và chỉ dành riêng cho bạn.
                  </p>
                </div>

                <div className='flex flex-wrap gap-3'>
                  <button
                    onClick={() => navigate('/viewQrcodeMe')}
                    className='px-6 py-2.5 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:bg-primary-dark transition-all shadow-lg hover:shadow-xl'
                  >
                    <span className='material-symbols-outlined text-base'>visibility</span>
                    Xem chi tiết
                  </button>
                  {personalQr?.qrImage && (
                    <a
                      href={personalQr.qrImage}
                      download='personal-qr.png'
                      className='px-6 py-2.5 bg-surface-container-lowest border border-outline-variant/20 text-on-surface rounded-xl font-bold flex items-center gap-2 hover:bg-surface-container transition-all'
                    >
                      <span className='material-symbols-outlined text-base'>download</span>
                      Tải xuống
                    </a>
                  )}
                </div>

                {/* Status Info */}
                <div className='flex items-center gap-6 pt-4'>
                  <div className='flex items-center gap-2'>
                    <span
                      className={`w-2 h-2 rounded-full ${personalQr?.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}
                    ></span>
                    <span className='text-sm text-on-surface-variant'>
                      Trạng thái:{' '}
                      <span className='font-bold text-on-surface'>
                        {personalQr?.status === 'ACTIVE' ? 'Đang hoạt động' : 'Đã khóa'}
                      </span>
                    </span>
                  </div>
                  {personalQr?.expires_at && (
                    <div className='flex items-center gap-2'>
                      <span className='material-symbols-outlined text-sm text-on-surface-variant'>event</span>
                      <span className='text-sm text-on-surface-variant'>
                        Hết hạn:{' '}
                        <span className='font-medium text-on-surface'>{formatDate(personalQr.expires_at)}</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right QR Display */}
              <div className='flex justify-center items-center'>
                <div className='bg-white p-6 rounded-3xl shadow-2xl relative'>
                  <div className='absolute -top-2 -right-2 w-16 h-16 bg-primary rounded-full blur-2xl opacity-30'></div>
                  <div className='w-56 h-56 bg-surface-container flex items-center justify-center rounded-2xl relative z-10'>
                    {personalQr?.qrImage ? (
                      <img src={personalQr.qrImage} alt='QR Code' className='w-full h-full object-contain' />
                    ) : (
                      <span className='material-symbols-outlined text-primary/20 text-8xl'>qr_code_2</span>
                    )}
                  </div>
                  <div className='mt-4 text-center'>
                    <p className='text-[10px] text-on-surface-variant font-mono bg-surface-container-low px-3 py-1 rounded-full inline-block'>
                      {personalQr?.qr_code?.slice(0, 20)}...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Guest QR Section */}
        <div>
          <div className='flex justify-between items-end mb-8'>
            <div>
              <div className='inline-flex items-center gap-2 bg-secondary/10 px-3 py-1 rounded-full mb-3'>
                <span className='material-symbols-outlined text-secondary text-sm'>group</span>
                <span className='text-[10px] font-bold text-secondary uppercase tracking-wider'>Temporary Access</span>
              </div>
              <h2 className='text-3xl font-extrabold text-on-surface'>Mã QR cho Khách</h2>
              <p className='text-on-surface-variant mt-2'>
                Quản lý mã truy cập tạm thời cho khách thăm, giao hàng và dịch vụ
              </p>
            </div>
            <div className='text-right'>
              <div className='text-2xl font-bold text-primary'>{guestList.length}</div>
              <div className='text-xs text-on-surface-variant uppercase tracking-wide'>Mã QR đã tạo</div>
            </div>
          </div>

          {guestList.length === 0 ? (
            <div className='bg-surface-container-lowest rounded-2xl p-12 text-center border-2 border-dashed border-outline-variant/20'>
              <span className='material-symbols-outlined text-6xl text-on-surface-variant/40 mb-3'>qr_code</span>
              <p className='text-on-surface-variant'>Bạn chưa có mã QR khách nào</p>
              <button className='mt-4 px-6 py-2 bg-primary text-white rounded-xl text-sm font-bold'>
                Tạo mã QR mới
              </button>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
              {guestList.map((qr) => (
                <div
                  key={qr.id}
                  className='group bg-surface-container-lowest rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-outline-variant/10 hover:border-primary/20'
                >
                  {/* Card Header */}
                  <div className='p-5 bg-gradient-to-r from-primary/5 to-transparent border-b border-outline-variant/10'>
                    <div className='flex justify-between items-start'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-2'>
                          <div className='w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center'>
                            <span className='material-symbols-outlined text-primary text-sm'>person</span>
                          </div>
                          <h4 className='font-bold text-on-surface text-base'>{qr.visitor_name || 'Chưa có tên'}</h4>
                        </div>
                        <p className='text-[10px] text-on-surface-variant font-mono'>{qr.qr_code?.slice(0, 16)}...</p>
                      </div>
                      {/* Status Toggle - Nổi bật hơn */}
                      <div className='flex flex-col items-end gap-1'>
                        <button
                          onClick={() => handleToggleStatus(qr)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all shadow-sm ${
                            qr.status === 'ACTIVE'
                              ? 'bg-green-500 text-white hover:bg-green-600'
                              : 'bg-red-500 text-white hover:bg-red-600'
                          }`}
                        >
                          {qr.status === 'ACTIVE' ? 'Đang mở' : 'Đã khóa'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className='p-5 space-y-4'>
                    <div className='grid grid-cols-2 gap-3'>
                      <div>
                        <p className='text-[9px] text-on-surface-variant uppercase tracking-wider mb-1'>Căn hộ</p>
                        <p className='text-sm font-bold text-primary'>{qr.apartment_code || '---'}</p>
                      </div>
                      <div>
                        <p className='text-[9px] text-on-surface-variant uppercase tracking-wider mb-1'>
                          Số điện thoại
                        </p>
                        <p className='text-sm text-on-surface'>{qr.visitor_phone || '---'}</p>
                      </div>
                    </div>

                    <div className='flex items-center justify-between text-xs'>
                      <div className='flex items-center gap-1'>
                        <span className='material-symbols-outlined text-sm text-on-surface-variant'>
                          calendar_today
                        </span>
                        <span className='text-on-surface-variant'>Hết hạn:</span>
                        <span className='font-medium text-on-surface'>{formatDate(qr.valid_to)}</span>
                      </div>
                      <div className='flex items-center gap-1'>
                        <span className='material-symbols-outlined text-sm text-on-surface-variant'>swap_vert</span>
                        <span className='font-medium text-on-surface'>
                          {qr.used_entries}/{qr.max_entries}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className='space-y-1'>
                      <div className='w-full h-1.5 bg-surface-container rounded-full overflow-hidden'>
                        <div
                          className='h-full bg-primary transition-all duration-500'
                          style={{ width: `${(qr.used_entries / qr.max_entries) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className='p-4 bg-surface-container-low/50 border-t border-outline-variant/10 flex gap-2'>
                    <button
                      onClick={() => handleViewGuestDetail(qr)}
                      className='flex-1 py-2 bg-surface-container-lowest rounded-lg text-[11px] font-bold text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-center gap-1'
                    >
                      <span className='material-symbols-outlined text-sm'>visibility</span>
                      Chi tiết
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(qr)}
                      className='flex-1 py-2 bg-surface-container-lowest rounded-lg text-[11px] font-bold text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-center gap-1'
                    >
                      <span className='material-symbols-outlined text-sm'>edit</span>
                      Sửa
                    </button>
                    <button
                      onClick={() => handleViewHistory(qr)}
                      className='flex-1 py-2 bg-surface-container-lowest rounded-lg text-[11px] font-bold text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-center gap-1'
                    >
                      <span className='material-symbols-outlined text-sm'>history</span>
                      Lịch sử
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Edit Modal - Improved */}
      {isEditModalOpen && guestDetailData?.data?.data && (
        <div className='fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn'>
          <div className='bg-surface-container-lowest rounded-2xl max-w-md w-full shadow-2xl animate-slideUp'>
            <div className='p-6 border-b border-outline-variant/10'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center'>
                  <span className='material-symbols-outlined text-primary'>edit</span>
                </div>
                <div>
                  <h2 className='text-xl font-bold text-on-surface'>Cập nhật mã QR</h2>
                  <p className='text-xs text-on-surface-variant'>Chỉnh sửa thông tin mã QR cho khách</p>
                </div>
              </div>
            </div>
            <div className='p-6 space-y-4'>
              <div>
                <label className='block text-xs font-bold text-on-surface uppercase tracking-wider mb-2'>
                  Tên khách
                </label>
                <input
                  type='text'
                  value={editForm.visitor_name}
                  onChange={(e) => setEditForm({ ...editForm, visitor_name: e.target.value })}
                  className='w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/20 rounded-xl focus:outline-none focus:border-primary transition-all'
                  placeholder='Nhập tên khách'
                />
              </div>
              <div>
                <label className='block text-xs font-bold text-on-surface uppercase tracking-wider mb-2'>
                  Số điện thoại
                </label>
                <input
                  type='text'
                  value={editForm.visitor_phone}
                  onChange={(e) => setEditForm({ ...editForm, visitor_phone: e.target.value })}
                  className='w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/20 rounded-xl focus:outline-none focus:border-primary transition-all'
                  placeholder='Nhập số điện thoại'
                />
              </div>

              <div>
                <label className='block text-xs font-bold text-on-surface uppercase tracking-wider mb-2'>CCCD</label>
                <input
                  type='text'
                  value={editForm.visitor_id_card}
                  onChange={(e) => setEditForm({ ...editForm, visitor_id_card: e.target.value })}
                  className='w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/20 rounded-xl focus:outline-none focus:border-primary transition-all'
                  placeholder='Nhập số điện thoại'
                />
              </div>
              <div>
                <label className='block text-xs font-bold text-on-surface uppercase tracking-wider mb-2'>
                  Số lượt tối đa
                </label>
                <input
                  type='number'
                  value={editForm.max_entries}
                  onChange={(e) => setEditForm({ ...editForm, max_entries: parseInt(e.target.value) })}
                  className='w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/20 rounded-xl focus:outline-none focus:border-primary transition-all'
                  min={1}
                />
              </div>
              <div>
                <label className='block text-xs font-bold text-on-surface uppercase tracking-wider mb-2'>
                  Thời hạn
                </label>
                <input
                  type='date'
                  value={editForm.valid_to ? new Date(editForm.valid_to).toISOString().slice(0, 10) : ''}
                  onChange={(e) => setEditForm({ ...editForm, valid_to: new Date(e.target.value).toISOString() })}
                  className='w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/20 rounded-xl focus:outline-none focus:border-primary transition-all'
                />
              </div>
            </div>
            <div className='p-6 border-t border-outline-variant/10 flex justify-end gap-3'>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className='px-5 py-2.5 bg-surface-container-low rounded-xl text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-all'
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitEdit}
                className='px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark transition-all shadow-lg'
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
