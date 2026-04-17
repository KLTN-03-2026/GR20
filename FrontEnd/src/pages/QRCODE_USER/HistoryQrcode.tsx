import { useQuery } from '@tanstack/react-query'
import { QRCodeApi } from 'src/apis/QrcodeApi/Qr.api'

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
  const {
    data: historyResponse,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['qr-history'],
    queryFn: () => QRCodeApi.getGuestQrHistory(),
    enabled: true
  })

  const historyData = historyResponse?.data?.data || []

  const totalScans = historyData.length
  const successCount = historyData.filter((item) => item.result === 'SUCCESS').length
  const deniedCount = historyData.filter((item) => item.result === 'DENIED').length
  const successRate = totalScans > 0 ? ((successCount / totalScans) * 100).toFixed(1) : 0

  if (isLoading) {
    return (
      <div className="bg-background text-on-surface min-h-screen font-['Manrope',sans-serif]">
        <div className='flex items-center justify-center min-h-screen'>
          <div className='text-center'>Đang tải dữ liệu...</div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="bg-background text-on-surface min-h-screen font-['Manrope',sans-serif]">
        <div className='flex items-center justify-center min-h-screen'>
          <div className='text-center text-red-500'>Có lỗi xảy ra khi tải dữ liệu</div>
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
            <div className='flex gap-3'>
              <button className='px-6 py-2.5 bg-surface-container-lowest border border-outline-variant/15 text-primary font-bold rounded-full text-sm hover:bg-surface-container-low transition-all'>
                Xuất báo cáo
              </button>
              <button
                onClick={() => refetch()}
                className='px-6 py-2.5 bg-primary text-white font-bold rounded-full text-sm hover:brightness-110 shadow-lg shadow-primary/10 transition-all flex items-center gap-2'
              >
                <span className='material-symbols-outlined text-sm'>refresh</span> Làm mới
              </button>
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
              <span
                className='material-symbols-outlined absolute -right-4 -bottom-4 text-7xl text-primary/10'
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                auto_awesome
              </span>
            </div>
          </div>

          {/* Filters Section */}
          <div className='bg-surface-container-low p-2 rounded-2xl flex flex-wrap items-center gap-4'>
            <div className='flex-1 flex gap-2 overflow-x-auto px-2'>
              <button className='px-5 py-2 bg-primary text-white rounded-full text-xs font-bold whitespace-nowrap'>
                Tất cả
              </button>
              <button className='px-5 py-2 bg-white text-on-surface-variant rounded-full text-xs font-semibold whitespace-nowrap hover:bg-white/80'>
                Thành công
              </button>
              <button className='px-5 py-2 bg-white text-on-surface-variant rounded-full text-xs font-semibold whitespace-nowrap hover:bg-white/80'>
                Thất bại
              </button>
            </div>
            <div className='flex gap-2 pr-2'>
              <div className='relative'>
                <span className='material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-outline'>
                  calendar_month
                </span>
                <input
                  className='pl-9 pr-4 py-2 bg-white border-none rounded-full text-xs font-bold w-48 shadow-sm'
                  type='text'
                  placeholder='Chọn ngày'
                />
              </div>
              <button className='p-2 bg-white rounded-full shadow-sm text-on-surface-variant'>
                <span className='material-symbols-outlined text-lg'>filter_list</span>
              </button>
            </div>
          </div>

          {/* Data Table Section */}
          <div className='bg-surface-container-lowest rounded-3xl overflow-hidden shadow-lg'>
            <div className='overflow-x-auto'>
              <table className='w-full text-left border-collapse min-w-[1000px]'>
                <thead>
                  <tr className='bg-surface-container-low'>
                    <th className='px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider'>STT</th>
                    <th className='px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider'>
                      Tên khách
                    </th>
                    <th className='px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider'>
                      Số điện thoại
                    </th>
                    <th className='px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider'>
                      Mã căn hộ
                    </th>
                    <th className='px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider'>
                      Người tạo
                    </th>
                    <th className='px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider'>
                      Thời gian quét
                    </th>
                    <th className='px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider'>
                      Kết quả
                    </th>
                    {/* <th className='px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider'>Hướng</th> */}
                    <th className='px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider'>
                      Người quét
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-surface-container-low'>
                  {historyData.length === 0 ? (
                    <tr>
                      <td colSpan={9} className='px-6 py-12 text-center text-on-surface-variant'>
                        Chưa có dữ liệu lịch sử quét
                      </td>
                    </tr>
                  ) : (
                    historyData.map((item, index) => {
                      const resultBadge = getResultBadge(item.result)
                      // const firstLetter = item.visitor_name?.charAt(0).toUpperCase() || 'K'

                      return (
                        <tr key={item.id} className='group hover:bg-blue-50/30 transition-colors'>
                          <td className='px-6 py-4 text-sm text-on-surface-variant'>{index + 1}</td>
                          <td className='px-6 py-4'>
                            <div className='flex items-center gap-3'>
                              {/* <div className='w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-xs'>
                                {firstLetter}
                              </div> */}
                              <span className='font-medium text-on-surface'>{item.visitor_name}</span>
                            </div>
                          </td>
                          <td className='px-6 py-4 text-sm text-on-surface-variant'>{item.visitor_phone || '---'}</td>
                          <td className='px-6 py-4'>
                            <span className='px-2 py-1 bg-slate-100 rounded text-xs font-mono font-semibold text-on-surface'>
                              {item.apartment_code}
                            </span>
                          </td>
                          <td className='px-6 py-4 text-sm text-on-surface-variant'>{item.host_name}</td>
                          <td className='px-6 py-4 text-sm text-on-surface-variant'>
                            {formatDateTime(item.scan_time)}
                          </td>
                          <td className='px-6 py-4'>
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${resultBadge.bgColor} ${resultBadge.textColor} text-[10px] font-black uppercase tracking-wider whitespace-nowrap`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${resultBadge.dotColor}`}></span>
                              {resultBadge.text}
                            </span>
                          </td>
                          {/* <td className='px-6 py-4'>
                            <span className='inline-flex items-center gap-1'>
                              <span className='material-symbols-outlined text-sm text-outline'>
                                {item.direction === 'IN' ? 'login' : 'logout'}
                              </span>
                              <span className='text-sm text-on-surface-variant'>
                                {item.direction === 'IN' ? 'Vào' : 'Ra'}
                              </span>
                            </span>
                          </td> */}
                          <td className='px-6 py-4 text-sm text-on-surface-variant'>Bảo vệ ID: {item.scanned_by}</td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className='px-6 py-4 flex items-center justify-between border-t border-surface-container-low bg-surface-container-lowest'>
              <p className='text-xs font-medium text-on-surface-variant'>
                Hiển thị {historyData.length} trong số {historyData.length} kết quả
              </p>
              <div className='flex gap-2'>
                <button className='w-8 h-8 flex items-center justify-center rounded-full border border-outline-variant/20 text-outline-variant cursor-not-allowed'>
                  <span className='material-symbols-outlined text-sm'>chevron_left</span>
                </button>
                <button className='w-8 h-8 flex items-center justify-center rounded-full bg-primary text-white font-bold text-sm shadow-sm'>
                  1
                </button>
                <button className='w-8 h-8 flex items-center justify-center rounded-full border border-outline-variant/20 hover:bg-surface-container text-on-surface transition-all'>
                  <span className='material-symbols-outlined text-sm'>chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
