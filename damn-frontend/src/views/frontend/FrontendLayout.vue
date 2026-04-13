<template>
  <el-container class="frontend-layout">
    <div class="header-wrapper" :class="{ 'header-hidden': isHeaderHidden }">
      <el-header class="header">
        <div class="header-content">
          <router-link to="/" class="logo">
            <div class="logo-icon">
              <el-icon><Document /></el-icon>
            </div>
            <h1>Damn Blog</h1>
          </router-link>
          <el-menu
            mode="horizontal"
            :default-active="activeIndex"
            class="nav-menu"
            :ellipsis="false"
          >
            <el-menu-item index="/" @click="router.push('/')">
              <el-icon><HomeFilled /></el-icon>
              首页
            </el-menu-item>
          </el-menu>
          <div class="header-actions">
            <el-button type="primary" @click="goToAdmin" class="admin-btn">
              <el-icon><Setting /></el-icon>
              管理后台
            </el-button>
          </div>
        </div>
      </el-header>
    </div>
    <el-main class="main-content" ref="mainContentRef" @scroll="handleScroll">
      <router-view />
    </el-main>
    <el-footer class="footer">
      <div class="footer-content">
        <div class="footer-logo">
          <el-icon><Document /></el-icon>
          <span>Damn Blog</span>
        </div>
        <div class="footer-links">
          <router-link to="/" class="footer-link">首页</router-link>
          <a href="#" class="footer-link">关于</a>
          <a href="#" class="footer-link">联系</a>
        </div>
        <div class="footer-copyright">
          <p>© 2024 Damn Blog. All rights reserved.</p>
        </div>
      </div>
    </el-footer>
  </el-container>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Setting, Document, HomeFilled } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const mainContentRef = ref<HTMLElement | null>(null)
const isHeaderHidden = ref(false)
let lastScrollTop = 0

const activeIndex = computed(() => route.path)

const goToAdmin = () => {
  router.push('/admin/login')
}

const handleScroll = () => {
  if (!mainContentRef.value) return
  
  const scrollTop = mainContentRef.value.scrollTop
  
  if (scrollTop > lastScrollTop && scrollTop > 20) {
    isHeaderHidden.value = true
  } else {
    isHeaderHidden.value = false
  }
  
  lastScrollTop = scrollTop
}
</script>

<style scoped>
.frontend-layout {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  background-attachment: fixed;
  display: flex;
  flex-direction: column;
  position: relative;
}

.frontend-layout::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(118, 75, 162, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(240, 147, 251, 0.2) 0%, transparent 40%);
  pointer-events: none;
  z-index: 0;
}

.header-wrapper {
  position: sticky;
  top: 0;
  z-index: 1000;
  padding: 16px 20px;
  flex-shrink: 0;
  transform: translateY(0);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.header-wrapper.header-hidden {
  transform: translateY(-120%);
}

.header {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  height: auto;
  padding: 0;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  height: 70px;
  gap: 24px;
  padding: 0 24px;
}

.logo {
  text-decoration: none;
  color: #333;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: transform 0.3s ease;
}

.logo:hover {
  transform: scale(1.05);
}

.logo-icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.logo-icon .el-icon {
  font-size: 24px;
  color: #fff;
}

.logo h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
}

.nav-menu {
  flex: 1;
  border: none;
  background: transparent;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.admin-btn {
  padding: 10px 24px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
}

.admin-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px 60px;
  padding-right: 60px;
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.footer {
  background: transparent;
  padding: 40px 20px 60px;
  margin-top: auto;
  position: relative;
  z-index: 1;
  flex-shrink: 0;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.footer-logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.footer-logo .el-icon {
  font-size: 28px;
  color: rgba(255, 255, 255, 0.9);
}

.footer-logo span {
  font-size: 20px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-bottom: 20px;
}

.footer-link {
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
}

.footer-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: rgba(255, 255, 255, 0.8);
  transition: width 0.3s ease;
}

.footer-link:hover {
  color: rgba(255, 255, 255, 1);
}

.footer-link:hover::after {
  width: 100%;
}

.footer-copyright p {
  margin: 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

:deep(.el-menu--horizontal) {
  border: none;
}

:deep(.el-menu-item) {
  font-weight: 600;
  font-size: 15px;
  height: 70px;
  line-height: 70px;
  color: #6b7280;
  transition: all 0.3s ease;
  border-bottom: 2px solid transparent;
}

:deep(.el-menu-item:hover) {
  background: rgba(102, 126, 234, 0.08);
  color: #667eea;
}

:deep(.el-menu-item.is-active) {
  background: transparent;
  color: #667eea;
  border-bottom-color: #667eea;
}

:deep(.el-menu-item .el-icon) {
  margin-right: 6px;
  font-size: 18px;
}

@media (max-width: 768px) {
  .header-wrapper {
    padding: 12px 16px;
  }

  .header-content {
    padding: 0 16px;
    height: 60px;
  }

  .logo h1 {
    font-size: 20px;
  }

  .logo-icon {
    width: 36px;
    height: 36px;
  }

  .logo-icon .el-icon {
    font-size: 20px;
  }

  .admin-btn {
    padding: 8px 16px;
    font-size: 14px;
  }

  .nav-menu {
    display: none;
  }

  .footer-links {
    gap: 20px;
  }
}
</style>
