import axios, { type AxiosError, type AxiosInstance } from 'axios'
import { toast } from 'react-toastify'
import { clearLS, getAccessToken, getRefeshToken, setAccessToken, setRefreshToken, setUser } from './auth'
import config from 'src/contexts/config'
import type { AuthResponse } from 'src/types/auth.type'
class Http {
  instance: AxiosInstance
  private accessToken: string
  private refreshToken: string

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
        if (url?.endsWith('login')) {
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
