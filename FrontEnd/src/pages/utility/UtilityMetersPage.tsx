import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { apartmentsApi } from 'src/apis/apartment_api/apartments.api'
import { UserApi } from 'src/apis/User/user.api'
import { utilityMetersApi } from 'src/apis/utility_api/utility-meters.api'
import type { UtilityMeter } from 'src/types/utility-meter.type'

const getApiErrorMessage = (err: any, fallbackMessage: string) => {
  const apiErr = err?.response?.data
  const firstFieldError = apiErr?.errors ? Object.values(apiErr.errors).flat()?.[0] : null
  const rawMessage = firstFieldError || apiErr?.formErrors?.[0] || apiErr?.details || apiErr?.message || fallbackMessage
  if (typeof rawMessage !== 'string') return fallbackMessage

  const translatedMessages: Array<[string, string]> = [
    ['Validation failed', 'Dữ liệu không hợp lệ'],
    ['Unknown field in request body', 'Có trường không hợp lệ trong dữ liệu gửi lên'],
    ['At least one field is required for update', 'Cần ít nhất 1 trường để cập nhật'],
    ['meterCode already exists', 'Mã đồng hồ đã tồn tại'],
    ['Invalid apartmentId', 'Căn hộ không hợp lệ'],
    ['Utility meter not found or not inactive', 'Không tìm thấy đồng hồ đã xóa để khôi phục'],
    ['Utility meter not found', 'Không tìm thấy đồng hồ tiện ích']
  ]
  const mapped = translatedMessages.find(([en]) => rawMessage.includes(en))
  return mapped?.[1] || rawMessage
}

const logApiSuccess = (action: string, response: any) => {
  console.log(`[UtilityMeter][${action}] success`, {
    status: response?.status,
    endpoint: response?.config?.url,
    method: response?.config?.method,
    data: response?.data
  })
}

const logApiError = (action: string, err: any) => {
  console.error(`[UtilityMeter][${action}] error`, {
    status: err?.response?.status,
    endpoint: err?.config?.url || err?.response?.config?.url,
    method: err?.config?.method || err?.response?.config?.method,
    data: err?.response?.data,
    message: err?.message
  })
}

export default function UtilityMetersPage() {
  const queryClient = useQueryClient()
  const pageSize = 10
  const [page, setPage] = useState(0)
  const [screenError, setScreenError] = useState<string | null>(null)
  const [selected, setSelected] = useState<UtilityMeter | null>(null)
  const [selectedDetail, setSelectedDetail] = useState<UtilityMeter | null>(null)
  const [filterMeterType, setFilterMeterType] = useState<'ALL' | 'ELECTRIC' | 'WATER' | 'GAS'>('ALL')
  const [filterApartmentId, setFilterApartmentId] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'BROKEN'>('ALL')
  const [formState, setFormState] = useState({
    apartmentId: '',
    meterType: 'ELECTRIC',
    meterCode: '',
    installedDate: '',
    status: 'ACTIVE'
  })
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const { data, error, isError } = useQuery({
    queryKey: ['utility-meters', filterMeterType, filterApartmentId, filterStatus, page],
    queryFn: async () => {
      const response = await utilityMetersApi.getAll({
        meterType: filterMeterType === 'ALL' ? undefined : filterMeterType,
        apartmentId: filterApartmentId ? Number(filterApartmentId) : undefined,
        status: filterStatus === 'ALL' ? undefined : filterStatus,
        page,
        size: pageSize
      })
      logApiSuccess('GetAll', response)
      return response
    }
  })
  const { data: apartmentData, error: apartmentError, isError: isApartmentError } = useQuery({
    queryKey: ['apartments-for-meter-form'],
    queryFn: () => apartmentsApi.getAll({ page: 0, size: 500 })
  })
  const { data: userData, error: userError, isError: isUserError } = useQuery({
    queryKey: ['users-for-meter-form'],
    queryFn: () => UserApi.getAllUsers({ page: 0, size: 500 })
  })

  const saveMutation = useMutation({
    mutationFn: (payload: any) =>
      selected ? utilityMetersApi.update(selected.id, payload) : utilityMetersApi.create(payload),
    onSuccess: (response) => {
      logApiSuccess(selected ? 'Update' : 'Create', response)
      queryClient.invalidateQueries({ queryKey: ['utility-meters'] })
      setSelected(null)
      setScreenError(null)
    },
    onError: (err: any) => {
      logApiError('Save', err)
      setScreenError(getApiErrorMessage(err, 'Lưu đồng hồ thất bại'))
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => utilityMetersApi.delete(id),
    onSuccess: (response) => {
      logApiSuccess('Delete', response)
      queryClient.invalidateQueries({ queryKey: ['utility-meters'] })
      setScreenError(null)
    },
    onError: (err: any) => {
      logApiError('Delete', err)
      setScreenError(getApiErrorMessage(err, 'Xóa đồng hồ thất bại'))
    }
  })
  const restoreMutation = useMutation({
    mutationFn: (id: string) => utilityMetersApi.restore(id),
    onSuccess: (response) => {
      logApiSuccess('Restore', response)
      queryClient.invalidateQueries({ queryKey: ['utility-meters'] })
      setScreenError(null)
    },
    onError: (err: any) => {
      logApiError('Restore', err)
      setScreenError(getApiErrorMessage(err, 'Khôi phục đồng hồ thất bại'))
    }
  })

  if (isError) logApiError('GetAll', error)
  if (isApartmentError) logApiError('Apartments', apartmentError)
  if (isUserError) logApiError('Users', userError)

  const list = data?.data?.data || []
  const totalPages = Number(data?.data?.totalPages || 0)
  const currentPage = Number(data?.data?.page || 0)
  const apartmentOptions = apartmentData?.data?.data || []
  const users = userData?.data?.data || []
  const getApartmentLabel = (apartment: any) => {
    const owner = users.find((u: any) => String(u.id) === String(apartment.ownerUserId))
    const ownerName = owner?.fullName || owner?.email || `User ${apartment.ownerUserId ?? '-'}`
    return `${apartment.id}${apartment.apartmentCode ? ` (${apartment.apartmentCode})` : ''} - ${ownerName}`
  }
  const summary = {
    total: list.length,
    active: list.filter((item) => item.status === 'ACTIVE').length,
    inactive: list.filter((item) => item.status === 'INACTIVE').length,
    broken: list.filter((item) => item.status === 'BROKEN').length
  }

  useEffect(() => {
    if (!selected) {
      setFormState({
        apartmentId: '',
        meterType: 'ELECTRIC',
        meterCode: '',
        installedDate: '',
        status: 'ACTIVE'
      })
      return
    }
    setFormState({
      apartmentId: String(selected.apartmentId),
      meterType: selected.meterType,
      meterCode: selected.meterCode,
      installedDate: selected.installedDate || '',
      status: selected.status
    })
  }, [selected])

  return (
    <div className='min-h-screen bg-[#F8F9FA] p-8 font-sans'>
      <div className='mx-auto max-w-6xl'>
      <div className='mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
        <div>
          <span className='rounded bg-[#DDE7FF] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0052CC]'>
            Administration
          </span>
          <h1 className='mt-4 mb-2 text-3xl font-bold text-gray-900'>Quản lý đồng hồ tiện ích</h1>
          <p className='text-sm text-gray-500'>Quản lý đồng hồ theo căn hộ, loại đồng hồ và trạng thái hoạt động.</p>
        </div>
        <button
          type='button'
          onClick={() => setIsCreateOpen(true)}
          className='rounded-lg bg-[#0052CC] px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700'
        >
          + Thêm đồng hồ
        </button>
      </div>

      <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-4'>
        <div className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm'>
          <div className='text-sm text-gray-500'>Tổng trên trang</div>
          <div className='mt-2 text-3xl font-bold text-gray-900'>{summary.total}</div>
        </div>
        <div className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm'>
          <div className='text-sm text-gray-500'>ACTIVE</div>
          <div className='mt-2 text-3xl font-bold text-emerald-600'>{summary.active}</div>
        </div>
        <div className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm'>
          <div className='text-sm text-gray-500'>INACTIVE</div>
          <div className='mt-2 text-3xl font-bold text-red-500'>{summary.inactive}</div>
        </div>
        <div className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm'>
          <div className='text-sm text-gray-500'>BROKEN</div>
          <div className='mt-2 text-3xl font-bold text-amber-600'>{summary.broken}</div>
        </div>
      </div>

      {(screenError || isError) && (
        <div className='mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600'>
          {screenError || getApiErrorMessage(error, 'Tải danh sách đồng hồ thất bại')}
        </div>
      )}
      <div className='mb-6 grid grid-cols-1 gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:grid-cols-4'>
        <select
          value={filterMeterType}
          onChange={(e) => setFilterMeterType(e.target.value as 'ALL' | 'ELECTRIC' | 'WATER' | 'GAS')}
          className='rounded-lg border border-gray-200 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
        >
          <option value='ALL'>Tất cả loại</option>
          <option value='ELECTRIC'>ELECTRIC</option>
          <option value='WATER'>WATER</option>
          <option value='GAS'>GAS</option>
        </select>
        <select
          value={filterApartmentId}
          onChange={(e) => setFilterApartmentId(e.target.value)}
          className='rounded-lg border border-gray-200 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
        >
          <option value=''>Lọc theo căn hộ (ID - chủ sở hữu)</option>
          {apartmentOptions.map((apartment) => (
            <option key={apartment.id} value={String(apartment.id)}>
              {getApartmentLabel(apartment)}
            </option>
          ))}
        </select>
        <button
          type='button'
          onClick={() => {
            setFilterMeterType('ALL')
            setFilterApartmentId('')
            setFilterStatus('ALL')
            setPage(0)
          }}
          className='rounded-lg bg-gray-100 px-4 py-2.5 font-semibold text-gray-700 transition hover:bg-gray-200'
        >
          Xóa lọc
        </button>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE' | 'BROKEN')}
          className='rounded-lg border border-gray-200 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
        >
          <option value='ALL'>Trạng thái: tất cả</option>
          <option value='ACTIVE'>ACTIVE</option>
          <option value='INACTIVE'>INACTIVE (đã xóa)</option>
          <option value='BROKEN'>BROKEN</option>
        </select>
      </div>
      {isCreateOpen && <form
        className='mb-6 grid grid-cols-1 gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:grid-cols-5'
        onSubmit={(e) => {
          e.preventDefault()
          setScreenError(null)
          saveMutation.mutate({
            apartmentId: Number(formState.apartmentId),
            meterType: formState.meterType,
            meterCode: formState.meterCode,
            installedDate: formState.installedDate || undefined,
            status: formState.status || 'ACTIVE'
          })
          if (!selected) {
            setFormState({
              apartmentId: '',
              meterType: 'ELECTRIC',
              meterCode: '',
              installedDate: '',
              status: 'ACTIVE'
            })
          }
        }}
      >
        <select
          name='apartmentId'
          value={formState.apartmentId}
          onChange={(e) => setFormState((prev) => ({ ...prev, apartmentId: e.target.value }))}
          className='rounded-lg border border-gray-200 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
        >
          <option value=''>Chọn căn hộ (ID - chủ sở hữu)</option>
          {apartmentOptions.map((apartment) => {
            return (
              <option key={apartment.id} value={String(apartment.id)}>
                {getApartmentLabel(apartment)}
              </option>
            )
          })}
        </select>
        <select
          name='meterType'
          value={formState.meterType}
          onChange={(e) => setFormState((prev) => ({ ...prev, meterType: e.target.value }))}
          className='rounded-lg border border-gray-200 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
        >
          <option value='ELECTRIC'>ELECTRIC</option>
          <option value='WATER'>WATER</option>
          <option value='GAS'>GAS</option>
        </select>
        <input
          name='meterCode'
          placeholder='Meter code'
          value={formState.meterCode}
          onChange={(e) => setFormState((prev) => ({ ...prev, meterCode: e.target.value }))}
          className='rounded-lg border border-gray-200 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
        />
        <input
          name='installedDate'
          type='date'
          value={formState.installedDate}
          onChange={(e) => setFormState((prev) => ({ ...prev, installedDate: e.target.value }))}
          className='rounded-lg border border-gray-200 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
        />
        <div className='flex gap-2'>
          <button className='rounded-lg bg-[#0052CC] px-4 py-2.5 font-semibold text-white transition hover:bg-blue-700'>
            {saveMutation.isPending ? 'Saving...' : selected ? 'Cập nhật' : 'Lưu'}
          </button>
          <button
            type='button'
            className='rounded-lg bg-gray-100 px-4 py-2.5 font-semibold text-gray-700 transition hover:bg-gray-200'
            onClick={() => {
              setIsCreateOpen(false)
              setSelected(null)
            }}
          >
            Hủy
          </button>
          {selected && (
            <button
              type='button'
              className='rounded-lg bg-gray-100 px-4 py-2.5 font-semibold text-gray-700 transition hover:bg-gray-200'
              onClick={() => setSelected(null)}
            >
              Hủy sửa
            </button>
          )}
        </div>
      </form>}
      <div className='overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm'>
        <table className='w-full border-collapse text-left'>
          <thead>
            <tr className='border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-400'>
              <th className='px-6 py-4'>Mã đồng hồ</th>
              <th className='px-6 py-4'>Loại</th>
              <th className='px-6 py-4'>Căn hộ</th>
              <th className='px-6 py-4'>Ngày lắp</th>
              <th className='px-6 py-4'>Trạng thái</th>
              <th className='px-6 py-4 text-right'>Hành động</th>
            </tr>
          </thead>
          <tbody className='text-sm text-gray-700'>
            {list.map((item) => (
              <tr key={item.id}>
                <td className='px-6 py-4 font-semibold text-gray-900'>{item.meterCode}</td>
                <td className='px-6 py-4'>{item.meterType}</td>
                <td className='px-6 py-4'>{item.apartmentId}</td>
                <td className='px-6 py-4'>{item.installedDate || 'Chưa có'}</td>
                <td className='px-6 py-4'>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      item.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700'
                        : item.status === 'BROKEN'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className='px-6 py-4 text-right'>
                  <div className='flex justify-end gap-2'>
                    <button
                      className='rounded-lg bg-slate-100 px-3 py-1.5 text-slate-700'
                      onClick={() => setSelectedDetail(item)}
                    >
                      Chi tiết
                    </button>
                    <button
                      className='rounded-lg bg-amber-100 px-3 py-1.5 text-amber-700'
                      onClick={() => {
                        setSelected(item)
                        setIsCreateOpen(true)
                      }}
                    >
                      Sửa
                    </button>
                    {item.status === 'INACTIVE' ? (
                      <button
                        className='rounded-lg bg-emerald-100 px-3 py-1.5 text-emerald-700'
                        onClick={() => {
                          setScreenError(null)
                          restoreMutation.mutate(item.id)
                        }}
                      >
                        Khôi phục
                      </button>
                    ) : (
                      <button
                        className='rounded-lg bg-red-100 px-3 py-1.5 text-red-700'
                        onClick={() => {
                          setScreenError(null)
                          deleteMutation.mutate(item.id)
                        }}
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className='mt-4 flex items-center justify-end gap-2 text-sm'>
        <button
          type='button'
          className='rounded bg-slate-200 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50'
          disabled={currentPage <= 0}
          onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
        >
          Trang trước
        </button>
        <span>
          Trang {totalPages === 0 ? 0 : currentPage + 1}/{totalPages}
        </span>
        <button
          type='button'
          className='rounded bg-slate-200 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50'
          disabled={totalPages === 0 || currentPage + 1 >= totalPages}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Trang sau
        </button>
      </div>
      {selectedDetail && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 backdrop-blur-sm'>
          <div className='w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-xl'>
            <div className='flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4'>
              <h2 className='text-xl font-bold text-gray-800'>Chi tiết đồng hồ</h2>
              <button className='text-gray-400 hover:text-gray-600' onClick={() => setSelectedDetail(null)}>Đóng</button>
            </div>
            <div className='grid grid-cols-1 gap-3 p-6 text-sm text-gray-700'>
              <div><span className='font-semibold text-gray-900'>ID:</span> #{selectedDetail.id}</div>
              <div><span className='font-semibold text-gray-900'>Mã đồng hồ:</span> {selectedDetail.meterCode}</div>
              <div><span className='font-semibold text-gray-900'>Loại:</span> {selectedDetail.meterType}</div>
              <div><span className='font-semibold text-gray-900'>Căn hộ:</span> {selectedDetail.apartmentId}</div>
              <div><span className='font-semibold text-gray-900'>Ngày lắp:</span> {selectedDetail.installedDate || '-'}</div>
              <div><span className='font-semibold text-gray-900'>Trạng thái:</span> {selectedDetail.status}</div>
            </div>
          </div>
        </div>
      )}
      </div>
      </div>
  )
}
