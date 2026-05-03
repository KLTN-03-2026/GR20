/* eslint-disable @typescript-eslint/no-unused-vars */

type Role = 'User' | 'Adim'

export interface User {
  _id: string
  roles: Role[]
  email: string
  name?: string
  date_of_birth?: string
  avatar?: string
  address?: string
  phone?: string
  createdAt: string
  updatedAt: string
}
