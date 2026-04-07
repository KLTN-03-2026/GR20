import type { RegisterOptions } from 'react-hook-form'
import * as yup from 'yup'
type Rule = { [key in 'email' | 'password' | 'confirmPassword']?: RegisterOptions }

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

export type Schema = yup.InferType<typeof schema>
