import type { User } from './user.type'
// import type { SuccessResponseApi } from './utils.type'

// export type AuthResponse = SuccessResponseApi<{
//   access_token: string
//   refresh_token: string
//   refresh_expires: string
//   expires: string
//   user: User
// }>
export interface AuthResponse {
  access_token: string
  refresh_token: string
  refresh_expires: string
  expires: string
  user: User
}
