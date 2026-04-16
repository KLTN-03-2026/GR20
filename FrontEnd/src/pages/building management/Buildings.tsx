import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { buildingApi } from 'src/apis/building_api/buildings.api'
import ItemBuilding from './ItemBuilding'

export default function Buildings() {
  const queryClient = useQueryClient()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['buildings'],
    queryFn: () => {
      return buildingApi.getAllBuildings()
    }
  })

  const dataBuildings = data?.data.data
  const page = data?.data.page ?? 0
  const totalElements = data?.data.totalElements ?? 0
  const totalPages = data?.data.totalPages ?? 1
  const editingBuilding = useMemo(
    () => dataBuildings?.find((b) => b.id === editingId) ?? null,
    [dataBuildings, editingId]
  )

  const createMutation = useMutation({
    mutationFn: (payload: Parameters<typeof buildingApi.createBuilding>[0]) =>
      editingBuilding && editingId
        ? buildingApi.updateBuilding(editingId, payload)
        : buildingApi.createBuilding(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] })
      setIsCreateOpen(false)
      setFormError(null)
      setEditingId(null)
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Không lưu được tòa nhà'
      setFormError(msg)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => buildingApi.deleteBuilding(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] })
    }
  })

  const reopenMutation = useMutation({
    mutationFn: (id: string) => buildingApi.updateBuilding(id, { status: 'ACTIVE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] })
    }
  })

  const handleSubmitCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    createMutation.mutate({
      name: String(formData.get('name') || ''),
      code: String(formData.get('code') || ''),
      address: String(formData.get('address') || ''),
      totalFloors: Number(formData.get('totalFloors') || 0),
      totalApartments: Number(formData.get('totalApartments') || 0),
      yearBuilt: Number(formData.get('yearBuilt') || new Date().getFullYear()),
      status: 'ACTIVE'
    })
  }

  const handleDelete = (building: { id: string; name: string }) => {
    if (deleteMutation.isPending) return
    const ok = window.confirm(`Bạn chắc chắn muốn đóng tòa nhà "${building.name}"?`)
    if (!ok) return
    deleteMutation.mutate(building.id)
  }

  const handleReopen = (building: { id: string; name: string }) => {
    if (reopenMutation.isPending) return
    const ok = window.confirm(`Bạn muốn mở lại tòa nhà "${building.name}"?`)
    if (!ok) return
    reopenMutation.mutate(building.id)
  }

  const totalApartments =
    dataBuildings &&
    dataBuildings.reduce((sum, building) => {
      // Chỉ cộng nếu totalApartments không phải null và là số
      if (building.totalApartments && typeof building.totalApartments === 'number') {
        return sum + building.totalApartments
      }
      return sum
    }, 0)

  const menuItems = ['Dashboard', 'Buildings', 'Tenants', 'Maintenance', 'Reports']

  return (
    <div className='min-h-screen bg-slate-50 text-slate-900'>
      <aside className='fixed left-0 top-0 h-full w-56 border-r border-slate-200 bg-white px-5 py-6'>
        <div className='mb-8 text-sm font-semibold tracking-wide text-blue-700'>Building Management</div>
        <nav className='space-y-1'>
          {menuItems.map((item) => (
            <button
              key={item}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${
                item === 'Buildings'
                  ? 'bg-blue-50 font-semibold text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className='material-symbols-outlined text-[18px]'>dashboard</span>
              {item}
            </button>
          ))}
        </nav>
      </aside>

      <main className='pl-56'>
        <header className='sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-8 py-4 backdrop-blur'>
          <div className='mx-auto flex max-w-7xl items-center justify-between gap-3'>
            <div className='w-full max-w-xl'>
              <div className='rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-500'>
                Search buildings...
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <button className='rounded-lg p-2 text-slate-600 hover:bg-slate-100'>
                <span className='material-symbols-outlined text-[20px]'>notifications</span>
              </button>
              <button className='rounded-lg p-2 text-slate-600 hover:bg-slate-100'>
                <span className='material-symbols-outlined text-[20px]'>settings</span>
              </button>
            </div>
          </div>
        </header>

        <section className='px-8 pb-10 pt-8'>
          <div className='mx-auto max-w-7xl'>
            <div className='mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end'>
              <div>
                <span className='mb-2 block text-[10px] font-bold uppercase tracking-[0.1em] text-blue-700'>
                  Building Portfolio
                </span>
                <h2 className='text-4xl font-extrabold leading-none tracking-tight'>Ban Quản Lý</h2>
                <p className='mt-3 max-w-lg text-slate-500'>
                  Giám sát và điều phối hoạt động trên các tài sản bất động sản giá trị cao của bạn với các công cụ quản
                  lý thời gian thực.
                </p>
              </div>
              <button
                type='button'
                onClick={() => {
                  setFormError(null)
                  setIsCreateOpen(true)
                  setEditingId(null)
                }}
                className='rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700'
              >
                + Register New Building
              </button>
            </div>

            <div className='mb-8 grid grid-cols-12 gap-4'>
              <div className='col-span-12 min-h-[180px] rounded-xl bg-white p-6 shadow-sm md:col-span-7'>
                <div className='mb-8 flex items-start justify-between'>
                  <div className='rounded-xl bg-blue-50 p-3'>
                    <span className='material-symbols-outlined text-blue-600'>apartment</span>
                  </div>
                  <span className='text-[10px] font-bold uppercase tracking-widest text-slate-400'>Active Units</span>
                </div>
                <div className='text-4xl font-bold'>{totalApartments ?? 0}</div>
                <div className='mt-2 text-sm text-slate-500'>Residential units across all active buildings</div>
              </div>

              <div className='relative col-span-12 min-h-[180px] overflow-hidden rounded-xl bg-blue-600 p-6 text-white shadow-sm md:col-span-5'>
                <span className='mb-4 block text-[10px] font-bold uppercase tracking-widest text-white/75'>
                  System Health
                </span>
                <div className='mb-2 text-4xl font-bold'>92% Occupancy</div>
                <p className='max-w-[220px] text-sm text-white/80'>Strong performance trending 4% higher than last quarter.</p>
                <span className='material-symbols-outlined absolute -bottom-6 right-0 text-[120px] text-white/15'>
                  query_stats
                </span>
              </div>
            </div>

            <div className='overflow-hidden rounded-2xl bg-white shadow-sm'>
              <div className='overflow-x-auto'>
                <table className='w-full border-collapse text-left'>
                  <thead>
                    <tr className='bg-slate-50'>
                      {['Building Name', 'Code', 'Address', 'Floors', 'Units', 'Status', 'Actions'].map((h) => (
                        <th
                          key={h}
                          className={`px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 ${
                            ['Floors', 'Units'].includes(h) ? 'text-center' : h === 'Actions' ? 'text-right' : ''
                          }`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-slate-100'>
                    {isLoading && (
                      <tr>
                        <td className='px-6 py-6 text-sm text-slate-500' colSpan={7}>
                          Đang tải dữ liệu tòa nhà...
                        </td>
                      </tr>
                    )}
                    {isError && (
                      <tr>
                        <td className='px-6 py-6 text-sm text-red-500' colSpan={7}>
                          Không tải được danh sách tòa nhà.
                        </td>
                      </tr>
                    )}
                    {!isLoading && !isError && dataBuildings?.length === 0 && (
                      <tr>
                        <td className='px-6 py-6 text-sm text-slate-500' colSpan={7}>
                          Chưa có dữ liệu tòa nhà.
                        </td>
                      </tr>
                    )}
                    {!isLoading &&
                      !isError &&
                      dataBuildings?.map((building) => (
                        <ItemBuilding
                          key={building.id}
                          building={building}
                          onDelete={handleDelete}
                          onReopen={handleReopen}
                          onEdit={(b) => {
                            setEditingId(b.id)
                            setIsCreateOpen(true)
                            setFormError(null)
                          }}
                        />
                      ))}
                  </tbody>
                </table>
              </div>

              <div className='flex items-center justify-between bg-slate-50/70 px-6 py-4'>
                <span className='text-xs font-medium text-slate-500'>Showing {dataBuildings?.length ?? 0} of {totalElements} buildings</span>
                <div className='flex items-center gap-2'>
                  <button className='rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-500'>Previous</button>
                  <button className='rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white'>{page + 1}</button>
                  <button className='rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-500'>Next</button>
                  <span className='pl-2 text-xs text-slate-400'>/ {totalPages} pages</span>
                </div>
              </div>
            </div>

            <div className='mt-8 flex items-start gap-4 rounded-2xl border border-white/50 bg-white/60 p-6 shadow-xl backdrop-blur-md'>
              <div className='rounded-full bg-blue-50 p-2'>
                <span className='material-symbols-outlined text-xl text-blue-600'>auto_awesome</span>
              </div>
              <div>
                <h4 className='mb-1 text-xs font-bold uppercase tracking-widest text-blue-800'>Homelink AI Insight</h4>
                <p className='text-sm leading-relaxed text-slate-500'>
                  Building <span className='font-bold text-slate-800'>ALPHA_01</span> shows higher maintenance requests than average.
                  We suggest scheduling a facility inspection for floors 12-25 to reduce potential failures.
                </p>
              </div>
            </div>
          </div>
        </section>

        {isCreateOpen && (
          <div className='fixed inset-0 z-20 flex items-center justify-center bg-slate-900/40'>
            <div className='w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl'>
              <div className='mb-4 flex items-center justify-between'>
                <h3 className='text-lg font-semibold'>
                  {editingBuilding ? 'Edit Building' : 'Register New Building'}
                </h3>
                <button
                  type='button'
                  onClick={() => !createMutation.isPending && setIsCreateOpen(false)}
                  className='rounded-full p-1 text-slate-500 hover:bg-slate-100'
                >
                  <span className='material-symbols-outlined text-[20px]'>close</span>
                </button>
              </div>
              {formError && <div className='mb-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600'>{formError}</div>}
              <form onSubmit={handleSubmitCreate} className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='mb-1 block text-xs font-semibold text-slate-600'>Name</label>
                    <input
                      name='name'
                      required
                      defaultValue={editingBuilding?.name}
                      className='w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                    />
                  </div>
                  <div>
                    <label className='mb-1 block text-xs font-semibold text-slate-600'>Code</label>
                    <input
                      name='code'
                      required
                      defaultValue={editingBuilding?.code}
                      className='w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                    />
                  </div>
                </div>
                <div>
                  <label className='mb-1 block text-xs font-semibold text-slate-600'>Address</label>
                  <input
                    name='address'
                    required
                      defaultValue={editingBuilding?.address}
                    className='w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                  />
                </div>
                <div className='grid grid-cols-3 gap-4'>
                  <div>
                    <label className='mb-1 block text-xs font-semibold text-slate-600'>Floors</label>
                    <input
                      name='totalFloors'
                      type='number'
                      min={1}
                      required
                      defaultValue={editingBuilding?.totalFloors}
                      className='w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                    />
                  </div>
                  <div>
                    <label className='mb-1 block text-xs font-semibold text-slate-600'>Units</label>
                    <input
                      name='totalApartments'
                      type='number'
                      min={0}
                      required
                      defaultValue={editingBuilding?.totalApartments}
                      className='w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                    />
                  </div>
                  <div>
                    <label className='mb-1 block text-xs font-semibold text-slate-600'>Year Built</label>
                    <input
                      name='yearBuilt'
                      type='number'
                      min={1800}
                      max={new Date().getFullYear() + 1}
                      required
                      defaultValue={editingBuilding?.yearBuilt}
                      className='w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                    />
                  </div>
                </div>
                <div className='mt-2 flex justify-end gap-2'>
                  <button
                    type='button'
                    disabled={createMutation.isPending}
                    onClick={() => setIsCreateOpen(false)}
                    className='rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-60'
                  >
                    Hủy
                  </button>
                  <button
                    type='submit'
                    disabled={createMutation.isPending}
                    className='rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60'
                  >
                    {createMutation.isPending ? 'Đang lưu...' : 'Tạo tòa nhà'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
