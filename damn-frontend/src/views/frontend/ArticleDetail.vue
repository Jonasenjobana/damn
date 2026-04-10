<template>
  <div class="article-detail" v-loading="loading">
    <div class="article-content-wrapper" v-if="article || !loading">
      <div class="article-main">
        <el-card v-if="article" class="article-card">
          <template #header>
            <div class="article-header">
              <div class="header-top">
                <el-tag v-if="article.isPinned === 1" type="danger" size="small">置顶</el-tag>
                <el-tag size="small">{{ article.articleTypeName }}</el-tag>
              </div>
              <h1 class="article-title">{{ article.title }}</h1>
              <div class="article-meta">
                <span class="meta-item">
                  <el-icon><Calendar /></el-icon>
                  {{ formatDate(article.createTime) }}
                </span>
                <span class="meta-item">
                  <el-icon><View /></el-icon>
                  {{ articleStats.viewCount || 0 }} 阅读
                </span>
                <span class="meta-item">
                  <el-icon><Timer /></el-icon>
                  {{ formatDuration(articleStats.totalViewDuration) }}
                </span>
              </div>
            </div>
          </template>

          <div class="article-cover" v-if="article.cover">
            <el-image :src="article.cover" fit="cover" :preview-src-list="[article.cover]">
              <template #error>
                <div class="image-fallback">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </div>

          <div class="article-body markdown-body" v-html="renderedContent"></div>

          <template #footer>
            <div class="article-footer">
              <div class="action-buttons">
                <el-button
                  :type="articleStats.liked ? 'danger' : 'default'"
                  @click="handleLike"
                  :icon="articleStats.liked ? StarFilled : Star"
                >
                  {{ articleStats.likeCount || 0 }} 点赞
                </el-button>
                <el-button @click="goBack" :icon="Back">返回</el-button>
              </div>
            </div>
          </template>
        </el-card>

        <el-empty v-if="!loading && !article" description="文章不存在或已删除">
          <el-button type="primary" @click="goBack">返回首页</el-button>
        </el-empty>
      </div>

      <div class="article-toc" v-if="toc.length > 0">
        <div class="toc-sticky">
          <div class="toc-title">📑 目录</div>
          <nav class="toc-list">
            <a 
              v-for="(item, index) in toc" 
              :key="index"
              :class="['toc-item', { active: activeIndex === index }]"
              :style="{ marginLeft: (item.level - 1) * 12 + 'px' }"
              @click="navigateTo(item)"
            >
              {{ item.text }}
            </a>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Calendar, View, Timer, Picture, Back, Star, StarFilled } from '@element-plus/icons-vue'
import { articleAPI } from '@/api/modules/article'
import type { Article } from '@/types/article'
import type { ArticleStats } from '@/types/article'
import { marked } from 'marked'

const route = useRoute()
const router = useRouter()

const articleId = computed(() => Number(route.params.id))

const article = ref<Article | null>(null)
const loading = ref(false)
const articleStats = ref<ArticleStats>({
  viewCount: 0,
  likeCount: 0,
  totalViewDuration: 0,
  liked: false,
})

let viewDurationTimer: number | null = null
let accumulatedDuration = 0
let pageVisible = true
let lastReportTime = Date.now()
let hasReportedInitial = false

interface TocItem {
  level: number
  text: string
  id: string
}

const toc = ref<TocItem[]>([])
const activeIndex = ref(0)
const observer = ref<IntersectionObserver | null>(null)

const parseToc = (content: string): TocItem[] => {
  const headings: TocItem[] = []
  const headingRegex = /^(#{1,6})\s+(.+)$/gm
  let match
  
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    const id = `heading-${headings.length}`
    headings.push({ level, text, id })
  }
  
  return headings
}

const renderMarkdown = (content: string): string => {
  let html = marked.parse(content, {
    breaks: true,
    gfm: true,
  }) as string
  
  let index = 0
  html = html.replace(/<(h[1-6])>(.*?)<\/h[1-6]>/g, (match, tag, text) => {
    const id = `heading-${index++}`
    return `<${tag} id="${id}">${text}</${tag}>`
  })
  
  return html
}

const renderedContent = computed(() => {
  if (!article.value?.content) return ''
  return renderMarkdown(article.value.content)
})

const setupObserver = () => {
  observer.value = new IntersectionObserver((entries) => {
    const visibleEntry = entries.find(entry => entry.isIntersecting)
    if (visibleEntry) {
      const id = visibleEntry.target.id
      const index = toc.value.findIndex(item => item.id === id)
      if (index !== -1) {
        activeIndex.value = index
      }
    }
  }, {
    rootMargin: '-20% 0px -80% 0px',
    threshold: 0.1
  })
}

const observeHeadings = () => {
  if (!observer.value) return
  
  toc.value.forEach(item => {
    nextTick(() => {
      const el = document.getElementById(item.id)
      if (el) {
        observer.value?.observe(el)
      }
    })
  })
}

const navigateTo = (item: TocItem) => {
  nextTick(() => {
    const el = document.getElementById(item.id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  })
}

watch(() => article.value?.content, (content) => {
  if (content) {
    toc.value = parseToc(content)
    nextTick(() => {
      observeHeadings()
    })
  }
})

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const formatDuration = (seconds: number) => {
  if (!seconds) return '0 分钟'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (minutes === 0) return `${remainingSeconds} 秒`
  return `${minutes} 分钟 ${remainingSeconds} 秒`
}

const loadArticle = async () => {
  if (isNaN(articleId.value)) {
    ElMessage.error('无效的文章ID')
    router.push('/')
    return
  }

  loading.value = true
  console.log('[ArticleDetail] 正在加载文章，ID:', articleId.value)
  
  try {
    const response = await articleAPI.getOne(articleId.value)
    if (response.rlt === '0') {
      article.value = response.data
      console.log('[ArticleDetail] 文章加载成功:', response.data.title)
      await loadArticleStats(articleId.value)
      startViewDurationTracking()
      hasReportedInitial = true
    } else {
      ElMessage.error(response.msg || '加载文章失败')
    }
  } catch (error: any) {
    console.error('[ArticleDetail] 加载文章失败:', error)
    ElMessage.error(error.message || '加载文章失败')
  } finally {
    loading.value = false
  }
}

const loadArticleStats = async (id: number) => {
  try {
    const response = await articleAPI.getStats(id)
    if (response.rlt === '0') {
      articleStats.value = response.data
    }
  } catch (error) {
    console.error('Failed to load article stats:', error)
  }
}

const handleLike = async () => {
  if (isNaN(articleId.value)) return

  try {
    const response = await articleAPI.toggleLike(articleId.value)
    if (response.rlt === '0') {
      articleStats.value.liked = response.data.liked
      articleStats.value.likeCount = response.data.likeCount
      ElMessage.success(response.data.liked ? '点赞成功' : '取消点赞')
    } else {
      ElMessage.error(response.msg || '操作失败')
    }
  } catch (error: any) {
    console.error('[ArticleDetail] 点赞操作失败:', error)
    ElMessage.error(error.message || '操作失败')
  }
}

const reportViewDuration = async () => {
  if (isNaN(articleId.value) || accumulatedDuration <= 0) {
    console.log('[ArticleDetail] 不需要上报时长，ID:', articleId.value, '时长:', accumulatedDuration)
    return
  }

  const durationToReport = accumulatedDuration
  console.log('[ArticleDetail] 正在上报阅读时长:', durationToReport, '秒, 文章ID:', articleId.value)

  try {
    const response = await articleAPI.recordViewDuration(articleId.value, durationToReport)
    if (response.rlt === '0') {
      console.log('[ArticleDetail] 阅读时长上报成功:', durationToReport, '秒')
      accumulatedDuration = 0
      lastReportTime = Date.now()
      
      await loadArticleStats(articleId.value)
    }
  } catch (error) {
    console.error('[ArticleDetail] 上报阅读时长失败:', error)
  }
}

const startViewDurationTracking = () => {
  if (viewDurationTimer) {
    console.log('[ArticleDetail] 定时器已存在，跳过创建')
    return
  }

  console.log('[ArticleDetail] 开始阅读时长追踪，文章ID:', articleId.value)
  
  viewDurationTimer = window.setInterval(() => {
    if (pageVisible) {
      accumulatedDuration += 10
      console.log('[ArticleDetail] 累加阅读时长，当前:', accumulatedDuration, '秒')
      
      if (accumulatedDuration >= 10) {
        reportViewDuration()
      }
    } else {
      console.log('[ArticleDetail] 页面不可见，暂停计时')
    }
  }, 10000)
}

const handleVisibilityChange = () => {
  pageVisible = !document.hidden
  console.log('[ArticleDetail] 页面可见性变化:', pageVisible ? '可见' : '不可见')
  
  if (pageVisible && accumulatedDuration > 0) {
    console.log('[ArticleDetail] 页面恢复可见，立即上报时长:', accumulatedDuration)
    reportViewDuration()
  }
}

const goBack = () => {
  router.push('/')
}

onMounted(() => {
  console.log('[ArticleDetail] 组件挂载')
  loadArticle()
  setupObserver()
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onUnmounted(() => {
  console.log('[ArticleDetail] 组件卸载，清理资源')
  
  if (viewDurationTimer) {
    clearInterval(viewDurationTimer)
    viewDurationTimer = null
  }
  
  if (accumulatedDuration > 0) {
    console.log('[ArticleDetail] 卸载前上报剩余时长:', accumulatedDuration)
    reportViewDuration()
  }
  
  observer.value?.disconnect()
  
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

const handleBeforeUnload = () => {
  if (accumulatedDuration > 0) {
    console.log('[ArticleDetail] 页面即将关闭，上报阅读时长:', accumulatedDuration)
    reportViewDuration()
  }
}
</script>

<style scoped>
.article-detail {
  animation: fadeIn 0.3s ease-in-out;
  flex: 1;
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

.article-content-wrapper {
  display: flex;
  gap: 40px;
  align-items: flex-start;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.article-main {
  flex: 1;
  min-width: 0;
}

.article-toc {
  width: 240px;
  flex-shrink: 0;
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 100;
}

.toc-sticky {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 400px;
  overflow-y: auto;
}

.toc-title {
  font-size: 16px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e4e7ed;
}

.toc-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.toc-item {
  font-size: 14px;
  color: #606266;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  line-height: 1.5;
}

.toc-item:hover {
  background: #f5f7fa;
  color: #409eff;
}

.toc-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-weight: 600;
}

@media (max-width: 1024px) {
  .article-content-wrapper {
    flex-direction: column;
  }
  
  .article-toc {
    display: none;
  }
}

.article-card {
  border-radius: 12px;
  overflow: hidden;
}

.article-header {
  text-align: center;
}

.header-top {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 16px;
}

.article-title {
  font-size: 32px;
  font-weight: 700;
  color: #303133;
  margin: 0 0 20px 0;
  line-height: 1.4;
}

.article-meta {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #909399;
}

.meta-item .el-icon {
  font-size: 16px;
}

.article-cover {
  width: 100%;
  max-height: 400px;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 30px;
}

.article-cover .el-image {
  width: 100%;
  height: 100%;
}

.image-fallback {
  width: 100%;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  color: #c0c4cc;
  font-size: 64px;
}

.article-body {
  font-size: 16px;
  line-height: 1.8;
  color: #303133;
  min-height: 300px;
}

:deep(.markdown-body) {
  word-wrap: break-word;
  overflow-wrap: break-word;
  line-height: 1.8;
}

:deep(.markdown-body h1) {
  font-size: 28px;
  font-weight: 700;
  margin: 24px 0 16px 0;
  color: #303133;
  border-bottom: 2px solid #409eff;
  padding-bottom: 8px;
}

:deep(.markdown-body h2) {
  font-size: 24px;
  font-weight: 600;
  margin: 20px 0 14px 0;
  color: #303133;
  border-bottom: 1px solid #e4e7ed;
  padding-bottom: 6px;
}

:deep(.markdown-body h3) {
  font-size: 20px;
  font-weight: 600;
  margin: 18px 0 12px 0;
  color: #303133;
}

:deep(.markdown-body h4) {
  font-size: 18px;
  font-weight: 600;
  margin: 16px 0 10px 0;
  color: #303133;
}

:deep(.markdown-body h5) {
  font-size: 16px;
  font-weight: 600;
  margin: 14px 0 8px 0;
  color: #303133;
}

:deep(.markdown-body h6) {
  font-size: 14px;
  font-weight: 600;
  margin: 12px 0 6px 0;
  color: #303133;
}

:deep(.markdown-body p) {
  margin: 12px 0;
  color: #303133;
}

:deep(.markdown-body ul),
:deep(.markdown-body ol) {
  padding-left: 24px;
  margin: 12px 0;
}

:deep(.markdown-body li) {
  margin: 6px 0;
  color: #303133;
}

:deep(.markdown-body code) {
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  color: #e74c3c;
}

:deep(.markdown-body pre) {
  background: #282c34;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 16px 0;
}

:deep(.markdown-body pre code) {
  background: transparent;
  padding: 0;
  color: #abb2bf;
  font-size: 14px;
}

:deep(.markdown-body blockquote) {
  border-left: 4px solid #409eff;
  padding: 10px 16px;
  margin: 16px 0;
  background: #f5f7fa;
  border-radius: 0 4px 4px 0;
  color: #606266;
}

:deep(.markdown-body strong) {
  font-weight: 700;
  color: #303133;
}

:deep(.markdown-body em) {
  font-style: italic;
  color: #606266;
}

:deep(.markdown-body a) {
  color: #409eff;
  text-decoration: none;
  transition: color 0.2s;
}

:deep(.markdown-body a:hover) {
  color: #66b1ff;
  text-decoration: underline;
}

:deep(.markdown-body img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 16px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

:deep(.markdown-body img:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

:deep(.markdown-body table) {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.markdown-body th) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-weight: 600;
  padding: 12px 16px;
  text-align: left;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

:deep(.markdown-body td) {
  padding: 12px 16px;
  border: 1px solid #e4e7ed;
  color: #303133;
}

:deep(.markdown-body tr:nth-child(even) td) {
  background: #f5f7fa;
}

:deep(.markdown-body tr:hover td) {
  background: #ecf5ff;
}

:deep(.markdown-body hr) {
  border: none;
  height: 1px;
  background: linear-gradient(90deg, transparent, #e4e7ed, transparent);
  margin: 24px 0;
}

:deep(.markdown-body input[type="checkbox"]) {
  margin-right: 8px;
  accent-color: #409eff;
}

:deep(.el-card__header) {
  padding: 30px;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.el-card__body) {
  padding: 30px;
}

:deep(.el-card__footer) {
  padding: 20px 30px;
  border-top: 1px solid #f0f0f0;
}

.article-footer {
  display: flex;
  justify-content: center;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.action-buttons .el-button {
  padding: 12px 24px;
  font-size: 14px;
}
</style>
