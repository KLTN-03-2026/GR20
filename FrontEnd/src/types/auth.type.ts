import type { User } from './user.type'
import type { SuccessResponseApi } from './utils.type'

export type AuthResponse = SuccessResponseApi<{
  access_token: string
  expires: string
  user: User
}>
