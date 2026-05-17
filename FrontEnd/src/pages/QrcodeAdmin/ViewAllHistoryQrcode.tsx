import { useState, useEffect } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { qrApiAdmin } from 'src/apis/QrcodeAdmin/QrcodeAdmin.api'
import { useNavigate, createSearchParams, useLocation } from 'react-router-dom'
import { useDebounce } from 'src/hooks/useDebounce'
import Paginate from 'src/components/Paginate/Paginate'
import type { historyQrcodeAdmin2 } from 'src/types/qrcode.type'

export default function ViewAllHistoryQrcode() {
  const navigate = useNavigate()
  const location = useLocation()

  const searchParams = new URLSearchParams(location.search)
  const pageFromUrl = searchParams.get('page') || '1'
  const limitFromUrl = searchParams.get('limit') || '10'
  const searchFromUrl = searchParams.get('search') || ''
  const resultFromUrl = searchParams.get('result') || ''
  const fromDateFromUrl = searchParams.get('fromDate') || ''
  const toDateFromUrl = searchParams.get('toDate') || ''
  const qrTypeFromUrl = searchParams.get('qrType') || '' // 👈 Thêm lọc theo loại QR

  const [searchInput, setSearchInput] = useState(searchFromUrl)
  const [resultFilter, setResultFilter] = useState(resultFromUrl)
  const [fromDate, setFromDate] = useState(fromDateFromUrl)
  const [toDate, setToDate] = useState(toDateFromUrl)
  const [qrTypeFilter, setQrTypeFilter] = useState(qrTypeFromUrl)

  const debouncedSearch = useDebounce(searchInput, 500)
  const debouncedFromDate = useDebounce(fromDate, 500)
  const debouncedToDate = useDebounce(toDate, 500)
  const debouncedResult = useDebounce(resultFilter, 300)
  const debouncedQrType = useDebounce(qrTypeFilter, 300)

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
    if (debouncedQrType) newParams.qrType = debouncedQrType

    navigate(
      {
        pathname: location.pathname,
        search: createSearchParams(newParams).toString()
      },
      { replace: true }
    )
  }, [debouncedSearch, debouncedResult, debouncedFromDate, debouncedToDate, debouncedQrType])

  const { data: historyData, isLoading } = useQuery({
    queryKey: [
      'all-history-qrcode',
      pageFromUrl,
      limitFromUrl,
      searchFromUrl,
      resultFromUrl,
      fromDateFromUrl,
      toDateFromUrl,
      qrTypeFromUrl
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

  const historyList: historyQrcodeAdmin2[] = historyData?.data?.data || []
  const totalElements = historyData?.data?.totalElements || 0
  const totalPages = historyData?.data?.totalPages || 1
  const currentPage = historyData?.data?.page || Number(pageFromUrl)
  const currentPageSize = historyData?.data?.pageSize || Number(limitFromUrl)

  // Lọc theo loại QR trên FE (nếu BE chưa hỗ trợ)
  const filteredList = qrTypeFilter ? historyList.filter((item) => item.qr_type === qrTypeFilter) : historyList

  const totalScans = totalElements
  const successCount = historyList.filter((item) => item.result === 'SUCCESS').length
  const successRate = totalScans > 0 ? ((successCount / totalScans) * 100).toFixed(1) : '0'

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`,
      time: `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')} ${date.getHours() >= 12 ? 'CH' : 'SA'}`
    }
  }

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

  const getQrTypeBadge = (qrType: string | undefined) => {
    if (qrType === 'personal') {
      return { text: 'QR Cư dân', bgColor: 'bg-purple-100', textColor: 'text-purple-700' }
    }
    if (qrType === 'guest') {
      return { text: 'QR Khách', bgColor: 'bg-blue-100', textColor: 'text-blue-700' }
    }
    return { text: '---', bgColor: 'bg-gray-100', textColor: 'text-gray-500' }
  }

  const handleResetFilters = () => {
    setSearchInput('')
    setResultFilter('')
    setFromDate('')
    setToDate('')
    setQrTypeFilter('')
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
                placeholder='Tìm kiếm theo tên cư dân, tên khách hoặc mã căn hộ...'
                type='text'
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <div className='flex flex-wrap items-center gap-4 w-full lg:w-auto'>
              <select
                value={qrTypeFilter}
                onChange={(e) => setQrTypeFilter(e.target.value)}
                className='px-4 py-2 bg-surface-container-highest/50 border-none rounded-lg text-sm cursor-pointer'
              >
                <option value=''>Tất cả loại QR</option>
                <option value='personal'>QR Cư dân</option>
                <option value='guest'>QR Khách</option>
              </select>
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
                    <th className='px-6 py-5 text-[10px] font-black uppercase tracking-widest'>STT</th>
                    <th className='px-6 py-5 text-[10px] font-black uppercase tracking-widest'>Thời gian</th>
                    <th className='px-6 py-5 text-[10px] font-black uppercase tracking-widest'>Hướng</th>
                    <th className='px-6 py-5 text-[10px] font-black uppercase tracking-widest'>Loại QR</th>
                    <th className='px-6 py-5 text-[10px] font-black uppercase tracking-widest'>Người dùng</th>
                    <th className='px-6 py-5 text-[10px] font-black uppercase tracking-widest'>Căn hộ</th>
                    <th className='px-6 py-5 text-[10px] font-black uppercase tracking-widest'>Kết quả</th>
                    <th className='px-6 py-5 text-[10px] font-black uppercase tracking-widest'>Người quét</th>
                    <th className='px-6 py-5 text-[10px] font-black uppercase tracking-widest'>Mã QR</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-surface-container'>
                  {filteredList.length === 0 ? (
                    <tr>
                      <td colSpan={9} className='px-6 py-12 text-center text-on-surface-variant'>
                        {searchInput || resultFilter || fromDate || toDate || qrTypeFilter
                          ? 'Không tìm thấy kết quả nào phù hợp'
                          : 'Chưa có dữ liệu lịch sử quét'}
                      </td>
                    </tr>
                  ) : (
                    filteredList.map((item, index) => {
                      const dateTime = formatDateTime(item.scan_time)
                      const resultBadge = getResultBadge(item.result)
                      const qrTypeBadge = getQrTypeBadge(item.qr_type)
                      const rowNumber = (currentPage - 1) * currentPageSize + index + 1
                      const displayName = item.qr_type === 'guest' ? item.visitor_name : item.resident_name
                      const displayEmail = item.qr_type === 'guest' ? item.visitor_phone : item.resident_email

                      return (
                        <tr key={item.id} className='hover:bg-surface-container-low/30 transition-colors group'>
                          <td className='px-6 py-5 font-mono text-xs text-on-surface-variant'>{rowNumber}</td>
                          <td className='px-6 py-5'>
                            <div className='text-sm font-semibold text-on-surface'>{dateTime.date}</div>
                            <div className='text-[11px] text-on-surface-variant'>{dateTime.time}</div>
                          </td>
                          <td className='px-6 py-5'>
                            <span
                              className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold ${item.direction === 'IN' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}
                            >
                              {item.direction === 'IN' ? 'VÀO' : 'RA'}
                            </span>
                          </td>
                          <td className='px-6 py-5'>
                            <span
                              className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold ${qrTypeBadge.bgColor} ${qrTypeBadge.textColor}`}
                            >
                              {qrTypeBadge.text}
                            </span>
                          </td>
                          <td className='px-6 py-5'>
                            <div>
                              <div className='text-sm font-bold text-on-surface'>{displayName || '---'}</div>
                              {displayEmail && (
                                <div className='text-[11px] text-on-surface-variant flex items-center gap-1'>
                                  <span className='material-symbols-outlined text-[12px]'>
                                    {item.qr_type === 'guest' ? 'phone' : 'mail'}
                                  </span>
                                  {displayEmail}
                                </div>
                              )}
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
                    page: pageFromUrl,
                    limit: limitFromUrl
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
