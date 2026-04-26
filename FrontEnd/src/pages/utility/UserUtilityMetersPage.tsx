import { useQuery } from '@tanstack/react-query'
import { useContext, useState } from 'react'
import { meterReadingsApi } from 'src/apis/utility_api/meter-readings.api'
import { utilityMetersApi } from 'src/apis/utility_api/utility-meters.api'
import { AppContext } from 'src/contexts/app.context'

const logApiError = (action: string, err: any) => {
  console.error(`[UserUtilityMeters][${action}] error`, {
    status: err?.response?.status,
    endpoint: err?.config?.url || err?.response?.config?.url,
    method: err?.config?.method || err?.response?.config?.method,
    data: err?.response?.data,
    message: err?.message
  })
}

export default function UserUtilityMetersPage() {
  const { user } = useContext(AppContext)
  const userId = String((user as any)?.id || (user as any)?._id || '')
  const [page, setPage] = useState(0)
  const pageSize = 10
  const [selectedMeterId, setSelectedMeterId] = useState<string | null>(null)

  const { data, error, isError, isLoading } = useQuery({
    queryKey: ['user-utility-meters', userId, page],
    queryFn: () => utilityMetersApi.getByUserId(userId, { page, size: pageSize }),
    enabled: Boolean(userId)
  })

  if (isError) logApiError('GetByUserId', error)

  const list = data?.data?.data || []
  const totalPages = Number(data?.data?.totalPages || 0)
  const currentPage = Number(data?.data?.page || 0)
  const selectedMeter = selectedMeterId ? list.find((m) => String(m.id) === String(selectedMeterId)) : null

  const meterReadingsQuery = useQuery({
    queryKey: ['user-meter-readings-by-meter', userId, selectedMeterId],
    queryFn: () => meterReadingsApi.getByUserIdAndMeterId(userId, String(selectedMeterId), { page: 0, size: 20 }),
    enabled: Boolean(userId && selectedMeterId)
  })

  return (
    <div className='min-h-screen bg-slate-50 px-6 py-6'>
      <div className='mx-auto max-w-6xl'>
        <h2 className='mb-4 text-3xl font-extrabold tracking-tight text-slate-900'>Đồng hồ của tôi</h2>
        <div className='overflow-hidden rounded-xl bg-white shadow-sm'>
          <table className='w-full border-collapse text-left'>
            <thead>
              <tr className='bg-slate-50'>
                <th className='px-4 py-3 text-xs font-bold uppercase text-slate-500'>Mã đồng hồ</th>
                <th className='px-4 py-3 text-xs font-bold uppercase text-slate-500'>Loại</th>
                <th className='px-4 py-3 text-xs font-bold uppercase text-slate-500'>Căn hộ</th>
                <th className='px-4 py-3 text-xs font-bold uppercase text-slate-500'>Ngày lắp</th>
                <th className='px-4 py-3 text-xs font-bold uppercase text-slate-500'>Trạng thái</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100'>
              {isLoading && (
                <tr>
                  <td className='px-4 py-4 text-sm text-slate-500' colSpan={5}>
                    Đang tải...
                  </td>
                </tr>
              )}
              {!isLoading &&
                list.map((item) => (
                  <tr key={item.id}>
                    <td className='px-4 py-3'>{item.meterCode}</td>
                    <td className='px-4 py-3'>{item.meterType}</td>
                    <td className='px-4 py-3'>Apt {item.apartmentId}</td>
                    <td className='px-4 py-3'>{item.installedDate || '-'}</td>
                    <td className='px-4 py-3'>{item.status}</td>
                      <td className='px-4 py-3 text-right'>
                        <button className='rounded bg-sky-100 px-2 py-1 text-xs' onClick={() => setSelectedMeterId(String(item.id))}>
                          Xem lịch sử chỉ số
                        </button>
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

      {selectedMeter && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4' onClick={() => setSelectedMeterId(null)}>
          <div className='w-full max-w-lg rounded-xl bg-white p-5 shadow-lg' onClick={(e) => e.stopPropagation()}>
            <div className='mb-3 flex items-center justify-between'>
              <h3 className='text-lg font-semibold'>Lịch sử chỉ số</h3>
              <button className='rounded bg-slate-100 px-2 py-1' onClick={() => setSelectedMeterId(null)}>
                Đóng
              </button>
            </div>
            <div className='mb-3 text-sm text-slate-700'>
              <div>Đồng hồ: {selectedMeter.meterCode}</div>
              <div>Loại: {selectedMeter.meterType}</div>
              <div>Căn hộ: {selectedMeter.apartmentId}</div>
            </div>
            <div className='overflow-hidden rounded border'>
              <table className='w-full border-collapse text-left text-sm'>
                <thead>
                  <tr className='bg-slate-50'>
                    <th className='px-3 py-2 text-xs font-bold uppercase text-slate-500'>Ngày</th>
                    <th className='px-3 py-2 text-xs font-bold uppercase text-slate-500'>Cũ</th>
                    <th className='px-3 py-2 text-xs font-bold uppercase text-slate-500'>Mới</th>
                    <th className='px-3 py-2 text-xs font-bold uppercase text-slate-500'>Tiêu thụ</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-100'>
                  {(meterReadingsQuery.data?.data?.data || []).map((r) => (
                    <tr key={r.id}>
                      <td className='px-3 py-2'>{r.readingDate}</td>
                      <td className='px-3 py-2'>{r.previousReading}</td>
                      <td className='px-3 py-2'>{r.currentReading}</td>
                      <td className='px-3 py-2'>{r.consumption}</td>
                    </tr>
                  ))}
                  {(meterReadingsQuery.data?.data?.data || []).length === 0 && (
                    <tr>
                      <td className='px-3 py-3 text-xs text-slate-500' colSpan={4}>
                        Chưa có dữ liệu chỉ số cho đồng hồ này.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
