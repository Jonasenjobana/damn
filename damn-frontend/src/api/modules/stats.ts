import request from '../request'
import type { ApiResponse, ErrorStatsResponse } from '@/types/api'

export const statsAPI = {
  getErrorStats(): Promise<ApiResponse<ErrorStatsResponse>> {
    return request.get('/stats/errors')
  },
  getTopErrors(): Promise<ApiResponse<any[]>> {
    return request.get('/stats/errors/top')
  },
  clearErrorStats(): Promise<ApiResponse<null>> {
    return request.get('/stats/errors/clear')
  },
}
