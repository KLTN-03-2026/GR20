import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { apartmentsApi } from 'src/apis/apartment_api/apartments.api'
import { UserApi } from 'src/apis/User/user.api'
import { utilityMetersApi } from 'src/apis/utility_api/utility-meters.api'
import { formatDateViVN } from 'src/utils/date-vi'
import { logResourceConsoleError } from 'src/utils/payment-console-log'
import {
  ROW_ACTION_DELETE,
  ROW_ACTION_EDIT,
  ROW_ACTION_RESTORE
} from 'src/utils/row-action-buttons'
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
    ['Utility meter not found or not inactive', 'Không tìm thấy đồng hồ đã xóa mềm để khôi phục'],
    ['Utility meter not found', 'Không tìm thấy đồng hồ tiện ích'],
    ['Căn hộ đang có cư dân', 'Căn hộ đang có cư dân, không được xóa đồng hồ tiện ích']
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

export default function UtilityMetersPage() {
  const queryClient = useQueryClient()
  const pageSize = 10
  const [page, setPage] = useState(0)
  const [screenError, setScreenError] = useState<string | null>(null)
  const [selected, setSelected] = useState<UtilityMeter | null>(null)
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
      logResourceConsoleError('UtilityMeter', 'Save', err)
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
      logResourceConsoleError('UtilityMeter', 'Delete', err)
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
      logResourceConsoleError('UtilityMeter', 'Restore', err)
      setScreenError(getApiErrorMessage(err, 'Khôi phục đồng hồ thất bại'))
    }
  })

  if (isError) logResourceConsoleError('UtilityMeter', 'GetAll', error)
  if (isApartmentError) logResourceConsoleError('UtilityMeter', 'Apartments', apartmentError)
  if (isUserError) logResourceConsoleError('UtilityMeter', 'Users', userError)

  const list = data?.data?.data || []
  const totalPages = Number(data?.data?.totalPages || 0)
  const currentPage = Number(data?.data?.page || 0)
  const apartmentOptions = apartmentData?.data?.data || []
  const users = userData?.data?.data || []
  const getApartmentLabel = (apartment: any) => {
    const owner = users.find((u: any) => String(u.id) === String(apartment.ownerUserId))
    const ownerName = owner?.fullName || owner?.name || owner?.email || `User ${apartment.ownerUserId ?? '-'}`
    return `${apartment.id}${apartment.apartmentCode ? ` (${apartment.apartmentCode})` : ''} - ${ownerName}`
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
    <div className='min-h-screen bg-slate-50 px-8 py-8'>
      <div className='mx-auto max-w-7xl'>
      <h2 className='mb-4 text-3xl font-extrabold tracking-tight text-slate-900'>Quản lý đồng hồ</h2>
      {(screenError || isError) && (
        <div className='mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-600'>
          {screenError || getApiErrorMessage(error, 'Tải danh sách đồng hồ thất bại')}
        </div>
      )}
      <div className='mb-4 grid grid-cols-1 gap-2 md:grid-cols-4'>
        <select
          value={filterMeterType}
          onChange={(e) => setFilterMeterType(e.target.value as 'ALL' | 'ELECTRIC' | 'WATER' | 'GAS')}
          className='rounded border px-2 py-2'
        >
          <option value='ALL'>Tất cả loại</option>
          <option value='ELECTRIC'>ELECTRIC</option>
          <option value='WATER'>WATER</option>
          <option value='GAS'>GAS</option>
        </select>
        <select
          value={filterApartmentId}
          onChange={(e) => setFilterApartmentId(e.target.value)}
          className='rounded border px-2 py-2'
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
          className='rounded bg-slate-200 px-3 py-2'
        >
          Xóa lọc
        </button>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE' | 'BROKEN')}
          className='rounded border px-2 py-2'
        >
          <option value='ALL'>Trạng thái: tất cả</option>
          <option value='ACTIVE'>ACTIVE</option>
          <option value='INACTIVE'>INACTIVE (dữ liệu cũ)</option>
          <option value='BROKEN'>BROKEN</option>
        </select>
      </div>
      <form
        className='mb-6 grid grid-cols-1 gap-2 rounded-xl bg-white p-4 shadow-sm md:grid-cols-5'
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
          className='rounded border px-2 py-2'
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
          className='rounded border px-2 py-2'
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
          className='rounded border px-2 py-2'
        />
        <input
          name='installedDate'
          type='date'
          value={formState.installedDate}
          onChange={(e) => setFormState((prev) => ({ ...prev, installedDate: e.target.value }))}
          className='rounded border px-2 py-2'
        />
        <div className='flex gap-2'>
          <button className='rounded bg-blue-600 px-3 py-2 text-white'>
            {saveMutation.isPending ? 'Saving...' : selected ? 'Cập nhật' : 'Lưu'}
          </button>
          {selected && (
            <button
              type='button'
              className='rounded bg-slate-200 px-3 py-2'
              onClick={() => setSelected(null)}
            >
              Hủy sửa
            </button>
          )}
        </div>
      </form>
      <div className='overflow-hidden rounded-xl bg-white shadow-sm'>
        <table className='w-full border-collapse text-left'>
          <thead>
            <tr className='bg-slate-50'>
              <th className='px-4 py-3 text-xs font-bold uppercase text-slate-500'>Mã đồng hồ</th>
              <th className='px-4 py-3 text-xs font-bold uppercase text-slate-500'>Loại</th>
              <th className='px-4 py-3 text-xs font-bold uppercase text-slate-500'>Căn hộ</th>
              <th className='px-4 py-3 text-xs font-bold uppercase text-slate-500'>Ngày lắp</th>
              <th className='px-4 py-3 text-xs font-bold uppercase text-slate-500'>Trạng thái</th>
              <th className='px-4 py-3 text-right text-xs font-bold uppercase text-slate-500'>Hành động</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-slate-100'>
            {list.map((item) => (
              <tr key={item.id}>
                <td className='px-4 py-3'>{item.meterCode}</td>
                <td className='px-4 py-3'>{item.meterType}</td>
                <td className='px-4 py-3'>{item.apartmentId}</td>
                <td className='px-4 py-3'>{item.installedDate ? formatDateViVN(item.installedDate) : 'Chưa có'}</td>
                <td className='px-4 py-3'>{item.status}</td>
                <td className='px-4 py-3 text-right'>
                  <div className='flex flex-wrap justify-end gap-2'>
                    <button type='button' className={ROW_ACTION_EDIT} onClick={() => setSelected(item)}>
                      Sửa
                    </button>
                    {item.status === 'INACTIVE' ? (
                      <button
                        type='button'
                        className={ROW_ACTION_RESTORE}
                        onClick={() => {
                          setScreenError(null)
                          restoreMutation.mutate(item.id)
                        }}
                      >
                        Khôi phục
                      </button>
                    ) : (
                      <button
                        type='button'
                        className={ROW_ACTION_DELETE}
                        onClick={() => {
                          if (
                            !window.confirm(
                              'Xóa vĩnh viễn đồng hồ này và các chỉ số liên quan? (Không thực hiện được nếu căn hộ còn cư dân.)'
                            )
                          ) {
                            return
                          }
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
      </div>
      </div>
  )
}
