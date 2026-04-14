<template>
  <el-container class="admin-layout">
    <el-aside width="260px" class="aside">
      <div class="logo">
        <div class="logo-icon">
          <el-icon><Setting /></el-icon>
        </div>
        <h2>管理后台</h2>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="menu"
        :router="true"
        background-color="transparent"
        text-color="#94a3b8"
        active-text-color="#667eea"
      >
        <el-menu-item index="/admin/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/admin/articles">
          <el-icon><Document /></el-icon>
          <span>文章管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/article-types">
          <el-icon><Collection /></el-icon>
          <span>文章类型</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container class="main-container">
      <el-header class="header">
        <div class="header-left">
          <div class="page-title-wrapper">
            <el-icon class="title-icon"><ArrowRight /></el-icon>
            <h3>{{ pageTitle }}</h3>
          </div>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand" class="user-dropdown">
            <div class="user-info">
              <div class="user-avatar">
                <el-icon><User /></el-icon>
              </div>
              <div class="user-details">
                <span class="user-name">{{ authStore.userInfo?.username || '管理员' }}</span>
                <span class="user-role">超级管理员</span>
              </div>
              <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu class="user-dropdown-menu">
                <el-dropdown-item command="home">
                  <el-icon><HomeFilled /></el-icon>
                  前台首页
                </el-dropdown-item>
                <el-dropdown-item command="logout" divided>
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  DataAnalysis,
  Document,
  Collection,
  User,
  ArrowDown,
  ArrowRight,
  HomeFilled,
  SwitchButton,
  Setting,
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/modules/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const activeMenu = computed(() => route.path)

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/admin/dashboard': '仪表盘',
    '/admin/articles': '文章管理',
    '/admin/article-types': '文章类型管理',
  }
  return titles[route.path] || '管理后台'
})

const handleCommand = async (command: string) => {
  if (command === 'home') {
    router.push('/')
  } else if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
      authStore.logout()
      ElMessage.success('已退出登录')
      router.push('/admin/login')
    } catch {
      // User cancelled
    }
  }
}
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  background: var(--bg-base);
}

.aside {
  background: #111827;
  box-shadow: 2px 0 16px rgba(15, 23, 42, 0.16);
  display: flex;
  flex-direction: column;
  position: relative;
  border-right: 1px solid rgba(148, 163, 184, 0.2);
}

.logo {
  height: 80px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 14px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.22);
  background: rgba(15, 23, 42, 0.28);
}

.logo-icon {
  width: 42px;
  height: 42px;
  background: var(--brand);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: none;
}

.logo-icon .el-icon {
  font-size: 22px;
  color: #fff;
}

.logo h2 {
  margin: 0;
  color: #f8fafc;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.3px;
}

.menu {
  border: none;
  background: transparent;
  padding: 20px 16px;
  flex: 1;
}

.menu .el-menu-item {
  height: 52px;
  line-height: 52px;
  margin: 4px 0;
  border-radius: 12px;
  color: #94a3b8;
  font-weight: 500;
  font-size: 15px;
  padding: 0 16px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.menu .el-menu-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%) scaleY(0);
  width: 3px;
  height: 24px;
  background: var(--brand);
  border-radius: 0 2px 2px 0;
  transition: all 0.3s ease;
}

.menu .el-menu-item:hover {
  background: rgba(14, 165, 164, 0.1) !important;
  color: #f1f5f9;
}

.menu .el-menu-item:hover::before {
  transform: translateY(-50%) scaleY(1);
}

.menu .el-menu-item.is-active {
  background: rgba(14, 165, 164, 0.2) !important;
  color: #99f6e4;
}

.menu .el-menu-item.is-active::before {
  transform: translateY(-50%) scaleY(1);
}

.menu .el-menu-item .el-icon {
  margin-right: 10px;
  font-size: 18px;
}

.main-container {
  display: flex;
  flex-direction: column;
}

.header {
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  height: 72px;
  border-bottom: 1px solid #e2e8f0;
}

.header-left {
  display: flex;
  align-items: center;
}

.page-title-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-icon {
  color: var(--brand);
  font-size: 20px;
}

.header-left h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: -0.3px;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-dropdown {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  border-radius: 14px;
  transition: all 0.3s ease;
}

.user-info:hover {
  background: #f8fafc;
}

.user-avatar {
  width: 44px;
  height: 44px;
  background: #0f172a;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: none;
}

.user-avatar .el-icon {
  font-size: 22px;
  color: #fff;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}

.user-role {
  font-size: 12px;
  color: #94a3b8;
}

.dropdown-icon {
  color: #94a3b8;
  font-size: 16px;
  transition: transform 0.3s ease;
}

.user-info:hover .dropdown-icon {
  transform: translateY(2px);
}

.main-content {
  background: var(--bg-base);
  padding: 24px 32px;
  overflow-y: auto;
  flex: 1;
}

.user-dropdown-menu {
  padding: 8px;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid #e2e8f0;
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 8px;
  margin: 2px 0;
  font-size: 14px;
  font-weight: 500;
  color: #475569;
  transition: all 0.2s ease;
}

:deep(.el-dropdown-menu__item:hover) {
  background: #f1f5f9;
  color: var(--brand-strong);
}

:deep(.el-dropdown-menu__item .el-icon) {
  font-size: 16px;
}

:deep(.el-dropdown-menu__item--divided) {
  margin-top: 6px;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
}
</style>
