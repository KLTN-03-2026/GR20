import type { User } from 'src/types/user.type'
import type { SuccessResponseApi } from 'src/types/utils.type'
import http from 'src/utils/http'
import type { UpdateProfileFormData } from 'src/utils/rules'

const URL = '/api/users'

export const UserApi = {
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

    return http.post<SuccessResponseApi<{ avatarUrl: string }>>(`${URL}/upload-avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}
