export interface ArticleType {
  id: number
  name: string
  sort: number
  status: number
  createTime: string
  updateTime: string
}

export interface CreateArticleTypeDTO {
  name: string
  sort?: number
}

export interface UpdateArticleTypeDTO {
  name?: string
  sort?: number
  status?: number
}
