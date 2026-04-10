import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authAPI } from '@/api/modules/auth'
import { userAPI } from '@/api/modules/user'
import type { LoginDTO } from '@/types/user'
import type { User } from '@/types/user'

export const useAuthStore = defineStore('auth', () => {
  const isLoggedIn = ref(false)
  const userInfo = ref<User | null>(null)
  const isAdmin = ref(false)

  async function login(credentials: LoginDTO) {
    try {
      const response = await authAPI.login(credentials)
      isLoggedIn.value = true
      userInfo.value = response.data.user
      const isAdminValue = response.data.user.isAdmin
      isAdmin.value = isAdminValue === 1 || isAdminValue === true
      return true
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }

  async function checkLoginStatus() {
    try {
      const response = await userAPI.getProfile()
      isLoggedIn.value = true
      userInfo.value = response.data.user
      const isAdminValue = response.data.user.isAdmin
      isAdmin.value = isAdminValue === 1 || isAdminValue === true
      return true
    } catch (error) {
      isLoggedIn.value = false
      userInfo.value = null
      isAdmin.value = false
      return false
    }
  }

  function logout() {
    isLoggedIn.value = false
    userInfo.value = null
    isAdmin.value = false
  }

  return {
    isLoggedIn,
    userInfo,
    isAdmin,
    login,
    checkLoginStatus,
    logout,
  }
})
