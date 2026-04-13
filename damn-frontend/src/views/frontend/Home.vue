<template>
  <div class="home-page">
    <div class="page-header">
      <div class="header-decoration">
        <div class="decoration-circle circle-1"></div>
        <div class="decoration-circle circle-2"></div>
        <div class="decoration-circle circle-3"></div>
      </div>
      <div class="header-content">
        <h2 class="page-title">博客文章</h2>
        <p class="page-subtitle">探索精彩内容，发现无限可能</p>
        <div class="header-divider"></div>
      </div>
    </div>

    <el-row :gutter="24" v-loading="loading" class="articles-grid">
      <el-col
        v-for="article in articles"
        :key="article.id"
        :xs="24"
        :sm="12"
        :md="8"
        :lg="8"
        class="article-col"
      >
        <div class="article-card" @click="goToArticle(article.id)">
          <div class="card-cover-wrapper">
            <div class="article-cover" v-if="article.cover">
              <el-image :src="article.cover" fit="cover" :lazy="true">
                <template #error>
                  <div class="image-fallback">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div class="cover-overlay"></div>
            </div>
            <div class="article-cover-empty" v-else>
              <el-icon><Document /></el-icon>
              <div class="cover-overlay"></div>
            </div>
            <div class="card-tags">
              <el-tag v-if="article.isPinned === 1" type="danger" size="small" class="pin-tag" effect="dark">
                <el-icon><Top /></el-icon>
                置顶
              </el-tag>
              <el-tag size="small" class="type-tag" effect="light">
                {{ article.articleTypeName }}
              </el-tag>
            </div>
          </div>
          <div class="article-content">
            <h3 class="article-title">{{ article.title }}</h3>
            <p class="article-excerpt">{{ getExcerpt(article.content) }}</p>
          </div>
          <div class="card-footer">
            <div class="article-stats">
              <span class="stat-item">
                <el-icon><View /></el-icon>
                {{ article.viewCount || 0 }}
              </span>
              <span class="stat-item">
                <el-icon><Star /></el-icon>
                {{ article.likeCount || 0 }}
              </span>
            </div>
            <div class="article-date">
              <el-icon><Calendar /></el-icon>
              {{ formatDate(article.createTime) }}
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-empty v-if="!loading && articles.length === 0" description="暂无文章" class="empty-state">
      <el-button type="primary" @click="loadArticles" class="refresh-btn">
        <el-icon><RefreshLeft /></el-icon>
        刷新
      </el-button>
    </el-empty>

    <div class="loading-wrapper" v-if="loading && articles.length > 0">
      <el-skeleton :rows="3" animated />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Picture, View, Star, Document, Top, Calendar, RefreshLeft } from '@element-plus/icons-vue'
import { articleAPI } from '@/api/modules/article'
import type { Article } from '@/types/article'

const router = useRouter()
const articles = ref<Article[]>([])
const loading = ref(false)

const getExcerpt = (content: string, maxLength: number = 100) => {
  if (!content) return ''
  const text = content.replace(/[#*`\[\]]/g, '').trim()
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

const loadArticles = async () => {
  loading.value = true
  try {
    const response = await articleAPI.getList()
    if (response.rlt === '0') {
      articles.value = response.data || []
    } else {
      ElMessage.error(response.msg || '加载文章失败')
    }
  } catch (error: any) {
    console.error('Failed to load articles:', error)
    ElMessage.error(error.message || '加载文章失败')
  } finally {
    loading.value = false
  }
}

const goToArticle = (id: number) => {
  router.push(`/article/${id}`)
}

onMounted(() => {
  loadArticles()
})
</script>

<style scoped>
.home-page {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-header {
  text-align: center;
  margin-bottom: 60px;
  position: relative;
  padding: 40px 0;
}

.header-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.circle-1 {
  width: 120px;
  height: 120px;
  top: -20px;
  left: 10%;
  animation-delay: 0s;
}

.circle-2 {
  width: 80px;
  height: 80px;
  top: 40px;
  right: 15%;
  animation-delay: 2s;
}

.circle-3 {
  width: 60px;
  height: 60px;
  bottom: 10px;
  left: 25%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(10deg);
  }
}

.header-content {
  position: relative;
  z-index: 1;
}

.page-title {
  font-size: 42px;
  font-weight: 800;
  color: #fff;
  margin: 0 0 12px 0;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  letter-spacing: 2px;
}

.page-subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 24px 0;
  font-weight: 400;
}

.header-divider {
  width: 80px;
  height: 4px;
  background: linear-gradient(90deg, transparent, #fff, transparent);
  margin: 0 auto;
  border-radius: 2px;
}

.articles-grid {
  margin-bottom: 40px;
}

.article-col {
  margin-bottom: 24px;
}

.article-card {
  height: 100%;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 20px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.article-card:hover {
  transform: translateY(-12px) scale(1.02);
  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.25);
}

.card-cover-wrapper {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.article-cover,
.article-cover-empty {
  width: 100%;
  height: 100%;
  position: relative;
}

.article-cover .el-image {
  width: 100%;
  height: 100%;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.article-card:hover .article-cover .el-image {
  transform: scale(1.1);
}

.article-cover-empty {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.article-cover-empty .el-icon {
  font-size: 64px;
  color: rgba(255, 255, 255, 0.8);
}

.cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.3) 100%);
  pointer-events: none;
}

.card-tags {
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
  align-items: center;
  z-index: 10;
}

.pin-tag,
.type-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  border: none;
}

.article-content {
  padding: 24px;
  min-height: 140px;
}

.article-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 12px 0;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  transition: color 0.3s ease;
}

.article-card:hover .article-title {
  color: #667eea;
}

.article-excerpt {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.7;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(102, 126, 234, 0.02);
}

.article-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #9ca3af;
  font-weight: 500;
  transition: color 0.3s ease;
}

.article-card:hover .stat-item {
  color: #667eea;
}

.stat-item .el-icon {
  font-size: 16px;
}

.article-date {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #d1d5db;
}

.article-date .el-icon {
  font-size: 14px;
}

.empty-state {
  padding: 80px 0;
}

.empty-state :deep(.el-empty__description) {
  color: rgba(255, 255, 255, 0.8);
}

.refresh-btn {
  margin-top: 20px;
  padding: 12px 32px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  transition: all 0.3s ease;
}

.refresh-btn:hover {
  background: #fff;
  color: #667eea;
  transform: translateY(-2px);
}

.loading-wrapper {
  margin-top: 20px;
  background: rgba(255, 255, 255, 0.95);
  padding: 30px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

.image-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: rgba(255, 255, 255, 0.8);
  font-size: 56px;
}
</style>
