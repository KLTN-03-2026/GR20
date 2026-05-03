import type { AuthResponse } from 'src/types/auth.type'
import http from 'src/utils/http'

const URL = 'api/auth/login'

export const loginApi = {
  postLogin(body: { username: string; password: string }) {
    return http.post<AuthResponse>(URL, body)
  }
}
