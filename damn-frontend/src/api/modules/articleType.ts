import request from '../request'
import type { ApiResponse } from '@/types/api'
import type { ArticleType, CreateArticleTypeDTO, UpdateArticleTypeDTO } from '@/types/articleType'

export const articleTypeAPI = {
  getList(): Promise<ApiResponse<ArticleType[]>> {
    return request.get('/article-type/list')
  },
  create(data: CreateArticleTypeDTO): Promise<ApiResponse<ArticleType>> {
    return request.post('/article-type/create', data)
  },
  update(id: number, data: UpdateArticleTypeDTO): Promise<ApiResponse<ArticleType>> {
    return request.put(`/article-type/update/${id}`, data)
  },
  delete(id: number): Promise<ApiResponse<null>> {
    return request.delete(`/article-type/delete/${id}`)
  },
}
