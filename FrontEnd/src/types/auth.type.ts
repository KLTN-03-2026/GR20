import type { User } from './user.type'
import type { SuccessResponseApi } from './utils.type'

/** Dữ liệu trong trường `data` khi POST login/register thành công */
export interface AuthPayload {
  access_token: string
  expires?: string
  user: User
}

/** Toàn bộ body JSON của login (chuẩn BE SuccessResponseApi) */
export type AuthResponse = SuccessResponseApi<AuthPayload>
