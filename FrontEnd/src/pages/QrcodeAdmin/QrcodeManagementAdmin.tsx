import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { Link, useNavigate, createSearchParams, useLocation } from 'react-router-dom'
import { qrApiAdmin } from 'src/apis/QrcodeAdmin/QrcodeAdmin.api'
import type { historyQrcodeAdmin, historyQrcodeAdmin1, ListQRGuest } from 'src/types/qrcode.type'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useDebounce } from 'src/hooks/useDebounce'
import Paginate from 'src/components/Paginate/Paginate'
import GuestQRTable from './GuestQRTable'

interface UpdateQrcodeParams {
  id: string
  status: string
  expiresAt: string
}

interface PostQRcode {
  userId: string
  apartmentId: string
  expiresAt: string
}

export default function QrcodeManagementAdmin() {
  const navigate = useNavigate()
  const location = useLocation()

  // Lấy params từ URL cho danh sách chính
  const searchParams = new URLSearchParams(location.search)
  const pageFromUrl = searchParams.get('page') || '1'
  const limitFromUrl = searchParams.get('limit') || '10'
  const searchFromUrl = searchParams.get('search') || ''
  const statusFromUrl = searchParams.get('status') || ''

  const [searchInput, setSearchInput] = useState(searchFromUrl)
  const [statusFilter, setStatusFilter] = useState(statusFromUrl)
  const debouncedSearch = useDebounce(searchInput, 500)
  const debouncedStatus = useDebounce(statusFilter, 300)

  // Tab state
  const [activeTab, setActiveTab] = useState<'resident' | 'guest'>('resident')

  // Update URL khi filter thay đổi (cho resident)
  useEffect(() => {
    const params: Record<string, string> = {
      page: '1',
      limit: limitFromUrl || '10'
    }
    if (debouncedSearch) {
      params.search = debouncedSearch
    }
    if (debouncedStatus) {
      params.status = debouncedStatus
    }
    navigate(
      {
        pathname: location.pathname,
        search: createSearchParams(params).toString()
      },
      { replace: true }
    )
  }, [debouncedSearch, debouncedStatus, limitFromUrl, location.pathname, navigate])

  // Modal history states (cho resident)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [selectedResident, setSelectedResident] = useState<{ id: string; name: string } | null>(null)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<UpdateQrcodeParams | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedUserForCreate, setSelectedUserForCreate] = useState<PostQRcode | null>(null)

  // History filters (cho resident)
  const [historyCurrentPage, setHistoryCurrentPage] = useState(1)
  const [historyPageSize] = useState(10)
  const [historySearchInput, setHistorySearchInput] = useState('')
  const [historyResultFilter, setHistoryResultFilter] = useState('')
  const [historyFromDate, setHistoryFromDate] = useState('')
  const [historyToDate, setHistoryToDate] = useState('')
  const debouncedHistorySearch = useDebounce(historySearchInput, 500)
  const debouncedHistoryResult = useDebounce(historyResultFilter, 300)

  const queryClient = useQueryClient()

  // Query danh sách resident QR
  const { data, isLoading } = useQuery({
    queryKey: ['personal/list', pageFromUrl, limitFromUrl, debouncedSearch, debouncedStatus],
    queryFn: () =>
      qrApiAdmin.getAllQrcode({
        page: Number(pageFromUrl),
        limit: Number(limitFromUrl),
        search: debouncedSearch || undefined,
        status: debouncedStatus || undefined
      }),
    placeholderData: keepPreviousData,
    staleTime: 3000 * 60
  })

  // // Query danh sách guest QR
  // const { data: guestData, isLoading: guestLoading } = useQuery({
  //   queryKey: ['guest/list', guestPage, limitFromUrl, debouncedGuestSearch, debouncedGuestStatus],
  //   queryFn: () =>
  //     qrApiAdmin.getListGuest({
  //       page: guestPage,
  //       limit: Number(limitFromUrl),
  //       search: debouncedGuestSearch || undefined,
  //       status: debouncedGuestStatus || undefined
  //     }),
  //   placeholderData: keepPreviousData,
  //   staleTime: 3000 * 60,
  //   enabled: activeTab === 'guest'
  // })

  const dataListQr: historyQrcodeAdmin[] = data?.data?.data || []
  // const guestList: ListQRGuest[] = guestData?.data?.data || []

  const totalElements = data?.data?.totalElements || 0
  const totalPages = data?.data?.totalPages || 1
  const currentPage = data?.data?.page || Number(pageFromUrl)
  const currentPageSize = data?.data?.pageSize || Number(limitFromUrl)

  // const guestTotalElements = guestData?.data?.totalElements || 0
  // const guestTotalPages = guestData?.data?.totalPages || 1

  // Query lịch sử quét resident
  const {
    data: historyData,
    isLoading: isLoadingHistory,
    refetch: refetchHistory
  } = useQuery({
    queryKey: [
      'resident-history',
      selectedResident?.id,
      historyCurrentPage,
      debouncedHistorySearch,
      debouncedHistoryResult,
      historyFromDate,
      historyToDate
    ],
    queryFn: () =>
      qrApiAdmin.getHistoryQrcodeByUserId(selectedResident!.id, {
        page: historyCurrentPage,
        limit: historyPageSize,
        search: debouncedHistorySearch || undefined,
        result: debouncedHistoryResult || undefined,
        fromDate: historyFromDate || undefined,
        toDate: historyToDate || undefined
      }),
    enabled: !!selectedResident?.id
  })

  const historyList: historyQrcodeAdmin1[] = historyData?.data?.data || []
  const historyTotalElements = historyData?.data?.totalElements || 0
  const historyTotalPages = historyData?.data?.totalPages || 1

  // Thống kê resident
  const totalIssued = dataListQr.filter((item) => item.qr_id !== null).length
  const activeKeys = dataListQr.filter((item) => item.qr_status === 'ACTIVE').length
  const revokedKeys = dataListQr.filter((item) => item.qr_status === 'REVOKED').length
  const activePercentage = totalIssued > 0 ? (activeKeys / totalIssued) * 100 : 0

  // Mutations Resident
  const deleteMutation = useMutation({
    mutationFn: (id: string) => qrApiAdmin.deleteQrcodeAdmin(id),
    onSuccess: () => {
      toast.success('Đã thu hồi mã QR thành công')
      queryClient.invalidateQueries({ queryKey: ['personal/list'] })
    },
    onError: () => toast.error('Thu hồi thất bại')
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: { status: string; expiresAt: string } }) =>
      qrApiAdmin.updateQrcodeAdmin(id, body),
    onSuccess: () => {
      toast.success('Cập nhật mã QR thành công')
      queryClient.invalidateQueries({ queryKey: ['personal/list'] })
      setIsUpdateModalOpen(false)
      setSelectedItem(null)
    },
    onError: (error) => toast.error(error.message || 'Cập nhật thất bại')
  })

  const createMutation = useMutation({
    mutationFn: (body: PostQRcode) => {
      return qrApiAdmin.postQrcodeAdmin(body)
    },
    onSuccess: () => {
      toast.success('Tạo mã QR thành công')
      queryClient.invalidateQueries({ queryKey: ['personal/list'] })
      setIsCreateModalOpen(false)
      setSelectedUserForCreate(null)
    },
    onError: (error) => toast.error(error.message || 'Tạo QR thất bại')
  })

  // Format functions
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    const hours = date.getHours()
    const ampm = hours >= 12 ? 'CH' : 'SA'
    const displayHours = hours % 12 || 12
    return {
      date: `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`,
      time: `${displayHours}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')} ${ampm}`
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return { text: 'HOẠT ĐỘNG', bgColor: 'bg-green-100', textColor: 'text-green-700' }
      case 'EXPIRED':
        return { text: 'HẾT HẠN', bgColor: 'bg-orange-100', textColor: 'text-orange-700' }
      case 'REVOKED':
        return { text: 'ĐÃ THU HỒI', bgColor: 'bg-error-container/30', textColor: 'text-error' }
      default:
        return { text: status, bgColor: 'bg-gray-100', textColor: 'text-gray-700' }
    }
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

  // Handlers Resident
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Đã sao chép mã QR')
  }

  const handleViewHistory = (userId: string, userName: string) => {
    setSelectedResident({ id: userId, name: userName })
    setIsHistoryModalOpen(true)
    setTimeout(() => refetchHistory(), 100)
  }

  const handleEdit = (item: historyQrcodeAdmin) => {
    if (!item.qr_id) {
      toast.warning('Cư dân chưa có mã QR để chỉnh sửa')
      return
    }
    setSelectedItem({
      id: item.qr_id,
      status: item.qr_status || 'ACTIVE',
      expiresAt: item.expires_at || new Date().toISOString()
    })
    setIsUpdateModalOpen(true)
  }

  const handleRevoke = (item: historyQrcodeAdmin) => {
    if (!item.qr_id) {
      toast.warning('Cư dân chưa có mã QR')
      return
    }
    if (window.confirm(`Bạn có chắc muốn thu hồi mã QR của ${item.user_name}?`)) {
      deleteMutation.mutate(item.qr_id)
    }
  }

  const handleResetFilters = () => {
    setSearchInput('')
    setStatusFilter('')
    navigate({ pathname: location.pathname, search: createSearchParams({ page: '1', limit: '10' }).toString() })
  }

  const handleResetHistoryFilters = () => {
    setHistorySearchInput('')
    setHistoryResultFilter('')
    setHistoryFromDate('')
    setHistoryToDate('')
    setHistoryCurrentPage(1)
  }

  if (isLoading && !data && activeTab === 'resident') {
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
    <div className="bg-surface text-on-surface min-h-screen font-['Manrope',sans-serif] antialiased overflow-x-hidden">
      <main className='min-h-screen'>
        <div className='max-w-[1200px] mx-auto space-y-12'>
          {/* Header Section */}
          <section className='flex flex-col md:flex-row md:items-end justify-between gap-6'>
            <div className='max-w-xl'>
              <span className='text-xs font-bold tracking-[0.2em] text-primary uppercase mb-2 block'>
                Trung tâm bảo mật
              </span>
              <h1 className='text-4xl font-extrabold tracking-tight text-on-surface'>Quản lý Mã QR</h1>
              <p className='mt-4 text-on-surface-variant text-lg leading-relaxed'>
                Quản lý và giám sát chìa khóa truy cập kỹ thuật số cho hệ sinh thái cư dân.
              </p>
            </div>
            <div className='flex gap-4'>
              <Link
                to={'/historyQrcodeAdmin'}
                className='px-6 py-3 bg-[#007FFF] text-white font-bold rounded-full transition-all active:scale-95 flex items-center gap-2 hover:opacity-90'
              >
                <span className='material-symbols-outlined text-sm'>history</span>
                Toàn bộ lịch sử quét
              </Link>
            </div>
          </section>

          {/* Tabs */}
          <div className='flex gap-3 mb-8 border-b border-surface-container-low'>
            <button
              onClick={() => setActiveTab('resident')}
              className={`px-6 py-3 font-semibold transition-all relative ${
                activeTab === 'resident' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className='flex items-center gap-2'>
                <span className='material-symbols-outlined text-lg'>qr_code_2</span>
                QR Cư dân
              </span>
              {activeTab === 'resident' && (
                <span className='absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full'></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('guest')}
              className={`px-6 py-3 font-semibold transition-all relative ${
                activeTab === 'guest' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className='flex items-center gap-2'>
                <span className='material-symbols-outlined text-lg'>group</span>
                QR Khách
              </span>
              {activeTab === 'guest' && (
                <span className='absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full'></span>
              )}
            </button>
          </div>

          {/* ==================== RESIDENT QR TAB ==================== */}
          {activeTab === 'resident' && (
            <>
              {/* Filter Bar */}
              <div className='bg-surface-container-low rounded-2xl p-6 flex flex-col lg:flex-row gap-6 items-center'>
                <div className='w-full lg:flex-1 relative'>
                  <span className='material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60'>
                    search
                  </span>
                  <input
                    className='w-full pl-12 pr-4 py-3 bg-surface-container-lowest border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-sm'
                    placeholder='Tìm kiếm theo tên, email, số điện thoại...'
                    type='text'
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </div>
                <div className='flex flex-wrap items-center gap-4 w-full lg:w-auto'>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className='px-4 py-2 bg-surface-container-highest/50 border-none rounded-lg text-sm cursor-pointer'
                  >
                    <option value=''>Tất cả trạng thái</option>
                    <option value='ACTIVE'>Hoạt động</option>
                    <option value='EXPIRED'>Hết hạn</option>
                    <option value='REVOKED'>Đã thu hồi</option>
                  </select>
                </div>
                <div className='flex flex-wrap items-center gap-4 w-full lg:w-auto bg-slate-50 rounded-md'>
                  <button
                    onClick={handleResetFilters}
                    className='px-4 py-2 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2'
                  >
                    <span className='material-symbols-outlined text-base'>refresh</span>
                    Xóa bộ lọc
                  </button>
                </div>
              </div>

              {/* Statistics */}
              <section className='grid grid-cols-1 md:grid-cols-4 gap-6'>
                <div className='md:col-span-2 bg-surface-container-lowest p-8 rounded-[2rem]'>
                  <div className='flex items-center gap-3 mb-6'>
                    <div className='p-3 bg-primary-fixed rounded-2xl text-primary'>
                      <span className='material-symbols-outlined'>analytics</span>
                    </div>
                    <span className='font-bold tracking-widest text-on-surface-variant opacity-60'>TỔNG SỐ ĐÃ CẤP</span>
                  </div>
                  <h2 className='text-6xl font-extrabold text-on-surface'>{totalIssued}</h2>
                </div>

                <div className='bg-secondary-fixed/30 p-8 rounded-[2rem]'>
                  <span className='font-bold tracking-widest text-on-secondary-fixed-variant opacity-70'>
                    CHÌA KHÓA HOẠT ĐỘNG
                  </span>
                  <h3 className='text-4xl font-extrabold text-on-secondary-fixed mt-2'>{activeKeys}</h3>
                  <div className='w-full bg-white/50 h-1.5 rounded-full mt-6 overflow-hidden'>
                    <div className='bg-primary h-full rounded-full' style={{ width: `${activePercentage}%` }}></div>
                  </div>
                </div>

                <div className='bg-error-container/20 p-8 rounded-[2rem]'>
                  <span className='font-bold tracking-widest text-on-error-container opacity-70'>ĐÃ THU HỒI</span>
                  <h3 className='text-4xl font-extrabold text-on-error-container mt-2'>{revokedKeys}</h3>
                </div>
              </section>

              {/* Resident Table */}
              <div className='bg-surface-container-lowest rounded-[2rem] overflow-hidden'>
                <div className='overflow-x-auto'>
                  <table className='w-full text-left border-collapse'>
                    <thead>
                      <tr className='bg-surface-container-low/50'>
                        <th className='px-6 py-5 text-[11px] font-extrabold uppercase tracking-widest'>Người dùng</th>
                        <th className='px-6 py-5 text-[11px] font-extrabold uppercase tracking-widest'>Liên hệ</th>
                        <th className='px-6 py-5 text-[11px] font-extrabold uppercase tracking-widest'>Căn hộ</th>
                        <th className='px-6 py-5 text-[11px] font-extrabold uppercase tracking-widest'>Mã QR</th>
                        <th className='px-6 py-5 text-[11px] font-extrabold uppercase tracking-widest text-center'>
                          Trạng thái
                        </th>
                        <th className='px-8 py-5 text-[11px] font-extrabold uppercase tracking-widest text-right'>
                          Hết hạn
                        </th>
                        <th className='px-8 py-5 text-[11px] font-extrabold uppercase tracking-widest text-right'>
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-surface-container-low'>
                      {dataListQr.length === 0 ? (
                        <tr>
                          <td colSpan={7} className='px-8 py-12 text-center'>
                            Không tìm thấy kết quả
                          </td>
                        </tr>
                      ) : (
                        dataListQr.map((item) => {
                          const statusBadge = getStatusBadge(item.qr_status)
                          return (
                            <tr key={item.user_id} className='group hover:bg-surface-container-low/20'>
                              <td className='px-6 py-6 font-bold'>{item.user_name}</td>
                              <td className='px-6 py-6 text-sm'>
                                <div>{item.user_email}</div>
                                <div className='text-xs opacity-70 '>{item.user_phone || 'Chưa có SĐT'}</div>
                              </td>
                              <td className='px-6 py-6'>
                                {item.apartment_code ? (
                                  <span className='px-3 py-1 bg-surface-container-high rounded-full text-xs font-bold'>
                                    {item.apartment_code}
                                  </span>
                                ) : (
                                  <span className='text-xs italic'>Chưa có căn hộ</span>
                                )}
                              </td>
                              <td className='px-6 py-6'>
                                {item.qr_code ? (
                                  <div
                                    className='flex items-center gap-2 cursor-pointer group/code'
                                    onClick={() => handleCopyCode(item.qr_code)}
                                  >
                                    <code className='text-xs bg-surface-container-low px-2 py-1 rounded'>
                                      {item.qr_code.slice(0, 10)}...
                                    </code>
                                    <span className='material-symbols-outlined text-xs opacity-0 group-hover/code:opacity-100'>
                                      content_copy
                                    </span>
                                  </div>
                                ) : (
                                  <span className='text-xs italic'>Chưa có QR</span>
                                )}
                              </td>
                              <td className='px-6 py-6 text-center'>
                                <span
                                  className={`inline-flex px-4 py-1.5 rounded-full text-[10px] font-bold ${statusBadge.bgColor} ${statusBadge.textColor}`}
                                >
                                  {statusBadge.text}
                                </span>
                              </td>
                              <td className='px-6 py-6 text-right'>
                                <p className='text-sm font-bold'>{formatDate(item.expires_at)}</p>
                                <p className='text-[10px] opacity-70'>
                                  {item.qr_status === 'ACTIVE'
                                    ? 'Còn hiệu lực'
                                    : item.qr_status === 'EXPIRED'
                                      ? 'Đã hết hạn'
                                      : 'Đã thu hồi'}
                                </p>
                              </td>
                              <td className='px-6 py-6 text-right'>
                                <div className='flex justify-end gap-2'>
                                  <button
                                    onClick={() => navigate(`/admin/viewDetailResident/${item.user_id}`)}
                                    className='p-2 bg-surface-container-low rounded-lg hover:bg-primary hover:text-white'
                                    title='Xem chi tiết'
                                  >
                                    <span className='material-symbols-outlined text-sm'>visibility</span>
                                  </button>
                                  <button
                                    onClick={() => handleViewHistory(item.user_id, item.user_name)}
                                    className='p-2 bg-surface-container-low rounded-lg hover:bg-primary hover:text-white'
                                    title='Lịch sử'
                                  >
                                    <span className='material-symbols-outlined text-sm'>history</span>
                                  </button>

                                  {item.qr_id ? (
                                    <>
                                      <button
                                        onClick={() => handleEdit(item)}
                                        className='p-2 bg-surface-container-low rounded-lg hover:bg-primary hover:text-white'
                                      >
                                        <span className='material-symbols-outlined text-sm'>edit</span>
                                      </button>
                                      <button
                                        onClick={() => handleRevoke(item)}
                                        className='p-2 bg-surface-container-low rounded-lg hover:bg-red-500 hover:text-white'
                                      >
                                        <span className='material-symbols-outlined text-sm'>block</span>
                                      </button>
                                    </>
                                  ) : item.apartment_code && item.apartment_code !== 'Chưa có căn hộ' ? (
                                    <button
                                      onClick={() => {
                                        setSelectedUserForCreate({
                                          userId: item.user_id,
                                          apartmentId: String(item.apartment_id),
                                          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
                                        })
                                        setIsCreateModalOpen(true)
                                      }}
                                      className='p-2 bg-green-500 text-white rounded-lg hover:bg-green-600'
                                      title='Tạo mã QR'
                                    >
                                      <span className='material-symbols-outlined text-sm'>add</span>
                                    </button>
                                  ) : (
                                    <button
                                      disabled
                                      className='p-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed'
                                      title='Cư dân chưa có căn hộ'
                                    >
                                      <span className='material-symbols-outlined text-sm'>add</span>
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Resident */}
                {totalElements > 0 && (
                  <div className='p-6 bg-surface-container-low/30 flex items-center justify-between'>
                    <p className='text-xs'>
                      Hiển thị {(currentPage - 1) * currentPageSize + 1} -{' '}
                      {Math.min(currentPage * currentPageSize, totalElements)} trên {totalElements}
                    </p>
                    <Paginate
                      queryConfig={{ page: currentPage.toString(), limit: currentPageSize.toString() }}
                      pageSize={totalPages}
                      search={debouncedSearch || undefined}
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {/* ==================== GUEST QR TAB ==================== */}
          {activeTab === 'guest' && <GuestQRTable />}
        </div>
      </main>

      {/* ==================== MODALS ==================== */}

      {/* Modal Lịch sử quét Resident */}
      {isHistoryModalOpen && selectedResident && (
        <div className='fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4'>
          <div className='bg-white rounded-2xl max-w-5xl w-full max-h-[85vh] overflow-hidden shadow-2xl'>
            <div className='p-6 border-b flex justify-between bg-gradient-to-r from-blue-50 to-white'>
              <div>
                <h2 className='text-2xl font-bold'>Lịch sử quét QR</h2>
                <p className='text-sm mt-1'>
                  Cư dân: <span className='font-semibold text-primary'>{selectedResident.name}</span>
                </p>
              </div>
              <button
                onClick={() => {
                  setIsHistoryModalOpen(false)
                  setSelectedResident(null)
                }}
                className='p-2 hover:bg-gray-100 rounded-full'
              >
                <span className='material-symbols-outlined'>close</span>
              </button>
            </div>

            <div className='flex flex-wrap gap-3 m-3'>
              <input
                type='text'
                placeholder='Tìm kiếm...'
                className='flex-1 px-3 py-2 border rounded-lg text-sm'
                value={historySearchInput}
                onChange={(e) => setHistorySearchInput(e.target.value)}
              />
              <select
                className='px-2 py-2 border rounded-lg text-sm'
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
                        <th className='px-4 py-3 text-xs font-bold'>Tòa nhà</th>
                        <th className='px-4 py-3 text-xs font-bold'>Căn hộ</th>
                        <th className='px-4 py-3 text-xs font-bold'>Kết quả</th>
                        <th className='px-4 py-3 text-xs font-bold'>Người quét</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyList.map((item, index) => {
                        const dateTime = formatDateTime(item.scan_time)
                        const resultBadge = getResultBadge(item.result)
                        const directionIcon = getDirectionIcon(item.direction)
                        const rowNumber = (historyCurrentPage - 1) * historyPageSize + index + 1
                        return (
                          <tr key={item.id} className='border-b hover:bg-gray-50'>
                            <td className='px-4 py-3'>{rowNumber}</td>
                            <td className='px-4 py-3'>
                              <div className='font-medium'>{dateTime.date}</div>
                              <div className='text-xs'>{dateTime.time}</div>
                            </td>
                            <td className='px-4 py-3'>
                              <span className={`material-symbols-outlined text-sm ${directionIcon.color}`}>
                                {directionIcon.icon}
                              </span>{' '}
                              {directionIcon.text}
                            </td>
                            <td className='px-4 py-3'>{item.building_name}</td>
                            <td className='px-4 py-3'>{item.apartment_code}</td>
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
                  setSelectedResident(null)
                }}
                className='px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300'
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cập nhật QR Resident */}
      {isUpdateModalOpen && selectedItem && (
        <div className='fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4'>
          <div className='bg-white rounded-2xl max-w-md w-full'>
            <div className='p-5 border-b'>
              <h2 className='text-xl font-bold'>Cập nhật mã QR</h2>
            </div>
            <div className='p-5 space-y-4'>
              <div>
                <label className='block text-sm font-bold mb-2'>Trạng thái</label>
                <select id='status' defaultValue={selectedItem.status} className='w-full px-4 py-2 border rounded-lg'>
                  <option value='ACTIVE'>Hoạt động</option>
                  <option value='EXPIRED'>Hết hạn</option>
                  <option value='REVOKED'>Đã thu hồi</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-bold mb-2'>Ngày hết hạn</label>
                <input
                  id='expiresAt'
                  type='datetime-local'
                  defaultValue={new Date(selectedItem.expiresAt).toISOString().slice(0, 16)}
                  className='w-full px-4 py-2 border rounded-lg'
                />
              </div>
            </div>
            <div className='p-5 border-t flex justify-end gap-3'>
              <button
                onClick={() => {
                  setIsUpdateModalOpen(false)
                  setSelectedItem(null)
                }}
                className='px-4 py-2 bg-gray-200 rounded-lg'
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  const status = (document.getElementById('status') as HTMLSelectElement).value
                  const expiresAt = (document.getElementById('expiresAt') as HTMLInputElement).value
                  updateMutation.mutate({
                    id: selectedItem.id,
                    body: { status, expiresAt: new Date(expiresAt).toISOString() }
                  })
                }}
                className='px-4 py-2 bg-primary text-white rounded-lg'
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Đang...' : 'Cập nhật'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tạo QR Resident */}
      {isCreateModalOpen && selectedUserForCreate && (
        <div className='fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4'>
          <div className='bg-white rounded-2xl max-w-md w-full'>
            <div className='p-5 border-b'>
              <h2 className='text-xl font-bold'>Tạo mã QR cho cư dân</h2>
              <p className='text-sm mt-1'>
                Cư dân: <span className='font-semibold text-green-600'>{selectedUserForCreate.userId}</span>
              </p>
            </div>
            <div className='p-5 space-y-4'>
              <div>
                <label className='block text-sm font-bold mb-2'>Ngày hết hạn</label>
                <input
                  id='expiresAtCreate'
                  type='datetime-local'
                  defaultValue={new Date(selectedUserForCreate.expiresAt).toISOString().slice(0, 16)}
                  className='w-full px-4 py-2 border rounded-lg'
                />
              </div>
            </div>
            <div className='p-5 border-t flex justify-end gap-3'>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false)
                  setSelectedUserForCreate(null)
                }}
                className='px-4 py-2 bg-gray-200 rounded-lg'
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  const expiresAt = (document.getElementById('expiresAtCreate') as HTMLInputElement).value
                  createMutation.mutate({
                    userId: selectedUserForCreate.userId,
                    apartmentId: selectedUserForCreate.apartmentId,
                    expiresAt: new Date(expiresAt).toISOString()
                  })
                }}
                className='px-4 py-2 bg-green-500 text-white rounded-lg'
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Đang...' : 'Tạo QR'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
