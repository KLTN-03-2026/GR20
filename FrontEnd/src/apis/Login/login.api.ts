import type { AuthResponse } from 'src/types/auth.type'
// import type { Login } from 'src/types/user.type'
import type { SuccessResponseApi } from 'src/types/utils.type'
import http from 'src/utils/http'

const URL = 'api/auth/login'

export const loginApi = {
  postLogin(body: { username: string; password: string }) {
    return http.post<SuccessResponseApi<AuthResponse>>(URL, body)
  }
}
