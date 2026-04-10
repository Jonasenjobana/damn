export interface User {
  id: number
  username: string
  phone?: string
  status?: number
  isAdmin: number | boolean
  createTime?: string
  updateTime?: string
}

export interface LoginDTO {
  username: string
  password: string
}

export interface LoginResponse {
  user: {
    id: number
    username: string
    isAdmin: number
  }
}

export interface ProfileResponse {
  user: User
  message: string
}

export interface AdminInfoResponse {
  user: User
  isAdmin: boolean
  message: string
}
