<template>
  <div class="home-page">
    <section class="hero glass-card animate-fade-up">
      <div class="hero-left">
        <p class="eyebrow">Damn Blog 2.0</p>
        <h2>Clean, calm, and a little futuristic</h2>
        <p class="hero-subtitle">
          Added article search, category filtering, and smart sorting for a more usable browsing flow.
        </p>
      </div>
      <div class="hero-stats">
        <div class="stat-card">
          <span class="label">Articles</span>
          <strong>{{ articles.length }}</strong>
        </div>
        <div class="stat-card">
          <span class="label">Pinned</span>
          <strong>{{ pinnedCount }}</strong>
        </div>
        <div class="stat-card">
          <span class="label">Likes</span>
          <strong>{{ totalLikes }}</strong>
        </div>
      </div>
    </section>

    <section class="filters glass-card">
      <el-input
        v-model="keyword"
        clearable
        placeholder="Search title / content / category"
        class="search-input"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <el-select v-model="typeFilter" placeholder="All categories" class="filter-item">
        <el-option label="All categories" value="all" />
        <el-option
          v-for="type in articleTypes"
          :key="type"
          :label="type"
          :value="type"
        />
      </el-select>

      <el-select v-model="sortBy" placeholder="Sort by" class="filter-item">
        <el-option label="Newest" value="newest" />
        <el-option label="Most viewed" value="views" />
        <el-option label="Most liked" value="likes" />
      </el-select>
    </section>

    <el-row :gutter="18" v-loading="loading" class="articles-grid">
      <el-col
        v-for="article in filteredArticles"
        :key="article.id"
        :xs="24"
        :sm="12"
        :lg="8"
      >
        <article class="article-card glass-card" @click="goToArticle(article.id)">
          <div class="article-cover" :class="{ empty: !article.cover }">
            <el-image v-if="article.cover" :src="article.cover" fit="cover" :lazy="true">
              <template #error>
                <div class="cover-fallback">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
            <div v-else class="cover-fallback">
              <el-icon><Document /></el-icon>
            </div>

            <div class="badge-row">
              <el-tag v-if="article.isPinned === 1" size="small" effect="dark" class="pin-tag">
                <el-icon><Top /></el-icon>
                Pin
              </el-tag>
              <el-tag size="small" effect="plain">{{ article.articleTypeName || 'General' }}</el-tag>
            </div>
          </div>

          <div class="article-body">
            <h3>{{ article.title }}</h3>
            <p>{{ getExcerpt(article.content) }}</p>
          </div>

          <div class="article-meta">
            <span><el-icon><View /></el-icon>{{ article.viewCount || 0 }}</span>
            <span><el-icon><Star /></el-icon>{{ article.likeCount || 0 }}</span>
            <span><el-icon><Calendar /></el-icon>{{ formatDate(article.createTime) }}</span>
          </div>
        </article>
      </el-col>
    </el-row>

    <el-empty v-if="!loading && filteredArticles.length === 0" description="No matched articles" class="empty">
      <el-button type="primary" @click="resetFilters">Reset filters</el-button>
    </el-empty>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Picture,
  View,
  Star,
  Document,
  Top,
  Calendar,
  Search,
} from '@element-plus/icons-vue'
import { articleAPI } from '@/api/modules/article'
import type { Article } from '@/types/article'

const router = useRouter()
const articles = ref<Article[]>([])
const loading = ref(false)
const keyword = ref('')
const typeFilter = ref('all')
const sortBy = ref<'newest' | 'views' | 'likes'>('newest')

const articleTypes = computed<string[]>(() => {
  const types = new Set(
    articles.value
      .map((item) => item.articleTypeName)
      .filter((item): item is string => typeof item === 'string' && item.trim().length > 0),
  )
  return Array.from(types)
})

const pinnedCount = computed(() => articles.value.filter((item) => item.isPinned === 1).length)
const totalLikes = computed(() => articles.value.reduce((sum, item) => sum + (item.likeCount || 0), 0))

const filteredArticles = computed(() => {
  const source = articles.value.filter((item) => {
    const matchesKeyword = [item.title, item.content, item.articleTypeName || '']
      .join(' ')
      .toLowerCase()
      .includes(keyword.value.trim().toLowerCase())
    const matchesType = typeFilter.value === 'all' || item.articleTypeName === typeFilter.value
    return matchesKeyword && matchesType
  })

  return source.sort((a, b) => {
    if (a.isPinned !== b.isPinned) return b.isPinned - a.isPinned

    if (sortBy.value === 'views') return (b.viewCount || 0) - (a.viewCount || 0)
    if (sortBy.value === 'likes') return (b.likeCount || 0) - (a.likeCount || 0)
    return new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
  })
})

const getExcerpt = (content: string, maxLength = 88) => {
  const text = (content || '').replace(/[#*`\[\]()]/g, '').replace(/\s+/g, ' ').trim()
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
}

const resetFilters = () => {
  keyword.value = ''
  typeFilter.value = 'all'
  sortBy.value = 'newest'
}

const loadArticles = async () => {
  loading.value = true
  try {
    const response = await articleAPI.getList()
    if (response.rlt === '0') {
      articles.value = response.data || []
      return
    }
    ElMessage.error(response.msg || 'Failed to load articles')
  } catch (error: any) {
    ElMessage.error(error?.message || 'Failed to load articles')
  } finally {
    loading.value = false
  }
}

const goToArticle = (id: number) => {
  router.push(`/article/${id}`)
}

onMounted(loadArticles)
</script>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 20px;
}

.hero {
  padding: 28px;
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 16px;
}

.hero-left h2 {
  font-size: clamp(26px, 3vw, 36px);
  line-height: 1.18;
  margin: 8px 0 10px;
}

.eyebrow {
  display: inline-flex;
  padding: 6px 11px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--brand) 12%, white);
  color: var(--brand-strong);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
}

.hero-subtitle {
  color: var(--text-secondary);
  max-width: 560px;
}

.hero-stats {
  display: flex;
  gap: 10px;
  align-items: stretch;
}

.stat-card {
  min-width: 92px;
  padding: 14px;
  border-radius: 14px;
  background: var(--bg-soft);
  border: 1px solid var(--line-soft);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stat-card .label {
  font-size: 12px;
  color: var(--text-muted);
}

.stat-card strong {
  font-size: 20px;
  color: var(--text-primary);
}

.filters {
  display: grid;
  grid-template-columns: minmax(230px, 1fr) 170px 170px;
  gap: 12px;
  padding: 14px;
  position: sticky;
  top: 92px;
  z-index: 10;
}

.search-input,
.filter-item {
  width: 100%;
}

.articles-grid {
  margin-top: 2px;
}

.article-card {
  height: 100%;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.28s var(--ease-smooth), box-shadow 0.28s var(--ease-smooth);
}

.article-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-strong);
}

.article-cover {
  position: relative;
  height: 172px;
  overflow: hidden;
}

.article-cover :deep(.el-image),
.article-cover :deep(.el-image__inner) {
  width: 100%;
  height: 100%;
}

.article-cover.empty {
  background: linear-gradient(145deg, color-mix(in srgb, var(--brand) 45%, white), var(--brand-soft));
}

.cover-fallback {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  color: white;
  font-size: 34px;
}

.badge-row {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  gap: 8px;
}

.pin-tag {
  background: var(--danger);
  border: none;
}

.article-body {
  padding: 16px 16px 10px;
}

.article-body h3 {
  font-size: 18px;
  line-height: 1.35;
  color: var(--text-primary);
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-body p {
  color: var(--text-secondary);
  line-height: 1.6;
  font-size: 14px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  padding: 0 16px 14px;
  color: var(--text-muted);
  font-size: 13px;
}

.article-meta span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.empty {
  margin-top: 12px;
  padding: 24px 0;
}

@media (max-width: 900px) {
  .hero {
    flex-direction: column;
  }

  .hero-stats {
    width: 100%;
  }

  .stat-card {
    flex: 1;
  }

  .filters {
    grid-template-columns: 1fr;
    top: 84px;
  }
}
</style>
