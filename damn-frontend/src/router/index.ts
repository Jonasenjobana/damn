import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/modules/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/views/frontend/FrontendLayout.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/frontend/Home.vue'),
      },
      {
        path: 'article/:id',
        name: 'ArticleDetail',
        component: () => import('@/views/frontend/ArticleDetail.vue'),
      },
    ],
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('@/views/admin/Login.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/admin',
    component: () => import('@/views/admin/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/admin/dashboard',
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/admin/Dashboard.vue'),
      },
      {
        path: 'articles',
        name: 'ArticleManage',
        component: () => import('@/views/admin/ArticleManage.vue'),
      },
      {
        path: 'article-types',
        name: 'ArticleTypeManage',
        component: () => import('@/views/admin/ArticleTypeManage.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth === true)

  if (requiresAuth) {
    if (!authStore.isLoggedIn) {
      await authStore.checkLoginStatus()
    }
    if (!authStore.isLoggedIn) {
      next('/admin/login')
      return
    }
  }

  if (to.path === '/admin/login' && authStore.isLoggedIn) {
    next('/admin/dashboard')
    return
  }

  next()
})

export default router
