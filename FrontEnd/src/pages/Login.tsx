import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation } from '@tanstack/react-query'
import { useContext } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { loginApi } from 'src/apis/Login/login.api'
import Input from 'src/components/Input'
import { AppContext } from 'src/contexts/app.context'
import type { ErrorResponseApi } from 'src/types/utils.type'
import { loginSchema, type LoginFormData } from 'src/utils/rules'
import { isAxiosUnprocessableEntityError } from 'src/utils/utils'

export default function Login() {
  const { SetIsAuthenticated, setUser } = useContext(AppContext)

  const navigate = useNavigate()
  const {
    handleSubmit,
    setError,
    register,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema) as Resolver<LoginFormData>
  })

  const loginAccountMutation = useMutation({
    mutationFn: (body: LoginFormData) => loginApi.postLogin(body)
  })

  const onSubmit = handleSubmit((data) => {
    loginAccountMutation.mutate(data, {
      onSuccess: (data) => {
        toast.success('Đăng nhập thành công')
        SetIsAuthenticated(true)
        setUser(data.data.data.user)
        navigate('/')
      },
      onError: (errors) => {
        if (isAxiosUnprocessableEntityError<ErrorResponseApi<LoginFormData>>(errors)) {
          const formErrors = errors.response?.data.data
          if (formErrors?.username) {
            setError('username', {
              message: formErrors.username,
              type: 'Server'
            })
          }
          if (formErrors?.password) {
            setError('password', {
              message: formErrors.password,
              type: 'Server'
            })
          }
        }
      }
    })
  })

  return (
    <main className='min-h-screen flex flex-col md:flex-row relative overflow-hidden bg-[#f3faff] font-[Inter] text-[#071e27]'>
      {/* ===== BÊN TRÁI: Phần Hình Ảnh ===== */}
      <section className='hidden md:flex md:w-1/2 lg:w-[60%] bg-[#1a237e] relative overflow-hidden flex-col justify-end p-16'>
        {/* Ảnh nền */}
        <div className='absolute inset-0 z-0'>
          <img
            alt='Nội thất căn hộ cao cấp'
            className='w-full h-full object-cover opacity-40 mix-blend-overlay'
            src='https://lh3.googleusercontent.com/aida-public/AB6AXuBxXfcqOg3Y-BRCzuD1vJt8OF6qmP9hTR7geimUwa6uRBnXIbFjkWL11KYpbG4zXW5jAkvlf7AOugHV5dlLI9JxYkfG04C04FovPQEX_NhncQ99Hfa0oquXlJYFakkskm4PkuyruM1yQYkXgUfNZFDsBFUglBleNVPyoHK3uZ8IVgHMRvQaFGXyQfEznOpUdK5vfNwrJvROSNeaLNREYNZgGSgB_boM6am1dwld9m2J1LZ4tpVkRfxPwVEk2qvO0EiPvozgidLFlrb1'
          />
          <div className='absolute inset-0 bg-gradient-to-t from-[#1a237e] via-[#1a237e]/20 to-transparent' />
        </div>

        {/* Nội dung chồng lên ảnh */}
        <div className='relative z-10 space-y-8 max-w-xl'>
          <div className='inline-flex items-center space-x-2 bg-[#58e6ff]/20 backdrop-blur-md px-4 py-2 rounded-full border border-[#c6c5d4]/10'>
            <span className='material-symbols-outlined text-[#44d8f1]' style={{ fontVariationSettings: "'FILL' 1" }}>
              shutter_speed
            </span>
            <span className='text-[#a1efff] text-sm font-medium tracking-wide uppercase'>Trải Nghiệm Với AI</span>
          </div>

          <h1 className='font-[Manrope] text-white leading-tight tracking-tighter text-5xl lg:text-6xl font-extrabold'>
            Chào mừng đến với không gian <span className='text-[#58e6ff]'>Thông Minh</span>.
          </h1>

          <p className='text-white/80 text-xl leading-relaxed'>
            Trợ lý kỹ thuật số của bạn sẵn sàng điều phối không gian sống lý tưởng. Trải nghiệm an ninh mượt mà và tiện
            nghi cá nhân hóa.
          </p>

          <div className='flex items-center space-x-6 pt-4'>
            <div className='flex -space-x-3'>
              <img
                alt='Cư dân'
                className='h-10 w-10 rounded-full border-2 border-[#1a237e] object-cover'
                src='https://lh3.googleusercontent.com/aida-public/AB6AXuBgNKHO_4v0Zxjc1iXzJMOgHV9UsA-mW9kT1RcZ7RnW1FNSfpLRgebhPoB3iZ96wGG4AFixsLM7CKuQ7U7V4tmeuuUCmnsoyXMwyDJVbLCMTMc_oxSVAK2kxaPSvDqHLK7bSgRhbp35kbFiicVQllkDnYjrQPz0OLEgYv8z98sVuMd7PigIzEpQTimI2TIGLyWnq4Cf_yLgWSHfmyrS1B55grKAfwIC05Xf1z02sFSTN8RtWkhEN_h1bqHMBdpzYW8yEn3vSsDm5z8Z'
              />
              <img
                alt='Cư dân'
                className='h-10 w-10 rounded-full border-2 border-[#1a237e] object-cover'
                src='https://lh3.googleusercontent.com/aida-public/AB6AXuBG-H7X2FKOzTNxDsUlq73nCn3VdKN0p4gdFzycLpRh0F-Q-rmQWNU41ue8Mg-Ks-v4D3JEyXXBEyCaTlg3u6pI2neXVXQjgdWUuEEkPeD127Jjlwy82CoowMY0PrC_4LkVV1qoibgUOVDdV0bffnNRJ0d9zSO8Q1SUfsISGBXIs8cGC-cvfZ4VSie5NFoLwJsRCQKaNxDoislmFqqYmDwMaVXlqy_iRcipXENbmvt-_pF3DcJnHRgWONLIIeHelXC4wRrIFyszR6qk'
              />
              <div className='h-10 w-10 rounded-full border-2 border-[#1a237e] bg-[#58e6ff] flex items-center justify-center text-[#000666] font-bold text-xs'>
                +4k
              </div>
            </div>
            <span className='text-white/60 text-sm italic'>Cùng 4,000+ cư dân cao cấp</span>
          </div>
        </div>

        {/* Hiệu ứng mờ trang trí */}
        <div className='absolute top-20 right-20 w-64 h-64 bg-[#006876]/10 rounded-full blur-[100px]' />
        <div className='absolute -bottom-20 -left-20 w-96 h-96 bg-[#000666]/20 rounded-full blur-[120px]' />
      </section>

      {/* ===== BÊN PHẢI: Phần Đăng Nhập ===== */}
      <section className='w-full md:w-1/2 lg:w-[40%] flex flex-col justify-center items-center p-8 md:p-12 lg:p-20 bg-[#f3faff] relative z-10'>
        <div className='w-full max-w-md space-y-10'>
          {/* Thương hiệu */}
          <div className='space-y-2'>
            <div className='flex items-center space-x-2'>
              <h2 className='text-2xl font-[Manrope] font-extrabold tracking-tighter text-[#1a237e]'>Homelink AI</h2>
            </div>
            <p className='text-[#071e27]/60 font-medium'>Cổng Truy Cập Kỹ Thuật Số</p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className='space-y-8'>
            <div className='space-y-4'>
              <h3 className='text-3xl font-[Manrope] font-bold text-[#071e27] tracking-tight'>Đăng nhập</h3>
              <p className='text-[#071e27]/50 text-sm'>Nhập thông tin đăng nhập hoặc sử dụng mã thẻ cư dân.</p>
            </div>

            {/* Các trường nhập liệu */}
            <div className='space-y-5'>
              <div className='space-y-4'>
                {/* Trường Tên đăng nhập */}
                <div className='space-y-1.5'>
                  <label className='text-xs font-bold uppercase tracking-widest text-[#071e27]/40 ml-1'>
                    Tên đăng nhập
                  </label>
                  <Input
                    register={register}
                    name='username'
                    errorMassage={errors.username?.message}
                    classNameInput='w-full pl-12 pr-4 py-4 bg-[#e6f6ff] border-none rounded-xl focus:ring-2 focus:ring-[#006876]/30 transition-all placeholder:text-[#071e27]/20 text-[#071e27] outline-none'
                    classNameError='mt-1 text-red-600 min-h-[1.25rem] text-sm'
                    placeholder='nguyenhoana'
                    type='text'
                  />
                </div>

                {/* Trường Mật khẩu */}
                <div className='space-y-1.5'>
                  <div className='flex justify-between items-center px-1'>
                    <label className='text-xs font-bold uppercase tracking-widest text-[#071e27]/40'>Mật khẩu</label>
                  </div>
                  <Input
                    register={register}
                    name='password'
                    errorMassage={errors.password?.message}
                    classNameInput='w-full pl-12 pr-12 py-4 bg-[#e6f6ff] border-none rounded-xl focus:ring-2 focus:ring-[#006876]/30 transition-all placeholder:text-[#071e27]/20 text-[#071e27] outline-none'
                    placeholder='••••••••••••'
                    type='password'
                  />
                  <div className='flex justify-end'>
                    <a
                      className='text-[10px] font-bold uppercase tracking-widest text-[#006876] hover:text-[#006573] transition-colors'
                      href='#'
                    >
                      Quên mật khẩu ?
                    </a>
                  </div>
                </div>

                {/* Nút Đăng nhập */}
                <button
                  type='submit'
                  disabled={loginAccountMutation.isPending}
                  className='mt-4 w-full py-4 bg-gradient-to-r from-[#1a237e] to-[#000666] text-white font-[Manrope] font-bold rounded-xl shadow-[0_0_20px_rgba(88,230,255,0.15)] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <span>{loginAccountMutation.isPending ? 'Đang đăng nhập...' : 'Đăng Nhập'}</span>
                </button>
              </div>
            </div>

            {/* Đường kẻ ngang */}
            <div className='relative flex items-center py-2'>
              <div className='flex-grow border-t border-[#c6c5d4]/30' />
              <span className='flex-shrink mx-4 text-xs font-bold uppercase tracking-widest text-[#071e27]/30'>
                Hoặc kết nối qua
              </span>
              <div className='flex-grow border-t border-[#c6c5d4]/30' />
            </div>

            {/* Đăng nhập mạng xã hội */}
            <div className='grid grid-cols-2 gap-4'>
              <button
                type='button'
                className='flex items-center justify-center space-x-3 py-3 border border-[#c6c5d4]/20 rounded-xl hover:bg-[#e6f6ff] transition-all'
              >
                <img
                  alt='Google'
                  className='w-5 h-5'
                  src='https://lh3.googleusercontent.com/aida-public/AB6AXuC1v56Jos2BJsCw3EUzmWNOaOTNdebGFHbI0ra859TafVEqw4t_9hqxCOm7iF3_Nw-U5qXEMAb_xU8rULPXyCHfn1a-YJozkMmjQakgy2D0L-diCv4p5NYAJqDF-ddI7n45U6UJNJeEMigMUjrgZlaV5U1jntDUBh_hcJI-soOJkdaAD0MkkAu5ThxuHyOXsfciBiHKzN5PmlF1yROpFwsFrmipeIYBLjO1WYrEhnrLO1CFLOabe5CcluAfMu9aBgOR2WQmDDmCyIsM'
                />
                <span className='text-sm font-semibold text-[#071e27]'>Google</span>
              </button>
              <button
                type='button'
                className='flex items-center justify-center space-x-3 py-3 border border-[#c6c5d4]/20 rounded-xl hover:bg-[#e6f6ff] transition-all'
              >
                <span
                  className='material-symbols-outlined text-[#071e27]'
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  ios
                </span>
                <span className='text-sm font-semibold text-[#071e27]'>Apple</span>
              </button>
            </div>
          </form>
        </div>

        {/* Huy hiệu trang trí */}
        <div className='absolute bottom-8 right-8 flex items-center space-x-2 text-[10px] text-[#071e27]/20'>
          <span className='w-2 h-2 rounded-full bg-[#006876] animate-pulse' />
          <span className='uppercase tracking-widest font-bold'>Kết Nối An Toàn</span>
        </div>
      </section>
    </main>
  )
}
