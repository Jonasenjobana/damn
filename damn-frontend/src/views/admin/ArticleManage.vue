<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useArticleStore } from '@/stores/modules/article'
import { useArticleTypeStore } from '@/stores/modules/articleType'
import type { Article } from '@/types/article'
import {
  ElTable,
  ElTableColumn,
  ElButton,
  ElPagination,
  ElMessage,
  ElMessageBox,
  ElCard,
} from 'element-plus'

const router = useRouter()
const articleStore = useArticleStore()
const articleTypeStore = useArticleTypeStore()

const page = ref(1)
const pageSize = ref(10)
const total = computed(() => articleStore.articles.length)

const paginatedArticles = computed(() => {
  const start = (page.value - 1) * pageSize.value
  const end = start + pageSize.value
  return articleStore.articles.slice(start, end)
})

function openCreatePage() {
  router.push('/admin/articles/create')
}

function openEditPage(article: Article) {
  router.push(`/admin/articles/${article.id}/edit`)
}

async function handleDelete(article: Article) {
  try {
    await ElMessageBox.confirm(`确定要删除文章"${article.title}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await articleStore.deleteArticle(article.id)
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

async function handleTogglePin(article: Article) {
  try {
    const isPinned = await articleStore.togglePin(article.id)
    ElMessage.success(isPinned ? '置顶成功' : '取消置顶成功')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

function getStatusText(status: number) {
  const map: Record<number, string> = {
    0: '草稿',
    1: '已发布',
  }
  return map[status] || '未知'
}

function getStatusType(status: number) {
  return status === 1 ? 'success' : 'info'
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

onMounted(async () => {
  await Promise.all([
    articleStore.fetchArticles(),
    articleTypeStore.fetchTypes(),
  ])
})
</script>

<template>
  <div class="article-manage-container">
    <ElCard shadow="hover">
      <template #header>
        <div class="card-header">
          <span>文章管理</span>
          <ElButton type="primary" @click="openCreatePage">创建文章</ElButton>
        </div>
      </template>

      <ElTable :data="paginatedArticles" v-loading="articleStore.loading" stripe>
        <ElTableColumn prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <ElTableColumn prop="articleTypeName" label="类型" width="120" />
        <ElTableColumn prop="viewCount" label="浏览数" width="100" align="center" />
        <ElTableColumn prop="likeCount" label="点赞数" width="100" align="center" />
        <ElTableColumn prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="isPinned" label="置顶" width="80" align="center">
          <template #default="{ row }">
            <span>{{ row.isPinned === 1 ? '✅' : '❌' }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="createTime" label="创建时间" width="120">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <ElButton size="small" type="primary" @click="openEditPage(row)">编辑</ElButton>
            <ElButton
              size="small"
              :type="row.isPinned === 1 ? 'warning' : 'info'"
              @click="handleTogglePin(row)"
            >
              {{ row.isPinned === 1 ? '取消置顶' : '置顶' }}
            </ElButton>
            <ElButton size="small" type="danger" @click="handleDelete(row)">删除</ElButton>
          </template>
        </ElTableColumn>
      </ElTable>

      <div class="pagination-container">
        <ElPagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          background
        />
      </div>
    </ElCard>
  </div>
</template>

<style scoped>
.article-manage-container {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-card) {
  border: 1px solid var(--line-soft);
  box-shadow: none;
  background: var(--bg-elevated);
}

:deep(.el-card__header) {
  border-bottom: 1px solid var(--line-soft);
  background: transparent;
}

:deep(.el-table) {
  --el-table-header-bg-color: var(--bg-soft);
}
</style>
