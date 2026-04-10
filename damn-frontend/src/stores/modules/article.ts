import { defineStore } from 'pinia'
import { ref } from 'vue'
import { articleAPI } from '@/api/modules/article'
import type { Article, ArticleStats, LikeResponse, CreateArticleDTO, UpdateArticleDTO } from '@/types/article'

export const useArticleStore = defineStore('article', () => {
  const articles = ref<Article[]>([])
  const currentArticle = ref<Article | null>(null)
  const currentArticleStats = ref<ArticleStats | null>(null)
  const loading = ref(false)

  async function fetchArticles() {
    loading.value = true
    try {
      const response = await articleAPI.getList()
      articles.value = response.data
    } catch (error) {
      console.error('Failed to fetch articles:', error)
    } finally {
      loading.value = false
    }
  }

  async function fetchArticle(id: number) {
    loading.value = true
    try {
      const response = await articleAPI.getOne(id)
      currentArticle.value = response.data
    } catch (error) {
      console.error('Failed to fetch article:', error)
    } finally {
      loading.value = false
    }
  }

  async function fetchArticleStats(id: number) {
    try {
      const response = await articleAPI.getStats(id)
      currentArticleStats.value = response.data
    } catch (error) {
      console.error('Failed to fetch article stats:', error)
    }
  }

  async function createArticle(data: CreateArticleDTO) {
    try {
      const response = await articleAPI.create(data)
      await fetchArticles()
      return response.data
    } catch (error) {
      console.error('Failed to create article:', error)
      throw error
    }
  }

  async function updateArticle(id: number, data: UpdateArticleDTO) {
    try {
      const response = await articleAPI.update(id, data)
      await fetchArticles()
      return response.data
    } catch (error) {
      console.error('Failed to update article:', error)
      throw error
    }
  }

  async function deleteArticle(id: number) {
    try {
      await articleAPI.delete(id)
      await fetchArticles()
    } catch (error) {
      console.error('Failed to delete article:', error)
      throw error
    }
  }

  async function togglePin(id: number) {
    try {
      const response = await articleAPI.togglePin(id)
      await fetchArticles()
      return response.data.isPinned === 1
    } catch (error) {
      console.error('Failed to toggle pin:', error)
      throw error
    }
  }

  async function toggleLike(id: number): Promise<LikeResponse> {
    try {
      const response = await articleAPI.toggleLike(id)
      await fetchArticleStats(id)
      return response.data
    } catch (error) {
      console.error('Failed to toggle like:', error)
      throw error
    }
  }

  async function recordViewDuration(id: number, duration: number) {
    try {
      await articleAPI.recordViewDuration(id, duration)
    } catch (error) {
      console.error('Failed to record view duration:', error)
    }
  }

  function clearCurrentArticle() {
    currentArticle.value = null
    currentArticleStats.value = null
  }

  return {
    articles,
    currentArticle,
    currentArticleStats,
    loading,
    fetchArticles,
    fetchArticle,
    fetchArticleStats,
    createArticle,
    updateArticle,
    deleteArticle,
    togglePin,
    toggleLike,
    recordViewDuration,
    clearCurrentArticle,
  }
})
