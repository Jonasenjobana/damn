import request from '../request'
import type { ApiResponse } from '@/types/api'
import type { UploadResponse } from '@/types/upload'

export const uploadAPI = {
  uploadImage(file: File): Promise<ApiResponse<UploadResponse>> {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  deleteImage(id: number): Promise<ApiResponse<null>> {
    return request.delete(`/upload/images/${id}`)
  },
}
