// src/pages/Security/SecurityResident.jsx
import { useState, useEffect, useRef } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { SecurityApi } from 'src/apis/Security_api/security.api'
import { useNavigate, createSearchParams, useLocation } from 'react-router-dom'
import { useDebounce } from 'src/hooks/useDebounce'
import Paginate from 'src/components/Paginate/Paginate'

export default function SecurityResident() {
  const navigate = useNavigate()
  const location = useLocation()

  const searchParams = new URLSearchParams(location.search)
  const pageFromUrl = searchParams.get('page') || '1'
  const limitFromUrl = searchParams.get('limit') || '10'
  const searchFromUrl = searchParams.get('search') || ''

  const [searchInput, setSearchInput] = useState(searchFromUrl)
  const debouncedSearch = useDebounce(searchInput, 500)

  // ✅ Dùng useRef để lưu giá trị hiện tại
  const pageRef = useRef(pageFromUrl)
  const limitRef = useRef(limitFromUrl)
  const searchRef = useRef(searchFromUrl)

  // Cập nhật ref khi URL thay đổi
  useEffect(() => {
    pageRef.current = pageFromUrl
    limitRef.current = limitFromUrl
    searchRef.current = searchFromUrl
  }, [pageFromUrl, limitFromUrl, searchFromUrl])

  const savedPageRef = useRef(pageFromUrl)
  const savedLimitRef = useRef(limitFromUrl)

  // ✅ Update URL khi search thay đổi - chỉ phụ thuộc vào debouncedSearch
  useEffect(() => {
    if (debouncedSearch !== searchRef.current) {
      if (debouncedSearch) {
        savedPageRef.current = pageRef.current
        savedLimitRef.current = limitRef.current

        const newParams: Record<string, string> = {
          page: '1',
          limit: limitRef.current,
          search: debouncedSearch
        }
        navigate({
          pathname: '/security/residents',
          search: createSearchParams(newParams).toString()
        })
      } else {
        const newParams: Record<string, string> = {
          page: savedPageRef.current,
          limit: savedLimitRef.current
        }
        navigate({
          pathname: '/security/residents',
          search: createSearchParams(newParams).toString()
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]) // ✅ Chỉ phụ thuộc debouncedSearch

  // Fetch dữ liệu với params từ URL
  const { data: residentsResponse, isLoading } = useQuery({
    queryKey: ['security-residents', pageFromUrl, limitFromUrl, searchFromUrl],
    queryFn: () =>
      SecurityApi.getResidentList({
        page: Number(pageFromUrl),
        limit: Number(limitFromUrl),
        search: searchFromUrl || undefined
      }),
    placeholderData: keepPreviousData,
    staleTime: 3000 * 60
  })

  const residents = residentsResponse?.data?.data || []
  const totalElements = residentsResponse?.data?.totalElements || 0
  const totalPages = residentsResponse?.data?.totalPages || 1

  const getAvatarUrl = (resident) => {
    if (resident.avatarUrl) return resident.avatarUrl
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(resident.fullName)}&background=005ab7&color=fff&rounded=true`
  }

  if (isLoading) {
    return (
      <div className='bg-surface min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
          <p className='mt-4 text-on-surface-variant'>Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='bg-surface min-h-screen'>
      <div className='pb-20 px-6 lg:px-12 w-full max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6'>
          <div>
            <h2 className='text-4xl font-extrabold text-on-surface tracking-tight'>Quản lý cư dân</h2>
            <p className='text-on-surface-variant mt-2 max-w-md'>Quản lý và giám sát cư dân đang cư trú tại tòa nhà</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-12'>
          <div className='col-span-1 md:col-span-2 bg-surface-container-lowest p-6 rounded-3xl flex items-center justify-between shadow-sm border-0'>
            <div>
              <p className='text-on-surface-variant text-sm font-medium'>Tổng số cư dân</p>
              <p className='text-5xl font-black text-on-surface mt-2'>{totalElements}</p>
            </div>
            <div className='h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary'>
              <span className='material-symbols-outlined text-4xl'>groups</span>
            </div>
          </div>
          <div className='bg-surface-container-low p-6 rounded-3xl shadow-sm'>
            <p className='text-on-surface-variant text-sm font-medium'>Đang cư trú</p>
            <p className='text-3xl font-bold text-on-surface mt-2'>
              {residents.filter((r) => r.status === 'ACTIVE').length}
            </p>
            <div className='mt-4 flex items-center gap-1 text-green-600 text-xs font-bold uppercase tracking-tighter'>
              <span className='material-symbols-outlined text-sm'>verified</span>
              Đang sinh sống
            </div>
          </div>
        </div>

        {/* Resident List Section */}
        <section className='bg-surface-container-lowest rounded-[2rem] overflow-hidden shadow-sm'>
          <div className='p-8 border-b border-surface-container flex items-center justify-between flex-wrap gap-4'>
            <h3 className='text-xl font-bold text-on-surface'>Danh sách cư dân</h3>
            <div className='flex items-center gap-4'>
              <div className='flex items-center gap-3 bg-surface-container-low px-4 py-2 rounded-full'>
                <span className='material-symbols-outlined text-slate-400'>search</span>
                <input
                  className='bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-transparent focus:shadow-none text-sm text-on-surface w-56'
                  placeholder='Tìm kiếm tên, SĐT, căn hộ...'
                  type='text'
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                {searchInput && (
                  <button onClick={() => setSearchInput('')} className='text-slate-400 hover:text-slate-600'>
                    <span className='material-symbols-outlined text-sm'>close</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {isLoading && (
            <div className='flex justify-center py-12'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
            </div>
          )}

          {!isLoading && (
            <>
              <div className='overflow-x-auto'>
                <table className='w-full text-left border-collapse'>
                  <thead>
                    <tr className='bg-surface-container-low/50'>
                      <th className='px-8 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-wider'>
                        Cư dân
                      </th>
                      <th className='px-8 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-wider'>
                        Liên hệ
                      </th>
                      <th className='px-8 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-wider'>
                        Căn hộ
                      </th>
                      <th className='px-8 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-wider'>
                        Trạng thái
                      </th>
                      <th className='px-8 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-right'>
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-surface-container'>
                    {residents.length === 0 ? (
                      <tr>
                        <td colSpan={5} className='px-8 py-12 text-center text-on-surface-variant'>
                          {searchFromUrl ? 'Không tìm thấy cư dân nào phù hợp' : 'Chưa có dữ liệu cư dân'}
                        </td>
                      </tr>
                    ) : (
                      residents.map((resident) => (
                        <tr key={resident.id} className='hover:bg-slate-50 transition-colors group'>
                          <td className='px-8 py-6'>
                            <div className='flex items-center gap-3'>
                              <div className='w-10 h-10 rounded-full overflow-hidden bg-slate-100'>
                                <img
                                  className='w-full h-full object-cover'
                                  src={getAvatarUrl(resident)}
                                  alt={resident.fullName}
                                />
                              </div>
                              <div>
                                <p className='font-bold text-on-surface'>{resident.fullName}</p>
                                <p className='text-xs text-on-surface-variant'>ID: {resident.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className='px-8 py-6'>
                            <p className='text-on-surface text-sm'>{resident.email}</p>
                            <p className='text-xs text-on-surface-variant mt-0.5'>
                              {resident.phone || 'Chưa cập nhật'}
                            </p>
                          </td>
                          <td className='px-8 py-6'>
                            <span className='text-sm font-bold text-primary'>{resident.apartmentCode || 'N/A'}</span>
                            <div className='flex items-center gap-2 mt-1'>
                              <span className='text-[10px] font-bold bg-surface-container text-on-surface-variant px-2 py-0.5 rounded uppercase'>
                                {resident.buildingName || 'N/A'}
                              </span>
                              <span className='text-[10px] text-on-surface-variant'>
                                Tầng {resident.floorNumber || 'N/A'}
                              </span>
                            </div>
                          </td>
                          <td className='px-8 py-6'>
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${
                                resident.status === 'ACTIVE'
                                  ? 'bg-green-50 text-green-700'
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${resident.status === 'ACTIVE' ? 'bg-green-500' : 'bg-slate-400'}`}
                              ></span>
                              {resident.status === 'ACTIVE' ? 'Đang cư trú' : 'Đã chuyển đi'}
                            </span>
                          </td>
                          <td className='px-8 py-6 text-right'>
                            <button
                              onClick={() => navigate(`/security/residents/${resident.id}`)}
                              className='px-4 py-1.5 text-xs font-bold text-primary hover:bg-primary/5 rounded-full transition-colors'
                            >
                              Xem chi tiết
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {totalElements > 0 && (
                <div className='px-8 py-6 border-t border-surface-container'>
                  <Paginate
                    queryConfig={{
                      page: pageFromUrl,
                      limit: limitFromUrl
                    }}
                    pageSize={totalPages}
                    search={searchFromUrl || undefined}
                  />
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  )
}
