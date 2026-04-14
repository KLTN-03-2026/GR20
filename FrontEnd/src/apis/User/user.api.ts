import type { User } from 'src/types/user.type'
import type { SuccessResponseApi } from 'src/types/utils.type'
import http from 'src/utils/http'

const URL = '/api/users'

export const UserApi = {
  getAllUser() {},
  getDetailUser(id: number) {
    return http.get<SuccessResponseApi<User>>(`${URL}/${id}`)
  },
  PostUserNew() {}
}
