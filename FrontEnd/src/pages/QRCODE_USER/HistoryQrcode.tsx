// src/pages/HistoryQrcode.tsx
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { QRCodeApi } from 'src/apis/QrcodeApi/Qr.api'
import { useNavigate, createSearchParams, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useDebounce } from 'src/hooks/useDebounce'
import Paginate from 'src/components/Paginate/Paginate'

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  const vnDate = new Date(date.getTime() + 7 * 60 * 60 * 1000)
  return `${vnDate.getHours().toString().padStart(2, '0')}:${vnDate.getMinutes().toString().padStart(2, '0')}:${vnDate.getSeconds().toString().padStart(2, '0')} - ${vnDate.getDate()}/${vnDate.getMonth() + 1}/${vnDate.getFullYear()}`
}

const getResultBadge = (result: string) => {
  if (result === 'SUCCESS') {
    return {
      text: 'THÀNH CÔNG',
      bgColor: 'bg-green-100',
      textColor: 'text-green-700',
      dotColor: 'bg-green-500'
    }
  }
  return {
    text: 'TỪ CHỐI',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    dotColor: 'bg-red-500'
  }
}

export default function HistoryQrcode() {
  const navigate = useNavigate()
  const location = useLocation()

  // Lấy params từ URL
  const searchParams = new URLSearchParams(location.search)
  const pageFromUrl = searchParams.get('page') || '1'
  const limitFromUrl = searchParams.get('limit') || '10'
  const searchFromUrl = searchParams.get('search') || ''
  const resultFromUrl = searchParams.get('result') || ''
  const fromDateFromUrl = searchParams.get('fromDate') || ''
  const toDateFromUrl = searchParams.get('toDate') || ''
  const qrTypeFromUrl = searchParams.get('qrType') || ''

  const [searchInput, setSearchInput] = useState(searchFromUrl)
  const [resultFilter, setResultFilter] = useState(resultFromUrl)
  const [fromDate, setFromDate] = useState(fromDateFromUrl)
  const [toDate, setToDate] = useState(toDateFromUrl)
  const [qrTypeFilter, setQrTypeFilter] = useState(qrTypeFromUrl)

  const debouncedSearch = useDebounce(searchInput, 500)
  const debouncedResult = useDebounce(resultFilter, 300)
  const debouncedQrType = useDebounce(qrTypeFilter, 300)

  // Update URL khi filter thay đổi
  useEffect(() => {
    const params: Record<string, string> = {
      page: '1',
      limit: limitFromUrl || '10'
    }
    if (debouncedSearch) params.search = debouncedSearch
    if (debouncedResult) params.result = debouncedResult
    if (debouncedQrType) params.qrType = debouncedQrType
    if (fromDate) params.fromDate = fromDate
    if (toDate) params.toDate = toDate

    navigate(
      {
        pathname: location.pathname,
        search: createSearchParams(params).toString()
      },
      { replace: true }
    )
  }, [debouncedSearch, debouncedResult, debouncedQrType, fromDate, toDate])

  // Fetch dữ liệu
  const {
    data: historyResponse,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: [
      'qr-history',
      pageFromUrl,
      limitFromUrl,
      searchFromUrl,
      resultFromUrl,
      qrTypeFromUrl,
      fromDateFromUrl,
      toDateFromUrl
    ],
    queryFn: () =>
      QRCodeApi.getGuestQrHistory({
        page: Number(pageFromUrl),
        limit: Number(limitFromUrl),
        search: searchFromUrl || undefined,
        result: resultFromUrl || undefined,
        qrType: qrTypeFromUrl || undefined,
        fromDate: fromDateFromUrl || undefined,
        toDate: toDateFromUrl || undefined
      }),
    placeholderData: keepPreviousData,
    staleTime: 3000 * 60
  })
  console.log(historyResponse)

  const historyData = historyResponse?.data?.data || []
  const totalElements = historyResponse?.data?.totalElements || 0
  const totalPages = historyResponse?.data?.totalPages || 1
  const currentPage = historyResponse?.data?.page || Number(pageFromUrl)
  const currentPageSize = historyResponse?.data?.pageSize || Number(limitFromUrl)

  // Thống kê (dựa trên data hiện tại hoặc tổng thể)
  const totalScans = totalElements
  const successCount = historyData.filter((item) => item.result === 'SUCCESS').length
  const deniedCount = historyData.filter((item) => item.result === 'DENIED').length
  const successRate = totalScans > 0 ? ((successCount / totalScans) * 100).toFixed(1) : '0'

  // Reset filters
  const handleResetFilters = () => {
    setSearchInput('')
    setResultFilter('')
    setQrTypeFilter('')
    setFromDate('')
    setToDate('')
    navigate({
      pathname: location.pathname,
      search: createSearchParams({ page: '1', limit: '10' }).toString()
    })
  }

  if (isLoading && !historyResponse) {
    return (
      <div className="bg-background text-on-surface min-h-screen font-['Manrope',sans-serif] flex items-center justify-center">
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
          <p className='mt-4 text-on-surface-variant'>Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background text-on-surface min-h-screen font-['Manrope',sans-serif]">
      <div className='flex h-screen'>
        <main className='flex-1 overflow-y-auto px-8 py-8 space-y-8'>
          {/* Header Section */}
          <header className='flex flex-col md:flex-row md:items-end justify-between gap-6'>
            <div>
              <h1 className='text-4xl font-extrabold tracking-tight text-on-surface mb-2'>Lịch sử Quét mã QR</h1>
              <p className='text-on-surface-variant max-w-lg'>
                Giám sát và kiểm tra lưu lượng khách truy cập vào tòa nhà thông qua hệ thống định danh mã QR thông minh.
              </p>
            </div>
          </header>

          {/* Statistics Grid */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
            <div className='bg-surface-container-lowest p-6 rounded-xl shadow-sm'>
              <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1'>Tổng lượt quét</p>
              <p className='text-3xl font-black text-on-surface'>{totalScans}</p>
            </div>
            <div className='bg-surface-container-lowest p-6 rounded-xl shadow-sm'>
              <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1'>Thành công</p>
              <p className='text-3xl font-black text-blue-600'>{successCount}</p>
              <p className='text-xs text-slate-500 font-medium mt-2'>{successRate}% tỷ lệ hợp lệ</p>
            </div>
            <div className='bg-surface-container-lowest p-6 rounded-xl shadow-sm'>
              <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1'>Từ chối</p>
              <p className='text-3xl font-black text-error'>{deniedCount}</p>
              <p className='text-xs text-error font-bold mt-2'>Cần lưu ý bảo vệ</p>
            </div>
            <div className='bg-secondary-fixed p-6 rounded-xl shadow-sm flex flex-col justify-center overflow-hidden relative'>
              <div className='relative z-10'>
                <p className='text-[10px] font-bold text-on-secondary-fixed-variant uppercase tracking-widest mb-1'>
                  AI Insights
                </p>
                <p className='text-sm font-semibold text-on-secondary-fixed leading-tight'>
                  Phát hiện mật độ cao tại sảnh A lúc 09:15.
                </p>
              </div>
              <span className='material-symbols-outlined absolute -right-4 -bottom-4 text-7xl text-primary/10'>
                auto_awesome
              </span>
            </div>
          </div>

          {/* Filters Section */}
          <div className='bg-surface-container-low p-4 rounded-2xl flex flex-wrap items-center gap-4'>
            <div className='flex-1 flex flex-wrap gap-2'>
              <input
                type='text'
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder='Tìm kiếm theo tên khách, SĐT, tên cư dân...'
                className='flex-1 min-w-[200px] px-4 py-2 bg-white border-none rounded-full text-sm shadow-sm focus:ring-2 focus:ring-primary/20'
              />
              <div className='relative'>
                <select
                  value={resultFilter}
                  onChange={(e) => setResultFilter(e.target.value)}
                  className='px-3 py-2 bg-white border-none rounded-full text-sm font-semibold shadow-sm cursor-pointer appearance-none pr-8'
                >
                  <option value=''>Tất cả kết quả</option>
                  <option value='SUCCESS'>Thành công</option>
                  <option value='DENIED'>Từ chối</option>
                </select>
                <span className='material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-sm pointer-events-none'>
                  expand_more
                </span>
              </div>
            </div>
            <div className='flex gap-2'>
              <input
                type='date'
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className='px-4 py-2 bg-white border-none rounded-full text-sm shadow-sm'
              />
              <span className='material-symbols-outlined text-on-surface-variant/60 text-base self-center'>east</span>
              <input
                type='date'
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className='px-4 py-2 bg-white border-none rounded-full text-sm shadow-sm'
              />
            </div>
            <button
              onClick={handleResetFilters}
              className='px-6 py-2.5 bg-surface-container-lowest border border-outline-variant/15 text-primary font-bold rounded-full text-sm hover:bg-red-100 transition-all flex items-center gap-2'
            >
              <span className='material-symbols-outlined text-sm'>refresh</span> Xóa bộ lọc
            </button>
          </div>

          {/* Data Table Section */}
          <div className='bg-surface-container-lowest rounded-3xl overflow-hidden shadow-lg'>
            <div className='overflow-x-auto'>
              <table className='w-full text-left border-collapse min-w-[1000px]'>
                <thead>
                  <tr className='bg-surface-container-low'>
                    <th className='px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider'>STT</th>
                    <th className='px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider'>Tên</th>
                    <th className='px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider'>
                      Số điện thoại
                    </th>
                    <th className='px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider'>
                      Mã căn hộ
                    </th>
                    <th className='px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider'>
                      Loại QR
                    </th>
                    <th className='px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider'>
                      Thời gian quét
                    </th>
                    <th className='px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider'>
                      Kết quả
                    </th>
                    <th className='px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider'>
                      Người quét
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-surface-container-low'>
                  {historyData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className='px-6 py-12 text-center text-on-surface-variant'>
                        {searchInput || resultFilter || qrTypeFilter || fromDate || toDate
                          ? 'Không tìm thấy kết quả nào phù hợp'
                          : 'Chưa có dữ liệu lịch sử quét'}
                      </td>
                    </tr>
                  ) : (
                    historyData.map((item, index) => {
                      const resultBadge = getResultBadge(item.result)
                      const rowNumber = (currentPage - 1) * currentPageSize + index + 1

                      return (
                        <tr key={item.id} className='group hover:bg-blue-50/30 transition-colors'>
                          <td className='px-3 py-4 text-sm text-on-surface-variant'>{rowNumber}</td>
                          <td className='px-3 py-4'>
                            <span className='font-medium text-on-surface'>{item.visitor_name || '---'}</span>
                          </td>
                          <td className='px-3 py-4 text-sm text-on-surface-variant'>{item.visitor_phone || '---'}</td>
                          <td className='px-3 py-4'>
                            <span className='px-2 py-1 bg-slate-100 rounded text-xs font-mono font-semibold text-on-surface'>
                              {item.apartment_code || '---'}
                            </span>
                          </td>
                          <td className='px-3 py-4'>
                            <span
                              className={`px-2 py-1 rounded-full text-[10px] font-bold ${item.qr_type === 'guest' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}
                            >
                              {item.qr_type === 'guest' ? 'QR khách' : 'QR cư dân'}
                            </span>
                          </td>
                          <td className='px-3 py-4 text-sm text-on-surface-variant'>
                            {formatDateTime(item.scan_time)}
                          </td>
                          <td className='px-3 py-4'>
                            <span
                              className={`inline-flex items-center gap-[5px] px-2 py-1 rounded-full ${resultBadge.bgColor} ${resultBadge.textColor} text-[9px] font-black uppercase tracking-wider`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${resultBadge.dotColor}`}></span>
                              {resultBadge.text}
                            </span>
                          </td>
                          <td className='px-3 py-4 text-sm text-on-surface-variant'>{item.scanned_by_name}</td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalElements > 0 && (
              <div className='px-6 py-4 flex items-center justify-between border-t border-surface-container-low bg-surface-container-lowest'>
                <p className='text-xs font-medium text-on-surface-variant'>
                  Hiển thị {(currentPage - 1) * currentPageSize + 1} -{' '}
                  {Math.min(currentPage * currentPageSize, totalElements)} trên {totalElements} kết quả
                </p>
                <Paginate
                  queryConfig={{
                    page: currentPage.toString(),
                    limit: currentPageSize.toString()
                  }}
                  pageSize={totalPages}
                  search={searchFromUrl || undefined}
                  result={resultFromUrl || undefined}
                  qrType={qrTypeFromUrl || undefined}
                  fromDate={fromDateFromUrl || undefined}
                  toDate={toDateFromUrl || undefined}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
