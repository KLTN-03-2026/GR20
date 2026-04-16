// import axios, { type AxiosError, type AxiosInstance } from 'axios'
// import { toast } from 'react-toastify'
// import type { AuthResponse } from 'src/types/auth.type'
// import { clearLS, getAccessToken, getRefeshToken, setAccessToken, setRefreshToken, setUser } from './auth'
// import config from 'src/contexts/config'

// class Http {
//   instance: AxiosInstance
//   private accessToken: string
//   constructor() {
//     this.accessToken = getAccessToken()
//     this.refreshToken = getRefeshToken()
//     this.instance = axios.create({
//       baseURL: config.BASEURL,
//       timeout: 1000 * 10,
//       headers: {
//         'Content-Type': 'application/json'
//       }
//     })
//     this.instance.interceptors.request.use(
//       (config) => {
//         if (this.accessToken && config.headers) {
//           config.headers.Authorization = this.accessToken
//           return config
//         }
//         return config
//       },
//       (error) => {
//         return Promise.reject(error)
//       }
//     )
//     this.instance.interceptors.response.use(
//       (response) => {
//         const { url } = response.config
//         if (url?.endsWith('login') || url?.endsWith('/register')) {
//           const data = response.data as AuthResponse
//           this.accessToken = data.access_token
//           setAccessToken(this.accessToken)
//           setRefreshToken(data.refresh_token) // 👈 thêm lưu refresh_token
//           setUser(data.user) // 👈 đổi setProfile → setUser
//         } else if (url?.endsWith('/logout')) {
//           this.accessToken = ''
//           clearLS()
//         }
//         return response
//       },
//       function onRejected(error: AxiosError) {
//         if (error.response?.status !== 422) {
//           // eslint-disable-next-line @typescript-eslint/no-explicit-any
//           const data: any | undefined = error.response?.data
//           const message = data?.message || error.message
//           toast.error(message)
//         }
//         if (error.response?.status === 401) {
//           toast.error('tên đăng nhập hoặc mật khẩu sai')
//         }
//         return Promise.reject(error)
//       }
//     )
//   }
// }

// const http = new Http().instance

// export default http

import axios, { type AxiosError, type AxiosInstance } from 'axios'
import { toast } from 'react-toastify'
import { clearLS, getAccessToken, getRefeshToken, setAccessToken, setRefreshToken, setUser } from './auth'
import config from 'src/contexts/config'
import type { AuthResponse } from 'src/types/auth.type'
import type { data } from 'src/types/user.type'
class Http {
  instance: AxiosInstance
  private accessToken: string
  private refreshToken: string // ✅ THÊM DÒNG NÀY - khai báo thuộc tính refreshToken

  constructor() {
    this.accessToken = getAccessToken()
    this.refreshToken = getRefeshToken()

    this.instance = axios.create({
      baseURL: config.BASEURL,
      timeout: 1000 * 10,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.instance.interceptors.request.use(
      (config) => {
        if (this.accessToken && config.headers) {
          config.headers.Authorization = `Bearer ${this.accessToken}`
          return config
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    this.instance.interceptors.response.use(
      (response) => {
        const { url } = response.config
        if (url?.endsWith('login') || url?.endsWith('/register')) {
          const authData = response.data.data as AuthResponse //
          if (authData?.access_token) {
            this.accessToken = authData.access_token
            setAccessToken(authData.access_token)
          }

          if (authData?.refresh_token) {
            this.refreshToken = authData.refresh_token
            setRefreshToken(authData.refresh_token)
          }

          if (authData?.user) {
            setUser(authData.user)
          }
        } else if (url?.endsWith('/logout')) {
          this.accessToken = ''
          this.refreshToken = ''
          clearLS()
        }
        return response
      },
      function onRejected(error: AxiosError) {
        if (error.response?.status !== 422) {
          const data: any = error.response?.data
          const message = data?.message || error.message
          toast.error(message)
        }
        if (error.response?.status === 401) {
          toast.error('Tên đăng nhập hoặc mật khẩu sai')
        }
        return Promise.reject(error)
      }
    )
  }
}

const http = new Http().instance
export default http
