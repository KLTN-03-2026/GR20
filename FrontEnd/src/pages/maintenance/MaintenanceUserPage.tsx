import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useContext, useState } from 'react'
import { maintenanceRequestsApi } from 'src/apis/maintenance_api/maintenance-requests.api'
import { residentsApi } from 'src/apis/resident_api/residents.api'
import { AppContext } from 'src/contexts/app.context'

export default function MaintenanceUserPage() {
  const queryClient = useQueryClient()
  const { user } = useContext(AppContext)
  const userId = Number((user as any)?.id || (user as any)?._id || 0)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedApartmentId, setSelectedApartmentId] = useState<number | ''>('')

  const { data: apartmentsData } = useQuery({
    queryKey: ['my-apartments-for-maintenance', userId],
    queryFn: () => residentsApi.getMyApartments(),
    enabled: Boolean(userId)
  })

  const { data, isLoading } = useQuery({
    queryKey: ['my-maintenance-requests', userId],
    queryFn: () => maintenanceRequestsApi.getMine({ page: 0, size: 100 }),
    enabled: Boolean(userId)
  })

  const createMutation = useMutation({
    mutationFn: () =>
      maintenanceRequestsApi.create({
        title,
        description,
        apartmentId: selectedApartmentId || null,
        reportedBy: userId,
        reporterName: (user as any)?.name || (user as any)?.fullName || null
      } as any),
    onSuccess: () => {
      setTitle('')
      setDescription('')
      setSelectedApartmentId('')
      queryClient.invalidateQueries({ queryKey: ['my-maintenance-requests'] })
    }
  })

  const list = data?.data?.data || []
  const apartments = apartmentsData?.data?.data || []
  const apartmentNameById = new Map(
    apartments.map((apartment) => [
      Number(apartment.apartmentId),
      `${apartment.apartmentNumber || `Apt ${apartment.apartmentId}`}${apartment.buildingName ? ` - ${apartment.buildingName}` : ''}`
    ])
  )

  return (
    <div className='min-h-screen bg-slate-50 p-6'>
      <div className='mx-auto max-w-5xl'>
        <h1 className='text-3xl font-extrabold text-slate-900'>Yêu cầu bảo trì của tôi</h1>
        <p className='mt-1 text-sm text-slate-500'>Chỉ hiển thị yêu cầu do chính bạn tạo.</p>

        <div className='mt-6 rounded-2xl bg-white p-4 shadow-sm'>
          <h2 className='mb-3 text-sm font-bold uppercase tracking-wider text-slate-600'>Tạo yêu cầu mới</h2>
          <div className='grid grid-cols-1 gap-3'>
            <select
              value={selectedApartmentId}
              onChange={(e) => setSelectedApartmentId(e.target.value ? Number(e.target.value) : '')}
              className='rounded-lg border border-gray-200 px-4 py-2.5'
            >
              <option value=''>Chọn căn hộ của bạn</option>
              {apartments.map((apartment) => (
                <option key={apartment.apartmentId} value={apartment.apartmentId}>
                  {apartment.apartmentNumber || `Apt ${apartment.apartmentId}`}
                  {apartment.buildingName ? ` - ${apartment.buildingName}` : ''}
                </option>
              ))}
            </select>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='Tiêu đề yêu cầu'
              className='rounded-lg border border-gray-200 px-4 py-2.5'
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Mô tả chi tiết'
              className='rounded-lg border border-gray-200 px-4 py-2.5'
              rows={4}
            />
            <div className='flex justify-end'>
              <button
                onClick={() => createMutation.mutate()}
                disabled={!title.trim() || !selectedApartmentId || createMutation.isPending}
                className='rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50'
              >
                {createMutation.isPending ? 'Đang gửi...' : 'Gửi yêu cầu'}
              </button>
            </div>
          </div>
        </div>

        <div className='mt-6 overflow-hidden rounded-2xl bg-white shadow-sm'>
          <table className='w-full text-left text-sm'>
            <thead className='bg-slate-50 text-xs uppercase text-slate-500'>
              <tr>
                <th className='px-4 py-3'>Mã</th>
                <th className='px-4 py-3'>Tiêu đề</th>
                <th className='px-4 py-3'>Căn hộ</th>
                <th className='px-4 py-3'>Ưu tiên</th>
                <th className='px-4 py-3'>Trạng thái</th>
                <th className='px-4 py-3'>Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td className='px-4 py-4 text-slate-500' colSpan={6}>
                    Đang tải dữ liệu...
                  </td>
                </tr>
              )}
              {!isLoading &&
                list.map((item: any) => (
                  <tr key={item.id} className='border-t border-slate-100'>
                    <td className='px-4 py-3'>{item.requestCode || item.id}</td>
                    <td className='px-4 py-3 font-medium'>{item.title}</td>
                    <td className='px-4 py-3'>
                      {item.apartmentId ? apartmentNameById.get(Number(item.apartmentId)) || `Apt ${item.apartmentId}` : '-'}
                    </td>
                    <td className='px-4 py-3'>{item.priority}</td>
                    <td className='px-4 py-3'>{item.status}</td>
                    <td className='px-4 py-3'>{item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : '-'}</td>
                  </tr>
                ))}
              {!isLoading && list.length === 0 && (
                <tr>
                  <td className='px-4 py-4 text-slate-500' colSpan={6}>
                    Bạn chưa có yêu cầu bảo trì nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
