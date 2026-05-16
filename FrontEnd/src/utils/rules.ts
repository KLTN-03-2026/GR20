import type { RegisterOptions } from 'react-hook-form'
import * as yup from 'yup'
type Rule = { [key in 'email' | 'password' | 'confirmPassword']?: RegisterOptions }

export const loginSchema = yup.object({
  username: yup
    .string()
    .required('Tên đăng nhập không được để trống')
    .min(6, '6 - 100 kí tự')
    .max(100, '6 - 100 kí tự'),
  password: yup.string().required('mật khẩu không được để trống').min(6, '6 - 100 kí tự').max(100, '6 - 100 kí tự')
})

export const updateQrSchema = yup.object({
  visitorName: yup
    .string()
    .required('Tên khách không được để trống')
    .min(2, 'Tên khách phải có ít nhất 2 ký tự')
    .max(100, 'Tên khách tối đa 100 ký tự'),

  visitorPhone: yup
    .string()
    .required('Số điện thoại không được để trống')
    .matches(/^[0-9]+$/, 'Số điện thoại chỉ được chứa số')
    .min(10, 'Số điện thoại phải có ít nhất 10 số')
    .max(11, 'Số điện thoại tối đa 11 số'),

  visitorIdCard: yup
    .string()
    .optional()
    .matches(/^[0-9]*$/, 'CMND/CCCD chỉ được chứa số')
    .min(9, 'CMND/CCCD phải có ít nhất 9 số')
    .max(12, 'CMND/CCCD tối đa 12 số'),

  validFrom: yup.string().required('Vui lòng chọn ngày bắt đầu'),
  // .test('valid-from', 'Ngày bắt đầu không hợp lệ', function (value) {
  //   if (!value) return false
  //   const fromDate = new Date(value)
  //   const now = new Date()
  //   return fromDate >= now
  // }),

  validTo: yup.string().required('Vui lòng chọn ngày kết thúc'),
  // .test('valid-to', 'Ngày kết thúc phải sau ngày bắt đầu', function (value) {
  //   const { validFrom } = this.parent
  //   if (!value || !validFrom) return false
  //   const fromDate = new Date(validFrom)
  //   const toDate = new Date(value)
  //   return toDate > fromDate
  // })
  // .test('max-duration', 'Thời gian hiệu lực không quá 30 ngày', function (value) {
  //   const { validFrom } = this.parent
  //   if (!value || !validFrom) return false
  //   const fromDate = new Date(validFrom)
  //   const toDate = new Date(value)
  //   const daysDiff = (toDate.getTime() - fromDate.getTime()) / (1000 * 3600 * 24)
  //   return daysDiff <= 30
  // }),

  maxEntries: yup
    .number()
    .required('Số lượt truy cập không được để trống')
    .min(1, 'Số lượt truy cập ít nhất là 1')
    .max(100, 'Số lượt truy cập tối đa là 100')
    .typeError('Số lượt truy cập phải là số'),

  status: yup
    .string()
    .oneOf(['ACTIVE', 'EXPIRED', 'REVOKED'], 'Trạng thái không hợp lệ')
    .required('Vui lòng chọn trạng thái')
})

// Type cho Update QR Form Data

// Schema cho Create QR Code (tương tự nhưng không có status)
export const createQrSchema = yup.object({
  visitorName: yup
    .string()
    .required('Tên khách không được để trống')
    .min(2, 'Tên khách phải có ít nhất 2 ký tự')
    .max(100, 'Tên khách tối đa 100 ký tự'),

  visitorPhone: yup
    .string()
    .required('Số điện thoại không được để trống')
    .matches(/^[0-9]+$/, 'Số điện thoại chỉ được chứa số')
    .min(10, 'Số điện thoại phải có ít nhất 10 số')
    .max(11, 'Số điện thoại tối đa 11 số'),

  visitorIdCard: yup
    .string()
    .optional()
    .matches(/^[0-9]*$/, 'CMND/CCCD chỉ được chứa số')
    .min(9, 'CMND/CCCD phải có ít nhất 9 số')
    .max(12, 'CMND/CCCD tối đa 12 số'),

  validFrom: yup.string().required('Vui lòng chọn ngày bắt đầu'),

  validTo: yup
    .string()
    .required('Vui lòng chọn ngày kết thúc')
    .test('valid-to', 'Ngày kết thúc phải sau ngày bắt đầu', function (value) {
      const { validFrom } = this.parent
      if (!value || !validFrom) return false
      return new Date(value) > new Date(validFrom)
    }),

  maxEntries: yup
    .number()
    .required('Số lượt truy cập không được để trống')
    .min(1, 'Số lượt truy cập ít nhất là 1')
    .max(100, 'Số lượt truy cập tối đa là 100')
    .typeError('Số lượt truy cập phải là số')
})

export type CreateQrFormData = yup.InferType<typeof createQrSchema>
export type UpdateQrFormData = yup.InferType<typeof updateQrSchema>
// export type CreateQrFormData = yup.InferType<typeof createQrSchema>

export type LoginFormData = yup.InferType<typeof loginSchema>

export const rules: Rule = {
  email: {
    required: {
      value: true,
      message: 'Email không được để trống'
    }, // bắt buộc phải nhập
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Định dạng email không đúng' // regex kiểm tra định dạng email
    },
    minLength: {
      value: 6,
      message: 'Email phải có ít nhất 6 ký tự'
    },
    maxLength: {
      value: 160,
      message: 'Email phải nhiều nhất 160 ký tự'
    }
  },
  password: {
    required: {
      value: true,
      message: 'Password không được để trống'
    }, // bắt buộc phải nhập
    minLength: {
      value: 6,
      message: 'Password phải có ít nhất 6 ký tự'
    },
    maxLength: {
      value: 160,
      message: 'Password phải nhiều nhất 160 ký tự'
    }
  },
  confirmPassword: {
    required: {
      value: true,
      message: 'Nhập lại Password không được để trống'
    }, // bắt buộc phải nhập
    minLength: {
      value: 6,
      message: 'Password phải có ít nhất 6 ký tự'
    },
    maxLength: {
      value: 160,
      message: 'Password phải nhiều nhất 160 ký tự'
    }
  }
}

const handleConfirmPassword = (refString: string) => {
  return yup
    .string()
    .required('password ép buộc nhập')
    .min(6, '6 - 160 kí tự')
    .max(160, '6 - 160 kí tự')
    .oneOf([yup.ref(refString)], 'nhập lại password ko khớp')
}

export const schema = yup.object({
  price_min: yup
    .string()
    .test({
      name: 'price_not_allowed',
      message: 'giá không phù hợp',
      test: function (value) {
        const { price_max } = this.parent
        // this.parent gọi obj cha price_min có hết cả hai giá trị max min
        const price_min = value
        // Nếu cả hai đều rỗng, cho phép
        if (price_min === '' && price_max === '') {
          return true
        }

        // Nếu chỉ có một trong hai có giá trị, cho phép
        if ((price_min !== '' && price_max === '') || (price_min === '' && price_max !== '')) {
          return true
        }

        // Nếu cả hai đều có giá trị, kiểm tra min <= max
        if (price_min !== '' && price_max !== '') {
          return Number(price_max) >= Number(price_min)
        }

        return false
      }
      //giải thích test:nếu mà max bé hơn mình không vào được return Number(price_max) >= Number(price_min)
      // nên thành rỗng và message thông báo giá không phù hợp
    })
    .default(''),
  price_max: yup
    .string()
    .test({
      name: 'price_not_allowed',
      message: 'giá không phù hợp',
      test: function (value) {
        const { price_min } = this.parent
        // this.parent gọi obj cha price_min có hết cả hai giá trị max min
        const price_max = value
        // Nếu cả hai đều rỗng, cho phép
        if (price_min === '' && price_max === '') {
          return true
        }

        // Nếu chỉ có một trong hai có giá trị, cho phép
        if ((price_min !== '' && price_max === '') || (price_min === '' && price_max !== '')) {
          return true
        }

        if (price_min !== '' && price_max !== '') {
          return Number(price_max) >= Number(price_min)
        }
        return false
      }
      //giải thích test:nếu mà max bé hơn mình không vào được return Number(price_max) >= Number(price_min)
      // nên thành rỗng và message thông báo giá không phù hợp
    })
    .default(''),
  password: yup.string().required('password ép buộc nhập').min(6, '6 - 160 kí tự').max(160, '6 - 160 kí tự'),
  confirm_password: handleConfirmPassword('password'),
  name: yup.string().trim().required('phải nhập tên sản phẩm')
})

export const userSchema = yup.object({
  name: yup.string().max(160, 'độ dài tối đa 160 kí tự').required(),
  phone: yup.string().max(10, 'độ dài tối đa 10 kí tự').required(),
  address: yup.string().max(160, 'độ dài tối đa 160 kí tự').required(),
  avatar: yup.string().max(1000, 'độ dài tối đa 1000 kí tự').required(),
  date_of_birth: yup.date().max(new Date(), 'hãy chọn ngày trong quá khứ').required(),
  password: schema.fields['password'],
  new_password: schema.fields['password'],
  confirm_password: handleConfirmPassword('new_password')
})

export type UserSchemaType = yup.InferType<typeof userSchema>

/** Form đổi mật khẩu (khớp `UserApi.changePassword`) */
export const changePasswordSchema = yup.object({
  currentPassword: yup.string().required('Vui lòng nhập mật khẩu hiện tại').min(6).max(160),
  newPassword: yup.string().required('Vui lòng nhập mật khẩu mới').min(6).max(160),
  confirmPassword: yup
    .string()
    .required('Vui lòng xác nhận mật khẩu')
    .oneOf([yup.ref('newPassword')], 'Mật khẩu xác nhận không khớp')
})

export type ChangePasswordFormData = yup.InferType<typeof changePasswordSchema>

// rules.ts
export const updateProfileSchema = yup.object({
  fullName: yup.string().required('Vui lòng nhập họ tên'),
  phone: yup
    .string()
    .required('Vui lòng nhập số điện thoại')
    .matches(/^(0[0-9]{9}|84[0-9]{9}|\+84[0-9]{9})$/, 'Số điện thoại không hợp lệ'),
  dateOfBirth: yup.string().required('Vui lòng chọn ngày sinh'),
  gender: yup.string().required('Vui lòng chọn giới tính').oneOf(['MALE', 'FEMALE', 'OTHER']),
  avatarUrl: yup.string().optional()
})

export type UpdateProfileFormData = yup.InferType<typeof updateProfileSchema>

export type Schema = yup.InferType<typeof schema>
