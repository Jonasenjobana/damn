import request from '../request'
import type { ApiResponse } from '@/types/api'
import type { Article, ArticleStats, LikeResponse, CreateArticleDTO, UpdateArticleDTO } from '@/types/article'

export const articleAPI = {
  getList(): Promise<ApiResponse<Article[]>> {
    return request.get('/article/list')
  },
  getOne(id: number): Promise<ApiResponse<Article>> {
    return request.get(`/article/${id}`)
  },
  create(data: CreateArticleDTO): Promise<ApiResponse<Article>> {
    return request.post('/article/create', data)
  },
  update(id: number, data: UpdateArticleDTO): Promise<ApiResponse<Article>> {
    return request.put(`/article/update/${id}`, data)
  },
  delete(id: number): Promise<ApiResponse<null>> {
    return request.delete(`/article/delete/${id}`)
  },
  togglePin(id: number): Promise<ApiResponse<{ isPinned: number }>> {
    return request.put(`/article/pin/${id}`)
  },
  recordViewDuration(id: number, duration: number): Promise<ApiResponse<null>> {
    return request.post(`/article/${id}/view`, { duration })
  },
  toggleLike(id: number): Promise<ApiResponse<LikeResponse>> {
    return request.post(`/article/${id}/like`)
  },
  getStats(id: number): Promise<ApiResponse<ArticleStats>> {
    return request.get(`/article/${id}/stats`)
  },
}
