import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { buildingAssignmentsApi } from 'src/apis/building_api/building-assignments.api'
import { buildingImagesApi } from 'src/apis/building_api/building-images.api'
import { buildingApi } from 'src/apis/building_api/buildings.api'
import { floorsApi } from 'src/apis/floor_api/floors.api'
import { UserApi } from 'src/apis/User/user.api'
import config from 'src/contexts/config'
import type { BuildingAssignment } from 'src/types/building-assignment.type'
import type { BuildingImage } from 'src/types/building-image.type'
import type { Floor } from 'src/types/floor.type'
import {
  buildingStatusBadgeClass,
  buildingStatusLabel
} from './building-admin-ui'

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
    ['At least one field is required for update', 'Cần ít nhất một trường để cập nhật'],
    ['Cannot close building while it still has floors or active apartments. Remove them first.', 'Không thể đóng tòa nhà khi còn tầng hoặc căn hộ đang dùng. Hãy gỡ hết tầng và căn trước.']
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
  const location = useLocation()
  const queryClient = useQueryClient()
  const { id = '' } = useParams()
  const buildingsListPath = location.pathname.includes('/admin/buildings') ? '/admin/buildings' : '/buildings'
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

  if (buildingQuery.isError) {
    return (
      <div className='min-h-screen bg-slate-50 px-6 py-8 font-sans md:px-8'>
        <div className='mx-auto max-w-6xl'>
          <button
            type='button'
            onClick={() => navigate(buildingsListPath)}
            className='mb-4 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800'
          >
            ← Danh sách tòa nhà
          </button>
          <div className='rounded-2xl border border-red-100 bg-red-50 px-6 py-5 text-red-800 shadow-sm'>
            <p className='text-lg font-semibold'>Không tải được tòa nhà</p>
            <p className='mt-2 text-sm leading-relaxed'>
              {getApiErrorMessage(buildingQuery.error, 'Tòa nhà không tồn tại hoặc bạn không có quyền xem.')}
            </p>
            <p className='mt-3 inline-block rounded-full bg-white/80 px-3 py-1 text-xs font-mono text-red-700'>ID: {id || '—'}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-slate-50 px-6 py-8 font-sans text-slate-900 md:px-8'>
      <div className='mx-auto max-w-6xl'>
        <div className='mb-8 flex flex-col gap-6 border-b border-slate-200/80 pb-8 md:flex-row md:items-end md:justify-between'>
          <div>
            <button
              type='button'
              onClick={() => navigate(buildingsListPath)}
              className='mb-3 text-sm font-medium text-blue-600 hover:text-blue-800'
            >
              ← Danh sách tòa nhà
            </button>
            <div className='flex flex-wrap items-center gap-2'>
              <span className='rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800 ring-1 ring-blue-100'>
                Chi tiết tòa nhà
              </span>
              {id ? (
                <span className='rounded-full bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-600'>#{id}</span>
              ) : null}
            </div>
            <h1 className='mt-3 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl'>
              {buildingQuery.isLoading ? 'Đang tải…' : building?.name || 'Tòa nhà'}
            </h1>
            <p className='mt-2 max-w-2xl text-sm leading-relaxed text-slate-600'>
              {buildingQuery.isLoading
                ? 'Đang tải thông tin tòa nhà…'
                : building
                  ? `${building.code} · ${building.address}`
                  : 'Không có dữ liệu tòa nhà.'}
            </p>
          </div>
        </div>

        {screenError && (
          <div className='mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm'>{screenError}</div>
        )}

        <div className='mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3'>
          <div className='rounded-2xl border border-slate-100 bg-white p-5 shadow-sm'>
            <div className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Số tầng</div>
            <div className='mt-2 text-3xl font-bold tabular-nums text-slate-900'>
              {buildingQuery.isLoading ? '…' : building?.totalFloors ?? '—'}
            </div>
          </div>
          <div className='rounded-2xl border border-slate-100 bg-white p-5 shadow-sm'>
            <div className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Số căn hộ</div>
            <div className='mt-2 text-3xl font-bold tabular-nums text-slate-900'>
              {buildingQuery.isLoading ? '…' : building?.totalApartments ?? '—'}
            </div>
          </div>
          <div className='rounded-2xl border border-slate-100 bg-white p-5 shadow-sm'>
            <div className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Trạng thái</div>
            <div className='mt-3'>
              {buildingQuery.isLoading ? (
                <span className='text-2xl font-bold text-slate-300'>…</span>
              ) : (
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${buildingStatusBadgeClass(building?.status)}`}
                >
                  {buildingStatusLabel[(building?.status || '').toUpperCase()] || building?.status || '—'}
                </span>
              )}
            </div>
          </div>
        </div>

        {building && (Number(building.linkedFloorCount ?? 0) > 0 || Number(building.linkedApartmentCount ?? 0) > 0) && (
          <div className='mb-8 rounded-xl border border-amber-200/90 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-sm'>
            <p className='font-semibold'>Ràng buộc đóng tòa</p>
            <p className='mt-1 leading-relaxed text-amber-900/95'>
              Tòa đang có <strong className='tabular-nums'>{building.linkedFloorCount ?? 0}</strong> tầng và{' '}
              <strong className='tabular-nums'>{building.linkedApartmentCount ?? 0}</strong> căn hộ (không tính căn bảo trì). Chỉ
              khi không còn tầng và không còn căn hoạt động, bạn mới đóng tòa được từ danh sách tòa nhà.
            </p>
          </div>
        )}

        <div className='mb-8 flex flex-wrap gap-1 rounded-xl border border-slate-200/90 bg-white p-1 shadow-sm'>
          {[
            { key: 'images' as const, label: 'Ảnh tòa nhà' },
            { key: 'floors' as const, label: 'Tầng' },
            { key: 'staff' as const, label: 'Nhân sự' }
          ].map((tab) => (
            <button
              key={tab.key}
              type='button'
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
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
                  <h2 className='text-xl font-bold text-slate-900'>Ảnh & tải lên</h2>
                  <p className='mt-1 text-sm text-slate-500'>Chọn ảnh, xem trước rồi lưu vào hệ thống.</p>
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
                      className='rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60'
                    >
                      {uploadMutation.isPending ? 'Đang lưu…' : 'Lưu ảnh'}
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
                      const url = image.imageUrl || ''
                      const src = url.startsWith('http') ? url : `${config.BASEURL}${url}`
                      return (
                        <div key={image.id} className='overflow-hidden rounded-xl border border-slate-200 bg-slate-50'>
                          <img src={src} alt='building' className='h-48 w-full object-cover' />
                          <div className='space-y-3 p-4'>
                            <div className='truncate text-xs text-slate-500'>{url || '—'}</div>
                            <div className={`text-xs font-semibold ${image.deletedAt ? 'text-red-500' : 'text-emerald-600'}`}>
                              {image.deletedAt ? 'Đã xóa' : 'Đang hiển thị'}
                            </div>
                            <div className='flex gap-3 text-sm font-medium'>
                              <a href={src} target='_blank' rel='noreferrer' className='text-blue-600 hover:underline'>
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
                <h2 className='text-xl font-bold text-slate-900'>Phân công nhân sự</h2>
                <p className='mt-1 text-sm text-slate-500'>Gán nhân viên quản lý tòa nhà và vai trò tại đây.</p>
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
                  <option value=''>{selectedAssignment ? 'Chọn lại nhân sự' : 'Chọn nhân viên'}</option>
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
                    className='rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60'
                  >
                    {saveAssignmentMutation.isPending ? 'Đang lưu…' : selectedAssignment ? 'Cập nhật' : 'Gán'}
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
                            <button type='button' onClick={() => setSelectedAssignment(assignment)} className='text-blue-600 hover:underline'>
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
                    className='rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700'
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
                                className='text-blue-600 hover:underline'
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
                            className='w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20'
                          />
                        </div>
                        <div>
                          <label className='mb-1 block text-sm font-bold text-gray-700'>Tên (tuỳ chọn)</label>
                          <input
                            name='name'
                            defaultValue={selectedFloor?.name ?? ''}
                            className='w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20'
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
                          className='rounded-lg bg-blue-600 px-5 py-2.5 font-bold text-white shadow-md transition hover:bg-blue-700 disabled:opacity-60'
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
