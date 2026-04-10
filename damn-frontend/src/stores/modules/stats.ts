import { defineStore } from 'pinia'
import { ref } from 'vue'
import { statsAPI } from '@/api/modules/stats'
import type { ErrorStatsResponse } from '@/types/api'

export const useStatsStore = defineStore('stats', () => {
  const errorStats = ref<ErrorStatsResponse | null>(null)
  const loading = ref(false)

  async function fetchErrorStats() {
    loading.value = true
    try {
      const response = await statsAPI.getErrorStats()
      errorStats.value = response.data
    } catch (error) {
      console.error('Failed to fetch error stats:', error)
    } finally {
      loading.value = false
    }
  }

  async function clearErrorStats() {
    try {
      await statsAPI.clearErrorStats()
      errorStats.value = null
    } catch (error) {
      console.error('Failed to clear error stats:', error)
      throw error
    }
  }

  return {
    errorStats,
    loading,
    fetchErrorStats,
    clearErrorStats,
  }
})
