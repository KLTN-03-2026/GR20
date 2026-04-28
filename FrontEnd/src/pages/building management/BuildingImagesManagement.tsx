import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { buildingImagesApi } from 'src/apis/building_api/building-images.api'
import { buildingApi } from 'src/apis/building_api/buildings.api'
import config from 'src/contexts/config'
import type { BuildingImage } from 'src/types/building-image.type'

export default function BuildingImagesManagement() {
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>(searchParams.get('buildingId') || '')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [includeDeleted, setIncludeDeleted] = useState(false)

  const getApiErrorMessage = (error: any, fallbackMessage: string) => {
    const apiErr = error?.response?.data
    const firstFieldError = apiErr?.errors ? Object.values(apiErr.errors).flat()?.[0] : null
    const rawMessage = firstFieldError || apiErr?.formErrors?.[0] || apiErr?.details || apiErr?.message || fallbackMessage
    if (typeof rawMessage !== 'string') return fallbackMessage

    const translatedMessages: Array<[string, string]> = [
      ['Validation failed', 'Dữ liệu không hợp lệ'],
      ['Invalid buildingId (building does not exist)', 'Tòa nhà không tồn tại'],
      ['Building image not found', 'Không tìm thấy ảnh tòa nhà'],
      ['Please select an image file', 'Vui lòng chọn file ảnh']
    ]

    const matched = translatedMessages.find(([en]) => rawMessage.includes(en))
    return matched?.[1] || rawMessage
  }

  const logApiSuccess = (action: string, response: any) => {
    console.log(`[BuildingImage][${action}] success`, {
      status: response?.status,
      endpoint: response?.config?.url,
      method: response?.config?.method,
      data: response?.data
    })
  }

  const logApiError = (action: string, error: any) => {
    console.error(`[BuildingImage][${action}] error`, {
      status: error?.response?.status,
      endpoint: error?.config?.url || error?.response?.config?.url,
      method: error?.config?.method || error?.response?.config?.method,
      data: error?.response?.data,
      message: error?.message
    })
  }

  const { data: buildingData } = useQuery({
    queryKey: ['buildings'],
    queryFn: () => buildingApi.getAllBuildings({ page: 0, size: 500 })
  })

  const buildings = buildingData?.data?.data || []

  const selectedBuilding = useMemo(
    () => buildings.find((b) => String(b.id) === selectedBuildingId) || null,
    [buildings, selectedBuildingId]
  )

  const {
    data: imagesData,
    isLoading: isLoadingImages,
    isError: isImagesError,
    error: imagesError
  } = useQuery({
    queryKey: ['building-images', selectedBuildingId, includeDeleted],
    queryFn: async () => {
      const response = await buildingImagesApi.getAllByBuildingId(selectedBuildingId, { includeDeleted })
      logApiSuccess('GetAllByBuildingId', response)
      return response
    },
    enabled: Boolean(selectedBuildingId)
  })

  const uploadMutation = useMutation({
    mutationFn: (payload: { buildingId: number; image: File }) => buildingImagesApi.uploadBuildingImage(payload),
    onSuccess: (response) => {
      logApiSuccess('Upload', response)
      if (!selectedBuildingId) return
      queryClient.invalidateQueries({ queryKey: ['building-images', selectedBuildingId] })
      setErrorMessage(null)
    },
    onError: (error: any) => {
      logApiError('Upload', error)
      setErrorMessage(getApiErrorMessage(error, 'Upload ảnh thất bại'))
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => buildingImagesApi.deleteBuildingImage(id),
    onSuccess: (response) => {
      logApiSuccess('Delete', response)
      if (!selectedBuildingId) return
      queryClient.invalidateQueries({ queryKey: ['building-images', selectedBuildingId] })
    },
    onError: (error: any) => {
      logApiError('Delete', error)
      setErrorMessage(getApiErrorMessage(error, 'Xóa ảnh thất bại'))
    }
  })

  const onUpload = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedBuildingId) {
      setErrorMessage('Vui lòng chọn tòa nhà trước khi tải ảnh')
      return
    }

    const formData = new FormData(e.currentTarget)
    const image = formData.get('image') as File | null

    if (!image || image.size === 0) {
      setErrorMessage('Vui lòng chọn file ảnh từ máy')
      return
    }

    uploadMutation.mutate({
      buildingId: Number(selectedBuildingId),
      image
    })
    e.currentTarget.reset()
  }

  const onDelete = (id: string) => {
    const ok = window.confirm('Bạn muốn xóa ảnh này?')
    if (!ok) return
    deleteMutation.mutate(id)
  }

  if (isImagesError) {
    logApiError('GetAllByBuildingId', imagesError)
  }

  const images: BuildingImage[] = imagesData?.data?.data || []

  return (
    <div className='min-h-screen bg-slate-50 px-8 py-8'>
      <div className='mx-auto max-w-6xl'>
        <h1 className='mb-2 text-2xl font-bold text-slate-900'>Quản lý hình ảnh tòa nhà</h1>
        <p className='mb-6 text-sm text-slate-500'>Chọn tòa nhà, sau đó chọn ảnh từ máy tính để upload.</p>

        <div className='mb-4 rounded-xl bg-white p-4 shadow-sm'>
          <label className='mb-2 block text-xs font-semibold text-slate-600'>Tòa nhà</label>
          <select
            value={selectedBuildingId}
            onChange={(e) => setSelectedBuildingId(e.target.value)}
            className='w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
          >
            <option value=''>-- Chọn tòa nhà --</option>
            {buildings.map((building) => (
              <option key={building.id} value={building.id}>
                {building.name} ({building.code})
              </option>
            ))}
          </select>
          <label className='mt-3 flex items-center gap-2 text-sm text-slate-600'>
            <input
              type='checkbox'
              checked={includeDeleted}
              onChange={(e) => setIncludeDeleted(e.target.checked)}
            />
            Hiển thị cả ảnh đã xóa
          </label>
        </div>

        <div className='mb-6 rounded-xl bg-white p-4 shadow-sm'>
          <form onSubmit={onUpload} className='flex flex-col gap-3 md:flex-row md:items-center'>
            <input
              type='file'
              name='image'
              accept='image/png,image/jpeg,image/jpg,image/gif,image/webp'
              className='block w-full text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200'
            />
            <button
              type='submit'
              disabled={uploadMutation.isPending}
              className='rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60'
            >
              {uploadMutation.isPending ? 'Đang upload...' : 'Upload ảnh'}
            </button>
          </form>
          {errorMessage && <div className='mt-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600'>{errorMessage}</div>}
        </div>

        <div className='rounded-xl bg-white p-4 shadow-sm'>
          <div className='mb-3 text-sm font-semibold text-slate-700'>
            Danh sách ảnh {selectedBuilding ? `- ${selectedBuilding.name}` : ''}
          </div>

          {!selectedBuildingId && <div className='text-sm text-slate-500'>Chọn tòa nhà để xem ảnh.</div>}
          {selectedBuildingId && isLoadingImages && <div className='text-sm text-slate-500'>Đang tải ảnh...</div>}
          {selectedBuildingId && !isLoadingImages && images.length === 0 && (
            <div className='text-sm text-slate-500'>Chưa có ảnh nào.</div>
          )}

          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            {images.map((image) => {
              const src = image.imageUrl.startsWith('http') ? image.imageUrl : `${config.BASEURL}${image.imageUrl}`
              return (
                <div key={image.id} className='overflow-hidden rounded-lg border border-slate-200'>
                  <img src={src} alt='building' className='h-48 w-full object-cover' />
                  <div className='flex items-center justify-between p-3'>
                    <div className='min-w-0 pr-2'>
                      <a
                        href={src}
                        target='_blank'
                        rel='noreferrer'
                        className='block truncate text-xs text-blue-600 hover:underline'
                      >
                        {image.imageUrl}
                      </a>
                      <div className={`mt-1 text-[11px] font-semibold ${image.deletedAt ? 'text-red-500' : 'text-emerald-600'}`}>
                        {image.deletedAt ? 'Đã xóa' : 'Đang hiển thị'}
                      </div>
                    </div>
                    <button
                      type='button'
                      disabled={Boolean(image.deletedAt)}
                      onClick={() => onDelete(String(image.id))}
                      className='rounded-md px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-300'
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
