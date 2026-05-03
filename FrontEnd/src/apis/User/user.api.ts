import type { User } from 'src/types/user.type'
import type { SuccessResponseApi } from 'src/types/utils.type'
import type { UserListResponse, UserManagementItem } from 'src/types/user-management.type'
import http from 'src/utils/http'
import type { UpdateProfileFormData } from 'src/utils/rules'

const URL = '/api/users'

export const UserApi = {
  getAllUsers(params?: { page?: number; size?: number; search?: string; role?: string; isActive?: boolean }) {
    return http.get<SuccessResponseApi<UserManagementItem[]> & UserListResponse>('/api/users', { params })
  },
  getById(id: string | number) {
    return http.get<SuccessResponseApi<UserManagementItem>>(`${URL}/${id}`)
  },
  create(body: {
    username: string
    password: string
    email: string
    phone?: string
    fullName?: string
    gender?: string
    dateOfBirth?: string
    idCard?: string
    avatarUrl?: string
    roleName?: string
  }) {
    return http.post<SuccessResponseApi<{ id: number }>>(URL, body)
  },
  update(id: string | number, body: Partial<Omit<UserManagementItem, 'id' | 'createdAt' | 'updatedAt' | 'roleId' | 'roleName'>>) {
    return http.put<SuccessResponseApi<UserManagementItem>>(`${URL}/${id}`, body)
  },
  changeRole(id: string | number, roleName: string) {
    return http.patch<SuccessResponseApi<UserManagementItem>>(`${URL}/${id}/role`, { roleName })
  },
  delete(id: string | number) {
    return http.delete<SuccessResponseApi<{ id: number }>>(`${URL}/${id}`)
  },
  getProfile() {
    return http.get<SuccessResponseApi<User>>('/api/users/me')
  },
  updateProfile(body: UpdateProfileFormData) {
    return http.put<SuccessResponseApi<User>>(`${URL}/profile`, body)
  },
  changePassword(body: { currentPassword: string; newPassword: string; confirmPassword: string }) {
    return http.put<SuccessResponseApi<null>>(`${URL}/change-password`, body)
  },
  uploadAvatar(file: File) {
    const formData = new FormData()
    formData.append('avatar', file)

    return http.post<SuccessResponseApi<{ avatarUrl: string }>>(`${URL}/me/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}
