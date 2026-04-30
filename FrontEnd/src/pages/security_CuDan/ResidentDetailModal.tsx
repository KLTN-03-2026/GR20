import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { SecurityApi } from 'src/apis/Security_api/security.api'

export default function ResidentDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: residentResponse, isLoading } = useQuery({
    queryKey: ['residentDetail', id],
    queryFn: () => SecurityApi.getResidentDetail(id),
    enabled: !!id
  })

  // Vì getResidentDetail trả về SuccessResponseApi<ResidentDetail>
  // Nên residentResponse?.data là ResidentDetail
  const resident = residentResponse?.data.data

  // console.log(resident.contracts)

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật'
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Chưa có'
    return new Date(dateString).toLocaleString('vi-VN')
  }

  const getGenderLabel = (gender) => {
    if (gender === 'MALE') return 'Nam'
    if (gender === 'FEMALE') return 'Nữ'
    return 'Khác'
  }

  const getAvatarUrl = () => {
    if (resident?.personalInfo.avatarUrl) return resident.personalInfo.avatarUrl
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(resident?.personalInfo?.fullName || 'User')}&background=005ab7&color=fff&size=200`
  }

  if (isLoading) {
    return (
      <div className='bg-surface min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
          <p className='mt-4 text-on-surface-variant'>Đang tải thông tin cư dân...</p>
        </div>
      </div>
    )
  }

  if (!resident) {
    return (
      <div className='bg-surface min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-on-surface-variant'>Không tìm thấy thông tin cư dân</p>
          <button
            onClick={() => navigate('/security/residents')}
            className='mt-4 px-6 py-2 bg-primary text-white rounded-lg'
          >
            Quay lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='bg-surface min-h-screen'>
      <div className='max-w-7xl mx-auto px-8 py-8'>
        {/* Hero Section: Asymmetric Layout - REDESIGNED */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12'>
          {/* Left Column - Thông tin chính */}
          <div className='lg:col-span-7 flex flex-col justify-center'>
            {/* Status Badge */}
            <div className='inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant text-[11px] font-bold uppercase tracking-widest mb-6 w-fit shadow-sm'>
              <span
                className={`w-2 h-2 rounded-full ${resident.residenceInfo?.status === 'ACTIVE' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}
              ></span>
              {resident.residenceInfo?.status === 'ACTIVE' ? 'ĐANG CƯ TRÚ' : 'ĐÃ CHUYỂN ĐI'}
            </div>

            {/* Resident Name */}
            <h2 className='text-5xl lg:text-6xl font-extrabold text-on-surface tracking-tight leading-tight mb-4'>
              {resident.personalInfo?.fullName}
            </h2>

            {/* Resident Meta Info */}
            <div className='flex flex-wrap items-center gap-4 mb-6'>
              <div className='flex items-center gap-2 px-3 py-1.5 bg-surface-container-low rounded-full'>
                <span className='material-symbols-outlined text-primary text-sm'>badge</span>
                <span className='text-sm font-medium text-on-surface-variant'>
                  Mã số: <span className='font-bold text-on-surface'>{resident.personalInfo?.id}</span>
                </span>
              </div>
              <div className='flex items-center gap-2 px-3 py-1.5 bg-surface-container-low rounded-full'>
                <span className='material-symbols-outlined text-primary text-sm'>event_available</span>
                <span className='text-sm font-medium text-on-surface-variant'>
                  Cư dân từ:{' '}
                  <span className='font-bold text-on-surface'>{formatDate(resident.residenceInfo?.moveInDate)}</span>
                </span>
              </div>
            </div>

            {/* Description */}
            <p className='text-on-surface-variant text-base leading-relaxed mb-8 max-w-xl'>
              Cư dân đang sinh sống tại {resident.residenceInfo?.buildingName}, căn hộ{' '}
              {resident.residenceInfo?.apartmentCode} (Tầng {resident.residenceInfo?.floorNumber}).
              {resident.familyMembers?.length > 0 &&
                ` Hiện đang sinh sống cùng ${resident.familyMembers.length} thành viên khác.`}
            </p>

            {/* Action Buttons */}
            <div className='flex flex-wrap gap-4'>
              <button
                onClick={() => navigate('/security/residents')}
                className='px-6 py-2.5 bg-surface-container-lowest text-primary rounded-full font-semibold text-sm border border-outline-variant/20 transition-all hover:bg-surface-container-low active:scale-95 flex items-center gap-2'
              >
                <span className='material-symbols-outlined text-sm'>arrow_back</span>
                Quay lại danh sách
              </button>
              {/* <button
                onClick={handleGrantAccess}
                className='px-6 py-2.5 bg-gradient-to-r from-primary to-primary-container text-white rounded-full font-semibold text-sm transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/30 flex items-center gap-2'
              >
                <span className='material-symbols-outlined text-sm'>verified</span>
                Xác nhận cho vào
              </button> */}
            </div>
          </div>

          {/* Right Column - Avatar & Quick Stats */}
          <div className='lg:col-span-5'>
            <div className='relative group'>
              {/* Gradient Border Effect */}
              <div className='absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-primary-container rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-700'></div>

              {/* Avatar Container */}
              <div className='relative bg-white rounded-2xl overflow-hidden shadow-2xl'>
                <img
                  alt={resident.personalInfo?.fullName}
                  className='w-full aspect-square object-cover'
                  src={getAvatarUrl()}
                />

                {/* Overlay Stats Card */}
                <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4'>
                  <div className='flex justify-around'>
                    <div className='text-center'>
                      <p className='text-2xl font-black text-white'>{resident.accessHistory?.todayAccessCount || 0}</p>
                      <p className='text-[10px] text-white/70 uppercase tracking-wider'>Lần vào hôm nay</p>
                    </div>
                    <div className='w-px h-8 bg-white/30'></div>
                    <div className='text-center'>
                      <p className='text-2xl font-black text-white'>{resident.familyMembers?.length || 0}</p>
                      <p className='text-[10px] text-white/70 uppercase tracking-wider'>Người ở cùng</p>
                    </div>
                    <div className='w-px h-8 bg-white/30'></div>
                    <div className='text-center'>
                      <p className='text-2xl font-black text-white'>
                        {resident.contracts?.filter((c) => c.isValid).length || 0}
                      </p>
                      <p className='text-[10px] text-white/70 uppercase tracking-wider'>Hợp đồng hiệu lực</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Last Access Info */}
            {resident.accessHistory?.lastAccessTime && (
              <div className='mt-4 flex items-center justify-center gap-2 text-xs text-on-surface-variant bg-surface-container-low/50 py-2 px-4 rounded-full w-fit mx-auto'>
                <span className='material-symbols-outlined text-primary text-sm'>schedule</span>
                <span>Lần cuối ra vào: {formatDateTime(resident.accessHistory?.lastAccessTime)}</span>
                <span className='w-1 h-1 rounded-full bg-slate-400'></span>
                <span>Cổng: {resident.accessHistory?.lastAccessGate || 'Chưa xác định'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bento Grid Content */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {/* Personal Info Card */}
          <div className='md:col-span-2 bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/15 shadow-sm'>
            <h3 className='text-xs font-bold uppercase tracking-[0.15em] text-on-surface-variant mb-8 flex items-center gap-2'>
              <span className='material-symbols-outlined text-primary text-sm'>person</span>
              Thông tin cá nhân & Liên hệ
            </h3>
            <div className='grid grid-cols-2 gap-y-8 gap-x-12'>
              <div>
                <p className='text-[10px] uppercase tracking-widest text-slate-400 mb-1'>Họ tên</p>
                <p className='font-semibold text-on-surface'>{resident.personalInfo?.fullName}</p>
              </div>
              <div>
                <p className='text-[10px] uppercase tracking-widest text-slate-400 mb-1'>Email</p>
                <p className='font-semibold text-on-surface'>{resident.personalInfo?.email}</p>
              </div>
              <div>
                <p className='text-[10px] uppercase tracking-widest text-slate-400 mb-1'>Số điện thoại</p>
                <p className='font-semibold text-on-surface'>{resident.personalInfo?.phone || 'Chưa cập nhật'}</p>
              </div>
              <div>
                <p className='text-[10px] uppercase tracking-widest text-slate-400 mb-1'>Ngày sinh</p>
                <p className='font-semibold text-on-surface'>{formatDate(resident.personalInfo?.dateOfBirth)}</p>
              </div>
              <div>
                <p className='text-[10px] uppercase tracking-widest text-slate-400 mb-1'>Giới tính</p>
                <p className='font-semibold text-on-surface'>{getGenderLabel(resident.personalInfo?.gender)}</p>
              </div>
              <div className='col-span-2'>
                <p className='text-[10px] uppercase tracking-widest text-slate-400 mb-1'>CCCD/CMND</p>
                <p className='font-semibold text-on-surface tracking-widest'>
                  {resident.personalInfo?.idCard || 'Chưa cập nhật'}
                </p>
              </div>
            </div>
          </div>

          {/* Residence Insight */}
          <div className='bg-gradient-to-b from-primary to-primary-container text-white rounded-3xl p-8 flex flex-col shadow-xl'>
            <h3 className='text-xs font-bold uppercase tracking-[0.15em] text-blue-100 mb-auto flex items-center gap-2'>
              <span className='material-symbols-outlined text-sm'>home_pin</span>
              Căn hộ hiện tại
            </h3>
            <div className='my-8'>
              <p className='text-4xl font-black mb-1 tracking-tighter'>{resident.residenceInfo?.apartmentCode}</p>
              <p className='text-blue-100 font-medium'>
                {resident.residenceInfo?.buildingName}, Tầng {resident.residenceInfo?.floorNumber}
              </p>
            </div>
            <div className='space-y-4'>
              <div className='flex justify-between items-end border-b border-white/10 pb-2'>
                <p className='text-[10px] uppercase tracking-widest opacity-70'>Mối quan hệ</p>
                <p className='font-bold'>{resident.residenceInfo?.relationship}</p>
              </div>
              <div className='flex justify-between items-end'>
                <p className='text-[10px] uppercase tracking-widest opacity-70'>Ngày dọn vào</p>
                <p className='font-bold'>{formatDate(resident.residenceInfo?.moveInDate)}</p>
              </div>
            </div>
          </div>

          {/* Contracts Section */}
          <div className='md:col-span-1 bg-surface-container-low rounded-3xl p-8 flex flex-col'>
            <h3 className='text-xs font-bold uppercase tracking-[0.15em] text-on-surface-variant mb-6'>
              Hợp đồng hiện tại
            </h3>
            {resident.contracts?.filter((c) => c.isValid === true).length > 0 ? (
              resident.contracts
                .filter((c) => c.isValid === true)
                .map((contract, idx) => (
                  <div key={idx} className='bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/10'>
                    <div className='flex justify-between items-start mb-4'>
                      <div className='w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center'>
                        <span className='material-symbols-outlined text-slate-600'>contract</span>
                      </div>
                      <div className='px-3 py-1 rounded-full bg-green-100 text-green-700 text-[9px] font-black uppercase'>
                        Còn hiệu lực
                      </div>
                    </div>
                    <p className='font-bold text-slate-900 mb-1'>
                      {contract.contractType === 'RENT'
                        ? 'Hợp đồng thuê'
                        : contract.contractType === 'OWNERSHIP'
                          ? 'Hợp đồng sở hữu'
                          : 'Hợp đồng chuyển nhượng'}
                    </p>
                    <div className='space-y-3 mt-4'>
                      <div className='flex items-center gap-3 text-xs text-on-surface-variant'>
                        <span className='material-symbols-outlined text-sm'>calendar_today</span>
                        {formatDate(contract.startDate)} — {formatDate(contract.endDate)}
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className='bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/10 text-center text-slate-500'>
                <span className='material-symbols-outlined text-4xl text-slate-300 mb-2'>description</span>
                <p className='text-sm'>Không có hợp đồng đang hiệu lực</p>
              </div>
            )}
          </div>

          {/* Family Members */}
          <div className='md:col-span-1 bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/15'>
            <h3 className='text-xs font-bold uppercase tracking-[0.15em] text-on-surface-variant mb-6'>Người ở cùng</h3>
            {resident.familyMembers && resident.familyMembers.length > 0 ? (
              <div className='space-y-6'>
                {resident.familyMembers.map((member, idx) => (
                  <div key={idx} className='flex items-center gap-4'>
                    <div className='w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed-variant font-bold text-sm'>
                      {member.fullName?.charAt(0) || '?'}
                    </div>
                    <div className='flex-1'>
                      <p className='text-sm font-bold text-on-surface'>{member.fullName}</p>
                      <p className='text-[10px] text-slate-500 uppercase tracking-tighter'>
                        {member.relationship} • {member.phone || 'Chưa có SĐT'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-sm text-slate-500 text-center py-8'>Chưa có người ở cùng</p>
            )}
          </div>

          {/* Access History: Glass Insight Style */}
          <div className='md:col-span-1 bg-white/60 backdrop-blur-xl rounded-3xl p-8 border border-white shadow-2xl relative overflow-hidden'>
            <div className='absolute top-0 right-0 p-4 opacity-5'>
              <span className='material-symbols-outlined text-8xl' style={{ fontVariationSettings: "'FILL' 1" }}>
                security
              </span>
            </div>
            <h3 className='text-xs font-bold uppercase tracking-[0.15em] text-on-surface-variant mb-6'>
              Lịch sử ra vào
            </h3>
            <div className='flex items-center gap-4 mb-8'>
              <div className='w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary'>
                <span className='text-2xl font-black'>{resident.accessHistory?.todayAccessCount || 0}</span>
              </div>
              <div>
                <p className='text-xs font-bold text-on-surface-variant uppercase tracking-widest'>
                  Số lần vào hôm nay
                </p>
                <p className='text-[10px] text-slate-500'>
                  Lần cuối: {formatDateTime(resident.accessHistory?.lastAccessTime)}
                </p>
              </div>
            </div>
            <div className='space-y-4'>
              {resident.accessHistory?.recentLogs?.slice(0, 3).map((log, idx) => (
                <div key={idx} className='flex items-center gap-3 p-3 bg-surface-container-low rounded-xl'>
                  <span className='material-symbols-outlined text-green-600'>check_circle</span>
                  <div className='flex-1'>
                    <p className='text-xs font-bold text-on-surface'>ĐÃ CẤP QUYỀN</p>
                    <p className='text-[10px] text-slate-500'>
                      {log.gateName} • {formatDateTime(log.scanTime)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Meta */}
        <div className='mt-12 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400'>
          <div className='flex gap-8'>
            <span>Cập nhật lần cuối: {formatDateTime(new Date())}</span>
            <span>Mã hệ thống: HL-{resident.personalInfo?.id}</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='w-2 h-2 rounded-full bg-green-500'></span>
            Kết nối bảo mật
          </div>
        </div>
      </div>
    </div>
  )
}
