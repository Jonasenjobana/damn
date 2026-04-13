<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/modules/auth'

const authStore = useAuthStore()

onMounted(async () => {
  // await authStore.checkLoginStatus()
})
</script>
