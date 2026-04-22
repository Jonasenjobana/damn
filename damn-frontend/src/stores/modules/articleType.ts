import { defineStore } from 'pinia'
import { ref } from 'vue'
import { articleTypeAPI } from '@/api/modules/articleType'
import type { ArticleType, CreateArticleTypeDTO, UpdateArticleTypeDTO } from '@/types/articleType'

export const useArticleTypeStore = defineStore('articleType', () => {
  const types = ref<ArticleType[]>([])
  const loading = ref(false)

  async function fetchTypes() {
    loading.value = true
    try {
      const response = await articleTypeAPI.getList()
      types.value = response.data
    } catch (error) {
      console.error('Failed to fetch article types:', error)
    } finally {
      loading.value = false
    }
  }

  async function createType(data: CreateArticleTypeDTO) {
    try {
      const response = await articleTypeAPI.create(data)
      await fetchTypes()
      return response.data
    } catch (error) {
      console.error('Failed to create article type:', error)
      throw error
    }
  }

  async function updateType(id: number, data: UpdateArticleTypeDTO) {
    try {
      const response = await articleTypeAPI.update(id, data)
      await fetchTypes()
      return response.data
    } catch (error) {
      console.error('Failed to update article type:', error)
      throw error
    }
  }

  async function deleteType(id: number) {
    try {
      await articleTypeAPI.delete(id)
      await fetchTypes()
    } catch (error) {
      console.error('Failed to delete article type:', error)
      throw error
    }
  }

  async function updateSort(orders: { id: number; sort: number }[]) {
    try {
      await articleTypeAPI.updateSort(orders)
      return true
    } catch (error) {
      console.error('Failed to update sort:', error)
      throw error
    }
  }

  return {
    types,
    loading,
    fetchTypes,
    createType,
    updateType,
    deleteType,
    updateSort,
  }
})
