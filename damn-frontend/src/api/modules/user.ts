import request from '../request'
import type { ApiResponse } from '@/types/api'
import type { User, ProfileResponse, AdminInfoResponse } from '@/types/user'

export const userAPI = {
  getList(): Promise<ApiResponse<User[]>> {
    return request.get('/user/list')
  },
  create(data: any): Promise<ApiResponse<User>> {
    return request.post('/user/create', data)
  },
  getProfile(): Promise<ApiResponse<ProfileResponse>> {
    return request.get('/user/profile')
  },
  getAdminInfo(): Promise<ApiResponse<AdminInfoResponse>> {
    return request.get('/user/admin')
  },
}
