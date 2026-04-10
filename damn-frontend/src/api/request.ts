import axios from 'axios'
import type { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

const request = axios.create({
  baseURL: '/api',
  timeout: 30000,
  withCredentials: true,
})

request.interceptors.request.use(
  (config) => {
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

request.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data
    if (res.rlt === '0') {
      return res
    } else {
      ElMessage.error(res.msg || '请求失败')
      return Promise.reject(new Error(res.msg || '请求失败'))
    }
  },
  (error: AxiosError<any>) => {
    if (error.response) {
      const { status, data } = error.response
      if (status === 401) {
        ElMessage.error('未授权，请重新登录')
        router.push('/admin/login')
      } else if (status === 400) {
        ElMessage.error(data?.msg || '请求参数错误')
      } else if (status === 500) {
        ElMessage.error('服务器错误')
      } else {
        ElMessage.error(data?.msg || '请求失败')
      }
    } else if (error.request) {
      ElMessage.error('网络连接失败')
    } else {
      ElMessage.error(error.message || '请求配置错误')
    }
    return Promise.reject(error)
  }
)

export default request
