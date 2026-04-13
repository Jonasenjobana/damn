<template>
  <div class="article-detail" v-loading="loading">
    <div class="article-content-wrapper" v-if="article || !loading">
      <div class="article-main">
        <div v-if="article" class="article-card-wrapper">
          <div class="article-header-section">
            <div class="article-tags">
              <el-tag v-if="article.isPinned === 1" type="danger" size="small" effect="dark" class="pin-tag">
                <el-icon><Top /></el-icon>
                置顶
              </el-tag>
              <el-tag size="small" effect="light" class="type-tag">
                {{ article.articleTypeName }}
              </el-tag>
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

          <div class="article-cover" v-if="article.cover">
            <el-image :src="article.cover" fit="cover" :preview-src-list="[article.cover]" class="cover-image">
              <template #error>
                <div class="image-fallback">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </div>

          <div class="article-body markdown-body" v-html="renderedContent"></div>

          <div class="article-footer">
            <div class="action-buttons">
              <el-button
                :type="articleStats.liked ? 'danger' : 'default'"
                @click="handleLike"
                :icon="articleStats.liked ? StarFilled : Star"
                class="like-btn"
              >
                {{ articleStats.likeCount || 0 }} 点赞
              </el-button>
              <el-button @click="goBack" :icon="Back" class="back-btn">
                返回
              </el-button>
            </div>
          </div>
        </div>

        <div v-if="!loading && !article" class="empty-article">
          <el-empty description="文章不存在或已删除">
            <el-button type="primary" @click="goBack" class="go-back-btn">
              <el-icon><ArrowLeft /></el-icon>
              返回首页
            </el-button>
          </el-empty>
        </div>
      </div>

      <div class="article-toc" v-if="toc.length > 0">
        <div class="toc-sticky">
          <div class="toc-title">
            <el-icon><List /></el-icon>
            目录
          </div>
          <nav class="toc-list">
            <a 
              v-for="(item, index) in toc" 
              :key="index"
              :class="['toc-item', { active: activeIndex === index }]"
              :style="{ marginLeft: (item.level - 1) * 16 + 'px' }"
              @click="navigateTo(item)"
            >
              <span class="toc-dot"></span>
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
import { Calendar, View, Timer, Picture, Back, Star, StarFilled, Top, List, ArrowLeft } from '@element-plus/icons-vue'
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
  animation: fadeIn 0.5s ease-in-out;
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

.article-card-wrapper {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.article-header-section {
  padding: 48px 48px 32px;
  text-align: center;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.article-tags {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 24px;
}

.pin-tag,
.type-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
}

.article-title {
  font-size: 36px;
  font-weight: 800;
  color: #1a1a2e;
  margin: 0 0 24px 0;
  line-height: 1.3;
  letter-spacing: -0.5px;
}

.article-meta {
  display: flex;
  gap: 28px;
  justify-content: center;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  color: #9ca3af;
  font-weight: 500;
}

.meta-item .el-icon {
  font-size: 18px;
}

.article-cover {
  width: 100%;
  max-height: 500px;
  overflow: hidden;
  position: relative;
}

.cover-image {
  width: 100%;
  height: 100%;
  transition: transform 0.5s ease;
}

.article-cover:hover .cover-image {
  transform: scale(1.02);
}

.image-fallback {
  width: 100%;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: rgba(255, 255, 255, 0.8);
  font-size: 72px;
}

.article-body {
  font-size: 17px;
  line-height: 1.9;
  color: #374151;
  min-height: 300px;
  padding: 48px;
}

.article-footer {
  padding: 32px 48px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.action-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.like-btn,
.back-btn {
  padding: 14px 32px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.like-btn:hover,
.back-btn:hover {
  transform: translateY(-2px);
}

.empty-article {
  padding: 80px 0;
}

.go-back-btn {
  margin-top: 20px;
  padding: 12px 32px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.go-back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.article-toc {
  width: 260px;
  flex-shrink: 0;
  position: sticky;
  top: 100px;
  z-index: 10;
}

.toc-sticky {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-height: calc(100vh - 140px);
  overflow-y: auto;
}

.toc-title {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid rgba(102, 126, 234, 0.2);
  display: flex;
  align-items: center;
  gap: 8px;
}

.toc-title .el-icon {
  color: #667eea;
}

.toc-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.toc-item {
  font-size: 14px;
  color: #6b7280;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  line-height: 1.5;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.toc-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #d1d5db;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.toc-item:hover {
  background: rgba(102, 126, 234, 0.08);
  color: #667eea;
}

.toc-item:hover .toc-dot {
  background: #667eea;
}

.toc-item.active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
  color: #667eea;
  font-weight: 600;
}

.toc-item.active .toc-dot {
  width: 10px;
  height: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2);
}

@media (max-width: 1024px) {
  .article-content-wrapper {
    flex-direction: column;
  }
  
  .article-toc {
    display: none;
  }
}

@media (max-width: 768px) {
  .article-header-section {
    padding: 32px 24px 24px;
  }

  .article-title {
    font-size: 28px;
  }

  .article-body {
    padding: 32px 24px;
    font-size: 16px;
  }

  .article-footer {
    padding: 24px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .like-btn,
  .back-btn {
    width: 100%;
  }
}

:deep(.markdown-body) {
  word-wrap: break-word;
  overflow-wrap: break-word;
  line-height: 1.9;
}

:deep(.markdown-body h1) {
  font-size: 32px;
  font-weight: 800;
  margin: 32px 0 20px 0;
  color: #1a1a2e;
  border-bottom: 3px solid transparent;
  border-image: linear-gradient(90deg, #667eea, #764ba2) 1;
  padding-bottom: 12px;
  letter-spacing: -0.5px;
}

:deep(.markdown-body h2) {
  font-size: 26px;
  font-weight: 700;
  margin: 28px 0 18px 0;
  color: #1a1a2e;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 10px;
  letter-spacing: -0.3px;
}

:deep(.markdown-body h3) {
  font-size: 22px;
  font-weight: 700;
  margin: 24px 0 14px 0;
  color: #374151;
}

:deep(.markdown-body h4) {
  font-size: 20px;
  font-weight: 600;
  margin: 20px 0 12px 0;
  color: #374151;
}

:deep(.markdown-body h5) {
  font-size: 18px;
  font-weight: 600;
  margin: 18px 0 10px 0;
  color: #4b5563;
}

:deep(.markdown-body h6) {
  font-size: 16px;
  font-weight: 600;
  margin: 16px 0 8px 0;
  color: #4b5563;
}

:deep(.markdown-body p) {
  margin: 16px 0;
  color: #374151;
}

:deep(.markdown-body ul),
:deep(.markdown-body ol) {
  padding-left: 28px;
  margin: 16px 0;
}

:deep(.markdown-body li) {
  margin: 8px 0;
  color: #374151;
}

:deep(.markdown-body code) {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  padding: 3px 8px;
  border-radius: 6px;
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
  font-size: 15px;
  color: #667eea;
  font-weight: 500;
}

:deep(.markdown-body pre) {
  background: linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%);
  padding: 24px;
  border-radius: 16px;
  overflow-x: auto;
  margin: 20px 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

:deep(.markdown-body pre code) {
  background: transparent;
  padding: 0;
  color: #cdd6f4;
  font-size: 15px;
  font-weight: 400;
}

:deep(.markdown-body blockquote) {
  border-left: 4px solid transparent;
  border-image: linear-gradient(180deg, #667eea, #764ba2) 1;
  padding: 16px 24px;
  margin: 20px 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
  border-radius: 0 12px 12px 0;
  color: #4b5563;
  font-style: italic;
}

:deep(.markdown-body strong) {
  font-weight: 700;
  color: #1a1a2e;
}

:deep(.markdown-body em) {
  font-style: italic;
  color: #4b5563;
}

:deep(.markdown-body a) {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  position: relative;
}

:deep(.markdown-body a::after) {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.3s ease;
}

:deep(.markdown-body a:hover) {
  color: #764ba2;
}

:deep(.markdown-body a:hover::after) {
  width: 100%;
}

:deep(.markdown-body img) {
  max-width: 100%;
  height: auto;
  border-radius: 16px;
  margin: 24px 0;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

:deep(.markdown-body img:hover) {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

:deep(.markdown-body table) {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin: 24px 0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

:deep(.markdown-body th) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-weight: 700;
  padding: 16px;
  text-align: left;
}

:deep(.markdown-body td) {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  color: #374151;
}

:deep(.markdown-body tr:last-child td) {
  border-bottom: none;
}

:deep(.markdown-body tr:nth-child(even) td) {
  background: rgba(102, 126, 234, 0.03);
}

:deep(.markdown-body tr:hover td) {
  background: rgba(102, 126, 234, 0.08);
}

:deep(.markdown-body hr) {
  border: none;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.5), transparent);
  margin: 40px 0;
}

:deep(.markdown-body input[type="checkbox"]) {
  margin-right: 10px;
  accent-color: #667eea;
  width: 18px;
  height: 18px;
}
</style>
