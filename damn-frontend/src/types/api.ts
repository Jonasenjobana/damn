export interface ApiResponse<T = any> {
  rlt: string
  msg: string
  data: T | null
}

export interface PageResult<T = any> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export interface ErrorStat {
  path: string
  method: string
  errorType: string
  count: number
  lastErrorTime: string
}

export interface ErrorStatsResponse {
  totalErrors: number
  errors: ErrorStat[]
}
