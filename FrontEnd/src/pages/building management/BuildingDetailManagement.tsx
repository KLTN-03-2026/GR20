import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { buildingAssignmentsApi } from 'src/apis/building_api/building-assignments.api'
import { buildingImagesApi } from 'src/apis/building_api/building-images.api'
import { buildingApi } from 'src/apis/building_api/buildings.api'
import { floorsApi } from 'src/apis/floor_api/floors.api'
import { UserApi } from 'src/apis/User/user.api'
import config from 'src/contexts/config'
import type { BuildingAssignment } from 'src/types/building-assignment.type'
import type { BuildingImage } from 'src/types/building-image.type'
import type { Floor } from 'src/types/floor.type'

type TabKey = 'images' | 'staff' | 'floors'

const getApiErrorMessage = (error: any, fallbackMessage: string) => {
  const apiErr = error?.response?.data
  const firstFieldError = apiErr?.errors ? Object.values(apiErr.errors).flat()?.[0] : null
  const rawMessage = firstFieldError || apiErr?.formErrors?.[0] || apiErr?.details || apiErr?.message || fallbackMessage
  if (typeof rawMessage !== 'string') return fallbackMessage

  const translatedMessages: Array<[string, string]> = [
    ['Validation failed', 'Dữ liệu không hợp lệ'],
    ['Building not found', 'Không tìm thấy tòa nhà'],
    ['Building image not found', 'Không tìm thấy ảnh tòa nhà'],
    ['Invalid buildingId (building does not exist)', 'Tòa nhà không tồn tại'],
    ['Invalid userId or buildingId', 'Người dùng hoặc tòa nhà không hợp lệ'],
    ['Building assignment not found', 'Không tìm thấy phân công tòa nhà'],
    ['Floor not found', 'Không tìm thấy tầng'],
    ['Invalid building_id (building does not exist)', 'Tòa nhà không tồn tại'],
    ['No fields to update', 'Cần ít nhất một trường để cập nhật'],
    ['At least one field is required for update', 'Cần ít nhất một trường để cập nhật']
  ]

  const matched = translatedMessages.find(([en]) => rawMessage.includes(en))
  return matched?.[1] || rawMessage
}

const logApiSuccess = (scope: string, action: string, response: any) => {
  console.log(`[${scope}][${action}] success`, {
    status: response?.status,
    endpoint: response?.config?.url,
    method: response?.config?.method,
    data: response?.data
  })
}

const logApiError = (scope: string, action: string, error: any) => {
  console.error(`[${scope}][${action}] error`, {
    status: error?.response?.status,
    endpoint: error?.config?.url || error?.response?.config?.url,
    method: error?.config?.method || error?.response?.config?.method,
    data: error?.response?.data,
    message: error?.message
  })
}

export default function BuildingDetailManagement() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { id = '' } = useParams()
  const [activeTab, setActiveTab] = useState<TabKey>('images')
  const [screenError, setScreenError] = useState<string | null>(null)
  const [includeDeletedImages, setIncludeDeletedImages] = useState(false)
  const [includeDeletedFloors, setIncludeDeletedFloors] = useState(true)
  const [previewFile, setPreviewFile] = useState<File | null>(null)
  const [selectedAssignment, setSelectedAssignment] = useState<BuildingAssignment | null>(null)
  const [isFloorModalOpen, setIsFloorModalOpen] = useState(false)
  const [selectedFloor, setSelectedFloor] = useState<Floor | null>(null)

  const buildingQuery = useQuery({
    queryKey: ['building-detail', id],
    queryFn: async () => {
      const response = await buildingApi.getBuildingById(id)
      logApiSuccess('BuildingDetail', 'GetById', response)
      return response
    },
    enabled: Boolean(id)
  })

  const imagesQuery = useQuery({
    queryKey: ['building-detail-images', id, includeDeletedImages],
    queryFn: async () => {
      const response = await buildingImagesApi.getAllByBuildingId(id, { includeDeleted: includeDeletedImages })
      logApiSuccess('BuildingImage', 'GetAllByBuildingId', response)
      return response
    },
    enabled: Boolean(id)
  })

  const assignmentsQuery = useQuery({
    queryKey: ['building-detail-assignments', id],
    queryFn: async () => {
      const response = await buildingAssignmentsApi.getAll({ page: 0, size: 100, buildingId: Number(id) })
      logApiSuccess('BuildingAssignment', 'GetAll', response)
      return response
    },
    enabled: Boolean(id)
  })

  const floorsQuery = useQuery({
    queryKey: ['building-detail-floors', id, includeDeletedFloors],
    queryFn: async () => {
      const response = await floorsApi.getAll({
        page: 0,
        size: 100,
        buildingId: Number(id),
        status: includeDeletedFloors ? 'all' : 'active'
      })
      logApiSuccess('Floor', 'GetAll', response)
      return response
    },
    enabled: Boolean(id)
  })

  const usersQuery = useQuery({
    queryKey: ['users-for-building-detail'],
    queryFn: () => UserApi.getAllUsers({ page: 0, size: 500, isActive: true })
  })

  const building = buildingQuery.data?.data?.data
  const images: BuildingImage[] = imagesQuery.data?.data?.data || []
  const assignments: BuildingAssignment[] = assignmentsQuery.data?.data?.data || []
  const users = usersQuery.data?.data?.data || []
  const floors: Floor[] = floorsQuery.data?.data?.data || []

  const availableUsers = useMemo(() => {
    const assignedUserIds = new Set(assignments.filter((item) => item.isActive).map((item) => String(item.userId)))
    return users.filter((user) => !assignedUserIds.has(String(user.id)))
  }, [assignments, users])

  const uploadMutation = useMutation({
    mutationFn: (file: File) => buildingImagesApi.uploadBuildingImage({ buildingId: Number(id), image: file }),
    onSuccess: (response) => {
      logApiSuccess('BuildingImage', 'Upload', response)
      queryClient.invalidateQueries({ queryKey: ['building-detail-images', id] })
      setPreviewFile(null)
      setScreenError(null)
    },
    onError: (error: any) => {
      logApiError('BuildingImage', 'Upload', error)
      setScreenError(getApiErrorMessage(error, 'Upload ảnh thất bại'))
    }
  })

  const deleteImageMutation = useMutation({
    mutationFn: (imageId: string) => buildingImagesApi.deleteBuildingImage(imageId),
    onSuccess: (response) => {
      logApiSuccess('BuildingImage', 'Delete', response)
      queryClient.invalidateQueries({ queryKey: ['building-detail-images', id] })
      setScreenError(null)
    },
    onError: (error: any) => {
      logApiError('BuildingImage', 'Delete', error)
      setScreenError(getApiErrorMessage(error, 'Xóa ảnh thất bại'))
    }
  })

  const saveAssignmentMutation = useMutation({
    mutationFn: (payload: { id?: string; userId: number; role: string }) => {
      if (payload.id) {
        return buildingAssignmentsApi.update(payload.id, { userId: payload.userId, buildingId: Number(id), role: payload.role })
      }
      return buildingAssignmentsApi.create({ userId: payload.userId, buildingId: Number(id), role: payload.role })
    },
    onSuccess: (response) => {
      logApiSuccess('BuildingAssignment', selectedAssignment ? 'Update' : 'Create', response)
      queryClient.invalidateQueries({ queryKey: ['building-detail-assignments', id] })
      setSelectedAssignment(null)
      setScreenError(null)
    },
    onError: (error: any) => {
      logApiError('BuildingAssignment', 'Save', error)
      setScreenError(getApiErrorMessage(error, 'Lưu phân công thất bại'))
    }
  })

  const deleteAssignmentMutation = useMutation({
    mutationFn: (assignmentId: string) => buildingAssignmentsApi.delete(assignmentId),
    onSuccess: (response) => {
      logApiSuccess('BuildingAssignment', 'Delete', response)
      queryClient.invalidateQueries({ queryKey: ['building-detail-assignments', id] })
      setScreenError(null)
    },
    onError: (error: any) => {
      logApiError('BuildingAssignment', 'Delete', error)
      setScreenError(getApiErrorMessage(error, 'Xóa phân công thất bại'))
    }
  })

  const saveFloorMutation = useMutation({
    mutationFn: async (payload: { id?: string; floor_number: number; name?: string | null }) => {
      const response = payload.id
        ? await floorsApi.update(payload.id, { floor_number: payload.floor_number, name: payload.name ?? null })
        : await floorsApi.create({ building_id: Number(id), floor_number: payload.floor_number, name: payload.name ?? null })
      return response as any
    },
    onSuccess: (response) => {
      logApiSuccess('Floor', selectedFloor ? 'Update' : 'Create', response)
      queryClient.invalidateQueries({ queryKey: ['building-detail-floors', id] })
      setIsFloorModalOpen(false)
      setSelectedFloor(null)
      setScreenError(null)
    },
    onError: (error: any) => {
      logApiError('Floor', 'Save', error)
      setScreenError(getApiErrorMessage(error, 'Lưu tầng thất bại'))
    }
  })

  const deleteFloorMutation = useMutation({
    mutationFn: (floorId: string) => floorsApi.delete(floorId),
    onSuccess: (response) => {
      logApiSuccess('Floor', 'Delete', response)
      queryClient.invalidateQueries({ queryKey: ['building-detail-floors', id] })
      setScreenError(null)
    },
    onError: (error: any) => {
      logApiError('Floor', 'Delete', error)
      setScreenError(getApiErrorMessage(error, 'Xóa tầng thất bại'))
    }
  })

  if (buildingQuery.isError) {
    logApiError('BuildingDetail', 'GetById', buildingQuery.error)
  }

  const previewUrl = previewFile ? URL.createObjectURL(previewFile) : null

  return (
    <div className='min-h-screen bg-[#F8F9FA] p-8 font-sans'>
      <div className='mx-auto max-w-6xl'>
        <div className='mb-8 flex items-start justify-between gap-4'>
          <div>
            <button
              type='button'
              onClick={() => navigate('/buildings')}
              className='mb-3 text-sm font-medium text-[#0052CC] hover:underline'
            >
              Quay lại danh sách tòa nhà
            </button>
            <span className='rounded bg-[#DDE7FF] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0052CC]'>
              Building Detail
            </span>
            <h1 className='mt-4 text-3xl font-bold text-gray-900'>{building?.name || 'Chi tiết tòa nhà'}</h1>
            <p className='mt-2 text-sm text-gray-500'>
              {building ? `${building.code} • ${building.address}` : 'Đang tải thông tin tòa nhà...'}
            </p>
          </div>
        </div>

        {screenError && <div className='mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600'>{screenError}</div>}

        <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-3'>
          <div className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm'>
            <div className='text-sm text-gray-500'>Số tầng</div>
            <div className='mt-2 text-3xl font-bold text-gray-900'>{building?.totalFloors ?? '--'}</div>
          </div>
          <div className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm'>
            <div className='text-sm text-gray-500'>Số căn hộ</div>
            <div className='mt-2 text-3xl font-bold text-gray-900'>{building?.totalApartments ?? '--'}</div>
          </div>
          <div className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm'>
            <div className='text-sm text-gray-500'>Trạng thái</div>
            <div className='mt-2 text-3xl font-bold text-gray-900'>{building?.status ?? '--'}</div>
          </div>
        </div>

        <div className='mb-6 flex gap-2'>
          {[
            { key: 'images', label: 'Images' },
            { key: 'floors', label: 'Floors' },
            { key: 'staff', label: 'Staff' }
          ].map((tab) => (
            <button
              key={tab.key}
              type='button'
              onClick={() => setActiveTab(tab.key as TabKey)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab.key ? 'bg-[#0052CC] text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'images' && (
          <div className='space-y-6'>
            <div className='rounded-2xl border border-gray-100 bg-white p-6 shadow-sm'>
              <div className='mb-4 flex items-center justify-between'>
                <div>
                  <h2 className='text-xl font-bold text-slate-900'>Upload image</h2>
                  <p className='mt-1 text-sm text-slate-500'>Chọn ảnh, xem trước rồi mới lưu vào database.</p>
                </div>
                <label className='flex items-center gap-2 text-sm text-slate-600'>
                  <input
                    type='checkbox'
                    checked={includeDeletedImages}
                    onChange={(e) => setIncludeDeletedImages(e.target.checked)}
                  />
                  Hiển thị ảnh đã xóa
                </label>
              </div>

              <div className='grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]'>
                <div className='rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4'>
                  <label className='mb-3 block text-sm font-semibold text-slate-700'>Chọn ảnh</label>
                  <input
                    type='file'
                    accept='image/png,image/jpeg,image/jpg,image/gif,image/webp'
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null
                      setPreviewFile(file)
                    }}
                    className='block w-full text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:font-semibold file:text-slate-700'
                  />
                  <div className='mt-4'>
                    {previewUrl ? (
                      <img src={previewUrl} alt='preview' className='h-56 w-full rounded-lg object-cover' />
                    ) : (
                      <div className='flex h-56 items-center justify-center rounded-lg bg-white text-sm text-slate-400'>
                        Chưa có ảnh để xem trước
                      </div>
                    )}
                  </div>
                  <div className='mt-4 flex gap-2'>
                    <button
                      type='button'
                      disabled={!previewFile || uploadMutation.isPending}
                      onClick={() => previewFile && uploadMutation.mutate(previewFile)}
                      className='rounded-lg bg-[#0052CC] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60'
                    >
                      {uploadMutation.isPending ? 'Đang lưu...' : 'Lưu vào DB'}
                    </button>
                    <button
                      type='button'
                      disabled={!previewFile}
                      onClick={() => setPreviewFile(null)}
                      className='rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-60'
                    >
                      Bỏ ảnh
                    </button>
                  </div>
                </div>

                <div className='rounded-xl border border-slate-100 bg-white'>
                  <div className='border-b border-slate-100 px-5 py-4'>
                    <h3 className='text-lg font-semibold text-slate-900'>Danh sách ảnh</h3>
                  </div>
                  <div className='grid grid-cols-1 gap-4 p-5 md:grid-cols-2 xl:grid-cols-3'>
                    {imagesQuery.isLoading && <div className='text-sm text-slate-500'>Đang tải ảnh...</div>}
                    {!imagesQuery.isLoading && images.length === 0 && (
                      <div className='text-sm text-slate-500'>Chưa có ảnh nào cho tòa nhà này.</div>
                    )}
                    {images.map((image) => {
                      const src = image.imageUrl.startsWith('http') ? image.imageUrl : `${config.BASEURL}${image.imageUrl}`
                      return (
                        <div key={image.id} className='overflow-hidden rounded-xl border border-slate-200 bg-slate-50'>
                          <img src={src} alt='building' className='h-48 w-full object-cover' />
                          <div className='space-y-3 p-4'>
                            <div className='truncate text-xs text-slate-500'>{image.imageUrl}</div>
                            <div className={`text-xs font-semibold ${image.deletedAt ? 'text-red-500' : 'text-emerald-600'}`}>
                              {image.deletedAt ? 'Đã xóa' : 'Đang hiển thị'}
                            </div>
                            <div className='flex gap-3 text-sm font-medium'>
                              <a href={src} target='_blank' rel='noreferrer' className='text-[#0052CC] hover:underline'>
                                Xem ảnh
                              </a>
                              <button
                                type='button'
                                disabled={Boolean(image.deletedAt)}
                                onClick={() => deleteImageMutation.mutate(String(image.id))}
                                className='text-red-600 hover:underline disabled:cursor-not-allowed disabled:text-slate-300'
                              >
                                Xóa
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'staff' && (
          <div className='space-y-6'>
            <div className='rounded-2xl border border-gray-100 bg-white p-6 shadow-sm'>
              <div className='mb-4'>
                <h2 className='text-xl font-bold text-slate-900'>Assign staff</h2>
                <p className='mt-1 text-sm text-slate-500'>Chọn nhân sự, gán vào tòa nhà rồi tải lại danh sách ngay trong tab này.</p>
              </div>

              <form
                className='grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_auto]'
                onSubmit={(e) => {
                  e.preventDefault()
                  const fd = new FormData(e.currentTarget)
                  saveAssignmentMutation.mutate({
                    id: selectedAssignment?.id,
                    userId: Number(fd.get('userId')),
                    role: String(fd.get('role') || '')
                  })
                }}
              >
                <select
                  name='userId'
                  defaultValue={selectedAssignment?.userId || ''}
                  className='rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none'
                  required
                >
                  <option value=''>{selectedAssignment ? 'Chọn lại nhân sự' : 'Chọn staff'}</option>
                  {(selectedAssignment ? users : availableUsers).map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.fullName || user.username}
                    </option>
                  ))}
                </select>
                <input
                  name='role'
                  defaultValue={selectedAssignment?.role || ''}
                  placeholder='Vai trò tại tòa nhà'
                  className='rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                  required
                />
                <div className='flex gap-2'>
                  <button
                    type='submit'
                    disabled={saveAssignmentMutation.isPending}
                    className='rounded-lg bg-[#0052CC] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60'
                  >
                    {saveAssignmentMutation.isPending ? 'Đang lưu...' : selectedAssignment ? 'Cập nhật' : 'Assign'}
                  </button>
                  {selectedAssignment && (
                    <button
                      type='button'
                      onClick={() => setSelectedAssignment(null)}
                      className='rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200'
                    >
                      Hủy
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className='overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm'>
              <div className='overflow-x-auto'>
                <table className='w-full border-collapse text-left'>
                  <thead>
                    <tr className='border-b border-slate-100 bg-slate-50 text-xs font-bold uppercase tracking-widest text-slate-500'>
                      <th className='px-6 py-4'>Nhân sự</th>
                      <th className='px-6 py-4'>Vai trò</th>
                      <th className='px-6 py-4'>Trạng thái</th>
                      <th className='px-6 py-4'>Ngày gán</th>
                      <th className='px-6 py-4 text-right'>Hành động</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-slate-100 text-sm text-slate-700'>
                    {assignmentsQuery.isLoading && (
                      <tr>
                        <td colSpan={5} className='px-6 py-6 text-slate-500'>
                          Đang tải danh sách nhân sự...
                        </td>
                      </tr>
                    )}
                    {!assignmentsQuery.isLoading && assignments.length === 0 && (
                      <tr>
                        <td colSpan={5} className='px-6 py-6 text-slate-500'>
                          Chưa có nhân sự nào được gán cho tòa nhà này.
                        </td>
                      </tr>
                    )}
                    {assignments.map((assignment) => (
                      <tr key={assignment.id}>
                        <td className='px-6 py-4'>
                          <div className='font-semibold text-slate-900'>{assignment.fullName || assignment.username}</div>
                          <div className='text-xs text-slate-400'>{assignment.username}</div>
                        </td>
                        <td className='px-6 py-4'>{assignment.role}</td>
                        <td className='px-6 py-4'>
                          <span className={assignment.isActive ? 'text-emerald-600' : 'text-red-500'}>
                            {assignment.isActive ? 'Đang hoạt động' : 'Đã xóa'}
                          </span>
                        </td>
                        <td className='px-6 py-4'>{new Date(assignment.assignedAt).toLocaleDateString('vi-VN')}</td>
                        <td className='px-6 py-4 text-right'>
                          <div className='inline-flex gap-3 text-sm font-medium'>
                            <button type='button' onClick={() => setSelectedAssignment(assignment)} className='text-[#0052CC] hover:underline'>
                              Sửa
                            </button>
                            <button
                              type='button'
                              disabled={!assignment.isActive || deleteAssignmentMutation.isPending}
                              onClick={() => deleteAssignmentMutation.mutate(assignment.id)}
                              className='text-red-600 hover:underline disabled:cursor-not-allowed disabled:text-slate-300'
                            >
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'floors' && (
          <div className='space-y-6'>
            <div className='rounded-2xl border border-gray-100 bg-white p-6 shadow-sm'>
              <div className='mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
                <div>
                  <h2 className='text-xl font-bold text-slate-900'>Quản lý tầng</h2>
                  <p className='mt-1 text-sm text-slate-500'>Tạo/sửa/xóa tầng. Có thể bật hiển thị tầng đã xóa.</p>
                </div>
                <div className='flex items-center gap-4'>
                  <label className='flex items-center gap-2 text-sm text-slate-600'>
                    <input
                      type='checkbox'
                      checked={includeDeletedFloors}
                      onChange={(e) => setIncludeDeletedFloors(e.target.checked)}
                    />
                    Hiển thị tầng đã xóa
                  </label>
                  <button
                    type='button'
                    onClick={() => {
                      setSelectedFloor(null)
                      setIsFloorModalOpen(true)
                    }}
                    className='rounded-lg bg-[#0052CC] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700'
                  >
                    + Thêm tầng
                  </button>
                </div>
              </div>

              <div className='overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm'>
                <div className='overflow-x-auto'>
                  <table className='w-full border-collapse text-left'>
                    <thead>
                      <tr className='border-b border-slate-100 bg-slate-50 text-xs font-bold uppercase tracking-widest text-slate-500'>
                        <th className='px-6 py-4'>Tầng</th>
                        <th className='px-6 py-4'>Tên</th>
                        <th className='px-6 py-4'>Trạng thái</th>
                        <th className='px-6 py-4 text-right'>Hành động</th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-slate-100 text-sm text-slate-700'>
                      {floorsQuery.isLoading && (
                        <tr>
                          <td colSpan={4} className='px-6 py-6 text-slate-500'>
                            Đang tải danh sách tầng...
                          </td>
                        </tr>
                      )}
                      {floorsQuery.isError && (
                        <tr>
                          <td colSpan={4} className='px-6 py-6 text-red-600'>
                            {getApiErrorMessage(floorsQuery.error, 'Không tải được danh sách tầng')}
                          </td>
                        </tr>
                      )}
                      {!floorsQuery.isLoading && !floorsQuery.isError && floors.length === 0 && (
                        <tr>
                          <td colSpan={4} className='px-6 py-6 text-slate-500'>
                            Chưa có tầng nào.
                          </td>
                        </tr>
                      )}
                      {floors.map((floor) => (
                        <tr key={floor.id}>
                          <td className='px-6 py-4'>
                            <div className='font-semibold text-slate-900'>Tầng {floor.floorNumber}</div>
                            <div className='text-xs text-slate-400'>ID: {floor.id}</div>
                          </td>
                          <td className='px-6 py-4'>{floor.name || <span className='text-slate-300'>—</span>}</td>
                          <td className='px-6 py-4'>
                            <span className={floor.deletedAt ? 'text-red-500 font-semibold' : 'text-emerald-600 font-semibold'}>
                              {floor.deletedAt ? 'Đã xóa' : 'Đang hoạt động'}
                            </span>
                          </td>
                          <td className='px-6 py-4 text-right'>
                            <div className='inline-flex gap-3 text-sm font-medium'>
                              <button
                                type='button'
                                onClick={() => {
                                  setSelectedFloor(floor)
                                  setIsFloorModalOpen(true)
                                }}
                                className='text-[#0052CC] hover:underline'
                              >
                                Sửa
                              </button>
                              <button
                                type='button'
                                disabled={Boolean(floor.deletedAt) || deleteFloorMutation.isPending}
                                onClick={() => {
                                  const ok = window.confirm(`Bạn chắc chắn muốn xóa tầng ${floor.floorNumber}?`)
                                  if (!ok) return
                                  deleteFloorMutation.mutate(String(floor.id))
                                }}
                                className='text-red-600 hover:underline disabled:cursor-not-allowed disabled:text-slate-300'
                              >
                                Xóa
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {isFloorModalOpen && (
              <div className='fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm'>
                <div className='w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl'>
                  <div className='flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4'>
                    <h2 className='text-xl font-bold text-gray-800'>{selectedFloor ? 'Cập nhật tầng' : 'Thêm tầng'}</h2>
                    <button
                      onClick={() => !saveFloorMutation.isPending && setIsFloorModalOpen(false)}
                      className='text-gray-400 transition hover:text-gray-600'
                    >
                      Đóng
                    </button>
                  </div>
                  <div className='p-6'>
                    <form
                      className='space-y-4'
                      onSubmit={(e) => {
                        e.preventDefault()
                        const fd = new FormData(e.currentTarget)
                        saveFloorMutation.mutate({
                          id: selectedFloor?.id,
                          floor_number: Number(fd.get('floor_number')),
                          name: String(fd.get('name') || '').trim() || null
                        })
                      }}
                    >
                      <div className='grid grid-cols-2 gap-4'>
                        <div>
                          <label className='mb-1 block text-sm font-bold text-gray-700'>Số tầng</label>
                          <input
                            name='floor_number'
                            type='number'
                            required
                            defaultValue={selectedFloor?.floorNumber ?? ''}
                            className='w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
                          />
                        </div>
                        <div>
                          <label className='mb-1 block text-sm font-bold text-gray-700'>Tên (tuỳ chọn)</label>
                          <input
                            name='name'
                            defaultValue={selectedFloor?.name ?? ''}
                            className='w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
                          />
                        </div>
                      </div>

                      <div className='flex justify-end gap-3 border-t border-gray-100 pt-4'>
                        <button
                          type='button'
                          disabled={saveFloorMutation.isPending}
                          onClick={() => {
                            setIsFloorModalOpen(false)
                            setSelectedFloor(null)
                          }}
                          className='rounded-lg bg-gray-100 px-5 py-2.5 font-bold text-gray-600 transition hover:bg-gray-200 disabled:opacity-60'
                        >
                          Hủy
                        </button>
                        <button
                          type='submit'
                          disabled={saveFloorMutation.isPending}
                          className='rounded-lg bg-[#0052CC] px-5 py-2.5 font-bold text-white shadow-md transition hover:bg-blue-700 disabled:opacity-60'
                        >
                          {saveFloorMutation.isPending ? 'Đang lưu...' : selectedFloor ? 'Cập nhật' : 'Tạo mới'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
