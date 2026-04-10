import request from '../request'
import type { ApiResponse } from '@/types/api'
import type { LoginDTO, LoginResponse } from '@/types/user'

export const authAPI = {
  login(data: LoginDTO): Promise<ApiResponse<LoginResponse>> {
    return request.post('/auth/login', data)
  },
}
