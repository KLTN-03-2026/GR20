import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { residentApi } from 'src/apis/resident_api/residents.api'
import { buildingApi } from 'src/apis/building_api/buildings.api'
import { toast } from 'react-toastify'


export default function Addresident() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    userId: '',
    apartmentId: '',
    relationship: 'FAMILY',
    moveInDate: ''
  })

  // Lấy danh sách tòa nhà để hiển thị (có thể mở rộng để lấy danh sách căn hộ)
  const { data: buildingsData } = useQuery({
    queryKey: ['buildings'],
    queryFn: () => buildingApi.getAllBuildings()
  })

  const buildings = buildingsData?.data.data || []

  // Mutation để thêm cư dân
  const createMutation = useMutation({
    mutationFn: (data: any) => residentApi.createResident(data),
    onSuccess: (response) => {
      toast.success('Thêm cư dân thành công')
      navigate('/residents')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Thêm cư dân thất bại')
    }
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate
    if (!formData.userId) {
      toast.error('Vui lòng nhập User ID')
      return
    }
    if (!formData.apartmentId) {
      toast.error('Vui lòng nhập Apartment ID')
      return
    }
    if (!formData.moveInDate) {
      toast.error('Vui lòng chọn ngày dời đến')
      return
    }

    createMutation.mutate({
      userId: parseInt(formData.userId),
      apartmentId: parseInt(formData.apartmentId),
      relationship: formData.relationship,
      moveInDate: formData.moveInDate
    })
  }

  const handleCancel = () => {
    navigate('/residents')
  }

  return (
    <div className="bg-surface text-on-surface antialiased">
      {/* Main Content */}
      <main className="pl-72 pt-20 min-h-screen">
        <div className="max-w-5xl mx-auto px-10 py-12">
          {/* Header */}
          <header className="mb-10">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                {/* <span className="material-symbols-outlined">arrow_back</span> */}
              </button>
              <div>
                <h1 className="text-4xl font-extrabold tracking-tight mb-2">
                  Thêm Cư dân mới
                </h1>
                <p className="text-on-surface-variant max-w-2xl">
                  Cung cấp thông tin chi tiết để khởi tạo hồ sơ cư dân.
                </p>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl p-10 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* User ID */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                      User ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="userId"
                      value={formData.userId}
                      onChange={handleChange}
                      placeholder="Nhập User ID (ví dụ: 5)"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      ID của người dùng đã có trong hệ thống
                    </p>
                  </div>

                  {/* Apartment ID */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                      Apartment ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="apartmentId"
                      value={formData.apartmentId}
                      onChange={handleChange}
                      placeholder="Nhập Apartment ID (ví dụ: 2)"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      ID của căn hộ muốn thêm cư dân
                    </p>
                  </div>

                  {/* Relationship */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                      Mối quan hệ <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="relationship"
                      value={formData.relationship}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="OWNER">Chủ hộ (OWNER)</option>
                      <option value="FAMILY">Người thân (FAMILY)</option>
                      <option value="TENANT">Người thuê (TENANT)</option>
                    </select>
                  </div>

                  {/* Move In Date */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                      Ngày dời đến <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="moveInDate"
                      value={formData.moveInDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  {/* Example Data */}
                  {/* <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-sm font-semibold text-blue-800 mb-2">📝 Ví dụ dữ liệu mẫu:</p>
                    <pre className="text-xs text-blue-700 bg-blue-100 p-3 rounded-lg overflow-x-auto">
                      {`{
                        "userId": 5,
                        "apartmentId": 2,
                        "relationship": "FAMILY",
                        "moveInDate": "2026-02-01"
                      }`}
                    </pre>
                  </div> */}

                  {/* Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={createMutation.isPending}
                      className="flex-1 py-3 bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-xl font-semibold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {createMutation.isPending ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Đang xử lý...
                        </span>
                      ) : (
                        'Thêm Cư dân'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  {/* <span className="material-symbols-outlined text-blue-500">info</span> */}
                  <h3 className="font-bold text-gray-800">Thông tin</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <p className="text-gray-600">
                    <span className="font-semibold">ID:</span> Tự động tạo
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold">Trạng thái:</span>{' '}
                    <span className="text-green-600">ACTIVE</span> (mặc định)
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold">Ngày tạo:</span> Tự động
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-symbols-outlined text-blue-500">tips_and_updates</span>
                  <h3 className="font-bold text-gray-800">Lưu ý</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex gap-2">
                    <span className="text-blue-500">•</span>
                    User ID phải tồn tại trong hệ thống
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-500">•</span>
                    Apartment ID phải hợp lệ
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-500">•</span>
                    Mỗi user chỉ được thêm 1 lần/căn hộ
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-500">•</span>
                    Ngày dời đến không được trong tương lai xa
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  )
}