<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useArticleStore } from '@/stores/modules/article'
import { useArticleTypeStore } from '@/stores/modules/articleType'
import { uploadAPI } from '@/api/modules/upload'
import type { Article, CreateArticleDTO, UpdateArticleDTO } from '@/types/article'
import MarkdownEditor from '@/components/MarkdownEditor.vue'
import {
  ElTable,
  ElTableColumn,
  ElButton,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElPagination,
  ElMessage,
  ElMessageBox,
  ElUpload,
  ElCard,
} from 'element-plus'

const articleStore = useArticleStore()
const articleTypeStore = useArticleTypeStore()

const dialogVisible = ref(false)
const dialogTitle = ref('创建文章')
const currentArticle = ref<Article | null>(null)

const formData = ref<CreateArticleDTO & { status?: number }>({
  title: '',
  content: '',
  cover: '',
  article_type_id: 0,
  sort: 0,
  is_pinned: 0,
  is_private: 0,
  status: 1,
})

const page = ref(1)
const pageSize = ref(10)
const total = computed(() => articleStore.articles.length)

const paginatedArticles = computed(() => {
  const start = (page.value - 1) * pageSize.value
  const end = start + pageSize.value
  return articleStore.articles.slice(start, end)
})

function openCreateDialog() {
  dialogTitle.value = '创建文章'
  currentArticle.value = null
  formData.value = {
    title: '',
    content: '',
    cover: '',
    article_type_id: 0,
    sort: 0,
    is_pinned: 0,
    is_private: 0,
    status: 1,
  }
  dialogVisible.value = true
}

function openEditDialog(article: Article) {
  dialogTitle.value = '编辑文章'
  currentArticle.value = article
  formData.value = {
    title: article.title,
    content: article.content,
    cover: article.cover || '',
    article_type_id: article.articleTypeId,
    sort: article.sort,
    is_pinned: article.isPinned,
    is_private: article.isPrivate,
    status: article.status,
  }
  dialogVisible.value = true
}

async function handleSubmit() {
  if (!formData.value.title || !formData.value.content || !formData.value.article_type_id) {
    ElMessage.warning('请填写完整信息')
    return
  }

  try {
    if (currentArticle.value) {
      await articleStore.updateArticle(currentArticle.value.id, formData.value)
      ElMessage.success('更新成功')
    } else {
      await articleStore.createArticle(formData.value)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    await articleStore.fetchArticles()
  } catch (error) {
    ElMessage.error('操作失败')
  }
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

async function handleCoverUpload(file: File) {
  try {
    const response = await uploadAPI.uploadImage(file)
    formData.value.cover = response?.data?.url
    ElMessage.success('封面上传成功')
    return false
  } catch (error) {
    ElMessage.error('封面上传失败')
    return false
  }
}

function handleCoverRemove() {
  formData.value.cover = ''
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
          <ElButton type="primary" @click="openCreateDialog">创建文章</ElButton>
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
        <ElTableColumn label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <ElButton size="small" type="primary" @click="openEditDialog(row)">编辑</ElButton>
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

    <ElDialog v-model="dialogVisible" :title="dialogTitle" width="800px" destroy-on-close>
      <ElForm :model="formData" label-width="100px">
        <ElFormItem label="标题" required>
          <ElInput v-model="formData.title" placeholder="请输入文章标题" />
        </ElFormItem>

        <ElFormItem label="类型" required>
          <ElSelect v-model="formData.article_type_id" placeholder="请选择文章类型" style="width: 100%">
            <ElOption
              v-for="type in articleTypeStore.types"
              :key="type.id"
              :label="type.name"
              :value="type.id"
            />
          </ElSelect>
        </ElFormItem>

        <ElFormItem label="封面图">
          <ElUpload
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="(file: any) => handleCoverUpload(file.raw)"
            list-type="picture"
          >
            <ElButton type="primary">选择图片</ElButton>
          </ElUpload>
          <div v-if="formData.cover" class="cover-preview">
            <img :src="formData.cover" alt="封面预览" />
            <ElButton type="danger" size="small" @click="handleCoverRemove">移除</ElButton>
          </div>
        </ElFormItem>

        <ElFormItem label="内容" required>
          <MarkdownEditor
            v-model="formData.content"
            placeholder="请输入文章内容，支持 Markdown 格式..."
            height="500px"
          />
        </ElFormItem>

        <ElFormItem label="排序">
          <ElInput v-model.number="formData.sort" type="number" placeholder="数值越大越靠前" />
        </ElFormItem>

        <ElFormItem label="是否私有">
          <ElSelect v-model="formData.is_private" style="width: 100%">
            <ElOption :label="'公开'" :value="0" />
            <ElOption :label="'私有'" :value="1" />
          </ElSelect>
        </ElFormItem>

        <ElFormItem label="状态" v-if="currentArticle">
          <ElSelect v-model="formData.status" style="width: 100%">
            <ElOption :label="'草稿'" :value="0" />
            <ElOption :label="'已发布'" :value="1" />
          </ElSelect>
        </ElFormItem>
      </ElForm>

      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
.article-manage-container {
  padding: 20px;
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

.cover-preview {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 10px;

  img {
    width: 200px;
    height: auto;
    border-radius: 4px;
    border: 1px solid #ddd;
  }
}
</style>
