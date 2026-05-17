import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { QRCodeApi } from 'src/apis/QrcodeApi/Qr.api'
import { toast } from 'react-toastify'
import type { QRGuestList } from 'src/types/qrcode.type'
import { useNavigate } from 'react-router-dom'

export default function QrcodeManagement() {
  const navigate = useNavigate()
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    valid_to: '',
    max_entries: 1,
    visitor_name: '',
    visitor_phone: '',
    visitor_id_card: '',
    pin_code: ''
  })

  // Lấy personal QR
  const { data: personalQrData, isLoading: isLoadingPersonal } = useQuery({
    queryKey: ['personal-qr'],
    queryFn: () => QRCodeApi.getQrcodeMe()
  })

  // Lấy danh sách guest QR
  const {
    data: guestQrsData,
    isLoading: isLoadingGuest,
    refetch
  } = useQuery({
    queryKey: ['guest-qrs'],
    queryFn: () => QRCodeApi.getQrGuesrList()
  })

  // Lấy chi tiết guest QR (khi mở modal sửa)
  const { data: guestDetailData } = useQuery({
    queryKey: ['guest-detail', selectedGuestId],
    queryFn: () => QRCodeApi.getDetailQrList(selectedGuestId!),
    enabled: !!selectedGuestId
  })

  // Cập nhật trạng thái (bật/tắt)
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACTIVE' | 'REVOKED' }) => QRCodeApi.PutStatus(id, status),
    onSuccess: () => {
      toast.success('Cập nhật trạng thái thành công')
      refetch()
    },
    onError: () => toast.error('Cập nhật thất bại')
  })

  // Cập nhật thông tin guest QR
  const updateGuestMutation = useMutation({
    mutationFn: ({
      id,
      valid_to,
      max_entries,
      visitor_name,
      visitor_phone,
      visitor_id_card,
      pin_code
    }: {
      id: string
      valid_to: string
      max_entries: number
      visitor_name: string
      visitor_phone: string
      visitor_id_card: string
      pin_code: string
    }) =>
      QRCodeApi.putBodyQRGuest(id, {
        valid_to,
        max_entries,
        visitor_name,
        visitor_phone,
        visitor_id_card,
        pin_code
      }),
    onSuccess: () => {
      toast.success('Cập nhật thành công')
      setIsEditModalOpen(false)
      refetch()
      setSelectedGuestId(null)
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Cập nhật thất bại')
    }
  })

  const personalQr = personalQrData?.data?.data
  const guestList = guestQrsData?.data?.data || []

  const handleToggleStatus = (qr: QRGuestList) => {
    const newStatus = qr.status === 'ACTIVE' ? 'REVOKED' : 'ACTIVE'
    const action = newStatus === 'ACTIVE' ? 'bật' : 'tắt'

    if (window.confirm(`Bạn có chắc muốn ${action} mã QR của khách "${qr.visitor_name || 'chưa có tên'}"?`)) {
      updateStatusMutation.mutate({ id: qr.id, status: newStatus })
    }
  }

  const handleOpenEditModal = (qr: QRGuestList) => {
    setSelectedGuestId(qr.id)
    setEditForm({
      valid_to: qr.valid_to,
      max_entries: qr.max_entries,
      visitor_name: qr.visitor_name || '',
      visitor_phone: qr.visitor_phone || '',
      visitor_id_card: qr.visitor_id_card || '',
      pin_code: qr.pin_code || ''
    })
    setIsEditModalOpen(true)
  }

  const handleSubmitEdit = () => {
    if (!selectedGuestId) return

    updateGuestMutation.mutate({
      id: selectedGuestId,
      valid_to: editForm.valid_to,
      max_entries: editForm.max_entries,
      visitor_name: editForm.visitor_name,
      visitor_phone: editForm.visitor_phone,
      // visitor_id_card: editForm.visitor_id_card
      visitor_id_card: editForm.visitor_id_card,
      pin_code: editForm.pin_code
    })
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '---'
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const handleViewGuestDetail = (qr: QRGuestList) => {
    navigate(`/guest-qr/${qr.id}`)
  }

  const handleViewHistory = (qr: QRGuestList) => {
    navigate(`/guest-qr/${qr.id}`)
  }

  if (isLoadingPersonal || isLoadingGuest) {
    return (
      <div className='flex justify-center items-center min-h-screen bg-surface'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
      </div>
    )
  }

  return (
    <div className='bg-gradient-to-br from-surface via-surface to-surface-container/30 min-h-screen'>
      <main className='max-w-7xl mx-auto px-6 py-12'>
        {/* Personal QR Section - Enhanced */}
        <div className='mb-16'>
          <div className='bg-gradient-to-br from-primary/5 via-surface-container-lowest to-surface-container-lowest rounded-3xl shadow-xl border border-primary/10 overflow-hidden'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 lg:p-12'>
              {/* Left Content */}
              <div className='space-y-6 flex flex-col justify-center'>
                <div>
                  <div className='inline-flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full mb-4'>
                    <span className='material-symbols-outlined text-primary text-sm'>verified</span>
                    <span className='text-[10px] font-bold text-primary uppercase tracking-wider'>Identity Secure</span>
                  </div>
                  <h2 className='text-3xl font-extrabold text-on-surface mb-3'>Mã QR Cá nhân</h2>
                  <p className='text-on-surface-variant leading-relaxed'>
                    Sử dụng mã QR này để truy cập nhanh chóng vào các khu vực tiện ích, cửa chính và thang máy của tòa
                    nhà. Mã QR này được bảo mật và chỉ dành riêng cho bạn.
                  </p>
                </div>

                <div className='flex flex-wrap gap-3'>
                  <button
                    onClick={() => navigate('/viewQrcodeMe')}
                    className='px-6 py-2.5 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:bg-primary-dark transition-all shadow-lg hover:shadow-xl'
                  >
                    <span className='material-symbols-outlined text-base'>visibility</span>
                    Xem chi tiết
                  </button>
                  {personalQr?.qrImage && (
                    <a
                      href={personalQr.qrImage}
                      download='personal-qr.png'
                      className='px-6 py-2.5 bg-surface-container-lowest border border-outline-variant/20 text-on-surface rounded-xl font-bold flex items-center gap-2 hover:bg-surface-container transition-all'
                    >
                      <span className='material-symbols-outlined text-base'>download</span>
                      Tải xuống
                    </a>
                  )}
                </div>

                {/* Status Info */}
                <div className='flex items-center gap-6 pt-4'>
                  <div className='flex items-center gap-2'>
                    <span
                      className={`w-2 h-2 rounded-full ${personalQr?.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}
                    ></span>
                    <span className='text-sm text-on-surface-variant'>
                      Trạng thái:{' '}
                      <span className='font-bold text-on-surface'>
                        {personalQr?.status === 'ACTIVE' ? 'Đang hoạt động' : 'Đã khóa'}
                      </span>
                    </span>
                  </div>
                  {personalQr?.expires_at && (
                    <div className='flex items-center gap-2'>
                      <span className='material-symbols-outlined text-sm text-on-surface-variant'>event</span>
                      <span className='text-sm text-on-surface-variant'>
                        Hết hạn:{' '}
                        <span className='font-medium text-on-surface'>{formatDate(personalQr.expires_at)}</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right QR Display */}
              <div className='flex justify-center items-center'>
                <div className='bg-white p-6 rounded-3xl shadow-2xl relative'>
                  <div className='absolute -top-2 -right-2 w-16 h-16 bg-primary rounded-full blur-2xl opacity-30'></div>
                  <div className='w-56 h-56 bg-surface-container flex items-center justify-center rounded-2xl relative z-10'>
                    {personalQr?.qrImage ? (
                      <img src={personalQr.qrImage} alt='QR Code' className='w-full h-full object-contain' />
                    ) : (
                      <span className='material-symbols-outlined text-primary/20 text-8xl'>qr_code_2</span>
                    )}
                  </div>
                  <div className='mt-4 text-center'>
                    <p className='text-[10px] text-on-surface-variant font-mono bg-surface-container-low px-3 py-1 rounded-full inline-block'>
                      {personalQr?.qr_code?.slice(0, 20)}...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Guest QR Section */}
        <div>
          <div className='flex justify-between items-end mb-8'>
            <div>
              <div className='inline-flex items-center gap-2 bg-secondary/10 px-3 py-1 rounded-full mb-3'>
                <span className='material-symbols-outlined text-secondary text-sm'>group</span>
                <span className='text-[10px] font-bold text-secondary uppercase tracking-wider'>Temporary Access</span>
              </div>
              <h2 className='text-3xl font-extrabold text-on-surface'>Mã QR cho Khách</h2>
              <p className='text-on-surface-variant mt-2'>
                Quản lý mã truy cập tạm thời cho khách thăm, giao hàng và dịch vụ
              </p>
            </div>
            <div className='text-right'>
              <div className='text-2xl font-bold text-primary'>{guestList.length}</div>
              <div className='text-xs text-on-surface-variant uppercase tracking-wide'>Mã QR đã tạo</div>
            </div>
          </div>

          {guestList.length === 0 ? (
            <div className='bg-surface-container-lowest rounded-2xl p-12 text-center border-2 border-dashed border-outline-variant/20'>
              <span className='material-symbols-outlined text-6xl text-on-surface-variant/40 mb-3'>qr_code</span>
              <p className='text-on-surface-variant'>Bạn chưa có mã QR khách nào</p>
              <button className='mt-4 px-6 py-2 bg-primary text-white rounded-xl text-sm font-bold'>
                Tạo mã QR mới
              </button>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
              {guestList.map((qr) => (
                <div
                  key={qr.id}
                  className='group bg-surface-container-lowest rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-outline-variant/10 hover:border-primary/20'
                >
                  {/* Card Header */}
                  <div className='p-5 bg-gradient-to-r from-primary/5 to-transparent border-b border-outline-variant/10'>
                    <div className='flex justify-between items-start'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-2'>
                          <div className='w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center'>
                            <span className='material-symbols-outlined text-primary text-sm'>person</span>
                          </div>
                          <h4 className='font-bold text-on-surface text-base'>{qr.visitor_name || 'Chưa có tên'}</h4>
                        </div>
                        <p className='text-[10px] text-on-surface-variant font-mono'>{qr.qr_code?.slice(0, 16)}...</p>
                      </div>
                      {/* Status Toggle - Nổi bật hơn */}
                      <div className='flex flex-col items-end gap-1'>
                        <button
                          onClick={() => handleToggleStatus(qr)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all shadow-sm ${
                            qr.status === 'ACTIVE'
                              ? 'bg-green-500 text-white hover:bg-green-600'
                              : 'bg-red-500 text-white hover:bg-red-600'
                          }`}
                        >
                          {qr.status === 'ACTIVE' ? 'Đang mở' : 'Đã khóa'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className='p-5 space-y-4'>
                    <div className='grid grid-cols-2 gap-3'>
                      <div>
                        <p className='text-[9px] text-on-surface-variant uppercase tracking-wider mb-1'>Căn hộ</p>
                        <p className='text-sm font-bold text-primary'>{qr.apartment_code || '---'}</p>
                      </div>
                      <div>
                        <p className='text-[9px] text-on-surface-variant uppercase tracking-wider mb-1'>
                          Số điện thoại
                        </p>
                        <p className='text-sm text-on-surface'>{qr.visitor_phone || '---'}</p>
                      </div>
                    </div>

                    <div className='flex items-center justify-between text-xs'>
                      <div className='flex items-center gap-1'>
                        <span className='material-symbols-outlined text-sm text-on-surface-variant'>
                          calendar_today
                        </span>
                        <span className='text-on-surface-variant'>Hết hạn:</span>
                        <span className='font-medium text-on-surface'>{formatDate(qr.valid_to)}</span>
                      </div>
                      <div className='flex items-center gap-1'>
                        <span className='material-symbols-outlined text-sm text-on-surface-variant'>swap_vert</span>
                        <span className='font-medium text-on-surface'>
                          {qr.used_entries}/{qr.max_entries}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className='space-y-1'>
                      <div className='w-full h-1.5 bg-surface-container rounded-full overflow-hidden'>
                        <div
                          className='h-full bg-primary transition-all duration-500'
                          style={{ width: `${(qr.used_entries / qr.max_entries) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className='p-4 bg-surface-container-low/50 border-t border-outline-variant/10 flex gap-2'>
                    <button
                      onClick={() => handleViewGuestDetail(qr)}
                      className='flex-1 py-2 bg-surface-container-lowest rounded-lg text-[11px] font-bold text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-center gap-1'
                    >
                      <span className='material-symbols-outlined text-sm'>visibility</span>
                      Chi tiết
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(qr)}
                      className='flex-1 py-2 bg-surface-container-lowest rounded-lg text-[11px] font-bold text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-center gap-1'
                    >
                      <span className='material-symbols-outlined text-sm'>edit</span>
                      Sửa
                    </button>
                    <button
                      onClick={() => handleViewHistory(qr)}
                      className='flex-1 py-2 bg-surface-container-lowest rounded-lg text-[11px] font-bold text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-center gap-1'
                    >
                      <span className='material-symbols-outlined text-sm'>history</span>
                      Lịch sử
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Edit Modal - Improved */}
      {isEditModalOpen && guestDetailData?.data?.data && (
        <div className='fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn'>
          <div className='bg-surface-container-lowest rounded-2xl max-w-md w-full shadow-2xl animate-slideUp'>
            <div className='p-6 border-b border-outline-variant/10'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center'>
                  <span className='material-symbols-outlined text-primary'>edit</span>
                </div>
                <div>
                  <h2 className='text-xl font-bold text-on-surface'>Cập nhật mã QR</h2>
                  <p className='text-xs text-on-surface-variant'>Chỉnh sửa thông tin mã QR cho khách</p>
                </div>
              </div>
            </div>
            <div className='p-6 space-y-4'>
              <div>
                <label className='block text-xs font-bold text-on-surface uppercase tracking-wider mb-2'>
                  Tên khách
                </label>
                <input
                  type='text'
                  value={editForm.visitor_name}
                  onChange={(e) => setEditForm({ ...editForm, visitor_name: e.target.value })}
                  className='w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/20 rounded-xl focus:outline-none focus:border-primary transition-all'
                  placeholder='Nhập tên khách'
                />
              </div>
              <div>
                <label className='block text-xs font-bold text-on-surface uppercase tracking-wider mb-2'>
                  Số điện thoại
                </label>
                <input
                  type='text'
                  value={editForm.visitor_phone}
                  onChange={(e) => setEditForm({ ...editForm, visitor_phone: e.target.value })}
                  className='w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/20 rounded-xl focus:outline-none focus:border-primary transition-all'
                  placeholder='Nhập số điện thoại'
                />
              </div>

              <div>
                <label className='block text-xs font-bold text-on-surface uppercase tracking-wider mb-2'>CCCD</label>
                <input
                  type='text'
                  value={editForm.visitor_id_card}
                  onChange={(e) => setEditForm({ ...editForm, visitor_id_card: e.target.value })}
                  className='w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/20 rounded-xl focus:outline-none focus:border-primary transition-all'
                  placeholder='Nhập số điện thoại'
                />
              </div>
              <div>
                <label className='block text-xs font-bold text-on-surface uppercase tracking-wider mb-2'>
                  Số lượt tối đa
                </label>
                <input
                  type='number'
                  value={editForm.max_entries}
                  onChange={(e) => setEditForm({ ...editForm, max_entries: parseInt(e.target.value) })}
                  className='w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/20 rounded-xl focus:outline-none focus:border-primary transition-all'
                  min={1}
                />
              </div>
              <div>
                <label className='block text-xs font-bold text-on-surface uppercase tracking-wider mb-2'>
                  Thời hạn
                </label>
                <input
                  type='date'
                  value={editForm.valid_to ? new Date(editForm.valid_to).toISOString().slice(0, 10) : ''}
                  onChange={(e) => setEditForm({ ...editForm, valid_to: new Date(e.target.value).toISOString() })}
                  className='w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/20 rounded-xl focus:outline-none focus:border-primary transition-all'
                />
              </div>
              <div>
                <label className='block text-xs font-bold text-on-surface uppercase tracking-wider mb-2'>Mã PIN</label>
                <input
                  type='text'
                  value={editForm.pin_code}
                  onChange={(e) => setEditForm({ ...editForm, pin_code: e.target.value })}
                  className='w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/20 rounded-xl focus:outline-none focus:border-primary transition-all'
                  placeholder='Nhập mã PIN'
                />
              </div>
            </div>
            <div className='p-6 border-t border-outline-variant/10 flex justify-end gap-3'>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className='px-5 py-2.5 bg-surface-container-low rounded-xl text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-all'
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitEdit}
                className='px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark transition-all shadow-lg'
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
