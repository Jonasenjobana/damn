export interface Article {
  id: number
  title: string
  content: string
  cover?: string
  articleTypeId: number
  articleTypeName?: string
  sort: number
  isPinned: number
  isPrivate: number
  status: number
  viewCount: number
  likeCount: number
  totalViewDuration: number
  createTime: string
  updateTime: string
}

export interface ArticleStats {
  viewCount: number
  likeCount: number
  totalViewDuration: number
  liked: boolean
}

export interface LikeResponse {
  liked: boolean
  likeCount: number
}

export interface CreateArticleDTO {
  title: string
  content: string
  cover?: string
  article_type_id: number
  sort?: number
  is_pinned?: number
  is_private?: number
}

export interface UpdateArticleDTO {
  title?: string
  content?: string
  cover?: string
  article_type_id?: number
  sort?: number
  is_pinned?: number
  is_private?: number
  status?: number
}
