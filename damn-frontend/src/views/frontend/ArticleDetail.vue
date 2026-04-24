<template>
  <div class="article-detail" v-loading="loading">
    <div class="detail-grid" v-if="article || !loading">
      <main class="article-main">
        <article v-if="article" class="glass-card article-card animate-fade-up">
          <header class="article-header">
            <div class="tags">
              <el-tag v-if="article.isPinned === 1" effect="dark" class="tag-pin">
                <el-icon><Top /></el-icon>
                Pin
              </el-tag>
              <el-tag effect="plain">{{ article.articleTypeName || 'General' }}</el-tag>
            </div>
            <h1>{{ article.title }}</h1>
            <div class="meta">
              <span><el-icon><Calendar /></el-icon>{{ formatDate(article.createTime) }}</span>
              <span><el-icon><View /></el-icon>{{ articleStats.viewCount || 0 }} reads</span>
              <span><el-icon><Timer /></el-icon>{{ formatDuration(articleStats.totalViewDuration) }}</span>
            </div>
          </header>

          <div class="cover-wrap" v-if="article.cover">
            <el-image :src="article.cover" fit="cover" :preview-src-list="[article.cover]" />
          </div>

          <section class="markdown-body article-body" v-html="renderedContent"></section>

          <footer class="actions">
            <el-button
              :type="articleStats.liked ? 'danger' : 'default'"
              @click="handleLike"
              :icon="articleStats.liked ? StarFilled : Star"
            >
              {{ articleStats.likeCount || 0 }} Likes
            </el-button>
            <el-button @click="goBack" :icon="Back">Back home</el-button>
          </footer>
        </article>

        <div v-if="!loading && !article" class="empty">
          <el-empty description="Article not found">
            <el-button type="primary" @click="goBack">Back home</el-button>
          </el-empty>
        </div>
      </main>

      <aside class="toc-box glass-card" v-if="toc.length > 1">
        <p class="toc-title"><el-icon><List /></el-icon>Table of Contents</p>
        <nav class="toc-list">
          <a
            v-for="(item, index) in toc"
            :key="item.id"
            :class="['toc-item', { active: activeIndex === index }]"
            :style="{ paddingLeft: `${(item.level - 1) * 12 + 10}px` }"
            @click="navigateTo(item)"
          >
            {{ item.text }}
          </a>
        </nav>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Calendar,
  View,
  Timer,
  Back,
  Star,
  StarFilled,
  Top,
  List,
} from '@element-plus/icons-vue'
import { articleAPI } from '@/api/modules/article'
import type { Article, ArticleStats } from '@/types/article'
import { marked } from 'marked'

interface TocItem {
  level: number
  text: string
  id: string
}

const route = useRoute()
const router = useRouter()

const articleId = computed(() => Number(route.params.id))
const article = ref<Article | null>(null)
const loading = ref(false)
const toc = ref<TocItem[]>([])
const activeIndex = ref(0)
const articleStats = ref<ArticleStats>({
  viewCount: 0,
  likeCount: 0,
  totalViewDuration: 0,
  liked: false,
})

let observer: IntersectionObserver | null = null
let viewDurationTimer: number | null = null
let accumulatedDuration = 0

const parseToc = (content: string): TocItem[] => {
  const headings: TocItem[] = []
  const headingRegex = /^(#{1,6})\s+(.+)$/gm
  let match: RegExpExecArray | null

  while ((match = headingRegex.exec(content)) !== null) {
    const levelToken = match[1]
    const textToken = match[2]
    if (!levelToken || !textToken) continue
    headings.push({
      level: levelToken.length,
      text: textToken.trim(),
      id: `heading-${headings.length}`,
    })
  }
  return headings
}

const renderMarkdown = (content: string): string => {
  const html = marked.parse(content || '', { breaks: true, gfm: true }) as string
  let index = 0
  return html.replace(/<(h[1-6])>(.*?)<\/h[1-6]>/g, (_, tag: string, text: string) => {
    const id = `heading-${index++}`
    return `<${tag} id="${id}">${text}</${tag}>`
  })
}

const renderedContent = computed(() => renderMarkdown(article.value?.content || ''))

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

const formatDuration = (seconds: number) => {
  if (!seconds) return '0 min'
  const minutes = Math.floor(seconds / 60)
  const remain = seconds % 60
  if (!minutes) return `${remain}s`
  return `${minutes}m ${remain}s`
}

const goBack = () => router.push('/')

const navigateTo = (item: TocItem) => {
  const target = document.getElementById(item.id)
  target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const setupObserver = () => {
  observer?.disconnect()
  observer = new IntersectionObserver(
    (entries) => {
      const visibleEntry = entries.find((entry) => entry.isIntersecting)
      if (!visibleEntry) return
      const id = visibleEntry.target.id
      const idx = toc.value.findIndex((item) => item.id === id)
      if (idx >= 0) activeIndex.value = idx
    },
    { rootMargin: '-20% 0px -70% 0px', threshold: 0.1 },
  )

  toc.value.forEach((item) => {
    const element = document.getElementById(item.id)
    if (element) observer?.observe(element)
  })
}

const reportViewDuration = async () => {
  if (isNaN(articleId.value) || accumulatedDuration <= 0) return
  const duration = accumulatedDuration
  accumulatedDuration = 0
  try {
    await articleAPI.recordViewDuration(articleId.value, duration)
  } catch (error) {
    console.error('reportViewDuration failed:', error)
  }
}

const startViewDurationTracking = () => {
  if (viewDurationTimer) return
  viewDurationTimer = window.setInterval(() => {
    if (document.hidden) return
    accumulatedDuration += 10
    if (accumulatedDuration >= 10) {
      void reportViewDuration()
    }
  }, 10000)
}

const loadArticleStats = async (id: number) => {
  try {
    const response = await articleAPI.getStats(id)
    if (response.rlt === '0' && response.data) {
      articleStats.value = response.data
    }
  } catch (error) {
    console.error('loadArticleStats failed:', error)
  }
}

const loadArticle = async () => {
  if (isNaN(articleId.value)) {
    ElMessage.error('Invalid article id')
    goBack()
    return
  }

  loading.value = true
  try {
    const response = await articleAPI.getOne(articleId.value)
    if (response.rlt !== '0' || !response.data) {
      ElMessage.error(response.msg || 'Failed to load article')
      return
    }
    article.value = response.data
    await loadArticleStats(articleId.value)
    startViewDurationTracking()
  } catch (error: any) {
    ElMessage.error(error?.message || 'Failed to load article')
  } finally {
    loading.value = false
  }
}

const handleLike = async () => {
  if (isNaN(articleId.value)) return
  try {
    const response = await articleAPI.toggleLike(articleId.value)
    if (response.rlt !== '0' || !response.data) {
      ElMessage.error(response.msg || 'Operation failed')
      return
    }
    articleStats.value.liked = response.data.liked
    articleStats.value.likeCount = response.data.likeCount
    ElMessage.success(response.data.liked ? 'Liked' : 'Unliked')
  } catch (error: any) {
    ElMessage.error(error?.message || 'Operation failed')
  }
}

const onVisibilityChange = () => {
  if (!document.hidden) {
    void reportViewDuration()
  }
}

watch(
  () => article.value?.content,
  (content) => {
    if (!content) return
    toc.value = parseToc(content)
    nextTick(setupObserver)
  },
)

onMounted(() => {
  void loadArticle()
  document.addEventListener('visibilitychange', onVisibilityChange)
  window.addEventListener('beforeunload', reportViewDuration)
})

onUnmounted(() => {
  observer?.disconnect()
  if (viewDurationTimer) clearInterval(viewDurationTimer)
  document.removeEventListener('visibilitychange', onVisibilityChange)
  window.removeEventListener('beforeunload', reportViewDuration)
  void reportViewDuration()
})
</script>

<style scoped>
.article-detail {
  padding-bottom: 12px;
}

.detail-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 270px;
  gap: 20px;
}

.article-card {
  overflow: hidden;
}

.article-header {
  padding: 28px 30px 18px;
  border-bottom: 1px solid var(--border-soft);
  background:
    radial-gradient(500px 200px at 10% -20%, color-mix(in srgb, var(--color-primary) 16%, transparent), transparent 70%),
    var(--bg-card);
}

.tags {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
}

.tag-pin {
  border: none;
}

.article-header h1 {
  font-size: clamp(28px, 3vw, 38px);
  line-height: 1.2;
  margin-bottom: 12px;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 18px;
  color: var(--text-muted);
}

.meta span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.cover-wrap {
  max-height: 460px;
  overflow: hidden;
}

.cover-wrap :deep(.el-image),
.cover-wrap :deep(.el-image__inner) {
  width: 100%;
  height: 100%;
}

.article-body {
  padding: 30px;
  line-height: 1.86;
  color: var(--text-secondary);
}

.actions {
  padding: 16px 30px 26px;
  border-top: 1px solid var(--border-soft);
  display: flex;
  gap: 10px;
  justify-content: center;
}

.toc-box {
  position: sticky;
  top: 98px;
  height: fit-content;
  max-height: calc(100vh - 120px);
  overflow: auto;
  padding: 16px;
}

.toc-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 10px;
}

.toc-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.toc-item {
  border-radius: 8px;
  color: var(--text-secondary);
  padding-block: 8px;
  font-size: 13px;
  text-decoration: none;
  cursor: pointer;
  transition: 0.2s ease;
}

.toc-item:hover,
.toc-item.active {
  background: color-mix(in srgb, var(--color-primary) 14%, transparent);
  color: var(--color-primary-active);
}

.empty {
  padding: 28px 0;
}

:deep(.markdown-body h1),
:deep(.markdown-body h2),
:deep(.markdown-body h3),
:deep(.markdown-body h4),
:deep(.markdown-body h5),
:deep(.markdown-body h6) {
  color: var(--text-primary);
  margin-top: 1.45em;
  margin-bottom: 0.6em;
  line-height: 1.3;
}

:deep(.markdown-body p) {
  margin: 0.85em 0;
}

:deep(.markdown-body code) {
  border-radius: var(--radius-sm);
  padding: 2px 7px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.92em;
  background: color-mix(in srgb, var(--color-primary) 12%, transparent);
  color: var(--color-primary-active);
}

:deep(.markdown-body pre) {
  border-radius: var(--radius-lg);
  background: var(--bg-soft);
  overflow-x: auto;
  padding: 16px;
}

:deep(.markdown-body pre code) {
  background: transparent;
  color: inherit;
  padding: 0;
}

:deep(.markdown-body blockquote) {
  border-left: 4px solid var(--color-primary);
  padding: 8px 14px;
  margin: 14px 0;
  background: var(--bg-soft);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}

:deep(.markdown-body img) {
  max-width: 100%;
  border-radius: var(--radius-lg);
}

@media (max-width: 1080px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .toc-box {
    display: none;
  }
}

@media (max-width: 768px) {
  .article-header,
  .article-body,
  .actions {
    padding-left: 18px;
    padding-right: 18px;
  }
}
</style>
