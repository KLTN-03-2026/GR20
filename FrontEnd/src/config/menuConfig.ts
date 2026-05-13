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
    path: '/residents',
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
