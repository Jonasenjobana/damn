<template>
  <div class="blog-card glass-card animate-fade-up" @click="$emit('click')">
    <!-- 封面图 -->
    <div v-if="cover" class="cover-wrapper">
      <img :src="cover" alt="封面" class="cover-img" />
    </div>
    <!-- 内容区 -->
    <div class="content">
      <div class="meta">
        <span class="category" v-if="category">{{ category }}</span>
        <span class="date">{{ formatDate(createTime) }}</span>
        <span class="views" v-if="views">{{ views }} 阅读</span>
      </div>
      <h3 class="title">{{ title }}</h3>
      <p class="summary" v-if="summary">{{ summary }}</p>
      <div class="footer">
        <el-tag size="small" type="primary" v-for="tag in tags" :key="tag">
          {{ tag }}
        </el-tag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDate } from '@/utils/format'

interface Props {
  title: string
  summary?: string
  cover?: string
  category?: string
  createTime: string
  views?: number
  tags?: string[]
}

defineProps<Props>()
defineEmits(['click'])
</script>

<style scoped>
.blog-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  cursor: pointer;
}

.cover-wrapper {
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-bottom: 1px solid var(--border-soft);
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-normal);
}

.blog-card:hover .cover-img {
  transform: scale(1.05);
}

.content {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.category {
  color: var(--color-primary);
  font-weight: 500;
}

.title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
  margin-bottom: 12px;
  transition: color var(--transition-fast);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.blog-card:hover .title {
  color: var(--color-primary);
}

.summary {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 16px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.footer {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .cover-wrapper {
    height: 160px;
  }

  .content {
    padding: 16px;
  }

  .title {
    font-size: 18px;
  }
}
</style>