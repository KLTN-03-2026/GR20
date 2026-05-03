/* eslint-disable no-duplicate-imports */
import type { AxiosError, AxiosInstance } from 'axios'
import { toast } from 'react-toastify'
import type { AuthResponse } from 'src/types/auth.type'
import { clearLS, getAccessToken, setAccessToken, setProfile } from './auth'
import config from 'src/contexts/config'
import axios from 'axios'
// import { path } from 'src/contexts/path'
// import config from 'src/contexts/config'

class Http {
  instance: AxiosInstance
  private accessToken: string
  constructor() {
    this.accessToken = getAccessToken()
    // console.log('Current token:', this.accessToken)
    this.instance = axios.create({
      baseURL: config.BASEURL,
      // baseURL: 'http://localhost:8080',
      timeout: 1000 * 10,
      headers: {
        'Content-Type': 'application/json'
      }
    })
    this.instance.interceptors.request.use(
      (config) => {
        if (this.accessToken && config.headers) {
          //route cần xác thực => gửi token lên bằng header và key được quy định Authorization
          // config.headers.Authorization = this.accessToken
          // config.headers.Authorization = `Bearer ${this.accessToken}` // ✅ đúng format
          config.headers.Authorization = this.accessToken
          return config
        }
        return config
        //điều kiện nếu có accsess token gán vào heder ko thì thoi
      },
      (error) => {
        return Promise.reject(error)
      }
    )
    // Add a response interceptor
    this.instance.interceptors.response.use(
      (response) => {
        const { url } = response.config
        if (url?.endsWith('login') || url?.endsWith('/register')) {
          //ko dùng this. được cánh nhanh nhất đỏi function thành arow func
          this.accessToken = (response.data as AuthResponse).data.access_token
          setAccessToken(this.accessToken)
          const data = response.data as AuthResponse
          setProfile(data.data.user)
        } else if (url?.endsWith('/logout')) {
          this.accessToken = ''
          clearLS()
        }
        return response
      },
      function onRejected(error: AxiosError) {
        if (error.response?.status !== 422) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const data: any | undefined = error.response?.data
          const message = data?.message || error.message
          toast.error(message)
        }
        if (error.response?.status === 401) {
          clearLS()
          //cais clear xoas access va profile
          //localStorage.removeItem('access_token')
          // localStorage.removeItem('profile')
        }
        // console.log(error)
        return Promise.reject(error)
      }
    )
  }
}

const http = new Http().instance

export default http
