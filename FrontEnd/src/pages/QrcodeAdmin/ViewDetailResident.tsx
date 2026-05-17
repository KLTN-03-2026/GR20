import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { SecurityApi } from 'src/apis/Security_api/security.api'
import { qrApiAdmin } from 'src/apis/QrcodeAdmin/QrcodeAdmin.api'
import { useState } from 'react'
import { useDebounce } from 'src/hooks/useDebounce'

export default function ViewDetailResident() {
  const { id } = useParams()
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const navigate = useNavigate()
  // History filters
  const [historyCurrentPage, setHistoryCurrentPage] = useState(1)
  const [historyPageSize] = useState(10)
  const [historySearchInput, setHistorySearchInput] = useState('')
  const [historyResultFilter, setHistoryResultFilter] = useState('')
  const [historyFromDate, setHistoryFromDate] = useState('')
  const [historyToDate, setHistoryToDate] = useState('')

  const debouncedHistorySearch = useDebounce(historySearchInput, 500)
  const debouncedHistoryResult = useDebounce(historyResultFilter, 300)

  const { data: residentDetail, isLoading } = useQuery({
    queryKey: ['resident-detail', id],
    queryFn: () => SecurityApi.getResidentDetail(id!),
    enabled: !!id
  })

  // Query lịch sử quét
  const {
    data: historyData,
    isLoading: isLoadingHistory,
    refetch: refetchHistory
  } = useQuery({
    queryKey: [
      'resident-history',
      id,
      historyCurrentPage,
      debouncedHistorySearch,
      debouncedHistoryResult,
      historyFromDate,
      historyToDate
    ],
    queryFn: () =>
      qrApiAdmin.getHistoryQrcodeByUserId(id!, {
        page: historyCurrentPage,
        limit: historyPageSize,
        search: debouncedHistorySearch || undefined,
        result: debouncedHistoryResult || undefined,
        fromDate: historyFromDate || undefined,
        toDate: historyToDate || undefined
      }),
    enabled: !!id && isHistoryModalOpen
  })

  const historyList = historyData?.data?.data || []
  const historyTotalElements = historyData?.data?.totalElements || 0
  const historyTotalPages = historyData?.data?.totalPages || 1

  const data = residentDetail?.data?.data

  const formatDate = (dateString: string) => {
    if (!dateString) return '---'
    const date = new Date(dateString)
    const vnDate = new Date(date.getTime() + 7 * 60 * 60 * 1000) // Cộng thêm 7 tiếng
    const day = vnDate.getDate().toString().padStart(2, '0')
    const month = (vnDate.getMonth() + 1).toString().padStart(2, '0')
    const year = vnDate.getFullYear()
    return `${day}/${month}/${year}`
  }

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'Chưa có hoạt động'
    const date = new Date(dateString)
    const vnDate = new Date(date.getTime() + 7 * 60 * 60 * 1000)
    const hours = vnDate.getHours().toString().padStart(2, '0')
    const minutes = vnDate.getMinutes().toString().padStart(2, '0')
    const seconds = vnDate.getSeconds().toString().padStart(2, '0')
    const day = vnDate.getDate().toString().padStart(2, '0')
    const month = (vnDate.getMonth() + 1).toString().padStart(2, '0')
    const year = vnDate.getFullYear()
    return `${hours}:${minutes}:${seconds} - ${day}/${month}/${year}`
  }

  const getGenderIcon = (gender: string) => {
    if (gender === 'FEMALE') return { icon: 'female', color: 'text-pink-500', label: 'Nữ' }
    return { icon: 'male', color: 'text-blue-500', label: 'Nam' }
  }

  const getResultBadge = (result: string) => {
    if (result === 'SUCCESS') {
      return { text: 'THÀNH CÔNG', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700', dotColor: 'bg-emerald-500' }
    }
    return { text: 'TỪ CHỐI', bgColor: 'bg-red-50', textColor: 'text-red-700', dotColor: 'bg-red-500' }
  }

  const getDirectionIcon = (direction: string) => {
    if (direction === 'IN') return { icon: 'login', color: 'text-blue-500', text: 'VÀO' }
    return { icon: 'logout', color: 'text-orange-500', text: 'RA' }
  }

  const handleResetHistoryFilters = () => {
    setHistorySearchInput('')
    setHistoryResultFilter('')
    setHistoryFromDate('')
    setHistoryToDate('')
    setHistoryCurrentPage(1)
  }

  const handleOpenHistoryModal = () => {
    setIsHistoryModalOpen(true)
    setTimeout(() => refetchHistory(), 100)
  }

  if (isLoading) {
    return (
      <div className='bg-background text-on-surface min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
          <p className='mt-4 text-on-surface-variant'>Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  if (!data) return null

  const genderInfo = getGenderIcon(data.personalInfo.gender)
  const isValidContract = data.contracts[0]?.isValid || false
  const contract = data.contracts[0]

  return (
    <div className='bg-background text-on-surface antialiased min-h-screen'>
      <main className='min-h-screen'>
        <div className='p-8 max-w-7xl mx-auto space-y-8'>
          {/* Header Section */}
          <div className='flex flex-col md:flex-row md:items-end justify-between gap-6'>
            <div className='space-y-2'>
              <nav
                onClick={() => navigate(-1)}
                className='flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate cursor-pointer hover:text-green-300 transition-colors'
              >
                <span className='material-symbols-outlined text-sm'>arrow_back</span>
                <span>Quay lại</span>
              </nav>
              <h2 className='text-4xl font-extrabold text-on-surface tracking-tight'>{data.personalInfo.fullName}</h2>
              <p className='text-on-surface-variant flex items-center gap-2'>
                <span className='px-2 py-0.5 bg-secondary-fixed text-on-secondary-fixed-variant rounded text-[10px] font-bold tracking-tighter'>
                  ID: {data.personalInfo.id}
                </span>
                <span className='w-1.5 h-1.5 rounded-full bg-slate-300'></span>
                Tham gia: {formatDate(data.personalInfo.joinedAt)}
              </p>
            </div>
            <div className='flex gap-3'>
              <button className='px-6 py-2.5 bg-surface-container-lowest text-on-surface-variant rounded-full text-sm font-semibold border border-outline-variant/20 hover:bg-white transition-colors'>
                Chỉnh sửa hồ sơ
              </button>
              <button className='px-6 py-2.5 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-full text-sm font-semibold shadow-xl shadow-blue-200/20 hover:brightness-105 transition-all'>
                Tạo báo cáo
              </button>
            </div>
          </div>

          {/* Bento Grid Layout */}
          <div className='grid grid-cols-1 md:grid-cols-12 gap-6'>
            {/* Personal Details Card */}
            <div className='md:col-span-7 bg-surface-container-lowest rounded-[2rem] p-8 shadow-sm border border-transparent hover:border-outline-variant/10 transition-all group'>
              <div className='flex items-start justify-between mb-8'>
                <div>
                  <h3 className='text-xl font-bold text-on-surface mb-1'>Thông tin cá nhân</h3>
                  <p className='text-sm text-on-surface-variant'>Thông tin nhận dạng và liên hệ chính</p>
                </div>
                <div className='w-12 h-12 bg-surface-container-low rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors'>
                  <span className='material-symbols-outlined'>person_pin</span>
                </div>
              </div>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12'>
                <div className='space-y-1'>
                  <label className='text-[10px] font-bold uppercase tracking-widest text-slate-400'>Họ và tên</label>
                  <p className='text-lg font-medium text-on-surface'>{data.personalInfo.fullName}</p>
                </div>
                <div className='space-y-1'>
                  <label className='text-[10px] font-bold uppercase tracking-widest text-slate-400'>CMND / CCCD</label>
                  <p className='text-lg font-medium text-on-surface tracking-wide'>
                    {data.personalInfo.idCard || '---'}
                  </p>
                </div>
                <div className='space-y-1'>
                  <label className='text-[10px] font-bold uppercase tracking-widest text-slate-400'>Email</label>
                  <p className='text-lg font-medium text-primary'>{data.personalInfo.email}</p>
                </div>
                <div className='space-y-1'>
                  <label className='text-[10px] font-bold uppercase tracking-widest text-slate-400'>
                    Số điện thoại
                  </label>
                  <p className='text-lg font-medium text-on-surface'>{data.personalInfo.phone}</p>
                </div>
                <div className='space-y-1'>
                  <label className='text-[10px] font-bold uppercase tracking-widest text-slate-400'>Ngày sinh</label>
                  <p className='text-lg font-medium text-on-surface'>{formatDate(data.personalInfo.dateOfBirth)}</p>
                </div>
                <div className='space-y-1'>
                  <label className='text-[10px] font-bold uppercase tracking-widest text-slate-400'>Giới tính</label>
                  <div className='flex items-center gap-2'>
                    <span className={`material-symbols-outlined text-base ${genderInfo.color}`}>{genderInfo.icon}</span>
                    <p className='text-lg font-medium text-on-surface'>{genderInfo.label}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contract Status Card */}
            <div className='md:col-span-5 bg-surface-container-lowest rounded-[2rem] p-8 shadow-sm overflow-hidden relative group'>
              <div className='absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700'></div>
              <div className='relative z-10'>
                <h3 className='text-xl font-bold text-on-surface mb-6'>Trạng thái hợp đồng</h3>
                <div className='space-y-6'>
                  <div className='flex items-center justify-between'>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isValidContract ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {isValidContract ? 'Đang hoạt động' : 'Sắp hết hạn'}
                    </span>
                    {!isValidContract && (
                      <span className='material-symbols-outlined text-orange-500 animate-pulse'>report_problem</span>
                    )}
                  </div>
                  {!isValidContract && (
                    <div className='p-4 bg-orange-50 rounded-2xl border border-orange-100'>
                      <p className='text-xs text-orange-800 font-semibold leading-relaxed'>
                        Cảnh báo: Hợp đồng đã hết hạn. Vui lòng gia hạn để tiếp tục sử dụng dịch vụ.
                      </p>
                    </div>
                  )}
                  <div className='space-y-4 pt-2'>
                    <div className='flex justify-between items-center'>
                      <span className='text-xs text-on-surface-variant font-medium'>Loại hợp đồng</span>
                      <span className='text-sm font-bold text-on-surface'>
                        {contract?.contractType === 'RENT' ? 'Thuê' : 'Mua'}
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-xs text-on-surface-variant font-medium'>Có hiệu lực từ</span>
                      <span className='text-sm font-bold text-on-surface'>{formatDate(contract?.startDate)}</span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-xs text-on-surface-variant font-medium'>Hết hạn vào</span>
                      <span className='text-sm font-bold text-on-surface'>{formatDate(contract?.endDate)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Residence Info */}
            <div className='md:col-span-5 bg-surface-container-low rounded-[2rem] p-8'>
              <div className='flex items-center gap-3 mb-6'>
                <div className='w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary'>
                  <span className='material-symbols-outlined' style={{ fontVariationSettings: "'FILL' 1" }}>
                    apartment
                  </span>
                </div>
                <div>
                  <h3 className='text-lg font-bold text-on-surface'>Thông tin cư trú</h3>
                  <p className='text-xs text-on-surface-variant'>Chi tiết căn hộ và vị trí</p>
                </div>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div className='bg-white/50 p-4 rounded-2xl'>
                  <label className='text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1'>
                    Tòa nhà
                  </label>
                  <p className='text-base font-bold text-on-surface'>{data.residenceInfo?.buildingName || '---'}</p>
                </div>
                <div className='bg-white/50 p-4 rounded-2xl'>
                  <label className='text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1'>
                    Căn hộ / Tầng
                  </label>
                  <p className='text-base font-bold text-on-surface'>
                    {data.residenceInfo?.apartmentCode || '---'}{' '}
                    {data.residenceInfo?.floorNumber ? `(Tầng ${data.residenceInfo.floorNumber})` : ''}
                  </p>
                </div>
                <div className='col-span-2 bg-primary/5 p-4 rounded-2xl flex justify-between items-center'>
                  <div>
                    <label className='text-[10px] font-bold uppercase tracking-widest text-primary block mb-1'>
                      Vai trò cư dân
                    </label>
                    <p className='text-base font-bold text-primary'>{data.residenceInfo?.relationship || '---'}</p>
                  </div>
                  <span className='material-symbols-outlined text-primary-container'>verified_user</span>
                </div>
              </div>
            </div>

            {/* Family Members */}
            <div className='md:col-span-7 bg-surface-container-lowest rounded-[2rem] p-8 shadow-sm'>
              <div className='flex items-center gap-3 mb-6'>
                <div className='w-10 h-10 bg-surface-container-low rounded-xl flex items-center justify-center text-primary'>
                  <span className='material-symbols-outlined'>family_restroom</span>
                </div>
                <div>
                  <h3 className='text-lg font-bold text-on-surface'>Thành viên gia đình</h3>
                  <p className='text-xs text-on-surface-variant'>Người ở cùng căn hộ</p>
                </div>
              </div>
              {data.familyMembers?.length === 0 ? (
                <p className='text-center text-on-surface-variant py-8'>Chưa có thành viên gia đình</p>
              ) : (
                <div className='space-y-3'>
                  {data.familyMembers.map((member: any) => (
                    <div
                      key={member.id}
                      className='flex items-center justify-between p-4 bg-surface-container-low rounded-2xl hover:shadow-md transition-shadow'
                    >
                      <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm'>
                          {member.fullName?.charAt(0)}
                        </div>
                        <div>
                          <p className='text-sm font-bold text-on-surface'>{member.fullName}</p>
                          <p className='text-[10px] text-on-surface-variant'>{member.relationship}</p>
                        </div>
                      </div>
                      <span className='material-symbols-outlined text-slate-300 text-sm'>chevron_right</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Access History */}
            <div className='md:col-span-12 bg-surface-container-lowest rounded-[2rem] p-8 shadow-sm'>
              <div className='flex items-center justify-between mb-8'>
                <div>
                  <h3 className='text-xl font-bold text-on-surface'>Lịch sử ra vào</h3>
                  <p className='text-sm text-on-surface-variant'>
                    Lần cuối:{' '}
                    {data.accessHistory?.lastAccessTime
                      ? formatDateTime(data.accessHistory.lastAccessTime)
                      : 'Chưa có hoạt động'}
                  </p>
                </div>
                <button
                  onClick={handleOpenHistoryModal}
                  className='text-primary text-xs font-bold uppercase tracking-widest hover:underline'
                >
                  Xem tất cả
                </button>
              </div>

              {data.accessHistory?.recentLogs?.length === 0 ? (
                <p className='text-center text-on-surface-variant py-8'>Chưa có lịch sử ra vào</p>
              ) : (
                <div className='space-y-0 relative'>
                  <div className='absolute left-6 top-2 bottom-8 w-px bg-slate-100'></div>
                  {data.accessHistory?.recentLogs.map((log, index: number) => (
                    <div key={index} className='relative flex items-center gap-6 pb-6'>
                      <div
                        className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center ring-4 ring-white ${
                          log.result === 'SUCCESS' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                        }`}
                      >
                        <span className='material-symbols-outlined text-xl'>login</span>
                      </div>
                      <div className='flex-grow'>
                        <div className='flex items-center justify-between'>
                          <p className='text-sm font-bold text-on-surface'>Quét QR</p>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                              log.result === 'SUCCESS' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                            }`}
                          >
                            {log.result === 'SUCCESS' ? 'Được phép' : 'Từ chối'}
                          </span>
                        </div>
                        <p className='text-xs text-on-surface-variant mt-0.5'>{formatDateTime(log.scanTime)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* AI Insight */}
              <div className='mt-8 bg-primary/5 backdrop-blur-sm p-6 rounded-[1.5rem] border border-primary/10 flex items-center gap-4'>
                <div className='w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary'>
                  <span className='material-symbols-outlined' style={{ fontVariationSettings: "'FILL' 1" }}>
                    psychology
                  </span>
                </div>
                <div className='flex-grow'>
                  <p className='text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-1'>
                    Homelink AI Insight
                  </p>
                  <p className='text-sm text-on-surface-variant leading-relaxed'>
                    Mẫu truy cập cho thấy có hoạt động về khuya. Đề xuất ưu tiên chiếu sáng tự động tại khu vực lối vào.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className='bg-surface-container-highest/30 rounded-3xl p-6 flex flex-wrap gap-4 items-center'>
            <p className='text-xs font-bold text-slate-500 uppercase tracking-widest mr-4'>Thao tác nhanh</p>
            <button className='flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-xs font-bold text-on-surface hover:bg-primary hover:text-white transition-all shadow-sm'>
              <span className='material-symbols-outlined text-sm'>key</span> Cấp quyền
            </button>
            <button className='flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-xs font-bold text-on-surface hover:bg-primary hover:text-white transition-all shadow-sm'>
              <span className='material-symbols-outlined text-sm'>payments</span> Lịch sử thanh toán
            </button>
            <button className='flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-xs font-bold text-on-surface hover:bg-primary hover:text-white transition-all shadow-sm'>
              <span className='material-symbols-outlined text-sm'>warning</span> Ghi nhận sự cố
            </button>
            <button className='flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-xs font-bold text-on-surface hover:bg-primary hover:text-white transition-all shadow-sm'>
              <span className='material-symbols-outlined text-sm'>mail</span> Gửi thông báo
            </button>
          </div>
        </div>
      </main>

      {/* Modal Lịch sử quét */}
      {isHistoryModalOpen && (
        <div className='fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4'>
          <div className='bg-white rounded-2xl max-w-5xl w-full max-h-[85vh] overflow-hidden shadow-2xl'>
            <div className='p-6 border-b flex justify-between bg-gradient-to-r from-blue-50 to-white'>
              <div>
                <h2 className='text-2xl font-bold'>Lịch sử quét QR</h2>
                <p className='text-sm mt-1'>
                  Cư dân: <span className='font-semibold text-primary'>{data?.personalInfo.fullName}</span>
                </p>
              </div>
              <button
                onClick={() => {
                  setIsHistoryModalOpen(false)
                  handleResetHistoryFilters()
                }}
                className='p-2 hover:bg-gray-100 rounded-full'
              >
                <span className='material-symbols-outlined'>close</span>
              </button>
            </div>

            <div className='flex flex-wrap gap-3 p-4'>
              <input
                type='text'
                placeholder='Tìm kiếm...'
                className='flex-1 px-3 py-2 border rounded-lg text-sm'
                value={historySearchInput}
                onChange={(e) => setHistorySearchInput(e.target.value)}
              />
              <select
                className='px-3 py-2 border rounded-lg text-sm'
                value={historyResultFilter}
                onChange={(e) => setHistoryResultFilter(e.target.value)}
              >
                <option value=''>Tất cả kết quả</option>
                <option value='SUCCESS'>Thành công</option>
                <option value='DENIED'>Từ chối</option>
              </select>
              <input
                type='date'
                className='px-3 py-2 border rounded-lg text-sm'
                value={historyFromDate}
                onChange={(e) => setHistoryFromDate(e.target.value)}
              />
              <span className='material-symbols-outlined text-on-surface-variant/60 text-base self-center'>east</span>
              <input
                type='date'
                className='px-3 py-2 border rounded-lg text-sm'
                value={historyToDate}
                onChange={(e) => setHistoryToDate(e.target.value)}
              />
              <button onClick={handleResetHistoryFilters} className='px-3 py-2 text-gray-500 hover:text-primary'>
                <span className='material-symbols-outlined text-sm'>refresh</span>
              </button>
            </div>

            <div className='p-6 overflow-y-auto max-h-[calc(60vh-80px)]'>
              {isLoadingHistory ? (
                <div className='flex justify-center py-12'>
                  <div className='animate-spin h-8 w-8 border-b-2 border-primary'></div>
                </div>
              ) : historyList.length === 0 ? (
                <div className='text-center py-12'>
                  <span className='material-symbols-outlined text-5xl text-gray-300'>history</span>
                  <p className='mt-3'>Chưa có lịch sử quét</p>
                </div>
              ) : (
                <>
                  <table className='w-full text-left border-collapse'>
                    <thead>
                      <tr className='border-b'>
                        <th className='px-4 py-3 text-xs font-bold'>STT</th>
                        <th className='px-4 py-3 text-xs font-bold'>Thời gian</th>
                        <th className='px-4 py-3 text-xs font-bold'>Hướng</th>
                        <th className='px-4 py-3 text-xs font-bold'>Cổng</th>
                        <th className='px-4 py-3 text-xs font-bold'>Kết quả</th>
                        <th className='px-4 py-3 text-xs font-bold'>Người quét</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* {historyList.map((item: any, index: number) => {
                        const date = new Date(item.scan_time)
                        const hours = date.getHours()
                        const ampm = hours >= 12 ? 'CH' : 'SA'
                        const displayHours = hours % 12 || 12
                        const dateStr = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
                        const timeStr = `${displayHours}:${String(date.getMinutes()).padStart(2, '0')} ${ampm}`
                        const resultBadge = getResultBadge(item.result)
                        const directionIcon = getDirectionIcon(item.direction)
                        const rowNumber = (historyCurrentPage - 1) * historyPageSize + index + 1
                        return (
                          <tr key={item.id} className='border-b hover:bg-gray-50'>
                            <td className='px-4 py-3'>{rowNumber}</td>
                            <td className='px-4 py-3'>
                              <div className='font-medium'>{dateStr}</div>
                              <div className='text-xs'>{timeStr}</div>
                            </td>
                            <td className='px-4 py-3'>
                              <span className={`material-symbols-outlined text-sm ${directionIcon.color}`}>
                                {directionIcon.icon}
                              </span>{' '}
                              {directionIcon.text}
                            </td>
                            <td className='px-4 py-3'>{item.gate || '---'}</td>
                            <td className='px-4 py-3'>
                              <span
                                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold ${resultBadge.bgColor} ${resultBadge.textColor}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${resultBadge.dotColor}`}></span>
                                {resultBadge.text}
                              </span>
                            </td>
                            <td className='px-4 py-3'>{item.scanned_by_name || '---'}</td>
                          </tr>
                        )
                      })} */}
                      {historyList.map((item: any, index: number) => {
                        const dateTime = formatDateTime(item.scan_time)
                        const resultBadge = getResultBadge(item.result)
                        const directionIcon = getDirectionIcon(item.direction)
                        const rowNumber = (historyCurrentPage - 1) * historyPageSize + index + 1
                        return (
                          <tr key={item.id} className='border-b hover:bg-gray-50'>
                            <td className='px-4 py-3'>{rowNumber}</td>
                            <td className='px-4 py-3'>
                              <div className='font-medium'>{dateTime.split(' - ')[1]}</div> {/* Ngày */}
                              <div className='text-xs'>{dateTime.split(' - ')[0]}</div> {/* Giờ */}
                            </td>
                            <td className='px-4 py-3'>
                              <span className={`material-symbols-outlined text-sm ${directionIcon.color}`}>
                                {directionIcon.icon}
                              </span>{' '}
                              {directionIcon.text}
                            </td>
                            <td className='px-4 py-3'>{item.gate || '---'}</td>
                            <td className='px-4 py-3'>
                              <span
                                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold ${resultBadge.bgColor} ${resultBadge.textColor}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${resultBadge.dotColor}`}></span>
                                {resultBadge.text}
                              </span>
                            </td>
                            <td className='px-4 py-3'>{item.scanned_by_name || '---'}</td>
                          </tr>
                        )
                      })}
                      {historyList.map((item: any, index: number) => {
                        const dateTime = formatDateTime(item.scan_time)
                        const resultBadge = getResultBadge(item.result)
                        const directionIcon = getDirectionIcon(item.direction)
                        const rowNumber = (historyCurrentPage - 1) * historyPageSize + index + 1
                        return (
                          <tr key={item.id} className='border-b hover:bg-gray-50'>
                            <td className='px-4 py-3'>{rowNumber}</td>
                            <td className='px-4 py-3'>
                              <div className='font-medium'>{dateTime.split(' - ')[1]}</div> {/* Ngày */}
                              <div className='text-xs'>{dateTime.split(' - ')[0]}</div> {/* Giờ */}
                            </td>
                            <td className='px-4 py-3'>
                              <span className={`material-symbols-outlined text-sm ${directionIcon.color}`}>
                                {directionIcon.icon}
                              </span>{' '}
                              {directionIcon.text}
                            </td>
                            <td className='px-4 py-3'>{item.gate || '---'}</td>
                            <td className='px-4 py-3'>
                              <span
                                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold ${resultBadge.bgColor} ${resultBadge.textColor}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${resultBadge.dotColor}`}></span>
                                {resultBadge.text}
                              </span>
                            </td>
                            <td className='px-4 py-3'>{item.scanned_by_name || '---'}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  {historyTotalElements > 0 && (
                    <div className='mt-4 flex justify-between'>
                      <p className='text-xs'>
                        Hiển thị {(historyCurrentPage - 1) * historyPageSize + 1} -{' '}
                        {Math.min(historyCurrentPage * historyPageSize, historyTotalElements)} trên{' '}
                        {historyTotalElements}
                      </p>
                      <div className='flex gap-2'>
                        <button
                          onClick={() => setHistoryCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={historyCurrentPage === 1}
                          className='px-3 py-1 border rounded-md disabled:opacity-50'
                        >
                          Trước
                        </button>
                        <span className='px-3 py-1'>
                          {historyCurrentPage} / {historyTotalPages}
                        </span>
                        <button
                          onClick={() => setHistoryCurrentPage((p) => Math.min(historyTotalPages, p + 1))}
                          disabled={historyCurrentPage === historyTotalPages}
                          className='px-3 py-1 border rounded-md disabled:opacity-50'
                        >
                          Sau
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className='p-4 border-t bg-gray-50 flex justify-end'>
              <button
                onClick={() => {
                  setIsHistoryModalOpen(false)
                  handleResetHistoryFilters()
                }}
                className='px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300'
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
