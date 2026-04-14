import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'system'

export const useThemeStore = defineStore('theme', () => {
  const mode = ref<ThemeMode>(localStorage.getItem('theme-mode') as ThemeMode || 'system')
  const isDark = computed(() => {
    if (mode.value === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return mode.value === 'dark'
  })

  const applyTheme = () => {
    const root = document.documentElement
    root.classList.remove('theme-light', 'theme-dark')
    if (mode.value === 'light') {
      root.classList.add('theme-light')
    } else if (mode.value === 'dark') {
      root.classList.add('theme-dark')
    }
    localStorage.setItem('theme-mode', mode.value)
  }

  const setMode = (newMode: ThemeMode) => {
    mode.value = newMode
    applyTheme()
  }

  const toggleTheme = () => {
    if (mode.value === 'system') {
      mode.value = isDark.value ? 'light' : 'dark'
    } else {
      mode.value = mode.value === 'light' ? 'dark' : 'light'
    }
    applyTheme()
  }

  const handleSystemChange = (e: MediaQueryListEvent) => {
    if (mode.value === 'system') {
      applyTheme()
    }
  }

  watch(isDark, () => {
    applyTheme()
  })

  if (mode.value === 'system') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', handleSystemChange)
  }

  applyTheme()

  return {
    mode,
    isDark,
    setMode,
    toggleTheme,
    applyTheme
  }
})
