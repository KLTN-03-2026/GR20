// src/pages/Admin/QrcodeManagement/GuestQRTable.tsx
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { qrApiAdmin } from 'src/apis/QrcodeAdmin/QrcodeAdmin.api'
import Paginate from 'src/components/Paginate/Paginate'
import { useDebounce } from 'src/hooks/useDebounce'
import useQueryParams from 'src/hooks/useQueryParams'
import { useNavigate, createSearchParams, useLocation } from 'react-router-dom'
import type { ListGuestQr, ListQRGuest } from 'src/types/qrcode.type'
import { CreateGuestQRModal } from './CreateGuestQRModal'
import { UpdateGuestQRModal } from './UpdateGuestQRModal'
import { HistoryGuestQRModal } from './HistoryGuestQRModal'

export default function GuestQRTable() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const queryParams = useQueryParams()

  // Lấy params từ URL
  const pageFromUrl = queryParams.page || '1'
  const limitFromUrl = queryParams.limit || '10'
  const searchFromUrl = queryParams.search || ''
  const hasQrOnlyFromUrl = queryParams.hasQrOnly === 'true'
  const noQrOnlyFromUrl = queryParams.noQrOnly === 'true'

  // State cho filter (local UI)
  const [searchInput, setSearchInput] = useState(searchFromUrl)
  const [hasQrOnly, setHasQrOnly] = useState(hasQrOnlyFromUrl)
  const [noQrOnly, setNoQrOnly] = useState(noQrOnlyFromUrl)
  const debouncedSearch = useDebounce(searchInput, 500)

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [selectedResident, setSelectedResident] = useState<ListGuestQr | null>(null)
  const [selectedGuestQR, setSelectedGuestQR] = useState<ListQRGuest | null>(null)
  const [selectedResidentForCreate, setSelectedResidentForCreate] = useState<{
    hostUserId: string
    apartmentId: string
  } | null>(null)

  // Sync URL khi filter thay đổi
  useEffect(() => {
    const params: Record<string, string> = {
      page: '1',
      limit: limitFromUrl
    }
    if (debouncedSearch) params.search = debouncedSearch
    if (hasQrOnly) params.hasQrOnly = 'true'
    if (noQrOnly) params.noQrOnly = 'true'

    navigate(
      {
        pathname: location.pathname,
        search: createSearchParams(params).toString()
      },
      { replace: true }
    )
  }, [debouncedSearch, hasQrOnly, noQrOnly, limitFromUrl, navigate, location.pathname])

  // Query danh sách cư dân (dùng API getAllResidents)
  const { data, isLoading } = useQuery({
    queryKey: ['residents', pageFromUrl, limitFromUrl, searchFromUrl, hasQrOnlyFromUrl, noQrOnlyFromUrl],
    queryFn: () =>
      qrApiAdmin.getAllResidents({
        page: Number(pageFromUrl),
        limit: Number(limitFromUrl),
        search: searchFromUrl || undefined,
        hasQrOnly: hasQrOnlyFromUrl || undefined,
        noQrOnly: noQrOnlyFromUrl || undefined
      }),
    placeholderData: keepPreviousData,
    staleTime: 3000 * 60
  })

  // Query chi tiết guest QR (khi cần xem lịch sử hoặc cập nhật)
  const { data: guestQRDetail, refetch: refetchGuestQR } = useQuery({
    queryKey: ['guestQR-detail', selectedResident?.guest_qr_id],
    queryFn: () => qrApiAdmin.getDetailQrGuest(selectedResident!.guest_qr_id!.toString()),
    enabled: !!selectedResident?.guest_qr_id && (isUpdateModalOpen || isHistoryModalOpen),
    staleTime: 3000 * 60
  })

  // Cập nhật guest QR detail khi có dữ liệu
  useEffect(() => {
    if (guestQRDetail?.data?.data) {
      setSelectedGuestQR(guestQRDetail.data.data)
    }
  }, [guestQRDetail])

  const residentsList = data?.data?.data || []
  const totalElements = data?.data?.totalElements || 0
  const totalPages = data?.data?.totalPages || 1
  const currentPage = data?.data?.page || Number(pageFromUrl)
  const currentLimit = data?.data?.pageSize || Number(limitFromUrl)

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: (id: string) => qrApiAdmin.DeleteQrGuest(id),
    onSuccess: () => {
      toast.success('Đã thu hồi mã QR khách thành công')
      queryClient.invalidateQueries({ queryKey: ['residents'] })
    },
    onError: () => toast.error('Thu hồi thất bại')
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: { validTo: string; status: string; pin_code?: string } }) =>
      qrApiAdmin.PutQrQuest(body, id),
    onSuccess: () => {
      toast.success('Cập nhật thành công')
      queryClient.invalidateQueries({ queryKey: ['residents'] })
      setIsUpdateModalOpen(false)
      setSelectedResident(null)
      setSelectedGuestQR(null)
    },
    onError: () => toast.error('Cập nhật thất bại')
  })

  const createMutation = useMutation({
    mutationFn: (body: {
      hostUserId: string
      apartmentId: string
      validTo: string
      visitorName: string
      visitorPhone: string
      pinCode?: string
    }) => qrApiAdmin.PostQrGuest(body),
    onSuccess: () => {
      toast.success('Tạo mã QR khách thành công')
      queryClient.invalidateQueries({ queryKey: ['residents'] })
      setIsCreateModalOpen(false)
      setSelectedResidentForCreate(null)
    },
    onError: (error: any) => toast.error(error?.message || 'Tạo thất bại')
  })

  // ==================== HANDLERS ====================

  // Xem lịch sử
  const handleViewHistory = (resident: any) => {
    if (!resident.guest_qr_id) {
      toast.warning('Cư dân chưa có mã QR')
      return
    }
    setSelectedResident(resident)
    setIsHistoryModalOpen(true)
    refetchGuestQR()
  }

  // Xóa
  const handleDelete = (resident: any) => {
    if (!resident.guest_qr_id) {
      toast.warning('Cư dân chưa có mã QR')
      return
    }
    if (window.confirm(`Bạn có chắc muốn thu hồi mã QR của ${resident.full_name}?`)) {
      deleteMutation.mutate(resident.guest_qr_id.toString())
    }
  }

  // Cập nhật
  const handleUpdate = (resident: any) => {
    if (!resident.guest_qr_id) {
      toast.warning('Cư dân chưa có mã QR')
      return
    }
    setSelectedResident(resident)
    setIsUpdateModalOpen(true)
    refetchGuestQR()
  }

  // Tạo mới (mở modal)
  const handleOpenCreateModal = (hostUserId: string, apartmentId: string) => {
    setSelectedResidentForCreate({ hostUserId, apartmentId })
    setIsCreateModalOpen(true)
  }

  // Reset filters
  const handleResetFilters = () => {
    setSearchInput('')
    setHasQrOnly(false)
    setNoQrOnly(false)
    navigate({
      pathname: location.pathname,
      search: createSearchParams({ page: '1', limit: '10' }).toString()
    })
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
  }

  if (isLoading && !data) {
    return (
      <div className='flex justify-center py-12'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    )
  }

  return (
    <div>
      {/* Filter Bar */}
      <div className='bg-surface-container-low rounded-2xl p-6 flex flex-col lg:flex-row gap-6 items-center mb-6'>
        <div className='w-full lg:flex-1 relative'>
          <span className='material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60'>
            search
          </span>
          <input
            className='w-full pl-12 pr-4 py-3 bg-surface-container-lowest border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-sm'
            placeholder='Tìm kiếm theo tên cư dân, email, số điện thoại...'
            type='text'
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <div className='flex flex-wrap items-center gap-4 w-full lg:w-auto'>
          <div className='flex items-center gap-3'>
            <label className='flex items-center gap-1.5 text-sm cursor-pointer'>
              <input
                type='checkbox'
                checked={hasQrOnly}
                onChange={(e) => {
                  setHasQrOnly(e.target.checked)
                  if (e.target.checked) setNoQrOnly(false)
                }}
                className='w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary'
              />
              <span>Đã có QR</span>
            </label>
            <label className='flex items-center gap-1.5 text-sm cursor-pointer'>
              <input
                type='checkbox'
                checked={noQrOnly}
                onChange={(e) => {
                  setNoQrOnly(e.target.checked)
                  if (e.target.checked) setHasQrOnly(false)
                }}
                className='w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary'
              />
              <span>Chưa có QR</span>
            </label>
          </div>

          <button
            onClick={handleResetFilters}
            className='px-4 py-2 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2'
          >
            <span className='material-symbols-outlined text-base'>refresh</span>
            Xóa bộ lọc
          </button>
        </div>
      </div>

      {/* Table - Hiển thị danh sách cư dân */}
      {/* Table - Hiển thị danh sách cư dân */}
      <div className='bg-surface-container-lowest rounded-[2rem] overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left border-collapse'>
            <thead>
              <tr className='bg-surface-container-low/50'>
                <th className='px-6 py-5 text-[11px] font-extrabold uppercase tracking-widest'>STT</th>
                <th className='px-6 py-5 text-[11px] font-extrabold uppercase tracking-widest'>Cư dân</th>
                <th className='px-6 py-5 text-[11px] font-extrabold uppercase tracking-widest'>Căn hộ</th>
                <th className='px-6 py-5 text-[11px] font-extrabold uppercase tracking-widest'>Trạng thái QR</th>
                <th className='px-6 py-5 text-[11px] font-extrabold uppercase tracking-widest'>Thời hạn</th>
                <th className='px-6 py-5 text-[11px] font-extrabold uppercase tracking-widest text-right'>Thao tác</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-surface-container-low'>
              {residentsList.length === 0 ? (
                <tr>
                  <td colSpan={6} className='px-8 py-12 text-center'>
                    Không tìm thấy kết quả
                  </td>
                </tr>
              ) : (
                residentsList.map((item, index) => {
                  const rowNumber = (currentPage - 1) * currentLimit + index + 1

                  const getStatusBadge = (status: string) => {
                    switch (status) {
                      case 'ACTIVE':
                        return { text: 'HOẠT ĐỘNG', bgColor: 'bg-emerald-100', textColor: 'text-emerald-700' }
                      case 'EXPIRED':
                        return { text: 'HẾT HẠN', bgColor: 'bg-amber-100', textColor: 'text-amber-700' }
                      case 'REVOKED':
                        return { text: 'ĐÃ THU HỒI', bgColor: 'bg-rose-100', textColor: 'text-rose-700' }
                      default:
                        return { text: 'CHƯA CÓ QR', bgColor: 'bg-gray-100', textColor: 'text-gray-500' }
                    }
                  }

                  // Luôn hiển thị trạng thái dựa vào guest_qr_status nếu có QR
                  const statusBadge = item.guest_qr_id
                    ? getStatusBadge(item.guest_qr_status)
                    : { text: 'CHƯA CÓ QR', bgColor: 'bg-gray-100', textColor: 'text-gray-500' }

                  return (
                    <tr key={item.user_id} className='group hover:bg-surface-container-low/20'>
                      <td className='px-6 py-6 text-sm'>{rowNumber}</td>
                      <td className='px-6 py-6'>
                        <div className='font-bold'>{item.full_name}</div>
                        <div className='text-xs text-gray-500'>{item.email}</div>
                        <div className='text-xs text-gray-400'>{item.phone}</div>
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
                        <span
                          className={`inline-flex px-4 py-1.5 rounded-full text-[10px] font-bold ${statusBadge.bgColor} ${statusBadge.textColor}`}
                        >
                          {statusBadge.text}
                          {item.guest_qr_count !== '0' && <span className='ml-1'>({item.guest_qr_count})</span>}
                        </span>
                      </td>
                      <td className='px-6 py-6'>
                        {item.guest_qr_valid_to ? (
                          <code className='text-xs bg-surface-container-low px-2 py-1 rounded font-bold'>
                            {/* {item.guest_qr_valid_to} */}
                            {formatDate(item.guest_qr_valid_to)}
                          </code>
                        ) : (
                          <span className='text-xs italic'>---</span>
                        )}
                      </td>
                      <td className='px-6 py-6 text-right'>
                        <div className='flex justify-end gap-2'>
                          {/* Nút Lịch sử - hiển thị khi có QR */}
                          {item.guest_qr_id && (
                            <button
                              onClick={() => handleViewHistory(item)}
                              className='p-2 bg-surface-container-low rounded-lg hover:bg-primary hover:text-white'
                              title='Lịch sử quét'
                            >
                              <span className='material-symbols-outlined text-sm'>history</span>
                            </button>
                          )}

                          {/* Nút Tạo mới - hiển thị khi có căn hộ */}
                          <button
                            onClick={() => {
                              if (item.apartment_id) {
                                handleOpenCreateModal(item.user_id.toString(), item.apartment_id.toString())
                              } else {
                                toast.warning('Cư dân chưa có căn hộ')
                              }
                            }}
                            disabled={!item.apartment_id}
                            className={`p-2 rounded-lg transition-colors ${
                              item.apartment_id
                                ? 'bg-green-500 text-white hover:bg-green-600'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                            title={item.apartment_id ? 'Tạo QR mới' : 'Chưa có căn hộ'}
                          >
                            <span className='material-symbols-outlined text-sm'>add</span>
                          </button>

                          {/* Nút Sửa - hiển thị khi có QR (kể cả REVOKED) */}
                          {item.guest_qr_id && (
                            <button
                              onClick={() => handleUpdate(item)}
                              className='p-2 bg-surface-container-low rounded-lg hover:bg-primary hover:text-white'
                              title='Chỉnh sửa'
                            >
                              <span className='material-symbols-outlined text-sm'>edit</span>
                            </button>
                          )}

                          {/* Nút Xóa/Thu hồi - hiển thị khi có QR (kể cả REVOKED) */}
                          {item.guest_qr_id && (
                            <button
                              onClick={() => handleDelete(item)}
                              className='p-2 bg-surface-container-low rounded-lg hover:bg-red-500 hover:text-white'
                              title='Thu hồi'
                            >
                              <span className='material-symbols-outlined text-sm'>block</span>
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

        {/* Pagination */}
        {totalElements > 0 && (
          <div className='p-6 bg-surface-container-low/30 flex items-center justify-between'>
            <p className='text-xs'>
              Hiển thị {(currentPage - 1) * currentLimit + 1} - {Math.min(currentPage * currentLimit, totalElements)}{' '}
              trên {totalElements}
            </p>
            <Paginate
              queryConfig={{ page: currentPage.toString(), limit: currentLimit.toString() }}
              pageSize={totalPages}
              search={searchFromUrl || undefined}
            />
          </div>
        )}
      </div>

      {/* ==================== MODALS ==================== */}

      {/* Modal Tạo QR Khách */}
      {isCreateModalOpen && (
        <CreateGuestQRModal
          onClose={() => {
            setIsCreateModalOpen(false)
            setSelectedResidentForCreate(null)
          }}
          onSubmit={(data) => createMutation.mutate(data)}
          isLoading={createMutation.isPending}
          defaultHostUserId={selectedResidentForCreate?.hostUserId}
          defaultApartmentId={selectedResidentForCreate?.apartmentId}
        />
      )}

      {/* Modal Cập Nhật QR Khách */}
      {isUpdateModalOpen && selectedGuestQR && (
        <UpdateGuestQRModal
          guestQR={selectedGuestQR}
          onClose={() => {
            setIsUpdateModalOpen(false)
            setSelectedResident(null)
            setSelectedGuestQR(null)
          }}
          onSubmit={(data) =>
            updateMutation.mutate({
              id: selectedGuestQR.id.toString(),
              body: data
            })
          }
          isLoading={updateMutation.isPending}
        />
      )}

      {/* Modal Lịch Sử Quét */}
      {isHistoryModalOpen && selectedGuestQR && (
        <HistoryGuestQRModal
          guestQR={selectedGuestQR}
          onClose={() => {
            setIsHistoryModalOpen(false)
            setSelectedResident(null)
            setSelectedGuestQR(null)
          }}
        />
      )}
    </div>
  )
}
