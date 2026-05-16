type UserRole = 'ADMIN' | 'Quản lý' | 'Nhân viên' | 'Bảo vệ' | 'Người Dùng'

export interface MenuItem {
  id: string
  name: string
  path: string
  icon?: string
  keywords: string[]
  roles: UserRole[] // 'ADMIN', 'Quản lý', 'Nhân viên', 'Bảo vệ', 'Người Dùng'
}

// Cấu hình menu cho từng role
export const menuConfig: MenuItem[] = [
  {
    id: 'user-home',
    name: 'Trang chủ',
    path: '/resident',
    icon: 'home',
    keywords: ['trang chủ', 'home', 'chính', 'dashboard'],
    roles: ['Người Dùng']
  },
  {
    id: 'user-homeProtect',
    name: 'Trang chủ',
    path: '/security',
    icon: 'home',
    keywords: ['trang chủ', 'home', 'chính', 'dashboard'],
    roles: ['Bảo vệ']
  },
  {
    id: 'user-homestaff',
    name: 'Trang chủ',
    path: '/staff',
    icon: 'home',
    keywords: ['trang chủ', 'home', 'chính', 'dashboard'],
    roles: ['Nhân viên']
  },
  {
    id: 'user-homeadmin',
    name: 'Trang chủ',
    path: '/admin',
    icon: 'home',
    keywords: ['trang chủ', 'home', 'chính', 'dashboard'],
    roles: ['ADMIN']
  },
  {
    id: 'qrCode_me',
    name: 'Xem QR cá nhân',
    path: '/viewQrcodeMe',
    icon: 'qr_code',
    keywords: ['qr', 'xem qr', 'qrcode', 'view qrcode'],
    roles: ['Người Dùng']
  },
  {
    id: 'admin-qr-management',
    name: 'Quản lý mã QR',
    path: '/admin/qrcodeAdmin',
    icon: 'qr_code_2',
    keywords: ['qr', 'mã qr', 'quản lý qr', 'qr cư dân', 'qr khách', 'lịch sử quét'],
    roles: ['ADMIN']
  },
  {
    id: 'admin-qr-resident',
    name: 'Quản lý mã QR',
    path: '/resident/qrcode',
    icon: 'qr_code_2',
    keywords: ['qr', 'mã qr', 'quản lý qr', 'qr cư dân', 'qr khách', 'lịch sử quét'],
    roles: ['Người Dùng']
  },
  {
    id: 'admin-qr-access-control',
    name: 'Quét mã QR',
    path: '/scanqr',
    icon: 'qr_code_scanner',
    keywords: ['qr', 'mã qr', 'quét qr', 'qr cư dân', 'qr khách', 'kiểm soát ra vào'],
    roles: ['ADMIN', 'Bảo vệ']
  },
  {
    id: 'history-qrcode-access',
    name: 'Lịch sử ra vào',
    path: '/history/qrcode',
    icon: 'history',
    keywords: ['lịch sử qr', 'lịch sử quét', 'ra vào', 'scan history', 'nhật ký qr', 'kiểm soát ra vào'],
    roles: ['Bảo vệ']
  },
  {
    id: 'security-resident-lookup',
    name: 'Tra cứu cư dân',
    path: '/SecurityResident',
    icon: 'badge',
    keywords: ['cư dân', 'tra cứu cư dân', 'resident', 'thông tin cư dân', 'căn hộ'],
    roles: ['Bảo vệ', 'ADMIN']
  },
  {
    id: 'apartments-lookup',
    name: 'Tra cứu căn hộ',
    path: '/Apartment',
    icon: 'apartment',
    keywords: ['căn hộ', 'tra cứu căn hộ', 'apartment', 'thông tin căn hộ', 'thêm cư dân', 'Thêm mới căn hộ', 'Sửa căn hộ'],
    roles: ['Bảo vệ', 'ADMIN']
  },
  {
    id: 'contracts-lookup',
    name: 'Tra cứu hợp đồng',
    path: '/admin/contractList',
    icon: 'description',
    keywords: ['hợp đồng', 'tra cứu hợp đồng', 'contract', 'thông tin hợp đồng', 'căn hộ', 'Thêm mới hợp đồng'],
    roles: ['ADMIN']
  },
  {
    id: 'amenities-lookup',
    name: 'Tra cứu tiện ích',
    path: '/admin/amenities',
    icon: 'pool',
    keywords: ['tiện ích', 'tra cứu tiện ích', 'amenity', 'thông tin tiện ích', 'tiện ích tòa nhà', 'Thêm mới tiện ích'],
    roles: ['ADMIN']
  },
  {
    id: 'apartments-lookup',
    name: 'Tra cứu căn hộ',
    path: '/MyApartment',
    icon: 'apartment',
    keywords: ['căn hộ', 'tra cứu căn hộ', 'apartment', 'thông tin căn hộ', 'tòa nhà'],
    roles: ['Người Dùng']
  },
  {
    id: 'contracts-lookup',
    name: 'Tra cứu hợp đồng',
    path: '/MyContract',
    icon: 'description',
    keywords: ['hợp đồng', 'tra cứu hợp đồng', 'contract', 'thông tin hợp đồng', 'căn hộ'],
    roles: ['Người Dùng']
  },
  {
    id: 'amenities-lookup',
    name: 'Tra cứu tiện ích',
    path: '/my-amenities',
    icon: 'pool',
    keywords: ['tiện ích', 'tra cứu tiện ích', 'amenity', 'thông tin tiện ích', 'tiện ích tòa nhà'],
    roles: ['Người Dùng']
  },
{
    id: 'building-management',
    name: 'Quản lý tòa nhà',
    path: '/admin/buildings',
    icon: 'apartment',
    keywords: ['tòa nhà', 'building', 'chung cư', 'khu căn hộ', 'block', 'quản lý building'],
    roles: ['ADMIN']
  },
  {
    id: 'utility-meters',
    name: 'Quản lý đồng hồ',
    path: '/admin/utility-meters',
    icon: 'electric_meter',
    keywords: ['đồng hồ', 'công tơ', 'meter', 'chỉ số điện', 'chỉ số nước', 'ghi chỉ số'],
    roles: ['ADMIN']
  },
  {
    id: 'utility-pricing',
    name: 'Quản lý giá tiện ích',
    path: '/admin/utility-pricing',
    icon: 'price_change',
    keywords: ['giá điện', 'giá nước', 'giá dịch vụ', 'utility price', 'pricing', 'đơn giá'],
    roles: ['ADMIN']
  },
  {
    id: 'invoices',
    name: 'Quản lý hóa đơn',
    path: '/admin/invoices',
    icon: 'receipt_long',
    keywords: ['hóa đơn', 'invoice', 'bill', 'biên lai', 'thanh toán hóa đơn'],
    roles: ['ADMIN']
  },
  {
    id: 'payments',
    name: 'Quản lý thanh toán',
    path: '/admin/payments',
    icon: 'payments',
    keywords: ['thanh toán', 'payment', 'trả tiền', 'giao dịch', 'payment history'],
    roles: ['ADMIN']
  },
  {
    id: 'user-utility-pricing',
    name: 'Giá tiện ích',
    path: '/utility-pricing',
    icon: 'sell',
    keywords: ['giá tiện ích', 'giá điện', 'giá nước', 'utility price', 'pricing'],
    roles: ['Người Dùng']
  },
  {
    id: 'user-utility-meters',
    name: 'Đồng hồ của tôi',
    path: '/my-utility-meters',
    icon: 'speed',
    keywords: ['đồng hồ', 'meter', 'công tơ', 'chỉ số điện nước', 'utility meter'],
    roles: ['Người Dùng']
  },
  {
    id: 'user-meter-readings',
    name: 'Chỉ số ghi nhận',
    path: '/my-meter-readings',
    icon: 'insights',
    keywords: ['chỉ số', 'meter reading', 'ghi chỉ số', 'lịch sử tiêu thụ', 'usage history'],
    roles: ['Người Dùng']
  },
  {
    id: 'user-invoices',
    name: 'Hóa đơn',
    path: '/invoices',
    icon: 'receipt_long',
    keywords: ['hóa đơn', 'invoice', 'bill', 'thanh toán hóa đơn'],
    roles: ['Người Dùng']
  },
  {
    id: 'user-payments',
    name: 'Thanh toán',
    path: '/payments',
    icon: 'payments',
    keywords: ['thanh toán', 'payment', 'trả tiền', 'giao dịch'],
    roles: ['Người Dùng']
  },
  {
    id: 'maintenance-request',
    name: 'Gửi yêu cầu bảo trì',
    path: '/resident/GetMaintenanceRequestList',
    icon: 'build',
    keywords: ['bảo trì', 'yêu cầu bảo trì', 'gửi yêu cầu'],
    roles: ['Người Dùng']
  },
  {
    id: 'resident-request',
    name: 'Quản lý yêu cầu cư dân',
    path: '/GetResidentRequestList',
    icon: 'build',
    keywords: ['bảo trì', 'quản lý yêu cầu bảo trì', 'yêu cầu bảo trì', 'quản lý'],
    roles: ['Nhân viên', 'ADMIN', 'Quản lý']
  },
  {
    id: 'resident-management',
    name: 'Quản lý cư dân',
    path: '/Getresidentlist',
    icon: 'people',
    keywords: ['quản lý cư dân', 'quản', 'cư dân'],
    roles: ['ADMIN', 'Quản lý']
  }
]

// Hàm lấy menu theo role (từ roleName hoặc roles array)
export const getMenuByRole = (roleName: UserRole) => {
  return menuConfig.filter((item) => item.roles.includes(roleName))
}

// Hàm tìm kiếm menu items theo từ khóa và role
export const searchMenuByKeyword = (keyword: string, roleName: UserRole) => {
  if (!keyword.trim()) return []

  const normalizedKeyword = keyword.toLowerCase().trim()
  const roleMenus = getMenuByRole(roleName)

  return roleMenus
    .filter((item) => {
      // Tìm kiếm theo tên
      if (item.name.toLowerCase().includes(normalizedKeyword)) return true

      // Tìm kiếm theo từ khóa
      if (item.keywords.some((kw) => kw.toLowerCase().includes(normalizedKeyword))) return true

      // Tìm kiếm theo path
      if (item.path.toLowerCase().includes(normalizedKeyword)) return true

      return false
    })
    .slice(0, 8)
}
