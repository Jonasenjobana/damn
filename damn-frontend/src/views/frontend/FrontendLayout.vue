<template>
  <el-container class="frontend-layout">
    <div class="header-wrapper" :class="{ hidden: isHeaderHidden }">
      <el-header class="page-shell header glass-card">
        <router-link to="/" class="logo">
          <span class="logo-badge">
            <el-icon><Document /></el-icon>
          </span>
          <div class="logo-text">
            <h1>Damn Blog</h1>
            <small>Stories & Experiments</small>
          </div>
        </router-link>
        <el-menu mode="horizontal" :default-active="activeIndex" class="nav-menu" :ellipsis="false">
          <el-menu-item index="/" @click="router.push('/')">
            <el-icon><HomeFilled /></el-icon>
            首页
          </el-menu-item>
        </el-menu>
        <el-button
          :type="isDark ? 'default' : 'primary'"
          plain
          @click="toggleTheme"
          class="theme-btn"
          :icon="isDark ? Sunny : Moon"
          circle
        />
        <el-button type="primary" plain @click="goToAdmin" class="admin-btn">
          <el-icon><Setting /></el-icon>
          管理后台
        </el-button>
      </el-header>
    </div>

    <el-main class="main-content">
      <div class="page-shell animate-fade-up">
        <router-view />
      </div>
    </el-main>

    <el-footer class="footer">
      <div class="page-shell footer-content">
        <span>Crafted with Vue + Nest</span>
        <span class="dot"></span>
        <span>2026</span>
      </div>
    </el-footer>
  </el-container>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Setting, Document, HomeFilled, Sunny, Moon } from '@element-plus/icons-vue'
import { useThemeStore } from '@/stores/modules/theme'

const route = useRoute()
const router = useRouter()
const isHeaderHidden = ref(false)
let lastY = 0
const themeStore = useThemeStore()

const activeIndex = computed(() => route.path)
const isDark = computed(() => themeStore.isDark)

const goToAdmin = () => router.push('/admin/login')
const toggleTheme = () => themeStore.toggleTheme()

const onScroll = () => {
  const currentY = window.scrollY || 0
  isHeaderHidden.value = currentY > lastY && currentY > 88
  lastY = currentY
}

onMounted(() => window.addEventListener('scroll', onScroll))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<style scoped>
.frontend-layout {
  min-height: 100vh;
}

.header-wrapper {
  position: sticky;
  top: 12px;
  z-index: 20;
  padding: 12px 0 0;
  transition: transform 0.35s var(--ease-smooth);
}

.header-wrapper.hidden {
  transform: translateY(-120%);
}

.header {
  height: 72px;
  display: flex;
  align-items: center;
  gap: 22px;
  padding: 0 18px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.logo-badge {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  color: white;
  background: linear-gradient(145deg, var(--brand), var(--brand-strong));
}

.logo-text h1 {
  font-size: 18px;
  line-height: 1.1;
  color: var(--text-primary);
}

.logo-text small {
  font-size: 12px;
  color: var(--text-muted);
}

.nav-menu {
  flex: 1;
  border: none;
  background: transparent;
}

.admin-btn {
  border-radius: 11px;
}

.theme-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  transition: all 0.3s var(--ease-smooth);
}

.theme-btn:hover {
  transform: rotate(15deg) scale(1.1);
}

.main-content {
  padding: 36px 0 0;
}

.footer {
  padding: 30px 0 42px;
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 14px;
  color: var(--text-muted);
}

.dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--text-muted);
}

:deep(.el-menu--horizontal) {
  border: none;
}

:deep(.el-menu-item) {
  border-radius: 10px;
  margin-right: 8px;
  font-weight: 600;
  color: var(--text-secondary);
  border-bottom: none !important;
}

:deep(.el-menu-item:hover),
:deep(.el-menu-item.is-active) {
  color: var(--brand-strong);
  background: color-mix(in srgb, var(--brand) 10%, white);
}

@media (max-width: 768px) {
  .header {
    height: 66px;
    gap: 8px;
    padding: 0 10px;
  }

  .admin-btn {
    padding: 8px 10px;
    font-size: 12px;
  }

  .logo-text small {
    display: none;
  }
}
</style>
