import React, { useContext, useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { QRCodeApi } from 'src/apis/QrcodeApi/Qr.api'
import type { Qrcodes, BodyCreateQrcode } from 'src/types/qrcode.type'
import { useNavigate } from 'react-router-dom'
import { AppContext } from 'src/contexts/app.context'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import Input from 'src/components/Input'

// Schema validation
const createQrSchema = yup.object({
  visitorName: yup.string().required('Vui lòng nhập tên khách'),
  visitorPhone: yup
    .string()
    .matches(/^[0-9]+$/, 'Số điện thoại chỉ chứa số')
    .min(10, 'Số điện thoại phải có ít nhất 10 số')
    .max(11, 'Số điện thoại tối đa 11 số')
    .required('Vui lòng nhập số điện thoại'),
  visitorIdCard: yup.string().optional(),
  validFrom: yup.string().required('Vui lòng chọn ngày bắt đầu'),
  validTo: yup.string().required('Vui lòng chọn ngày kết thúc'),
  maxEntries: yup.number().min(1, 'Ít nhất 1 lượt').max(100, 'Tối đa 100 lượt')
})

type CreateQrFormData = yup.InferType<typeof createQrSchema>

export default function QrcodeManagement() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isMultipleEntries, setIsMultipleEntries] = useState(false)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [selectedQr, setSelectedQr] = useState<Qrcodes | null>(null)
  const { user } = useContext(AppContext)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(createQrSchema),
    defaultValues: {
      visitorName: '',
      visitorPhone: '',
      validFrom: new Date().toISOString().slice(0, 16),
      validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      maxEntries: 1
    }
  })

  const maxEntries = watch('maxEntries')

  // Lấy danh sách guest QR
  const { data: qrListData, refetch } = useQuery({
    queryKey: ['guest-qr-list'],
    queryFn: () => QRCodeApi.getGuestQrList()
  })

  const guestQrs: Qrcodes[] = qrListData?.data?.data?.data || []

  const activeCount = guestQrs.filter((qr: Qrcodes) => qr.isActive && qr.maxEntries !== qr.usedEntries).length
  // Cách 1: So sánh theo ngày (bỏ qua giờ phút)
  const expiredToday = guestQrs.filter((qr: Qrcodes) => {
    // if (!qr.isActive) return
    const daynow = new Date()
    const day = new Date(qr.validTo)
    return daynow >= day
  }).length

  const updateQrMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) => QRCodeApi.updateGuestQr(id, body),
    onSuccess: () => {
      toast.success('Cập nhật mã QR thành công!')
      setIsUpdateModalOpen(false)
      setSelectedQr(null)
      refetch()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Cập nhật mã QR thất bại')
    }
  })

  // Hàm mở modal update
  const handleOpenUpdateModal = (qr: Qrcodes) => {
    setSelectedQr(qr)
    setIsUpdateModalOpen(true)
  }

  // Format datetime-local cho input
  const formatDateTimeLocal = (dateString: string) => {
    const date = new Date(dateString)
    return date.toISOString().slice(0, 16)
  }

  // Submit update
  const onSubmitUpdate = (data: any) => {
    if (!selectedQr) return

    const updateData = {
      visitorName: data.visitorName,
      visitorPhone: data.visitorPhone,
      visitorIdCard: data.visitorIdCard || '',
      validFrom: new Date(data.validFrom).toISOString(),
      validTo: new Date(data.validTo).toISOString(),
      maxEntries: data.maxEntries,
      status: data.status
    }

    updateQrMutation.mutate({ id: selectedQr.id, body: updateData })
  }

  // Mutation tạo QR
  const createQrMutation = useMutation({
    mutationFn: (body: BodyCreateQrcode) => QRCodeApi.createGuestQr(body),
    onSuccess: () => {
      toast.success('Tạo mã QR thành công!')
      setIsCreateModalOpen(false)
      reset()
      refetch()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Tạo mã QR thất bại')
    }
  })

  // Mutation thu hồi QR
  const revokeMutation = useMutation({
    mutationFn: (id: string) => QRCodeApi.deleteGuestQr(id),
    onSuccess: () => {
      toast.success('Đã thu hồi mã QR thành công')
      refetch()
    },
    onError: () => {
      toast.error('Thu hồi thất bại')
    }
  })

  const handleRevoke = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn thu hồi mã QR này?')) {
      revokeMutation.mutate(id)
    }
  }

  const handleViewDetail = (id: string) => {
    navigate(`/qrcodeDetail/${id}`)
  }

  const handleEntryTypeChange = (multiple: boolean) => {
    setIsMultipleEntries(multiple)
    setValue('maxEntries', multiple ? 5 : 1)
  }

  const handleMaxEntriesChange = (increment: boolean) => {
    const newValue = increment ? maxEntries + 1 : Math.max(1, maxEntries - 1)
    setValue('maxEntries', newValue)
  }

  const onSubmit = (data: CreateQrFormData) => {
    const submitData: BodyCreateQrcode = {
      visitorName: data.visitorName,
      visitorPhone: data.visitorPhone,
      visitorIdCard: data.visitorIdCard || '',
      apartmentId: 1,
      validFrom: new Date(data.validFrom),
      validTo: new Date(data.validTo),
      maxEntries: data.maxEntries || 1
    }
    createQrMutation.mutate(submitData)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} - ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
  }

  const getStatusBadge = (qr: Qrcodes) => {
    if (qr.isRevoked) {
      return (
        <span className='px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-100 text-red-700'>
          REVOKED
        </span>
      )
    }
    if (qr.isExpired) {
      return (
        <span className='px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-200 text-slate-500'>
          EXPIRED
        </span>
      )
    }
    const currentDate = new Date()
    const validToDate = new Date(qr.validTo)
    if (qr.isActive && validToDate > currentDate) {
      return (
        <span className='px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-100 text-green-700'>
          ACTIVE
        </span>
      )
    }
    return (
      <span className='px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-200 text-slate-500'>
        {qr.status}
      </span>
    )
  }

  const getUsagePercent = (qr: Qrcodes) => {
    if (qr.maxEntries === 0) return 0
    return (qr.usedEntries / qr.maxEntries) * 100
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen font-['Manrope',sans-serif]">
      <div className='pb-20 px-6 lg:px-12 w-full max-w-7xl mx-auto'>
        {/* Welcome Header */}
        <div className='mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6'>
          <div>
            <h2 className='text-4xl font-extrabold text-on-surface tracking-tight'>Xin chào, {user?.name || 'User'}</h2>
            <p className='text-on-surface-variant mt-2 max-w-md'>
              Quản lý mã QR truy cập cho khách ghé thăm tại căn hộ của bạn.
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className='px-8 py-4 bg-gradient-to-br from-primary to-primary-container text-white rounded-full font-bold flex items-center gap-3 shadow-lg shadow-primary/20 active:scale-95 transition-all'
          >
            <span className='material-symbols-outlined'>qr_code_2_add</span>
            Tạo mã QR mới
          </button>
        </div>

        {/* Bento Stats Grid */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-12'>
          <div className='col-span-1 md:col-span-2 bg-surface-container-lowest p-6 rounded-3xl flex items-center justify-between shadow-sm border-0'>
            <div>
              <p className='text-on-surface-variant text-sm font-medium'>Mã QR đang hoạt động</p>
              <p className='text-5xl font-black text-on-surface mt-2'>{activeCount}</p>
            </div>
            <div className='h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary'>
              <span className='material-symbols-outlined text-4xl'>sensors</span>
            </div>
          </div>
          <div className='bg-surface-container-low p-6 rounded-3xl shadow-sm'>
            <p className='text-on-surface-variant text-sm font-medium'>QR Hết hạn</p>
            <p className='text-3xl font-bold text-on-surface mt-2'>{expiredToday}</p>
            <div className='mt-4 flex items-center gap-1 text-error text-xs font-bold uppercase tracking-tighter'>
              <span className='material-symbols-outlined text-sm'>schedule</span>
              Cần gia hạn
            </div>
          </div>
          <div className='bg-surface-container-low p-6 rounded-3xl shadow-sm'>
            <p className='text-on-surface-variant text-sm font-medium'>Tổng lượt vào tuần này</p>
            <p className='text-3xl font-bold text-on-surface mt-2'>
              {guestQrs.reduce((sum: number, qr: Qrcodes) => sum + qr.usedEntries, 0)}
            </p>
            <div className='mt-4 flex items-center gap-1 text-primary text-xs font-bold uppercase tracking-tighter'>
              <span className='material-symbols-outlined text-sm'>trending_up</span>
              Lượt truy cập
            </div>
          </div>
        </div>

        {/* QR List Section */}
        <section className='bg-surface-container-lowest rounded-[2rem] overflow-hidden shadow-sm'>
          <div className='p-8 border-b border-surface-container flex items-center justify-between flex-wrap gap-4'>
            <h3 className='text-xl font-bold text-on-surface'>Danh sách mã QR khách</h3>
            <div className='flex items-center gap-3 bg-surface-container-low px-4 py-2 rounded-full'>
              <span className='material-symbols-outlined text-slate-400'>search</span>
              <input
                className='bg-transparent border-none focus:ring-0 text-sm text-on-surface w-48'
                placeholder='Tìm kiếm tên khách...'
                type='text'
              />
            </div>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full text-left border-collapse'>
              <thead>
                <tr className='bg-surface-container-low/50'>
                  <th className='px-8 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-wider'>
                    Tên khách / SĐT
                  </th>
                  <th className='px-8 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-wider'>
                    Mã QR
                  </th>
                  <th className='px-8 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-center'>
                    Số lượt vào
                  </th>
                  <th className='px-8 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-wider'>
                    Thời gian hiệu lực
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
                {guestQrs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className='px-8 py-12 text-center text-on-surface-variant'>
                      Chưa có mã QR nào. Hãy tạo mã QR đầu tiên!
                    </td>
                  </tr>
                ) : (
                  guestQrs.map((qr: Qrcodes) => (
                    <tr key={qr.id} className='hover:bg-slate-50 transition-colors group'>
                      <td className='px-8 py-6'>
                        <div className='font-bold text-on-surface'>{qr.visitor.name}</div>
                        <div className='text-xs text-on-surface-variant opacity-70'>{qr.visitor.phone}</div>
                      </td>
                      <td className='px-8 py-6'>
                        <div className='flex items-center gap-2 text-primary font-mono text-sm bg-primary/5 px-3 py-1 rounded-lg w-fit'>
                          <span className='material-symbols-outlined text-sm'>qr_code_2</span>
                          {qr.qrCode.slice(-8)}
                        </div>
                      </td>
                      <td className='px-8 py-6 text-center'>
                        <div className='text-sm font-bold text-on-surface'>
                          {qr.usedEntries}/{qr.maxEntries}
                        </div>
                        <div className='w-16 h-1.5 bg-surface-container rounded-full mx-auto mt-2'>
                          <div
                            className='h-full bg-primary rounded-full transition-all'
                            style={{ width: `${getUsagePercent(qr)}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className='px-8 py-6 text-sm text-on-surface-variant'>{formatDate(qr.validTo)}</td>
                      <td className='px-8 py-6'>{getStatusBadge(qr)}</td>
                      <td className='px-8 py-6 text-right'>
                        <div className='flex justify-end gap-2'>
                          <button
                            onClick={() => handleViewDetail(qr.id)}
                            className='p-2 text-primary hover:bg-primary/10 rounded-xl transition-all'
                            title='Xem chi tiết'
                          >
                            <span className='material-symbols-outlined'>visibility</span>
                          </button>

                          <button
                            onClick={() => handleOpenUpdateModal(qr)}
                            className='p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all'
                            title='Chỉnh sửa'
                          >
                            <span className='material-symbols-outlined'>edit</span>
                          </button>

                          <button
                            onClick={() => handleRevoke(qr.id)}
                            className='p-2 text-error hover:bg-error/10 rounded-xl transition-all'
                            title='Thu hồi'
                          >
                            <span className='material-symbols-outlined'>block</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* FAB for Mobile */}
      <button
        onClick={() => setIsCreateModalOpen(true)}
        className='lg:hidden fixed bottom-24 right-6 h-16 w-16 bg-primary text-white rounded-full shadow-2xl shadow-primary/40 flex items-center justify-center z-50 active:scale-90 transition-transform'
      >
        <span className='material-symbols-outlined text-3xl'>qr_code_2_add</span>
      </button>

      {/* Modal Tạo QR */}
      {isCreateModalOpen && (
        <div className='fixed inset-0 bg-on-secondary-container/10 backdrop-blur-sm z-[60] flex items-center justify-center p-4'>
          <div className='w-full max-w-2xl bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_32px_64px_0_rgba(68,93,128,0.08)] relative'>
            {/* Modal Header */}
            <div className='px-8 pt-8 pb-6 border-b border-outline-variant/10'>
              <div className='flex justify-between items-start'>
                <div>
                  <span className='text-[10px] font-bold tracking-[0.15em] text-primary uppercase mb-1 block'>
                    Homelink AI • Secure Access
                  </span>
                  <h3 className='text-2xl font-extrabold text-on-surface tracking-tight'>Create Guest QR</h3>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className='w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high transition-colors'
                >
                  <span className='material-symbols-outlined'>close</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Modal Content */}
              <div className='px-8 py-6 space-y-8'>
                {/* AI Insight Chip */}
                <div className='bg-secondary-fixed/30 rounded-full px-4 py-2 flex items-center gap-3'>
                  <span className='material-symbols-outlined text-on-secondary-fixed-variant text-sm'>
                    auto_awesome
                  </span>
                  <p className='text-xs font-medium text-on-secondary-fixed-variant'>
                    AI is ready to generate an encrypted high-security QR link.
                  </p>
                </div>

                <div className='grid grid-cols-2 gap-x-8 gap-y-6'>
                  {/* Visitor Name */}
                  <div className='col-span-2 sm:col-span-1'>
                    <label className='block text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-2'>
                      Visitor Name
                    </label>
                    <Input
                      register={register}
                      name='visitorName'
                      errorMassage={errors.visitorName?.message}
                      classNameInput='w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:bg-surface-container-lowest transition-all placeholder:text-outline/50'
                      placeholder='e.g. Julianne Moore'
                      type='text'
                    />
                  </div>

                  {/* Visitor Phone */}
                  <div className='col-span-2 sm:col-span-1'>
                    <label className='block text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-2'>
                      Visitor Phone
                    </label>
                    <Input
                      register={register}
                      name='visitorPhone'
                      errorMassage={errors.visitorPhone?.message}
                      classNameInput='w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:bg-surface-container-lowest transition-all placeholder:text-outline/50'
                      placeholder='+84 000 000 000'
                      type='tel'
                    />
                  </div>

                  {/* Identification ID */}
                  <div className='col-span-2'>
                    <label className='block text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-2'>
                      visitor IdCard
                    </label>
                    <Input
                      register={register}
                      name='visitorIdCard'
                      errorMassage={errors.visitorIdCard?.message}
                      classNameInput='w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:bg-surface-container-lowest transition-all placeholder:text-outline/50'
                      placeholder='Passport or National ID number'
                      type='text'
                    />
                  </div>

                  {/* Validity Period */}
                  <div className='col-span-2 grid grid-cols-2 gap-4 p-5 bg-surface-container-low rounded-xl border border-outline-variant/5'>
                    <div className='col-span-2 mb-2'>
                      <label className='text-[10px] font-bold tracking-widest text-on-surface-variant uppercase'>
                        Validity Period
                      </label>
                    </div>
                    <div>
                      <span className='block text-[9px] font-medium text-outline mb-1'>Valid From</span>
                      <Input
                        register={register}
                        name='validFrom'
                        errorMassage={errors.validFrom?.message}
                        classNameInput='w-full bg-surface-container-lowest border-none rounded-md px-3 py-2 text-xs focus:ring-1 focus:ring-primary'
                        type='datetime-local'
                      />
                    </div>
                    <div>
                      <span className='block text-[9px] font-medium text-outline mb-1'>Valid To</span>
                      <Input
                        register={register}
                        name='validTo'
                        errorMassage={errors.validTo?.message}
                        classNameInput='w-full bg-surface-container-lowest border-none rounded-md px-3 py-2 text-xs focus:ring-1 focus:ring-primary'
                        type='datetime-local'
                      />
                    </div>
                  </div>

                  {/* Entry Permissions */}
                  <div className='col-span-2'>
                    <label className='block text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-3'>
                      Entry Permissions
                    </label>
                    <div className='flex items-center gap-6'>
                      <label className='flex items-center gap-3 cursor-pointer group'>
                        <div
                          onClick={() => handleEntryTypeChange(false)}
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            !isMultipleEntries ? 'border-primary bg-primary' : 'border-outline-variant'
                          }`}
                        >
                          {!isMultipleEntries && <div className='w-1.5 h-1.5 rounded-full bg-white'></div>}
                        </div>
                        <span
                          className={`text-sm font-medium ${!isMultipleEntries ? 'text-on-surface' : 'text-on-surface-variant'}`}
                        >
                          Single Entry
                        </span>
                      </label>
                      <label className='flex items-center gap-3 cursor-pointer group'>
                        <div
                          onClick={() => handleEntryTypeChange(true)}
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            isMultipleEntries ? 'border-primary bg-primary' : 'border-outline-variant'
                          }`}
                        >
                          {isMultipleEntries && <div className='w-1.5 h-1.5 rounded-full bg-white'></div>}
                        </div>
                        <span
                          className={`text-sm font-medium ${isMultipleEntries ? 'text-on-surface' : 'text-on-surface-variant'}`}
                        >
                          Multiple Entries
                        </span>
                      </label>
                      {isMultipleEntries && (
                        <div className='flex-1 flex justify-end'>
                          <div className='flex items-center bg-surface-container-low rounded-lg px-2'>
                            <button
                              type='button'
                              onClick={() => handleMaxEntriesChange(false)}
                              className='w-8 h-8 flex items-center justify-center text-on-surface-variant'
                            >
                              <span className='material-symbols-outlined text-base'>remove</span>
                            </button>
                            <span className='px-4 text-sm font-bold text-on-surface'>{maxEntries}</span>
                            <button
                              type='button'
                              onClick={() => handleMaxEntriesChange(true)}
                              className='w-8 h-8 flex items-center justify-center text-primary'
                            >
                              <span className='material-symbols-outlined text-base'>add</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className='px-8 pb-8 pt-4 flex items-center justify-end gap-4'>
                <button
                  type='button'
                  onClick={() => setIsCreateModalOpen(false)}
                  className='px-8 py-3 text-sm font-bold text-primary hover:bg-primary/5 rounded-full transition-all active:scale-95'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={createQrMutation.isPending}
                  className='px-10 py-3 bg-gradient-to-br from-primary to-primary-container text-white text-sm font-bold rounded-full shadow-lg shadow-primary/20 hover:brightness-110 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50'
                >
                  <span className='material-symbols-outlined text-lg'>qr_code_scanner</span>
                  {createQrMutation.isPending ? 'Đang tạo...' : 'Generate Access QR'}
                </button>
              </div>
            </form>

            {/* Glass Accent Decoration */}
            <div className='absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none'></div>
            <div className='absolute -bottom-24 -left-24 w-48 h-48 bg-secondary-fixed/10 rounded-full blur-3xl pointer-events-none'></div>
          </div>
        </div>
      )}

      {/* Modal Update QR */}
      {isUpdateModalOpen && selectedQr && (
        <div className='fixed inset-0 bg-on-secondary-container/10 backdrop-blur-sm z-[60] flex items-center justify-center p-4'>
          <div className='w-full max-w-2xl bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_32px_64px_0_rgba(68,93,128,0.08)] relative'>
            {/* Modal Header */}
            <div className='px-8 pt-8 pb-6 border-b border-outline-variant/10'>
              <div className='flex justify-between items-start'>
                <div>
                  <span className='text-[10px] font-bold tracking-[0.15em] text-primary uppercase mb-1 block'>
                    Homelink AI • Update Access
                  </span>
                  <h3 className='text-2xl font-extrabold text-on-surface tracking-tight'>Cập nhật mã QR</h3>
                </div>
                <button
                  onClick={() => {
                    setIsUpdateModalOpen(false)
                    setSelectedQr(null)
                  }}
                  className='w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high transition-colors'
                >
                  <span className='material-symbols-outlined'>close</span>
                </button>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const data = {
                  visitorName: formData.get('visitorName'),
                  visitorPhone: formData.get('visitorPhone'),
                  visitorIdCard: formData.get('visitorIdCard'),
                  validFrom: formData.get('validFrom'),
                  validTo: formData.get('validTo'),
                  maxEntries: Number(formData.get('maxEntries')),
                  status: formData.get('status')
                }
                onSubmitUpdate(data)
              }}
            >
              {/* Modal Content */}
              <div className='px-8 py-6 space-y-8'>
                <div className='grid grid-cols-2 gap-x-8 gap-y-6'>
                  {/* Visitor Name */}
                  <div className='col-span-2 sm:col-span-1'>
                    <label className='block text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-2'>
                      Tên khách
                    </label>
                    <input
                      name='visitorName'
                      defaultValue={selectedQr.visitor.name}
                      className='w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:bg-surface-container-lowest transition-all'
                      placeholder='Nhập tên khách'
                      required
                    />
                  </div>

                  {/* Visitor Phone */}
                  <div className='col-span-2 sm:col-span-1'>
                    <label className='block text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-2'>
                      Số điện thoại
                    </label>
                    <input
                      name='visitorPhone'
                      defaultValue={selectedQr.visitor.phone}
                      className='w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:bg-surface-container-lowest transition-all'
                      placeholder='Nhập số điện thoại'
                      required
                    />
                  </div>

                  {/* Identification ID */}
                  <div className='col-span-2'>
                    <label className='block text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-2'>
                      CMND/CCCD
                    </label>
                    <input
                      name='visitorIdCard'
                      defaultValue={selectedQr.visitor.idCard || ''}
                      className='w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:bg-surface-container-lowest transition-all'
                      placeholder='Số CMND/CCCD (không bắt buộc)'
                    />
                  </div>

                  {/* Validity Period */}
                  <div className='col-span-2 grid grid-cols-2 gap-4 p-5 bg-surface-container-low rounded-xl border border-outline-variant/5'>
                    <div className='col-span-2 mb-2'>
                      <label className='text-[10px] font-bold tracking-widest text-on-surface-variant uppercase'>
                        Thời gian hiệu lực
                      </label>
                    </div>
                    <div>
                      <span className='block text-[9px] font-medium text-outline mb-1'>Từ ngày</span>
                      <input
                        name='validFrom'
                        type='datetime-local'
                        defaultValue={formatDateTimeLocal(selectedQr.validFrom)}
                        className='w-full bg-surface-container-lowest border-none rounded-md px-3 py-2 text-xs focus:ring-1 focus:ring-primary'
                        required
                      />
                    </div>
                    <div>
                      <span className='block text-[9px] font-medium text-outline mb-1'>Đến ngày</span>
                      <input
                        name='validTo'
                        type='datetime-local'
                        defaultValue={formatDateTimeLocal(selectedQr.validTo)}
                        className='w-full bg-surface-container-lowest border-none rounded-md px-3 py-2 text-xs focus:ring-1 focus:ring-primary'
                        required
                      />
                    </div>
                  </div>

                  {/* Max Entries */}
                  <div className='col-span-2'>
                    <label className='block text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-2'>
                      Số lượt tối đa
                    </label>
                    <input
                      name='maxEntries'
                      type='number'
                      min='1'
                      max='100'
                      defaultValue={selectedQr.maxEntries}
                      className='w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:bg-surface-container-lowest transition-all'
                      required
                    />
                  </div>

                  {/* Status */}
                  <div className='col-span-2'>
                    <label className='block text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-2'>
                      Trạng thái
                    </label>
                    <select
                      name='status'
                      defaultValue={selectedQr.status}
                      className='w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:bg-surface-container-lowest transition-all'
                    >
                      <option value='ACTIVE'>✅ Đang hoạt động</option>
                      <option value='EXPIRED'>⏰ Đã hết hạn</option>
                      <option value='REVOKED'>🔒 Đã thu hồi</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className='px-8 pb-8 pt-4 flex items-center justify-end gap-4'>
                <button
                  type='button'
                  onClick={() => {
                    setIsUpdateModalOpen(false)
                    setSelectedQr(null)
                  }}
                  className='px-8 py-3 text-sm font-bold text-primary hover:bg-primary/5 rounded-full transition-all'
                >
                  Hủy
                </button>
                <button
                  type='submit'
                  disabled={updateQrMutation.isPending}
                  className='px-10 py-3 bg-gradient-to-br from-blue-500 to-blue-700 text-white text-sm font-bold rounded-full shadow-lg shadow-blue-500/20 hover:brightness-110 transition-all flex items-center gap-2 disabled:opacity-50'
                >
                  <span className='material-symbols-outlined text-lg'>save</span>
                  {updateQrMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật'}
                </button>
              </div>
            </form>

            {/* Glass Accent Decoration */}
            <div className='absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none'></div>
            <div className='absolute -bottom-24 -left-24 w-48 h-48 bg-secondary-fixed/10 rounded-full blur-3xl pointer-events-none'></div>
          </div>
        </div>
      )}
    </div>
  )
}
