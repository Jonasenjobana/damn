<template>
  <el-container class="frontend-layout">
    <el-header class="header">
      <div class="header-content">
        <router-link to="/" class="logo">
          <h1>Damn Blog</h1>
        </router-link>
        <el-menu
          mode="horizontal"
          :default-active="activeIndex"
          class="nav-menu"
          :ellipsis="false"
        >
          <el-menu-item index="/" @click="router.push('/')">首页</el-menu-item>
        </el-menu>
        <div class="header-actions">
          <el-button type="primary" @click="goToAdmin">
            <el-icon><Setting /></el-icon>
            管理后台
          </el-button>
        </div>
      </div>
    </el-header>
    <el-main class="main-content">
      <router-view />
    </el-main>
    <el-footer class="footer">
      <p>© 2024 Damn Blog. All rights reserved.</p>
    </el-footer>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Setting } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const activeIndex = computed(() => route.path)

const goToAdmin = () => {
  router.push('/admin/login')
}
</script>

<style scoped>
.frontend-layout {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  flex: 1;
}

.header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  height: 100%;
  gap: 20px;
}

.logo {
  text-decoration: none;
  color: #333;
}

.logo h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-menu {
  flex: 1;
  border: none;
  background: transparent;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.footer {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  text-align: center;
  padding: 20px;
  margin-top: auto;
}

.footer p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

:deep(.el-menu--horizontal) {
  border: none;
}

:deep(.el-menu-item) {
  font-weight: 500;
}

:deep(.el-menu-item:hover) {
  background: rgba(102, 126, 234, 0.1);
}
</style>
