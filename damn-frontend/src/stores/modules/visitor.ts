import { defineStore } from 'pinia'
import { ref } from 'vue'
import { visitorAPI, type VisitorStats } from '@/api/modules/visitor'

export const useVisitorStore = defineStore('visitor', () => {
  const stats = ref<VisitorStats | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchStats() {
    loading.value = true
    error.value = null
    
    try {
      const response = await visitorAPI.getStats()
      
      if (response.rlt === '0') {
        stats.value = response.data
      } else {
        error.value = response.msg || '获取访客统计失败'
      }
    } catch (err: any) {
      error.value = err.message || '获取访客统计失败'
      console.error('Failed to fetch visitor stats:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    stats,
    loading,
    error,
    fetchStats,
  }
})
