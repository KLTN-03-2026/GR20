import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { buildingApi } from 'src/apis/building_api/buildings.api'
import ItemBuilding from './ItemBuilding'

export default function Buildings() {
  const { data } = useQuery({
    queryKey: ['buildings'],
    queryFn: () => {
      return buildingApi.getAllBuildings()
    }
  })

  const dataBuildings = data?.data.data

  const totalApartments =
    dataBuildings &&
    dataBuildings.reduce((sum, building) => {
      // Chỉ cộng nếu totalApartments không phải null và là số
      if (building.totalApartments && typeof building.totalApartments === 'number') {
        return sum + building.totalApartments
      }
      return sum
    }, 0)
  return (
    <main className='pt-24 pl-64 pr-8 pb-12'>
      <div className='max-w-7xl mx-auto'>
        {/* Header & Action Section */}
        <div className='flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6'>
          <div>
            <span className='text-[10px] font-bold tracking-[0.1em] text-blue-700 uppercase mb-2 block'>
              Danh Mục Tòa Nhà
            </span>
            <h2 className='text-4xl font-extrabold tracking-tight leading-none'>Ban Quản Lý</h2>
            <p className='mt-3 text-gray-500 max-w-md leading-relaxed'>
              Giám sát và điều phối hoạt động trên các tài sản bất động sản giá trị cao của bạn với các công cụ quản lý
              thời gian thực.
            </p>
          </div>
          <button className='bg-gradient-to-br from-blue-600 to-blue-500 text-white px-8 py-3 rounded-full font-semibold text-sm hover:brightness-110 transition-all flex items-center gap-2'>
            {/* <span className='material-symbols-outlined text-sm'>add</span> */}
            Đăng Ký Tòa Nhà Mới
          </button>
        </div>

        {/* Stats Grid */}
        <div className='grid grid-cols-12 gap-4 mb-8'>
          <div className='col-span-12 md:col-span-7 bg-white rounded-xl p-6 shadow-sm flex flex-col justify-between min-h-[200px]'>
            <div className='flex justify-between items-start'>
              <div className='bg-blue-50 p-3 rounded-xl'>
                <span className='material-symbols-outlined text-blue-600'>apartment</span>
              </div>
              <span className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>
                Đơn Vị Đang Hoạt Động
              </span>
            </div>
            <div>
              <div className='text-4xl font-bold mb-1'>{totalApartments}</div>
              <div className='text-sm text-gray-500'>Số căn hộ trên tất cả các tòa nhà đang hoạt động</div>
            </div>
          </div>

          <div className='col-span-12 md:col-span-5 bg-blue-600 text-white rounded-xl p-6 shadow-sm overflow-hidden relative min-h-[200px]'>
            <div className='relative z-10'>
              <span className='text-[10px] font-bold text-white/70 uppercase tracking-widest mb-4 block'>
                Tình Trạng Hệ Thống
              </span>
              <div className='text-3xl font-bold mb-2'>Tỷ lệ lấp đầy 92%</div>
              <p className='text-sm text-white/80 max-w-[180px]'>Hiệu suất mạnh mẽ, tăng 4% so với quý trước.</p>
            </div>
            <div className='absolute -right-8 -bottom-8 opacity-20'>
              <span className='material-symbols-outlined text-[120px]'>query_stats</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className='bg-white rounded-2xl overflow-hidden shadow-sm'>
          <div className='overflow-x-auto'>
            <table className='w-full text-left border-collapse'>
              <thead>
                <tr className='bg-gray-50'>
                  {['Building Name', 'Code', 'Address', 'Floors', 'Units', 'Status', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className={`px-6 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest ${
                        ['Floors', 'Units'].includes(h) ? 'text-center' : h === 'Actions' ? 'text-right' : ''
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {dataBuildings && dataBuildings.map((building) => <ItemBuilding building={building} />)}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className='px-6 py-4 flex items-center justify-between bg-gray-50/50'>
            <span className='text-xs text-gray-500 font-medium'>
              {/* Showing {buildings.length} of {buildings.length} Buildings */}
            </span>
            <div className='flex gap-2'>
              <button className='px-4 py-2 text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all'>
                Previous
              </button>
              <button className='px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg'>1</button>
              <button className='px-4 py-2 text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all'>
                Next
              </button>
            </div>
          </div>
        </div>

        {/* AI Insight */}
        <div className='mt-8 p-6 bg-white/60 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 flex items-start gap-4'>
          <div className='bg-blue-50 p-2 rounded-full'>
            <span className='material-symbols-outlined text-blue-600 text-xl'>auto_awesome</span>
          </div>
          <div>
            <h4 className='text-xs font-bold text-blue-800 uppercase tracking-widest mb-1'>
              Thông Tin Thông Minh Homelink AI
            </h4>
            <p className='text-sm text-gray-500 leading-relaxed'>
              Tòa nhà <span className='font-bold text-gray-800'>ALPHA_01</span> có số lượng yêu cầu bảo trì cao hơn mức
              trung bình. Chúng tôi đề xuất lên lịch kiểm tra cơ sở vật chất cho các tầng 12-25 để giảm thiểu nguy cơ
              hỏng hóc hệ thống.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
