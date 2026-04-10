<template>
  <div class="home-page">
    <div class="page-header">
      <h2 class="page-title">博客文章</h2>
      <p class="page-subtitle">探索精彩内容，发现无限可能</p>
    </div>

    <el-row :gutter="20" v-loading="loading">
      <el-col
        v-for="article in articles"
        :key="article.id"
        :xs="24"
        :sm="12"
        :md="8"
        :lg="8"
        class="article-col"
      >
        <el-card class="article-card" shadow="hover" @click="goToArticle(article.id)">
          <template #header>
            <div class="card-header">
              <el-tag v-if="article.isPinned === 1" type="danger" size="small" class="pin-tag">
                置顶
              </el-tag>
              <span class="article-type">{{ article.articleTypeName }}</span>
            </div>
          </template>
          <div class="article-cover" v-if="article.cover">
            <el-image :src="article.cover" fit="cover" :lazy="true">
              <template #error>
                <div class="image-fallback">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </div>
          <div class="article-content">
            <h3 class="article-title">{{ article.title }}</h3>
            <p class="article-excerpt">{{ getExcerpt(article.content) }}</p>
          </div>
          <template #footer>
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
                {{ formatDate(article.createTime) }}
              </div>
            </div>
          </template>
        </el-card>
      </el-col>
    </el-row>

    <el-empty v-if="!loading && articles.length === 0" description="暂无文章">
      <el-button type="primary" @click="loadArticles">刷新</el-button>
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
import { Picture, View, Star } from '@element-plus/icons-vue'
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
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  font-size: 36px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 10px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.page-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

.article-col {
  margin-bottom: 20px;
}

.article-card {
  height: 100%;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
}

.article-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pin-tag {
  flex-shrink: 0;
}

.article-type {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.article-cover {
  width: 100%;
  height: 180px;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 12px;
}

.article-cover .el-image {
  width: 100%;
  height: 100%;
}

.image-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  color: #c0c4cc;
  font-size: 48px;
}

.article-content {
  min-height: 120px;
}

.article-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 10px 0;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.article-excerpt {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
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
}

.article-stats {
  display: flex;
  gap: 15px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #909399;
}

.stat-item .el-icon {
  font-size: 14px;
}

.article-date {
  font-size: 12px;
  color: #c0c4cc;
}

.loading-wrapper {
  margin-top: 20px;
  background: #fff;
  padding: 20px;
  border-radius: 12px;
}

:deep(.el-card__header) {
  padding: 12px 20px;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.el-card__body) {
  padding: 20px;
}

:deep(.el-card__footer) {
  padding: 12px 20px;
  border-top: 1px solid #f0f0f0;
}
</style>
