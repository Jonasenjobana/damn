<template>
  <div class="login-container">
    <div class="login-wrapper">
      <div class="login-card">
        <div class="login-header">
          <div class="logo-wrapper">
            <div class="logo-icon">
              <el-icon><Lock /></el-icon>
            </div>
          </div>
          <h1 class="login-title">Damn Blog</h1>
          <p class="login-subtitle">管理后台登录</p>
        </div>

        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
          @submit.prevent="handleLogin"
        >
          <el-form-item prop="username">
            <div class="input-wrapper">
              <div class="input-icon">
                <el-icon><User /></el-icon>
              </div>
              <el-input
                v-model="loginForm.username"
                placeholder="请输入用户名"
                size="large"
                class="custom-input"
                clearable
              />
            </div>
          </el-form-item>

          <el-form-item prop="password">
            <div class="input-wrapper">
              <div class="input-icon">
                <el-icon><Lock /></el-icon>
              </div>
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                size="large"
                class="custom-input"
                show-password
                clearable
                @keyup.enter="handleLogin"
              />
            </div>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              :loading="loading"
              class="login-button"
              @click="handleLogin"
            >
              <span v-if="!loading">
                <el-icon><ArrowRight /></el-icon>
                登录
              </span>
              <span v-else>登录中...</span>
            </el-button>
          </el-form-item>
        </el-form>

        <div class="login-footer">
          <el-link type="primary" :underline="false" @click="goHome" class="home-link">
            <el-icon><HomeFilled /></el-icon>
            返回前台
          </el-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { User, Lock, HomeFilled, ArrowRight } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/modules/auth'
import type { LoginDTO } from '@/types/user'

const router = useRouter()
const authStore = useAuthStore()

const loginFormRef = ref<FormInstance>()
const loading = ref(false)

const loginForm = reactive<LoginDTO>({
  username: '',
  password: '',
})

const loginRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
  ],
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    const valid = await loginFormRef.value.validate()
    if (!valid) return

    loading.value = true

    const success = await authStore.login(loginForm)

    if (success) {
      ElMessage.success('登录成功')
      router.push('/admin/dashboard')
    } else {
      ElMessage.error('登录失败，请检查用户名和密码')
    }
  } catch (error: any) {
    console.error('Login error:', error)
    ElMessage.error(error.message || '登录失败，请检查用户名和密码')
  } finally {
    loading.value = false
  }
}

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-base);
  padding: 20px;
  position: relative;
}

.login-wrapper {
  width: 100%;
  max-width: 440px;
  position: relative;
  z-index: 1;
  animation: slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.login-card {
  background: #fff;
  border-radius: 24px;
  padding: 48px 40px;
  box-shadow: var(--shadow-soft);
  border: 1px solid var(--line-soft);
  position: relative;
  overflow: hidden;
}

.login-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--line-soft);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo-wrapper {
  margin-bottom: 20px;
}

.logo-icon {
  width: 80px;
  height: 80px;
  background: var(--brand);
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: none;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.03);
  }
}

.logo-icon .el-icon {
  font-size: 40px;
  color: #fff;
}

.login-title {
  font-size: 32px;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 10px 0;
  letter-spacing: -0.5px;
}

.login-subtitle {
  font-size: 15px;
  color: #64748b;
  margin: 0;
  font-weight: 500;
}

.login-form {
  margin-bottom: 24px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 16px;
  z-index: 1;
  color: #94a3b8;
  transition: color 0.3s ease;
  pointer-events: none;
}

.input-icon .el-icon {
  font-size: 20px;
}

.custom-input {
  padding-left: 48px;
}

.login-button {
  width: 100%;
  height: 52px;
  font-size: 16px;
  font-weight: 700;
  border-radius: 14px;
  background: var(--brand);
  border: none;
  box-shadow: none;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.login-button:hover {
  transform: translateY(-1px);
}

.login-button:active {
  transform: translateY(0);
}

.login-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid rgba(226, 232, 240, 0.8);
}

.home-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 600;
  color: var(--brand-strong);
  transition: all 0.3s ease;
  padding: 8px 16px;
  border-radius: 10px;
}

.home-link:hover {
  background: rgba(15, 118, 110, 0.08);
  color: var(--brand-strong);
}

:deep(.el-form-item) {
  margin-bottom: 24px;
}

:deep(.el-input__wrapper) {
  padding: 4px 16px;
  border-radius: 14px;
  background: #f8fafc;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  box-shadow: none;
}

:deep(.el-input__wrapper:hover) {
  background: #fff;
  border-color: #e2e8f0;
}

:deep(.el-input__wrapper.is-focus) {
  background: #fff;
  border-color: var(--brand);
  box-shadow: 0 0 0 4px rgba(15, 118, 110, 0.12);
}

:deep(.el-input__wrapper.is-focus + .input-icon) {
  color: var(--brand-strong);
}

:deep(.el-input__inner) {
  height: 48px;
  font-size: 15px;
  font-weight: 500;
  color: #1e293b;
}

:deep(.el-input__inner::placeholder) {
  color: #94a3b8;
}

:deep(.el-button--primary) {
  background: var(--brand);
  border: none;
}

:deep(.el-button--primary:hover) {
  background: var(--brand-strong);
}

@media (max-width: 640px) {
  .login-card {
    padding: 40px 28px;
    border-radius: 20px;
  }

  .login-title {
    font-size: 28px;
  }

  .logo-icon {
    width: 70px;
    height: 70px;
  }

  .logo-icon .el-icon {
    font-size: 36px;
  }
}
</style>
