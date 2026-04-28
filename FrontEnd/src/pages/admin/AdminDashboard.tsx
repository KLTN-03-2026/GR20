import { useNavigate } from 'react-router-dom'

type AdminShortcut = {
  label: string
  description: string
  to: string
}

export default function AdminDashboard() {
  const navigate = useNavigate()

  const shortcuts: AdminShortcut[] = [
    { label: 'Quản lý vai trò', description: 'Tạo/sửa/xóa vai trò', to: '/admin/roles' },
    { label: 'Quản lý user', description: 'Danh sách người dùng', to: '/admin/users' },
    { label: 'Quản lý tòa nhà', description: 'Danh sách building', to: '/admin/buildings' },
    { label: 'Quản lý tầng', description: 'Danh sách floors', to: '/admin/floors' },
    { label: 'Quản lý căn hộ', description: 'Danh sách apartments', to: '/admin/apartments' },
    { label: 'Quản lý giá', description: 'Bảng giá tiện ích', to: '/admin/utility-pricing' },
    { label: 'Quản lý đồng hồ', description: 'Utility meters', to: '/admin/utility-meters' },
    { label: 'Quản lý chỉ số', description: 'Meter readings', to: '/admin/meter-readings' },
    { label: 'Quản lý hóa đơn', description: 'Invoices', to: '/admin/invoices' },
    { label: 'Quản lý thanh toán', description: 'Payments', to: '/admin/payments' },
    { label: 'Quản lý phương tiện', description: 'Danh sách vehicles', to: '/admin/vehicles' },
    { label: 'Quản lý khách', description: 'Danh sách visitors', to: '/admin/visitors' },
    { label: 'Quản lý hợp đồng', description: 'Danh sách contracts', to: '/admin/contracts' }
  ]

  return (
    <div className='min-h-screen bg-[#F8F9FA] p-8 font-sans'>
      <div className='mx-auto max-w-6xl'>
        <div className='mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
          <div>
            <span className='rounded bg-[#DDE7FF] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0052CC]'>
              Administration
            </span>
            <h1 className='mt-4 mb-2 text-3xl font-bold text-gray-900'>Admin Dashboard</h1>
            <p className='text-sm text-gray-500'>Trang tổng quan admin. Chưa cần dữ liệu, chỉ điều hướng nhanh.</p>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {shortcuts.map((item) => (
            <button
              key={item.to}
              type='button'
              onClick={() => navigate(item.to)}
              className='rounded-2xl border border-gray-100 bg-white p-6 text-left shadow-sm transition hover:border-[#0052CC]/30 hover:shadow-md'
            >
              <div className='text-lg font-bold text-gray-900'>{item.label}</div>
              <div className='mt-1 text-sm text-gray-500'>{item.description}</div>
              <div className='mt-4 text-sm font-semibold text-[#0052CC]'>Mở trang</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

