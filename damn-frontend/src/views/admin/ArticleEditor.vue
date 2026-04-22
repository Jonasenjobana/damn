<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useArticleStore } from '@/stores/modules/article'
import { useArticleTypeStore } from '@/stores/modules/articleType'
import { uploadAPI } from '@/api/modules/upload'
import type { CreateArticleDTO, UpdateArticleDTO } from '@/types/article'
import MarkdownEditor from '@/components/MarkdownEditor.vue'
import {
  ElButton,
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElMessage,
  ElUpload,
  ElCard,
} from 'element-plus'

const route = useRoute()
const router = useRouter()
const articleStore = useArticleStore()
const articleTypeStore = useArticleTypeStore()

const articleId = computed(() => {
  const id = route.params.id
  return id ? parseInt(id) : null
})
const isEdit = computed(() => articleId.value !== null)

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

async function loadArticleData() {
  if (articleId.value) {
    const article = articleStore.articles.find(a => a.id === articleId.value)
    if (article) {
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
    }
  }
}

async function handleSubmit() {
  if (!formData.value.title || !formData.value.content || !formData.value.article_type_id) {
    ElMessage.warning('请填写完整信息')
    return
  }

  try {
    if (articleId.value) {
      await articleStore.updateArticle(articleId.value, formData.value as UpdateArticleDTO)
      ElMessage.success('更新成功')
    } else {
      await articleStore.createArticle(formData.value)
      ElMessage.success('创建成功')
    }
    await articleStore.fetchArticles()
    router.push('/admin/articles')
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

function handleCancel() {
  router.push('/admin/articles')
}

onMounted(async () => {
  await Promise.all([
    articleStore.fetchArticles(),
    articleTypeStore.fetchTypes(),
  ])
  await loadArticleData()
})

watch(route, async () => {
  await loadArticleData()
})

const pageTitle = computed(() => isEdit.value ? '编辑文章' : '创建文章')
</script>

<template>
  <div class="article-editor-container">
    <ElCard shadow="hover">
      <template #header>
        <div class="card-header">
          <span>{{ pageTitle }}</span>
        </div>
      </template>

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

        <ElFormItem label="状态" v-if="isEdit">
          <ElSelect v-model="formData.status" style="width: 100%">
            <ElOption :label="'草稿'" :value="0" />
            <ElOption :label="'已发布'" :value="1" />
          </ElSelect>
        </ElFormItem>

        <ElFormItem>
          <div class="form-actions">
            <ElButton @click="handleCancel">取消</ElButton>
            <ElButton type="primary" @click="handleSubmit">确定</ElButton>
          </div>
        </ElFormItem>
      </ElForm>
    </ElCard>
  </div>
</template>

<style scoped>
.article-editor-container {
  padding: 0;
  max-width: 900px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
    border: 1px solid var(--line-soft);
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
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
</style>
